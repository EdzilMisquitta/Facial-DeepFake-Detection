import { Badge, Card, SectionTitle, ScoreBar, MetaStat } from "./Primitives";
import { fmt, pct } from "../utils/helpers";

export function ResultPanel({ data }) {
  const isFake = data.verdict.result === "DEEPFAKE";
  const accent = isFake ? "var(--red)" : "var(--green)";
  const accentBg = isFake ? "var(--red-bg)" : "var(--green-bg)";
  const accentBdr = isFake ? "var(--red-bdr)" : "var(--green-bdr)";
  const variant = isFake ? "red" : "green";

  return (
    <div
      className="fade-up"
      style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}
    >
      {/* ── VERDICT ── */}
      <div
        style={{
          background: accentBg,
          border: `1px solid ${accentBdr}`,
          borderRadius: 14,
          padding: "32px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, marginBottom: 8, letterSpacing: "0.03em" }}>
            Analysis Result
          </p>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 14 }}>
            {isFake ? "Deepfake" : "Authentic"}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Badge variant={variant}>
              {isFake ? "⚠ Manipulation Detected" : "✓ No Manipulation Found"}
            </Badge>
            <Badge variant="default">ID #{data.analysis_id}</Badge>
          </div>
          <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 12 }}>
            {data.video_metadata.filename}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, marginBottom: 6 }}>
            Confidence
          </p>
          <p style={{ fontSize: 64, fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {fmt(data.verdict.confidence, 1)}
            <span style={{ fontSize: 30, fontWeight: 600 }}>%</span>
          </p>
          <div
            style={{
              width: 200,
              height: 5,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 99,
              overflow: "hidden",
              marginLeft: "auto",
              marginTop: 10,
            }}
          >
            <div
              style={{
                width: `${data.verdict.confidence}%`,
                height: "100%",
                background: accent,
                borderRadius: 99,
                transition: "width 1.2s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>
            {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── VIDEO METADATA ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {[
          { label: "Duration",        value: `${fmt(data.video_metadata.duration_seconds, 1)}s` },
          { label: "Total Frames",    value: data.video_metadata.total_frames },
          { label: "Frame Rate",      value: `${fmt(data.video_metadata.fps, 0)} fps` },
          { label: "Resolution",      value: `${data.video_metadata.width}×${data.video_metadata.height}` },
          { label: "Frames Analyzed", value: data.frame_breakdown.analyzed_frames },
        ].map((s) => (
          <MetaStat key={s.label} {...s} />
        ))}
      </div>

      {/* ── SCORES + BREAKDOWN ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Score Statistics */}
        <Card>
          <SectionTitle>Score Statistics</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["Mean Score",    data.score_statistics.mean_score],
              ["Peak Score",    data.score_statistics.max_score],
              ["Floor Score",   data.score_statistics.min_score],
              ["Std Deviation", data.score_statistics.std_dev],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "var(--text2)", fontWeight: 500 }}>{label}</span>
                </div>
                <ScoreBar value={val} />
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text3)" }}>
              Threshold:{" "}
              <span style={{ color: "var(--amber)", fontWeight: 600 }}>
                {data.score_statistics.threshold}
              </span>
            </span>
            <span style={{ fontSize: 13, color: "var(--text3)" }}>0 = Real · 1 = Fake</span>
          </div>
        </Card>

        {/* Frame Breakdown */}
        <Card>
          <SectionTitle>Frame Breakdown</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Fake Frames",  value: data.frame_breakdown.fake_frames,  sub: pct(data.frame_breakdown.fake_percentage), accent: true },
              { label: "Real Frames",  value: data.frame_breakdown.real_frames,  sub: pct(100 - data.frame_breakdown.fake_percentage) },
              { label: "No Face Found", value: data.frame_breakdown.no_face_frames },
              { label: "Process Time", value: `${fmt(data.processing_time_seconds, 1)}s` },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--bg3)",
                  border: `1px solid ${s.accent ? "var(--red-bdr)" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: s.accent ? "var(--red)" : "var(--text)" }}>
                  {s.value}
                </div>
                {s.sub && (
                  <div style={{ fontSize: 12, color: "var(--amber)", fontWeight: 600, marginTop: 3 }}>
                    {s.sub}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 5, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Ratio Bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--text2)",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              <span>Fake / Real Ratio</span>
              <span style={{ color: isFake ? "var(--red)" : "var(--green)" }}>
                {pct(data.frame_breakdown.fake_percentage)} fake
              </span>
            </div>
            <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", background: "var(--bg3)" }}>
              <div
                style={{
                  width: pct(data.frame_breakdown.fake_percentage),
                  background: "var(--red)",
                  transition: "width 1s ease",
                  minWidth: data.frame_breakdown.fake_frames > 0 ? 3 : 0,
                }}
              />
              <div style={{ flex: 1, background: "var(--green)", opacity: 0.7 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginTop: 6 }}>
              <span style={{ color: "var(--red)", fontWeight: 500 }}>● Fake</span>
              <span style={{ color: "var(--green)", fontWeight: 500 }}>● Real</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── HISTOGRAM ── */}
      <Card>
        <SectionTitle>Score Distribution</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, paddingBottom: 2 }}>
          {data.score_distribution.map((bin) => {
            const maxC = Math.max(...data.score_distribution.map((b) => b.count), 1);
            const h = Math.max((bin.count / maxC) * 94, bin.count > 0 ? 4 : 2);
            const rv = parseFloat(bin.range);
            const barColor = bin.is_threshold_bin
              ? "var(--amber)"
              : rv >= 0.5
                ? "var(--red)"
                : "var(--green)";
            return (
              <div
                key={bin.range}
                title={`${bin.range}: ${bin.count} frames`}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                {bin.count > 0 && (
                  <span style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4, fontWeight: 500 }}>
                    {bin.count}
                  </span>
                )}
                <div
                  style={{
                    width: "100%",
                    height: h,
                    background: barColor,
                    opacity: bin.count === 0 ? 0.12 : 0.9,
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.7s ease",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--text3)",
            fontWeight: 500,
            marginTop: 8,
            paddingTop: 10,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span>0.0 — Real</span>
          <span style={{ color: "var(--amber)" }}>▲ Threshold {data.score_statistics.threshold}</span>
          <span>1.0 — Fake</span>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          {[
            { color: "var(--green)", label: "Below threshold (Real)" },
            { color: "var(--amber)", label: "Threshold zone" },
            { color: "var(--red)",   label: "Above threshold (Fake)" },
          ].map((l) => (
            <span
              key={l.label}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: l.color,
                  display: "inline-block",
                  opacity: 0.85,
                }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </Card>

      {/* ── TOP SUSPICIOUS FRAMES ── */}
      {data.top_suspicious_frames?.length > 0 && (
        <Card>
          <SectionTitle>Top Suspicious Frames</SectionTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "36px 90px 110px 70px 1fr 90px",
              gap: 16,
              paddingBottom: 12,
              borderBottom: "1px solid var(--border)",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text3)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <span>#</span>
            <span>Frame</span>
            <span>Timestamp</span>
            <span>Faces</span>
            <span>Fake Probability</span>
            <span style={{ textAlign: "right" }}>Result</span>
          </div>
          {data.top_suspicious_frames.map((fr, i) => (
            <div
              key={fr.frame}
              style={{
                display: "grid",
                gridTemplateColumns: "36px 90px 110px 70px 1fr 90px",
                gap: 16,
                padding: "14px 0",
                borderBottom: "1px solid var(--bg3)",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text3)", fontWeight: 600 }}>{i + 1}</span>
              <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{fr.frame}</span>
              <span style={{ fontSize: 14, color: "var(--blue)", fontWeight: 500 }}>{fr.time_label}</span>
              <span style={{ fontSize: 14, color: "var(--text2)" }}>{fr.faces}</span>
              <ScoreBar value={fr.score} animated={false} />
              <div style={{ textAlign: "right" }}>
                <Badge variant={fr.verdict === "FAKE" ? "red" : "green"}>{fr.verdict}</Badge>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
