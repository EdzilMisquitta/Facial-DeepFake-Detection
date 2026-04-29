import { UploadZone } from "./UploadZone";
import { HistoryRow } from "./HistoryRow";
import { Spinner } from "./Primitives";

export function Sidebar({
  loading,
  error,
  history,
  histLoading,
  activeId,
  onFile,
  onLoadItem,
  onRefreshHistory,
}) {
  return (
    <aside
      style={{
        borderRight: "1px solid var(--border)",
        background: "var(--bg2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Upload */}
      <div style={{ padding: "18px 16px 14px" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text3)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Upload Video
        </p>
        <UploadZone onFile={onFile} loading={loading} />
        {error && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-bdr)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--red)",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            ⚠ {error}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "0 16px" }} />

      {/* History */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              History
            </p>
            {history.length > 0 && (
              <span
                style={{
                  padding: "1px 7px",
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text3)",
                }}
              >
                {history.length}
              </span>
            )}
          </div>
          <button
            onClick={onRefreshHistory}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--text3)",
              cursor: "pointer",
              fontSize: 14,
              padding: "3px 9px",
              borderRadius: 6,
              transition: "all 0.15s",
              fontFamily: "var(--font)",
            }}
          >
            ↻
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 16px" }}>
          {histLoading ? (
            <div style={{ textAlign: "center", paddingTop: 28 }}>
              <Spinner size={20} />
            </div>
          ) : history.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text3)", textAlign: "center", paddingTop: 28 }}>
              No records yet
            </p>
          ) : (
            history.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                active={item.id === activeId}
                onClick={() => onLoadItem(item.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500 }}>
          Deepfake Detector · Final Year Project
        </p>
        <p style={{ fontSize: 11, color: "var(--text3)", opacity: 0.5, marginTop: 2 }}>
          Xception CNN · FaceForensics++ · 2026
        </p>
      </div>
    </aside>
  );
}
