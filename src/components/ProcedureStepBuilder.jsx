import { useState } from "react";

export default function ProcedureStepBuilder({ rooms, steps, onChange }) {
  function add(roomId) {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    onChange([...steps, { room_id: roomId, name: room.name }]);
  }

  function remove(idx) {
    onChange(steps.filter((_, i) => i !== idx));
  }

  function move(idx, dir) {
    const next = [...steps];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  }

  const usedIds = new Set(steps.map(s => s.room_id));
  const available = rooms.filter(r => !usedIds.has(r.id));

  return (
    <div className="space-y-3">
      {steps.length > 0 && (
        <ol className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
              <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-bold">{i + 1}</span>
              <span className="flex-1 text-sm text-slate-700">{s.name}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs px-1">↓</button>
              <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
            </li>
          ))}
        </ol>
      )}
      {available.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            defaultValue=""
            onChange={e => { if (e.target.value) { add(Number(e.target.value)); e.target.value = ""; } }}
          >
            <option value="">+ Add room step…</option>
            {available.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      )}
      {steps.length === 0 && <p className="text-xs text-slate-400">Add rooms in order to define the procedure flow.</p>}
    </div>
  );
}
