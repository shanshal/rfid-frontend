import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Shell from "../layouts/Shell";
import { DeviceStatusBadge, deviceStatus } from "../components/StatusBadge";
import { getDevices, getRooms } from "../services/api";

function fmt(ts) {
  if (!ts) return "Never";
  return new Date(ts).toLocaleString();
}

export default function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const load = () => {
      getDevices().then(r => setDevices(r.data)).catch(() => {});
      getRooms().then(r => setRooms(r.data)).catch(() => {});
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const roomMap = Object.fromEntries(rooms.map(r => [r.id, r.name]));

  return (
    <Shell title="Devices">
      <div className="max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{devices.length} device{devices.length !== 1 ? "s" : ""} registered</p>
          <Link
            to="/register?tab=devices"
            className="text-sm px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            + Register Device
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.length === 0 && (
            <div className="col-span-3 py-12 text-center text-slate-400 text-sm">No devices registered yet</div>
          )}
          {devices.map(d => {
            const status = deviceStatus(d);
            return (
              <div
                key={d.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                onClick={() => navigate(`/devices/${d.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-800">{d.name}</h3>
                    <p className="font-mono text-xs text-slate-400 mt-0.5">{d.mac_address}</p>
                  </div>
                  <DeviceStatusBadge status={status} />
                </div>
                <div className="space-y-1 text-xs text-slate-500">
                  <p>Room: <span className="text-slate-700">{d.room_id ? (roomMap[d.room_id] ?? `Room ${d.room_id}`) : <span className="text-amber-600">Unassigned</span>}</span></p>
                  {d.firmware && <p>FW: <span className="text-slate-700 font-mono">{d.firmware}</span></p>}
                  <p>Last seen: {fmt(d.last_activity_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
