const EVENT_LABELS = {
  created:                  "Enrolled",
  moved:                    "Moved",
  status_changed:           "Status Changed",
  deleted:                  "Retired",
  room_defined:             "Room Defined",
  requirements_updated:     "Requirements Updated",
  procedure_updated:        "Procedure Updated",
  transfer_in:              "Transferred In",
  transfer_out:             "Transferred Out",
  assembly_start:           "Assembly Start",
  assembly_complete:        "Assembly Complete",
  sterilization_in:         "Sterilization In",
  sterilization_out:        "Sterilization Out",
  or_usage_start:           "OR Usage Start",
  or_usage_end:             "OR Usage End",
};

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export default function Timeline({ entries = [] }) {
  if (!entries.length) {
    return <p className="text-sm text-slate-400 py-4">No history recorded.</p>;
  }
  return (
    <ol className="relative border-l border-slate-200 ml-3">
      {entries.map((e, i) => (
        <li key={i} className="mb-6 ml-4">
          <span className="absolute -left-1.5 mt-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white" />
          <p className="text-xs text-slate-400">{fmt(e.timestamp || e.created_at || e.recorded_at)}</p>
          <p className="text-sm font-medium text-slate-800">
            {EVENT_LABELS[e.event_type] ?? e.event_type?.replace(/_/g, " ")}
          </p>
          {e.actor && <p className="text-xs text-slate-500">by {e.actor}</p>}
          {e.details && <p className="text-xs text-slate-400 mt-0.5 italic">{e.details}</p>}
        </li>
      ))}
    </ol>
  );
}
