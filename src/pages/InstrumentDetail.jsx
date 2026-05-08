import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Shell from "../layouts/Shell";
import { InstrumentStatusBadge, OutcomeBadge } from "../components/StatusBadge";
import Timeline from "../components/Timeline";
import { getInstrumentDetail, getRooms, transferInstrument, retireInstrument } from "../services/api";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export default function InstrumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instrument, setInstrument] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [toRoomId, setToRoomId] = useState("");
  const [tab, setTab] = useState("history");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => {
    getInstrumentDetail(id).then(r => setInstrument(r.data)).catch(() => {});
    getRooms().then(r => setRooms(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [id]);

  async function transfer() {
    if (!toRoomId) return;
    setBusy(true); setMsg(null);
    try {
      await transferInstrument(id, Number(toRoomId));
      setMsg({ ok: true, text: "Transferred successfully." });
      setToRoomId("");
      load();
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.detail ?? "Transfer failed." });
    } finally { setBusy(false); }
  }

  async function retire() {
    const notes = window.prompt("Retire this instrument? Enter reason (optional):");
    if (notes === null) return;
    setBusy(true); setMsg(null);
    try {
      await retireInstrument(id, notes || null);
      setMsg({ ok: true, text: "Instrument retired." });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.detail ?? "Retire failed." });
    } finally { setBusy(false); }
  }

  const isRetired = instrument?.status === "retired";

  return (
    <Shell title={instrument?.name ?? "Instrument"}>
      <div className="max-w-3xl space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/instruments" className="text-slate-400 hover:text-slate-600 text-sm">← Instruments</Link>
          {instrument && <InstrumentStatusBadge status={instrument.status} />}
        </div>

        {instrument && (
          <>
            {/* Info card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">RFID Tag</p>
                <p className="font-mono text-sm text-slate-700 mt-0.5">{instrument.rfid}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Current Room</p>
                <p className="text-sm text-slate-700 mt-0.5">{instrument.location ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <div className="mt-0.5"><InstrumentStatusBadge status={instrument.status} /></div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmt(instrument.updated_at)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Actions</h3>
              {msg && (
                <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={toRoomId}
                  onChange={e => setToRoomId(e.target.value)}
                  disabled={isRetired}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white disabled:opacity-50"
                >
                  <option value="">Select destination room…</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button
                  onClick={transfer}
                  disabled={isRetired || !toRoomId || busy}
                  className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
                >
                  Transfer
                </button>
                <button
                  onClick={retire}
                  disabled={isRetired || busy}
                  className="text-sm px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  Retire
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
              <div className="flex border-b border-slate-100">
                {["history", "scans"].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-5 py-3 text-sm font-medium transition-colors ${tab === t ? "text-teal-700 border-b-2 border-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {t === "history" ? "Lifecycle History" : "Recent Scans"}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {tab === "history" && (
                  <Timeline entries={instrument.lifecycle_history ?? []} />
                )}
                {tab === "scans" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                          <th className="pb-2 pr-4 font-medium">Device</th>
                          <th className="pb-2 pr-4 font-medium">Room</th>
                          <th className="pb-2 pr-4 font-medium">Outcome</th>
                          <th className="pb-2 font-medium">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(instrument.recent_scans ?? []).length === 0 && (
                          <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No scans recorded</td></tr>
                        )}
                        {(instrument.recent_scans ?? []).map((s, i) => (
                          <tr key={i} className="border-b border-slate-50">
                            <td className="py-2 pr-4 font-mono text-xs text-slate-500">{s.device_mac}</td>
                            <td className="py-2 pr-4 text-xs text-slate-600">{s.room ?? "—"}</td>
                            <td className="py-2 pr-4"><OutcomeBadge outcome={s.outcome} /></td>
                            <td className="py-2 text-xs text-slate-400">{fmt(s.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
