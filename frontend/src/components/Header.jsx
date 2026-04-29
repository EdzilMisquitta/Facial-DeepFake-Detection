import { Badge } from "./Primitives";

export function Header() {
  return (
    <header
      style={{
        height: 60,
        flexShrink: 0,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg2)",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "var(--bg3)",
            border: "1px solid var(--border2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🔬
        </div>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            Deepfake Detector
          </h1>
          <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>
            Forensic Video Analysis
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            color: "var(--text3)",
            fontWeight: 500,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--green)",
              display: "inline-block",
              animation: "pulse 2.5s ease-in-out infinite",
            }}
          />
          Online
        </div>
        <Badge variant="default">Xception CNN</Badge>
        <Badge variant="default">FaceForensics++</Badge>
      </div>
    </header>
  );
}
