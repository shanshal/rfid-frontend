import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Shell from "../layouts/Shell";
import QRScanner from "../components/QRScanner";
import ProcedureStepBuilder from "../components/ProcedureStepBuilder";
import {
  getRooms, createRoom,
  getDevices, registerDevice, assignDeviceRoom, getPendingDevices,
  getInstruments, createInstrument, getUnknownScans,
  getProcedures, createProcedure, getProcedureSteps,
} from "../services/api";

const ESSENTIAL_IDS = new Set([1, 2, 3]);

const TAB_MAP = { rooms: 0, devices: 1, instruments: 2, procedures: 3 };

// ── Rooms Tab ──────────────────────────────────────────────────────────────
function RoomsTab({ rooms, onRoomsChange }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);
  const [assigning, setAssigning] = useState(null); // room just created, needs device
  const [devices, setDevices] = useState([]);
  const [deviceRoom, setDeviceRoom] = useState("");

  useEffect(() => { getDevices().then(r => setDevices(r.data)).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setErr(null);
    try {
      const res = await createRoom(name.trim());
      setName("");
      onRoomsChange();
      setAssigning(res.data);
    } catch (ex) {
      setErr(ex.response?.data?.detail ?? "Failed to create room.");
    }
  }

  async function assignDevice(deviceId, roomId) {
    await assignDeviceRoom(deviceId, roomId);
    setAssigning(null);
    setDeviceRoom("");
  }

  const unassigned = devices.filter(d => !d.room_id);

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Room</h3>
        {err && <p className="text-xs text-red-500 mb-2">{err}</p>}
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Room name…"
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <button className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
            Create
          </button>
        </form>
      </div>

      {/* Prompt to assign device after creation */}
      {assigning && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-teal-800">"{assigning.name}" created! Assign a device to this room:</p>
          {unassigned.length === 0
            ? <p className="text-xs text-slate-500">No unassigned devices. Register a device first.</p>
            : (
              <div className="flex gap-2">
                <select
                  value={deviceRoom}
                  onChange={e => setDeviceRoom(e.target.value)}
                  className="text-sm border border-teal-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">Select device…</option>
                  {unassigned.map(d => <option key={d.id} value={d.id}>{d.name} ({d.mac_address})</option>)}
                </select>
                <button
                  onClick={() => deviceRoom && assignDevice(Number(deviceRoom), assigning.id)}
                  className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                >
                  Assign
                </button>
                <button onClick={() => setAssigning(null)} className="text-sm text-slate-400 hover:text-slate-600">
                  Skip
                </button>
              </div>
            )
          }
        </div>
      )}

      {/* Room list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="px-4 py-2.5 font-medium text-slate-800">{r.name}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{r.id}</td>
                <td className="px-4 py-2.5">
                  {ESSENTIAL_IDS.has(r.id)
                    ? <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Essential</span>
                    : <span className="text-xs text-slate-400">Custom</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Devices Tab ────────────────────────────────────────────────────────────
function DevicesTab({ rooms }) {
  const [mac, setMac] = useState("");
  const [devName, setDevName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [pending, setPending] = useState([]);
  const [assignRoom, setAssignRoom] = useState({});
  const [msg, setMsg] = useState(null);

  const loadPending = () => getPendingDevices().then(r => setPending(r.data)).catch(() => {});
  useEffect(() => { loadPending(); }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!mac.trim()) return;
    try {
      await registerDevice({ mac_address: mac.trim().toUpperCase(), name: devName.trim() || null, room_id: roomId ? Number(roomId) : null });
      setMsg({ ok: true, text: "Device registered." });
      setMac(""); setDevName(""); setRoomId("");
      loadPending();
    } catch (ex) {
      setMsg({ ok: false, text: ex.response?.data?.detail ?? "Registration failed." });
    }
  }

  async function assign(deviceId) {
    const rid = assignRoom[deviceId];
    if (!rid) return;
    await assignDeviceRoom(deviceId, Number(rid));
    loadPending();
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Register Device</h3>
        <QRScanner onScan={setMac} />
        {msg && <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">MAC Address *</label>
            <input
              value={mac}
              onChange={e => setMac(e.target.value)}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="w-full font-mono text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Device Name</label>
            <input
              value={devName}
              onChange={e => setDevName(e.target.value)}
              placeholder="e.g. OR Scanner 1"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Assign to Room</label>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">None (assign later)</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              Register Device
            </button>
          </div>
        </form>
      </div>

      {pending.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Pending (Unassigned) Devices</h3>
          <div className="space-y-2">
            {pending.map(d => (
              <div key={d.id} className="flex flex-wrap items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{d.name}</p>
                  <p className="font-mono text-xs text-slate-500">{d.mac_address}</p>
                </div>
                <select
                  value={assignRoom[d.id] ?? ""}
                  onChange={e => setAssignRoom(prev => ({ ...prev, [d.id]: e.target.value }))}
                  className="text-sm border border-amber-300 rounded-lg px-2 py-1.5 bg-white"
                >
                  <option value="">Select room…</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button
                  onClick={() => assign(d.id)}
                  disabled={!assignRoom[d.id]}
                  className="text-sm px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Instruments Tab ────────────────────────────────────────────────────────
function InstrumentsTab({ rooms }) {
  const [unknowns, setUnknowns] = useState([]);
  const [rfid, setRfid] = useState("");
  const [instName, setInstName] = useState("");
  const [roomId, setRoomId] = useState("1"); // default Storage
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getUnknownScans(30).then(r => setUnknowns(r.data)).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!rfid.trim()) return;
    try {
      await createInstrument({ rfid: rfid.trim(), name: instName.trim() || `Instrument-${rfid.trim()}`, room_id: Number(roomId) });
      setMsg({ ok: true, text: "Instrument registered. Starts in Storage." });
      setRfid(""); setInstName("");
      getUnknownScans(30).then(r => setUnknowns(r.data)).catch(() => {});
    } catch (ex) {
      setMsg({ ok: false, text: ex.response?.data?.detail ?? "Registration failed." });
    }
  }

  return (
    <div className="space-y-5">
      {unknowns.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Unknown RFID scans — click to prefill:</p>
          <div className="flex flex-wrap gap-2">
            {unknowns.map(u => (
              <button
                key={u.id}
                onClick={() => setRfid(u.rfid_uid)}
                className={`text-xs font-mono px-2.5 py-1 rounded-full border transition-colors ${rfid === u.rfid_uid ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-400"}`}
              >
                {u.rfid_uid}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Register Instrument</h3>
        {msg && <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">RFID Tag *</label>
            <input
              value={rfid}
              onChange={e => setRfid(e.target.value)}
              placeholder="Scan or enter RFID UID"
              className="w-full font-mono text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Name</label>
            <input
              value={instName}
              onChange={e => setInstName(e.target.value)}
              placeholder="e.g. Scalpel #3"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Starting Room</label>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
            >
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}{r.id === 1 ? " (default)" : ""}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              Register Instrument
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Procedures Tab ─────────────────────────────────────────────────────────
function ProceduresTab({ rooms }) {
  const [procedures, setProcedures] = useState([]);
  const [selected, setSelected] = useState(null);
  const [steps, setSteps] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [builderSteps, setBuilderSteps] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => getProcedures().then(r => setProcedures(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function viewSteps(proc) {
    setSelected(proc);
    const res = await getProcedureSteps(proc.id);
    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));
    setSteps(res.data.map(s => ({ ...s, name: roomMap[s.room_id] ?? `Room ${s.room_id}` })));
  }

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim() || builderSteps.length === 0) {
      setMsg({ ok: false, text: "Name and at least one step are required." });
      return;
    }
    try {
      await createProcedure({ name: form.name, description: form.description || null, is_active: form.is_active, room_ids: builderSteps.map(s => s.room_id) });
      setMsg({ ok: true, text: "Procedure created." });
      setForm({ name: "", description: "", is_active: true });
      setBuilderSteps([]);
      load();
    } catch (ex) {
      setMsg({ ok: false, text: ex.response?.data?.detail ?? "Failed to create procedure." });
    }
  }

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">New Procedure</h3>
        {msg && <p className={`text-xs px-3 py-1.5 rounded-lg ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Surgical Kit Flow"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-2 block">Room Flow (in order)</label>
            <ProcedureStepBuilder rooms={rooms} steps={builderSteps} onChange={setBuilderSteps} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                className="rounded"
              />
              Active
            </label>
            <button className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              Create Procedure
            </button>
          </div>
        </form>
      </div>

      {/* Existing procedures */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {procedures.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs">No procedures yet</td></tr>
            )}
            {procedures.map(p => (
              <>
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => selected?.id === p.id ? setSelected(null) : viewSteps(p)}
                      className="text-xs text-teal-600 hover:text-teal-800"
                    >
                      {selected?.id === p.id ? "Hide" : "View steps"}
                    </button>
                  </td>
                </tr>
                {selected?.id === p.id && (
                  <tr key={`${p.id}-steps`} className="border-b border-slate-100">
                    <td colSpan={3} className="px-4 py-3 bg-slate-50">
                      {steps.length === 0
                        ? <p className="text-xs text-slate-400">No steps defined.</p>
                        : (
                          <ol className="flex flex-wrap gap-2 items-center">
                            {steps.map((s, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs">
                                {i > 0 && <span className="text-slate-300">→</span>}
                                <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{s.name}</span>
                              </li>
                            ))}
                          </ol>
                        )
                      }
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Register page ─────────────────────────────────────────────────────
const TABS = ["Rooms", "Devices", "Instruments", "Procedures"];

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState(TAB_MAP[tabParam] ?? 0);
  const [rooms, setRooms] = useState([]);

  const loadRooms = () => getRooms().then(r => setRooms(r.data)).catch(() => {});
  useEffect(() => { loadRooms(); }, []);

  function switchTab(i) {
    setTab(i);
    setSearchParams({ tab: TABS[i].toLowerCase() });
  }

  return (
    <Shell title="Register">
      <div className="max-w-3xl">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 mb-5">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => switchTab(i)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${tab === i ? "text-teal-700 border-b-2 border-teal-600 -mb-px" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && <RoomsTab rooms={rooms} onRoomsChange={loadRooms} />}
        {tab === 1 && <DevicesTab rooms={rooms} />}
        {tab === 2 && <InstrumentsTab rooms={rooms} />}
        {tab === 3 && <ProceduresTab rooms={rooms} />}
      </div>
    </Shell>
  );
}
