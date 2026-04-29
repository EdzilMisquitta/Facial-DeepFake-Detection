from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import tempfile
import os
import shutil
from typing import List

from database import get_db, create_tables, AnalysisResult
from detector import analyze_video, load_model, load_face_detector
from schemas import AnalysisResponse, AnalysisSummary, ErrorResponse

# ── App init ─────────────────────────────────────────────────
app = FastAPI(
    title="Deepfake Detector API",
    description="Upload a video and get deepfake analysis results powered by Xception CNN.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load heavy models once at startup ────────────────────────
model         = None
face_detector = None

@app.on_event("startup")
def startup():
    global model, face_detector
    create_tables()
    print("[STARTUP] Loading deepfake model...")
    model = load_model()
    print("[STARTUP] Loading face detector...")
    face_detector = load_face_detector()
    print("[STARTUP] ✅ Ready")


# ── Helper ───────────────────────────────────────────────────
def save_to_db(db: Session, filename: str, result: dict) -> AnalysisResult:
    meta   = result["video_metadata"]
    verd   = result["verdict"]
    stats  = result["score_statistics"]
    frames = result["frame_breakdown"]

    record = AnalysisResult(
        filename            = filename,
        duration_seconds    = meta["duration_seconds"],
        total_frames        = meta["total_frames"],
        fps                 = meta["fps"],
        width               = meta["width"],
        height              = meta["height"],
        frame_skip          = meta["frame_skip"],
        verdict             = verd["result"],
        confidence          = verd["confidence"],
        mean_score          = stats["mean_score"],
        max_score           = stats["max_score"],
        min_score           = stats["min_score"],
        std_score           = stats["std_dev"],
        analyzed_frames     = frames["analyzed_frames"],
        no_face_frames      = frames["no_face_frames"],
        fake_frames         = frames["fake_frames"],
        real_frames         = frames["real_frames"],
        fake_percentage     = frames["fake_percentage"],
        processing_time_sec = result["processing_time_seconds"],
        top_suspicious_frames = result["top_suspicious_frames"],
        score_distribution    = result["score_distribution"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── Routes ───────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Deepfake Detector API is running."}


@app.post(
    "/analyze",
    response_model=AnalysisResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Detection"],
    summary="Upload a video and detect deepfakes",
)
async def analyze(
    video: UploadFile = File(..., description="Video file (.mp4, .avi, .mov, .mkv)"),
    db: Session = Depends(get_db),
):
    """
    Upload a video file and receive a full deepfake analysis:
    - Frame-by-frame scoring
    - Overall verdict (DEEPFAKE / REAL) with confidence
    - Score statistics and distribution
    - Top 5 most suspicious frames
    - Result saved to PostgreSQL
    """
    allowed_types = {"video/mp4", "video/avi", "video/quicktime", "video/x-matroska", "video/x-msvideo"}
    if video.content_type and video.content_type not in allowed_types:
        # Be lenient — browsers send inconsistent MIME types for videos
        pass

    allowed_extensions = {".mp4", ".avi", ".mov", ".mkv", ".webm"}
    ext = os.path.splitext(video.filename or "")[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension '{ext}'. Allowed: {allowed_extensions}",
        )

    # Save upload to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        shutil.copyfileobj(video.file, tmp)
        tmp_path = tmp.name

    try:
        result = analyze_video(tmp_path, model, face_detector)
    except Exception as e:
        os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    # Persist to DB
    record = save_to_db(db, video.filename or "unknown", result)

    return AnalysisResponse(
        analysis_id              = record.id,
        video_metadata           = result["video_metadata"],
        verdict                  = result["verdict"],
        score_statistics         = result["score_statistics"],
        frame_breakdown          = result["frame_breakdown"],
        processing_time_seconds  = result["processing_time_seconds"],
        top_suspicious_frames    = result["top_suspicious_frames"],
        score_distribution       = result["score_distribution"],
        created_at               = record.created_at,
    )


@app.get(
    "/results",
    response_model=List[AnalysisSummary],
    tags=["History"],
    summary="List all past analyses",
)
def list_results(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Return a paginated list of all past video analyses."""
    records = (
        db.query(AnalysisResult)
        .order_by(AnalysisResult.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return records


@app.get(
    "/results/{analysis_id}",
    response_model=AnalysisResponse,
    responses={404: {"model": ErrorResponse}},
    tags=["History"],
    summary="Get full details of a past analysis",
)
def get_result(analysis_id: int, db: Session = Depends(get_db)):
    """Retrieve the complete analysis result for a given ID."""
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found.")

    return AnalysisResponse(
        analysis_id = record.id,
        video_metadata = {
            "filename":         record.filename,
            "duration_seconds": record.duration_seconds,
            "total_frames":     record.total_frames,
            "fps":              record.fps,
            "width":            record.width,
            "height":           record.height,
            "frame_skip":       record.frame_skip,
        },
        verdict = {
            "result":     record.verdict,
            "confidence": record.confidence,
        },
        score_statistics = {
            "mean_score": record.mean_score,
            "max_score":  record.max_score,
            "min_score":  record.min_score,
            "std_dev":    record.std_score,
            "threshold":  float(os.getenv("FAKE_THRESHOLD", "0.4")),
        },
        frame_breakdown = {
            "total_frames":    record.total_frames,
            "analyzed_frames": record.analyzed_frames,
            "no_face_frames":  record.no_face_frames,
            "fake_frames":     record.fake_frames,
            "real_frames":     record.real_frames,
            "fake_percentage": record.fake_percentage,
        },
        processing_time_seconds = record.processing_time_sec,
        top_suspicious_frames   = record.top_suspicious_frames or [],
        score_distribution      = record.score_distribution or [],
        created_at              = record.created_at,
    )


@app.delete(
    "/results/{analysis_id}",
    tags=["History"],
    summary="Delete an analysis record",
)
def delete_result(analysis_id: int, db: Session = Depends(get_db)):
    record = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Analysis {analysis_id} not found.")
    db.delete(record)
    db.commit()
    return {"message": f"Analysis {analysis_id} deleted."}
