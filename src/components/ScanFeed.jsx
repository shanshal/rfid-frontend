import { useEffect, useState } from "react";
import { getScans } from "../services/api";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ScanFeed({ limit = 20, refreshMs = 5000 }) {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const load = () => getScans(limit).then(r => setScans(r.data)).catch(() => {});
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [limit, refreshMs]);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
            <th className="pb-2 pr-4 font-medium">RFID Tag</th>
            <th className="pb-2 pr-4 font-medium">Instrument</th>
            <th className="pb-2 pr-4 font-medium">Room</th>
            <th className="pb-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {scans.length === 0 && (
            <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No recent scans</td></tr>
          )}
          {scans.map(s => (
            <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="py-1.5 pr-4 font-mono text-xs text-slate-600">{s.rfid_tag ?? "—"}</td>
              <td className="py-1.5 pr-4 text-xs">
                {s.instrument === "Unknown"
                  ? <span className="text-red-500">Unregistered</span>
                  : s.instrument}
              </td>
              <td className="py-1.5 pr-4 text-xs text-slate-500">{s.room}</td>
              <td className="py-1.5 text-xs text-slate-400">{fmt(s.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
