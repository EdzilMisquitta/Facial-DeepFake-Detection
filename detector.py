import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import Xception
from tensorflow.keras import layers, Model
import os
import time

# ── Constants ──────────────────────────────────────────────────────────────────
FRAME_SKIP      = int(os.getenv("FRAME_SKIP",    "5"))
FACE_CONF       = float(os.getenv("FACE_CONF",   "0.5"))
FAKE_THRESHOLD  = float(os.getenv("FAKE_THRESHOLD", "0.5"))
MODEL_PATH      = os.getenv("MODEL_PATH", "cnn_model.h5")

# Resolved dynamically after model loads
IMG_SIZE = None


# ── Model ───────────────────────────────────────────────────────────────────────
def build_model():
    base = Xception(weights="imagenet", include_top=False, input_shape=(299, 299, 3))
    base.trainable = False
    x = base.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.5)(x)
    output = layers.Dense(1, activation="sigmoid")(x)
    model = Model(inputs=base.input, outputs=output)
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model


def load_model():
    global IMG_SIZE
    if MODEL_PATH and os.path.exists(MODEL_PATH):
        print(f"[MODEL] Loading from: {MODEL_PATH}")
        model = tf.keras.models.load_model(MODEL_PATH)
        print("[MODEL] Loaded successfully")
    else:
        print("[MODEL] Model file not found — building fresh Xception (ImageNet weights)")
        print("[MODEL] WARNING: Untrained model — predictions will be random!")
        model = build_model()

    # Auto-detect correct input size from model so preprocessing always matches
    h, w = model.input_shape[1], model.input_shape[2]
    IMG_SIZE = (w, h)   # cv2.resize takes (width, height)
    print(f"[MODEL] Input shape: {model.input_shape}  → resizing faces to {IMG_SIZE}")
    return model


# ── Face detector ────────────────────────────────────────────────────────────────
def load_face_detector():
    prototxt = "deploy.prototxt"
    weights  = "res10_300x300_ssd_iter_140000.caffemodel"
    if os.path.exists(prototxt) and os.path.exists(weights):
        net = cv2.dnn.readNetFromCaffe(prototxt, weights)
        print("[FACE] DNN face detector loaded")
        return ("dnn", net)
    print("[FACE] DNN files not found — using Haar Cascade fallback")
    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    return ("haar", cascade)


def detect_faces_dnn(frame, net, conf_threshold):
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    faces = []
    for i in range(detections.shape[2]):
        conf = detections[0, 0, i, 2]
        if conf > conf_threshold:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype(int)
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            if x2 > x1 and y2 > y1:
                faces.append((x1, y1, x2, y2))
    return faces


def get_faces(frame, detector):
    mode, model = detector
    if mode == "dnn":
        return detect_faces_dnn(frame, model, FACE_CONF)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces_rect = model.detectMultiScale(gray, 1.1, 4, minSize=(60, 60))
    return [(x, y, x + w, y + h) for (x, y, w, h) in faces_rect] if len(faces_rect) else []


def preprocess_face(face_img):
    """Resize face to model's actual input size and normalize to [0,1]."""
    face = cv2.resize(face_img, IMG_SIZE)
    face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    face = np.expand_dims(face, axis=0).astype(np.float32)
    face = face / 255.0
    return face


