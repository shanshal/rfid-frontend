import { useEffect, useRef, useState } from "react";
import Shell from "../layouts/Shell";
import { getLogs, getMqttMessages, getWsBase } from "../services/api";

const LEVELS = ["ALL", "DEBUG", "INFO", "WARN", "ERROR"];

const LEVEL_STYLE = {
  DEBUG: "bg-slate-100 text-slate-500",
  INFO:  "bg-blue-100  text-blue-700",
  WARN:  "bg-amber-100 text-amber-700",
  ERROR: "bg-red-100   text-red-700",
};

const ROW_HIGHLIGHT = {
  ERROR: "bg-red-50/50",
  WARN:  "bg-amber-50/40",
};

function LevelBadge({ level }) {
  return (
    <span className={`inline-block text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${LEVEL_STYLE[level] ?? "bg-slate-100 text-slate-500"}`}>
      {level}
    </span>
  );
}

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const IS_MOCK = import.meta.env.VITE_MOCK === "true";

export default function SystemLogs() {
  const [tab,         setTab]         = useState("logs");
  const [logs,        setLogs]        = useState([]);
  const [mqtt,        setMqtt]        = useState([]);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [paused,      setPaused]      = useState(false);
  const [wsStatus,    setWsStatus]    = useState("connecting");
  const wsRef        = useRef(null);
  const mqttEndRef   = useRef(null);
  const pausedRef    = useRef(paused);
  pausedRef.current  = paused;

  // Poll backend logs
  useEffect(() => {
    if (paused) return;
    const load = () => getLogs(300).then(r => setLogs(r.data)).catch(() => {});
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [paused]);

  // WebSocket for live MQTT feed (real backend)
  useEffect(() => {
    if (IS_MOCK) return;
    let dead = false;

    const connect = () => {
      if (dead) return;
      const ws = new WebSocket(`${getWsBase()}/ws/mqtt`);
      wsRef.current = ws;
      ws.onopen  = () => { if (!dead) setWsStatus("open"); };
      ws.onclose = () => {
        if (!dead) { setWsStatus("closed"); setTimeout(connect, 5000); }
      };
      ws.onerror = () => setWsStatus("closed");
      ws.onmessage = (e) => {
        if (pausedRef.current) return;
        try {
          const msg = JSON.parse(e.data);
          setMqtt(prev => [...prev.slice(-499), { ...msg, _id: Date.now() + Math.random() }]);
        } catch {
          setMqtt(prev => [...prev.slice(-499), {
            topic: "raw", payload: e.data, timestamp: new Date().toISOString(), _id: Date.now(),
          }]);
        }
      };
    };
    connect();
    return () => { dead = true; wsRef.current?.close(); };
  }, []);

  // Mock MQTT: seed static data then drip live events
  useEffect(() => {
    if (!IS_MOCK) return;
    getMqttMessages(40).then(r => setMqtt(r.data.map((m, i) => ({ ...m, _id: i })))).catch(() => {});

    const TOPICS = [
      "rfid/scan/reader-001", "rfid/scan/reader-002",
      "rfid/scan/reader-004", "rfid/status/reader-001",
      "rfid/status/reader-003", "rfid/alert",
    ];
    const RFIDS = ["A1001","A1002","A1003","A1005","A1008","A1011"];
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      let payload;
      if (topic.includes("scan"))   payload = JSON.stringify({ rfid: RFIDS[Math.floor(Math.random() * RFIDS.length)], rssi: -(55 + Math.floor(Math.random() * 25)) });
      else if (topic.includes("status")) payload = JSON.stringify({ online: Math.random() > 0.1, uptime_s: Math.floor(Math.random() * 86400) });
      else                          payload = JSON.stringify({ type: "unknown_rfid", tag: `X${Math.floor(Math.random() * 9000 + 1000)}` });

      setMqtt(prev => [...prev.slice(-499), {
        topic, payload, timestamp: new Date().toISOString(), _id: Date.now() + Math.random(),
      }]);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll MQTT to newest
  useEffect(() => {
    if (!paused) mqttEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mqtt, paused]);

  const filteredLogs = levelFilter === "ALL" ? logs : logs.filter(l => l.level === levelFilter);

  const wsConnected = IS_MOCK || wsStatus === "open";

  return (
    <Shell title="System Logs">
      {/* Tab bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setTab("logs")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "logs" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          App Logs
        </button>
        <button
          onClick={() => setTab("mqtt")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === "mqtt" ? "bg-teal-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
        >
          MQTT Feed
          <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-400" : "bg-red-400"}`} />
        </button>

        <div className="flex-1" />

        <button
          onClick={() => setPaused(p => !p)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${paused ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>

        {tab === "mqtt" && (
          <button
            onClick={() => setMqtt([])}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── App Logs ── */}
      {tab === "logs" && (
        <>
          <div className="flex items-center gap-1.5 mb-3">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${levelFilter === l ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                {l}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filteredLogs.length} entries</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <table className="w-full font-mono text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-400 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium whitespace-nowrap">Time</th>
                    <th className="px-3 py-2 font-medium">Level</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">No log entries</td>
                    </tr>
                  )}
                  {filteredLogs.map((l, i) => (
                    <tr key={l.id ?? i} className={`border-t border-slate-50 ${ROW_HIGHLIGHT[l.level] ?? ""}`}>
                      <td className="px-3 py-1.5 text-slate-400 whitespace-nowrap">{fmt(l.timestamp)}</td>
                      <td className="px-3 py-1.5"><LevelBadge level={l.level} /></td>
                      <td className="px-3 py-1.5 text-slate-500 whitespace-nowrap">{l.source}</td>
                      <td className="px-3 py-1.5 text-slate-700 break-all">{l.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── MQTT Feed ── */}
      {tab === "mqtt" && (
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-800">
          {/* status bar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
            <span className={`w-2 h-2 rounded-full shrink-0 ${wsConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {IS_MOCK
              ? "Mock MQTT stream (live)"
              : wsStatus === "open"
              ? "Connected to MQTT WebSocket"
              : "Reconnecting to MQTT WebSocket..."}
            <span className="ml-auto">{mqtt.length} messages</span>
          </div>

          {/* message list */}
          <div className="overflow-auto p-3 space-y-1 font-mono text-xs" style={{ maxHeight: "calc(100vh - 260px)" }}>
            {mqtt.length === 0 && (
              <p className="text-slate-500 text-center py-10">Waiting for MQTT messages…</p>
            )}
            {mqtt.map((m) => {
              let pretty = m.payload;
              try { pretty = JSON.stringify(JSON.parse(m.payload)); } catch { /* leave as-is */ }
              return (
                <div key={m._id ?? m.id} className="flex gap-3 px-2 py-1 rounded hover:bg-slate-800/60">
                  <span className="text-slate-500 whitespace-nowrap shrink-0">{fmt(m.timestamp)}</span>
                  <span className={`whitespace-nowrap shrink-0 ${m.topic.includes("alert") ? "text-amber-400" : m.topic.includes("status") ? "text-sky-400" : "text-teal-400"}`}>
                    {m.topic}
                  </span>
                  <span className="text-slate-300 break-all">{pretty}</span>
                </div>
              );
            })}
            <div ref={mqttEndRef} />
          </div>
        </div>
      )}
    </Shell>
  );
}
