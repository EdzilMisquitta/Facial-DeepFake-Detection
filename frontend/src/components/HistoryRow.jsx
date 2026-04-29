import { Badge } from "./Primitives";

export function HistoryRow({ item, active, onClick }) {
  const isFake = item.verdict === "DEEPFAKE";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: active ? "var(--bg3)" : "transparent",
        border: `1px solid ${active ? "var(--border2)" : "transparent"}`,
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 3,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: active ? "var(--text)" : "var(--text2)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 3,
          }}
        >
          {item.filename}
        </p>
        <p style={{ fontSize: 11, color: "var(--text3)" }}>
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
      <Badge variant={isFake ? "red" : "green"}>
        {isFake ? "Fake" : "Real"}
      </Badge>
    </button>
  );
}
