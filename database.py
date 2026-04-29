from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5435/deepfake_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id                  = Column(Integer, primary_key=True, index=True)
    filename            = Column(String, nullable=False)
    created_at          = Column(DateTime, default=datetime.utcnow)

    # Video metadata
    duration_seconds    = Column(Float)
    total_frames        = Column(Integer)
    fps                 = Column(Float)
    width               = Column(Integer)
    height              = Column(Integer)
    frame_skip          = Column(Integer)

    # Verdict
    verdict             = Column(String)          # "DEEPFAKE" or "REAL"
    confidence          = Column(Float)           # 0–100
    mean_score          = Column(Float)
    max_score           = Column(Float)
    min_score           = Column(Float)
    std_score           = Column(Float)

    # Frame breakdown
    analyzed_frames     = Column(Integer)
    no_face_frames      = Column(Integer)
    fake_frames         = Column(Integer)
    real_frames         = Column(Integer)
    fake_percentage     = Column(Float)

    processing_time_sec = Column(Float)

    # JSON blobs
    top_suspicious_frames = Column(JSON)   # list of dicts
    score_distribution    = Column(JSON)   # list of bin dicts


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    Base.metadata.create_all(bind=engine)
