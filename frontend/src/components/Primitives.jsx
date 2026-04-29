import { clamp, fmt } from "../utils/helpers";

export function Badge({ children, variant = "default" }) {
  const styles = {
    default: { bg: "var(--bg3)", border: "var(--border2)", color: "var(--text2)" },
    red:     { bg: "var(--red-bg)", border: "var(--red-bdr)", color: "var(--red)" },
    green:   { bg: "var(--green-bg)", border: "var(--green-bdr)", color: "var(--green)" },
    amber:   { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: "var(--amber)" },
    blue:    { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", color: "var(--blue)" },
  };
  const s = styles[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 6,
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text3)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 16,
      }}
    >
      {children}
    </p>
  );
}

export function ScoreBar({ value, animated = true }) {
  const fill = clamp(value * 100, 0, 100);
  const color =
    value >= 0.7 ? "var(--red)" : value >= 0.5 ? "var(--amber)" : "var(--green)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--bg3)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fill}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
            transition: animated ? "width 0.8s ease" : "none",
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          color: "var(--text2)",
          minWidth: 44,
          textAlign: "right",
          fontWeight: 500,
        }}
      >
        {fmt(value, 3)}
      </span>
    </div>
  );
}

export function MetaStat({ label, value }) {
  return (
    <div
      style={{
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "16px 18px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text3)",
          fontWeight: 500,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "2px solid var(--border2)",
        borderTop: "2px solid var(--text2)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        margin: "0 auto",
      }}
    />
  );
}
