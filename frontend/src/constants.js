export const API = "http://localhost:8000";

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0f0f0f;
    --bg2:      #171717;
    --bg3:      #1e1e1e;
    --border:   #2a2a2a;
    --border2:  #383838;
    --text:     #f0f0f0;
    --text2:    #a0a0a0;
    --text3:    #606060;
    --red:      #ef4444;
    --red-bg:   rgba(239,68,68,0.1);
    --red-bdr:  rgba(239,68,68,0.25);
    --green:    #22c55e;
    --green-bg: rgba(34,197,94,0.1);
    --green-bdr:rgba(34,197,94,0.25);
    --amber:    #f59e0b;
    --blue:     #3b82f6;
    --font:     'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  html, body { height: 100%; background: var(--bg); color: var(--text); font-family: var(--font); }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

  .fade-up { animation: fadeUp 0.3s ease both; }

  ::-webkit-scrollbar       { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

  button:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }
`;
