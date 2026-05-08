import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstrumentStatusBadge } from "./StatusBadge";

function roomContamination(instruments) {
  if (!instruments.length) return "empty";
  if (instruments.some(i => i.status === "contaminated")) return "red";
  if (instruments.some(i => i.status === "in_use")) return "amber";
  return "green";
}

const BORDER = {
  red:   "border-red-400 shadow-red-100",
  amber: "border-amber-400 shadow-amber-100",
  green: "border-emerald-400 shadow-emerald-100",
  empty: "border-slate-200",
};
const DOT = {
  red:   "bg-red-500",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
  empty: "bg-slate-300",
};
const LABEL = {
  red:   "Contaminated",
  amber: "In Use",
  green: "All Clear",
  empty: "Empty",
};

function RoomBox({ room, instruments, devices }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const color = roomContamination(instruments);

  return (
    <div
      className={`relative bg-white rounded-xl border-2 shadow-sm cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md p-4 ${BORDER[color]}`}
      onClick={() => navigate(`/rooms/${room.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{room.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{instruments.length} instrument{instruments.length !== 1 ? "s" : ""} · {devices.length} device{devices.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2.5 h-2.5 rounded-full ${DOT[color]}`} />
          <span className="text-xs text-slate-500">{LABEL[color]}</span>
        </div>
      </div>

      {hovered && instruments.length > 0 && (
        <div className="absolute z-10 top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-3 text-left pointer-events-none">
          <p className="text-xs font-medium text-slate-500 mb-2">Instruments in {room.name}</p>
          <ul className="space-y-1.5">
            {instruments.slice(0, 10).map(inst => (
              <li key={inst.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-700 truncate">{inst.name}</span>
                <InstrumentStatusBadge status={inst.status} />
              </li>
            ))}
            {instruments.length > 10 && (
              <li className="text-xs text-slate-400">+{instruments.length - 10} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function HospitalMap({ rooms, instruments, devices }) {
  const essentialIds = new Set([1, 2, 3]);
  const essential = rooms.filter(r => essentialIds.has(r.id));
  const extra = rooms.filter(r => !essentialIds.has(r.id));

  const instByRoom = {};
  const devByRoom = {};
  rooms.forEach(r => { instByRoom[r.id] = []; devByRoom[r.id] = []; });
  instruments.forEach(i => {
    const loc = i.location;
    const room = rooms.find(r => r.name === loc);
    if (room) (instByRoom[room.id] = instByRoom[room.id] || []).push(i);
  });
  devices.forEach(d => {
    if (d.room_id && devByRoom[d.room_id] !== undefined) devByRoom[d.room_id].push(d);
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {essential.map(r => (
          <RoomBox
            key={r.id}
            room={r}
            instruments={instByRoom[r.id] ?? []}
            devices={devByRoom[r.id] ?? []}
          />
        ))}
      </div>
      {extra.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {extra.map(r => (
            <RoomBox
              key={r.id}
              room={r}
              instruments={instByRoom[r.id] ?? []}
              devices={devByRoom[r.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