# ── Main analysis ─────────────────────────────────────────────────────────────────
def analyze_video(video_path: str, model, face_detector) -> dict:
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS)
    duration     = total_frames / fps if fps > 0 else 0
    width        = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height       = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    all_scores     = []
    frame_results  = []
    frame_num      = 0
    analyzed       = 0
    no_face_frames = 0
    start_time     = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame_num += 1
        if frame_num % FRAME_SKIP != 0:
            continue

        faces = get_faces(frame, face_detector)
        if not faces:
            no_face_frames += 1
            continue

        frame_scores = []
        for (x1, y1, x2, y2) in faces:
            face_crop = frame[y1:y2, x1:x2]
            if face_crop.size == 0:
                continue
            processed = preprocess_face(face_crop)
            score = float(model.predict(processed, verbose=0)[0][0])
            frame_scores.append(score)

        if frame_scores:
            avg_score = float(np.mean(frame_scores))
            all_scores.append(avg_score)
            analyzed += 1
            frame_results.append({
                "frame":     frame_num,
                "timestamp": round(frame_num / fps, 2),
                "faces":     len(frame_scores),
                "score":     round(avg_score, 4),
                "verdict":   "FAKE" if avg_score >= FAKE_THRESHOLD else "REAL",
            })

    cap.release()
    elapsed = time.time() - start_time

    # ── No faces edge case ────────────────────────────────────────────────────
    if not all_scores:
        return {
            "error": "No faces detected in video",
            "video_metadata": {
                "filename":         os.path.basename(video_path),
                "duration_seconds": round(duration, 2),
                "total_frames":     total_frames,
                "fps":              round(fps, 2),
                "width":            width,
                "height":           height,
                "frame_skip":       FRAME_SKIP,
            },
        }

    # ── Aggregate stats ───────────────────────────────────────────────────────
    mean_score  = float(np.mean(all_scores))
    max_score   = float(np.max(all_scores))
    min_score   = float(np.min(all_scores))
    std_score   = float(np.std(all_scores))

    fake_frames      = sum(1 for s in all_scores if s >= FAKE_THRESHOLD)
    real_frames      = analyzed - fake_frames
    fake_pct         = round((fake_frames / analyzed) * 100, 2)
    fake_frame_ratio = fake_frames / analyzed if analyzed > 0 else 0

    # ── FIX: Stricter verdict logic ───────────────────────────────────────────
    # Old logic: is_fake = mean_score >= 0.4   ← too sensitive, flags real videos
    # New logic: mean score must cross 0.5 AND at least 60% of frames must be fake
    # This requires BOTH conditions to agree before calling DEEPFAKE
    is_fake    = (mean_score >= FAKE_THRESHOLD) and (fake_frame_ratio >= 0.6)
    verdict    = "DEEPFAKE" if is_fake else "REAL"
    confidence = round((mean_score if is_fake else 1 - mean_score) * 100, 2)

    # ── Top 5 suspicious frames ───────────────────────────────────────────────
    top_5 = sorted(frame_results, key=lambda x: x["score"], reverse=True)[:5]
    for fr in top_5:
        ts = fr["timestamp"]
        fr["time_label"] = f"{int(ts // 60):02d}:{ts % 60:05.2f}"

    # ── Score distribution histogram ──────────────────────────────────────────
    bins = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    hist, _ = np.histogram(all_scores, bins=bins)
    distribution = []
    for i, count in enumerate(hist):
        distribution.append({
            "range":            f"{bins[i]:.1f}–{bins[i+1]:.1f}",
            "count":            int(count),
            "is_threshold_bin": bins[i] <= FAKE_THRESHOLD <= bins[i + 1],
        })

    return {
        "video_metadata": {
            "filename":         os.path.basename(video_path),
            "duration_seconds": round(duration, 2),
            "total_frames":     total_frames,
            "fps":              round(fps, 2),
            "width":            width,
            "height":           height,
            "frame_skip":       FRAME_SKIP,
        },
        "verdict": {
            "result":     verdict,
            "confidence": confidence,
        },
        "score_statistics": {
            "mean_score": round(mean_score, 4),
            "max_score":  round(max_score, 4),
            "min_score":  round(min_score, 4),
            "std_dev":    round(std_score, 4),
            "threshold":  FAKE_THRESHOLD,
        },
        "frame_breakdown": {
            "total_frames":    total_frames,
            "analyzed_frames": analyzed,
            "no_face_frames":  no_face_frames,
            "fake_frames":     fake_frames,
            "real_frames":     real_frames,
            "fake_percentage": fake_pct,
        },
        "processing_time_seconds": round(elapsed, 2),
        "top_suspicious_frames":   top_5,
        "score_distribution":      distribution,
    }