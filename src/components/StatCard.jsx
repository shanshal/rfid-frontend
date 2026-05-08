export default function StatCard({ label, value, sub, accent }) {
  const accentClass = {
    green:  "border-l-emerald-500",
    red:    "border-l-red-500",
    blue:   "border-l-blue-500",
    amber:  "border-l-amber-500",
    slate:  "border-l-slate-400",
    teal:   "border-l-teal-500",
  }[accent] ?? "border-l-slate-300";

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 border-l-4 ${accentClass} p-4`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value ?? "—"}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
