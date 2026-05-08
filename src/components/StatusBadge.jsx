const INSTRUMENT_COLORS = {
  available:    "bg-emerald-100 text-emerald-800",
  in_use:       "bg-blue-100 text-blue-800",
  sterilizing:  "bg-amber-100 text-amber-800",
  contaminated: "bg-red-100 text-red-800",
  retired:      "bg-slate-100 text-slate-500",
};

const INSTRUMENT_LABELS = {
  available:    "Available",
  in_use:       "In Use",
  sterilizing:  "Sterilizing",
  contaminated: "Contaminated",
  retired:      "Retired",
};

const DEVICE_COLORS = {
  online:  "bg-emerald-100 text-emerald-800",
  stale:   "bg-amber-100 text-amber-800",
  offline: "bg-slate-100 text-slate-500",
};

const OUTCOME_COLORS = {
  moved:             "bg-emerald-100 text-emerald-800",
  ignored_same_room: "bg-slate-100 text-slate-500",
  unknown_rfid:      "bg-red-100 text-red-800",
  unassigned_device: "bg-amber-100 text-amber-800",
  movement_rejected: "bg-orange-100 text-orange-800",
  processing:        "bg-blue-100 text-blue-800",
  handler_error:     "bg-red-100 text-red-800",
};

export function InstrumentStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${INSTRUMENT_COLORS[status] ?? "bg-slate-100 text-slate-500"}`}>
      {INSTRUMENT_LABELS[status] ?? status}
    </span>
  );
}

const DEVICE_LABELS = { online: "Online", stale: "Idle", offline: "Offline" };

export function DeviceStatusBadge({ status }) {
  const colors = DEVICE_COLORS[status] ?? "bg-slate-100 text-slate-500";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-emerald-500" : status === "stale" ? "bg-amber-400" : "bg-slate-400"}`} />
      {DEVICE_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function OutcomeBadge({ outcome }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${OUTCOME_COLORS[outcome] ?? "bg-slate-100 text-slate-500"}`}>
      {outcome?.replace(/_/g, " ")}
    </span>
  );
}

// Without heartbeats the device only sends "online" on connect and "offline"
// via LWT on disconnect. "stale" (shown as "Idle") means seen within the last
// hour — expected for a device sleeping between scans.
export function deviceStatus(device) {
  if (!device) return "offline";
  if (device.last_status === "online") return "online";
  if (!device.last_activity_at) return "offline";
  const secs = (Date.now() - new Date(device.last_activity_at).getTime()) / 1000;
  if (secs < 3600) return "stale";
  return "offline";
}
