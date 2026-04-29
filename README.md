# Deepfake Detector — FastAPI + PostgreSQL Backend

## Project Structure

```
deepfake_backend/
├── main.py          # FastAPI app + all routes
├── detector.py      # Core CV/ML analysis logic
├── database.py      # SQLAlchemy models + DB session
├── schemas.py       # Pydantic request/response schemas
├── requirements.txt
├── .env
└── README.md
```

---

## 1. PostgreSQL Setup (local)

```bash
# Install PostgreSQL if not already installed
sudo apt install postgresql postgresql-contrib   # Ubuntu/Debian
# OR
brew install postgresql                          # macOS

# Start service
sudo service postgresql start      # Linux
brew services start postgresql     # macOS

# Create DB and user
sudo -u postgres psql <<EOF
CREATE USER deepfake_user WITH PASSWORD 'deepfake_pass';
CREATE DATABASE deepfake_db OWNER deepfake_user;
GRANT ALL PRIVILEGES ON DATABASE deepfake_db TO deepfake_user;
EOF
```

---

## 2. Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate          # Linux/macOS
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## 3. Environment Variables

Copy `.env` and edit if needed (DB credentials, model path, thresholds):

```bash
cp .env .env.local   # optional — .env is loaded automatically
```

Default values in `.env`:
| Variable        | Default                                               | Description                        |
|-----------------|-------------------------------------------------------|------------------------------------|
| DATABASE_URL    | postgresql://deepfake_user:deepfake_pass@localhost... | PostgreSQL connection string        |
| MODEL_PATH      | cnn_model.h5                                          | Path to your trained .h5 model      |
| FRAME_SKIP      | 5                                                     | Analyze every Nth frame             |
| FACE_CONF       | 0.5                                                   | Face detection confidence threshold |
| FAKE_THRESHOLD  | 0.4                                                   | Score above this = DEEPFAKE         |

---

## 4. Place Your Model

Put `cnn_model.h5` in the same folder as `main.py`, or set `MODEL_PATH` in `.env` to its absolute path.

---

## 5. (Optional) DNN Face Detector — Better Accuracy

Download these two files into the project folder for a more accurate face detector:

```bash
# deploy.prototxt
wget https://raw.githubusercontent.com/opencv/opencv/master/samples/dnn/face_detector/deploy.prototxt

# caffemodel weights
wget https://github.com/opencv/opencv_3rdparty/raw/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel
```

If these files are missing, the app falls back to Haar Cascade automatically.

---

## 6. Run the Server

```bash
# Load .env and start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Server starts at: **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

---

## 7. API Endpoints

| Method   | Endpoint              | Description                        |
|----------|-----------------------|------------------------------------|
| `GET`    | `/`                   | Health check                       |
| `POST`   | `/analyze`            | Upload video → get full analysis   |
| `GET`    | `/results`            | List all past analyses             |
| `GET`    | `/results/{id}`       | Get full details of one analysis   |
| `DELETE` | `/results/{id}`       | Delete an analysis record          |

---

## 8. Example — Upload Video (curl)

```bash
curl -X POST http://localhost:8000/analyze \
  -F "video=@DF1.mp4"
```

---

## 9. Example Response (JSON)

```json
{
  "analysis_id": 1,
  "video_metadata": {
    "filename": "DF1.mp4",
    "duration_seconds": 10.3,
    "total_frames": 308,
    "fps": 30.0,
    "width": 406,
    "height": 722,
    "frame_skip": 5
  },
  "verdict": {
    "result": "DEEPFAKE",
    "confidence": 42.66
  },
  "score_statistics": {
    "mean_score": 0.4266,
    "max_score": 0.7260,
    "min_score": 0.1293,
    "std_dev": 0.1214,
    "threshold": 0.4
  },
  "frame_breakdown": {
    "total_frames": 308,
    "analyzed_frames": 60,
    "no_face_frames": 1,
    "fake_frames": 33,
    "real_frames": 27,
    "fake_percentage": 55.0
  },
  "processing_time_seconds": 6.9,
  "top_suspicious_frames": [
    {
      "frame": 260,
      "timestamp": 8.67,
      "time_label": "00:08.67",
      "faces": 1,
      "score": 0.7260,
      "verdict": "FAKE"
    }
  ],
  "score_distribution": [
    { "range": "0.0–0.1", "count": 0, "is_threshold_bin": false },
    { "range": "0.3–0.4", "count": 21, "is_threshold_bin": true }
  ],
  "created_at": "2026-03-15T10:00:00"
}
```

---

## Notes

- Tables are auto-created on first startup — no migrations needed.
- Uploaded videos are processed in a temp file and deleted immediately after analysis.
- The `.env` file is loaded automatically by `python-dotenv` at startup.
