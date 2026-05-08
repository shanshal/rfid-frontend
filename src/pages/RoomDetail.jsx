import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Shell from "../layouts/Shell";
import { InstrumentStatusBadge, DeviceStatusBadge, deviceStatus } from "../components/StatusBadge";
import { getRoom, getInstruments, getDevices } from "../services/api";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const roomId = Number(id);
    getRoom(roomId).then(r => setRoom(r.data)).catch(() => {});
    getInstruments().then(r => {
      // The backend returns location as room name string
      setInstruments(r.data);
    }).catch(() => {});
    getDevices().then(r => {
      setDevices(r.data.filter(d => d.room_id === roomId));
    }).catch(() => {});
  }, [id]);

  const roomInstruments = room
    ? instruments.filter(i => i.location === room.name && i.status !== "retired")
    : [];

  const contaminated = roomInstruments.some(i => i.status === "contaminated");

  return (
    <Shell title={room?.name ?? "Room"}>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">← Dashboard</Link>
          {room && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contaminated ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
              {contaminated ? "Contaminated Items Present" : "All Clear"}
            </span>
          )}
        </div>

        {/* Instruments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Instruments ({roomInstruments.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">RFID</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {roomInstruments.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No instruments in this room</td></tr>
                )}
                {roomInstruments.map(i => (
                  <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 pr-4">
                      <Link to={`/instruments/${i.id}`} className="text-teal-700 hover:underline font-medium">{i.name}</Link>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-slate-500">{i.rfid}</td>
                    <td className="py-2 pr-4"><InstrumentStatusBadge status={i.status} /></td>
                    <td className="py-2 text-xs text-slate-400">{fmt(i.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h2 className="font-semibold text-slate-800 mb-3">Devices ({devices.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">MAC</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No devices assigned to this room</td></tr>
                )}
                {devices.map(d => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 pr-4">
                      <Link to={`/devices/${d.id}`} className="text-teal-700 hover:underline font-medium">{d.name}</Link>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-slate-500">{d.mac_address}</td>
                    <td className="py-2 pr-4"><DeviceStatusBadge status={deviceStatus(d.last_activity_at)} /></td>
                    <td className="py-2 text-xs text-slate-400">{fmt(d.last_activity_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
