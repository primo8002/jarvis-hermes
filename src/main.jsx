import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'http://127.0.0.1:8787';
const quickActions = [
  'Open my most important unread items and summarize them',
  'Search the web for the latest AI assistant demos and make a comparison table',
  'Inspect this computer and tell me what is using resources',
  'Create a file on my Desktop with a plan for today',
  'Build or fix the current project and run tests',
  'Find files related to Jarvis and summarize them',
  'Pull current data for a topic I name and cite sources',
  'Automate a repetitive desktop/task workflow end-to-end'
];

function fmtBytes(n) {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0, v = n;
  while (v > 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(i ? 1 : 0)} ${units[i]}`;
}

function MindOrb({ state, level }) {
  const rings = Array.from({ length: 28 }, (_, i) => i);
  return <div className={`orbWrap ${state}`}>
    <div className="halo halo1" />
    <div className="halo halo2" />
    <div className="halo halo3" />
    <div className="radar" />
    <div className="ringBars">
      {rings.map(i => <i key={i} style={{ '--i': i, '--h': `${18 + Math.sin(i + level * 16) * 11 + level * 70}px` }} />)}
    </div>
    <div className="orb" style={{ transform: `scale(${1 + level * .08})` }}>
      <div className="core" />
      <div className="shine" />
      <span>{state === 'listening' ? 'LISTENING' : state === 'thinking' ? 'THINKING' : state === 'speaking' ? 'SPEAKING' : 'JARVIS'}</span>
    </div>
  </div>;
}

function useMicLevel(enabled) {
  const [level, setLevel] = useState(0.08);
  useEffect(() => {
    if (!enabled) { setLevel(0.08); return; }
    let ctx, analyser, source, raf, stream;
    navigator.mediaDevices?.getUserMedia({ audio: true }).then(s => {
      stream = s;
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setLevel(Math.min(1, avg * 2.2));
        raf = requestAnimationFrame(loop);
      };
      loop();
    }).catch(() => setLevel(0.12));
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach(t => t.stop()); ctx?.close(); };
  }, [enabled]);
  return level;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('idle');
  const [input, setInput] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [tokens, setTokens] = useState('');
  const [tools, setTools] = useState([]);
  const [traces, setTraces] = useState([]);
  const [system, setSystem] = useState(null);
  const [config, setConfig] = useState(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [selfCorrection, setSelfCorrection] = useState(false);
  const [listening, setListening] = useState(false);
  const wsRef = useRef(null);
  const recRef = useRef(null);
  const outputRef = useRef(null);
  const micLevel = useMicLevel(listening);
  const orbLevel = status === 'thinking' ? 0.45 + Math.random() * 0.1 : listening ? micLevel : status === 'speaking' ? 0.25 : 0.08;

  useEffect(() => {
    fetch(`${API}/api/health`).then(r => r.json()).then(setConfig).catch(() => {});
    const loadSystem = () => fetch(`${API}/api/system`).then(r => r.json()).then(setSystem).catch(() => {});
    loadSystem();
    const int = setInterval(loadSystem, 3000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8787/assistant');
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => { setConnected(false); setStatus('offline'); };
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === 'hello') setConfig(c => ({ ...c, ...msg }));
      if (msg.type === 'status') setStatus(msg.status);
      if (msg.type === 'token') setTokens(t => t + msg.text);
      if (msg.type === 'tool') setTools(t => [{ name: msg.name, input: msg.input, at: new Date().toLocaleTimeString() }, ...t].slice(0, 20));
      if (msg.type === 'trace') setTraces(t => [{ event: msg.event, at: new Date().toLocaleTimeString() }, ...t].slice(0, 28));
      if (msg.type === 'stderr') setTraces(t => [{ event: msg.text.trim().slice(0, 180), at: new Date().toLocaleTimeString(), err: true }, ...t].slice(0, 28));
      if (msg.type === 'done') {
        setStatus(msg.code === 0 ? 'speaking' : 'error');
        if (msg.text) {
          setTranscript(t => [...t, { role: 'jarvis', text: msg.text }]);
          if (voiceOn) speak(msg.text);
        }
        setTimeout(() => setStatus('idle'), 800);
      }
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
    };
    return () => ws.close();
  }, [voiceOn]);

  function speak(text) {
    window.speechSynthesis?.cancel();
    const utter = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, 'code block omitted'));
    utter.rate = 1.02; utter.pitch = 0.88;
    utter.onstart = () => setStatus('speaking');
    utter.onend = () => setStatus('idle');
    window.speechSynthesis?.speak(utter);
  }

  function send(text = input) {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== 1) return;
    window.speechSynthesis?.cancel();
    setTranscript(t => [...t, { role: 'you', text }]);
    setTokens('');
    setInput('');
    setStatus('thinking');
    wsRef.current.send(JSON.stringify({ type: 'prompt', text, options: { selfCorrection } }));
  }

  function stop() {
    window.speechSynthesis?.cancel();
    wsRef.current?.send(JSON.stringify({ type: 'stop' }));
    setStatus('idle');
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('SpeechRecognition is not available in this browser. Use Chrome/Edge or type commands.'); return; }
    stop();
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => { setListening(true); setStatus('listening'); };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setInput(text);
      if (e.results[e.results.length - 1].isFinal) setTimeout(() => send(text), 250);
    };
    rec.onend = () => { setListening(false); setStatus(s => s === 'listening' ? 'idle' : s); };
    recRef.current = rec;
    rec.start();
  }

  const state = listening ? 'listening' : status;
  const lastLines = tokens || transcript.filter(x => x.role === 'jarvis').slice(-1)[0]?.text || 'Awaiting command. Say “Jarvis…” or type a mission.';

  return <main>
    <section className="shell">
      <header>
        <div><h1>JARVIS</h1><p>Claude CLI voice cockpit · local full-access mode</p></div>
        <div className="status"><b className={connected ? 'ok' : 'bad'} />{connected ? 'online' : 'offline'} · {config?.permissionMode || '...'}</div>
      </header>

      <div className="grid">
        <aside className="panel left">
          <h2>System</h2>
          <div className="metric"><span>CPU</span><b>{system?.cpu?.load?.toFixed?.(0) || 0}%</b></div>
          <div className="bar"><i style={{ width: `${system?.cpu?.load || 0}%` }} /></div>
          <div className="metric"><span>Memory</span><b>{fmtBytes(system?.memory?.used)} / {fmtBytes(system?.memory?.total)}</b></div>
          <div className="bar"><i style={{ width: `${system ? system.memory.used / system.memory.total * 100 : 0}%` }} /></div>
          <div className="metric"><span>Disk</span><b>{system?.disk?.use?.toFixed?.(0) || 0}%</b></div>
          <div className="bar"><i style={{ width: `${system?.disk?.use || 0}%` }} /></div>
          <div className="small">{system?.platform}<br />{system?.host} · {system?.arch}<br />Processes: {system?.processes?.all || 0}</div>
          <h2>Capabilities</h2>
          <ul className="caps"><li>Voice I/O</li><li>Desktop automation via Claude CLI</li><li>Files, terminal, code, web/data pulls</li><li>Documents, research, app control</li><li>Barge-in and stop</li></ul>
        </aside>

        <section className="center">
          <MindOrb state={state} level={orbLevel} />
          <div className="composer">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Tell Jarvis what to do..." />
            <button onClick={() => send()}>Send</button><button onClick={startVoice}>Voice</button><button onClick={stop}>Stop</button>
          </div>
          <div className="toggles"><label><input type="checkbox" checked={voiceOn} onChange={e => setVoiceOn(e.target.checked)} /> Speak replies</label><label><input type="checkbox" checked={selfCorrection} onChange={e => setSelfCorrection(e.target.checked)} /> Self-correction</label></div>
          <div className="chips">{quickActions.map(q => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
        </section>

        <aside className="panel right">
          <h2>Tool ticker</h2>
          <div className="ticker">{tools.length ? tools.map((t, i) => <p key={i}><b>{t.at}</b> {t.name}<small>{JSON.stringify(t.input || {}).slice(0, 120)}</small></p>) : <p>No tools yet.</p>}</div>
          <h2>Reasoning trace</h2>
          <div className="ticker trace">{traces.map((t, i) => <p className={t.err ? 'err' : ''} key={i}><b>{t.at}</b> {t.event}</p>)}</div>
        </aside>
      </div>

      <section className="console" ref={outputRef}>
        <h2>Live mission transcript</h2>
        {transcript.slice(-8).map((m, i) => <p key={i} className={m.role}><b>{m.role === 'you' ? 'Svanik' : 'Jarvis'}:</b> {m.text}</p>)}
        <pre>{lastLines}</pre>
      </section>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
