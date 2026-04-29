import { useState, useEffect, useCallback } from "react";
import { GLOBAL_CSS, API } from "./constants";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ResultPanel } from "./components/ResultPanel";

export default function DeepfakeDetector() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [histLoading, setHistLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await fetch(`${API}/results?limit=50`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      /* silent */
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFile = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveId(null);
    const fd = new FormData();
    fd.append("video", file);
    try {
      const res = await fetch(`${API}/analyze`, { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Server error" }));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      setResult(data);
      setActiveId(data.analysis_id);
      await fetchHistory();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadItem = async (id) => {
    setActiveId(id);
    setError(null);
    try {
      const res = await fetch(`${API}/results/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          fontFamily: "var(--font)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "290px 1fr",
            height: "calc(100vh - 60px)",
            overflow: "hidden",
          }}
        >
          <Sidebar
            loading={loading}
            error={error}
            history={history}
            histLoading={histLoading}
            activeId={activeId}
            onFile={handleFile}
            onLoadItem={loadItem}
            onRefreshHistory={fetchHistory}
          />

          <main
            style={{
              overflowY: "auto",
              padding: "28px 32px",
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {result ? (
              <ResultPanel data={result} />
            ) : (
              <div
                style={{
                  flex: 1,
                  minHeight: "calc(100vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    opacity: 0.5,
                  }}
                >
                  🎬
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text3)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  No analysis loaded
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text3)",
                    textAlign: "center",
                    lineHeight: 1.6,
                    maxWidth: 320,
                    opacity: 0.7,
                  }}
                >
                  Upload a video file or select a record from the history panel
                  to view results.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
