import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Shell from "../layouts/Shell";
import { DeviceStatusBadge, OutcomeBadge, deviceStatus } from "../components/StatusBadge";
import { getDevice, getDeviceLogs, getRooms, assignDeviceRoom } from "../services/api";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function duration(a, b) {
  if (!a || !b) return "—";
  return `${Math.round((new Date(b) - new Date(a))).toFixed(0)} ms`;
}

export default function DeviceDetail() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomAssign, setRoomAssign] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadDevice = () => getDevice(id).then(r => setDevice(r.data)).catch(() => {});
  const loadLogs = () => getDeviceLogs(id, 100).then(r => setLogs(r.data)).catch(() => {});

  useEffect(() => {
    loadDevice();
    loadLogs();
    getRooms().then(r => setRooms(r.data)).catch(() => {});
    const interval = setInterval(loadLogs, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

  async function saveRoom() {
    if (!roomAssign) return;
    setBusy(true); setMsg(null);
    try {
      await assignDeviceRoom(id, Number(roomAssign));
      setMsg({ ok: true, text: "Room assigned." });
      setRoomAssign("");
      loadDevice();
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.detail ?? "Assignment failed." });
    } finally { setBusy(false); }
  }

  const status = device ? deviceStatus(device) : "offline";

  return (
    <Shell title={device?.name ?? "Device"}>
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/devices" className="text-slate-400 hover:text-slate-600 text-sm">← Devices</Link>
          <DeviceStatusBadge status={status} />
        </div>

        {device && (
          <>
            {/* Info card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">MAC Address</p>
                <p className="font-mono text-sm text-slate-700 mt-0.5">{device.mac_address}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Room</p>
                <p className="text-sm text-slate-700 mt-0.5">{device.room_id ? (roomMap[device.room_id] ?? `Room ${device.room_id}`) : <span className="text-amber-600">Unassigned</span>}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Local IP</p>
                <p className="font-mono text-sm text-slate-700 mt-0.5">{device.local_ip ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Firmware</p>
                <p className="font-mono text-sm text-slate-700 mt-0.5">{device.firmware ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Scan Topic</p>
                <p className="font-mono text-xs text-slate-500 mt-0.5 truncate">{device.scan_topic ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Seen</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmt(device.last_activity_at)}</p>
              </div>
            </div>

            {/* Assign room (only if unassigned) */}
            {!device.room_id && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-amber-800">This device has no room assigned.</p>
                {msg && <p className={`text-xs ${msg.ok ? "text-emerald-700" : "text-red-600"}`}>{msg.text}</p>}
                <div className="flex items-center gap-2">
                  <select
                    value={roomAssign}
                    onChange={e => setRoomAssign(e.target.value)}
                    className="text-sm border border-amber-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Select room…</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                  <button
                    onClick={saveRoom}
                    disabled={!roomAssign || busy}
                    className="text-sm px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
                  >
                    Assign Room
                  </button>
                </div>
              </div>
            )}

            {/* Scan log */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-800">Scan Log</h2>
                <span className="text-xs text-slate-400">Auto-refreshes every 8s</span>
              </div>
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-3 font-medium">RFID UID</th>
                      <th className="pb-2 pr-3 font-medium">Outcome</th>
                      <th className="pb-2 pr-3 font-medium">From → To</th>
                      <th className="pb-2 pr-3 font-medium">Processing</th>
                      <th className="pb-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-slate-400">No scan logs</td></tr>
                    )}
                    {logs.map(l => (
                      <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-1.5 pr-3 font-mono text-slate-600">{l.rfid_uid ?? "—"}</td>
                        <td className="py-1.5 pr-3"><OutcomeBadge outcome={l.outcome} /></td>
                        <td className="py-1.5 pr-3 text-slate-500">
                          {l.from_room_id ? roomMap[l.from_room_id] ?? l.from_room_id : "—"} → {l.to_room_id ? roomMap[l.to_room_id] ?? l.to_room_id : "—"}
                        </td>
                        <td className="py-1.5 pr-3 text-slate-400">{duration(l.handler_started_at, l.handler_finished_at)}</td>
                        <td className="py-1.5 text-slate-400">{fmt(l.backend_received_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
