import { useRef, useState } from "react";
import { Spinner } from "./Primitives";

export function UploadZone({ onFile, loading }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current.click()}
      style={{
        border: `2px dashed ${drag ? "#555" : "var(--border2)"}`,
        borderRadius: 10,
        padding: "28px 20px",
        textAlign: "center",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        background: drag ? "rgba(255,255,255,0.03)" : "transparent",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />
      {loading ? (
        <>
          <Spinner size={28} />
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 12, fontWeight: 500 }}>
            Analyzing video…
          </p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
            Processing frame data
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🎬</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>
            Drop video file here
          </p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>
            MP4, AVI, MOV, MKV, WEBM
          </p>
          <span
            style={{
              display: "inline-block",
              padding: "7px 18px",
              background: "var(--bg3)",
              border: "1px solid var(--border2)",
              borderRadius: 7,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text2)",
            }}
          >
            Browse Files
          </span>
        </>
      )}
    </div>
  );
}
