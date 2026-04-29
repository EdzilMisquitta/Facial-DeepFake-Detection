from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class VideoMetadata(BaseModel):
    filename: str
    duration_seconds: float
    total_frames: int
    fps: float
    width: int
    height: int
    frame_skip: int


class Verdict(BaseModel):
    result: str        # "DEEPFAKE" or "REAL"
    confidence: float  # 0–100


class ScoreStatistics(BaseModel):
    mean_score: float
    max_score: float
    min_score: float
    std_dev: float
    threshold: float


class FrameBreakdown(BaseModel):
    total_frames: int
    analyzed_frames: int
    no_face_frames: int
    fake_frames: int
    real_frames: int
    fake_percentage: float


class SuspiciousFrame(BaseModel):
    frame: int
    timestamp: float
    time_label: str
    faces: int
    score: float
    verdict: str


class ScoreBin(BaseModel):
    range: str
    count: int
    is_threshold_bin: bool


class AnalysisResponse(BaseModel):
    analysis_id: int
    video_metadata: VideoMetadata
    verdict: Verdict
    score_statistics: ScoreStatistics
    frame_breakdown: FrameBreakdown
    processing_time_seconds: float
    top_suspicious_frames: List[SuspiciousFrame]
    score_distribution: List[ScoreBin]
    created_at: datetime


class AnalysisSummary(BaseModel):
    id: int
    filename: str
    verdict: str
    confidence: float
    mean_score: float
    processing_time_sec: float
    created_at: datetime

    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    detail: str
