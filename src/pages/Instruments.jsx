import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Shell from "../layouts/Shell";
import { InstrumentStatusBadge } from "../components/StatusBadge";
import { getInstruments, getRooms, retireInstrument } from "../services/api";

const STATUSES = ["available", "in_use", "sterilizing", "contaminated", "retired"];

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export default function Instruments() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  const load = () => {
    getInstruments().then(r => setInstruments(r.data)).catch(() => {});
    getRooms().then(r => setRooms(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  async function retire(e, inst) {
    e.stopPropagation();
    const notes = window.prompt(`Retire "${inst.name}"? Enter reason (optional):`);
    if (notes === null) return;
    await retireInstrument(inst.id, notes || null);
    load();
  }

  const filtered = instruments.filter(i => {
    const q = search.toLowerCase();
    if (q && !i.name.toLowerCase().includes(q) && !i.rfid.toLowerCase().includes(q)) return false;
    if (statusFilter && i.status !== statusFilter) return false;
    if (roomFilter && i.location !== roomFilter) return false;
    return true;
  });

  const roomNames = [...new Set(instruments.map(i => i.location).filter(Boolean))].sort();

  return (
    <Shell title="Instruments">
      <div className="max-w-5xl space-y-4">
        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or RFID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <select
            value={roomFilter}
            onChange={e => setRoomFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">All Rooms</option>
            {roomNames.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Link
            to="/register?tab=instruments"
            className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 whitespace-nowrap"
          >
            + Register
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">RFID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Last Updated</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">No instruments found</td></tr>
              )}
              {filtered.map(i => (
                <tr
                  key={i.id}
                  className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate(`/instruments/${i.id}`)}
                >
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{i.rfid}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{i.name}</td>
                  <td className="px-4 py-2.5"><InstrumentStatusBadge status={i.status} /></td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{i.location ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{fmt(i.updated_at)}</td>
                  <td className="px-4 py-2.5">
                    {i.status !== "retired" && (
                      <button
                        onClick={e => retire(e, i)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Retire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">{filtered.length} of {instruments.length} instruments</p>
      </div>
    </Shell>
  );
}
