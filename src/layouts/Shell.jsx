import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getReaders } from "../services/api";

const NAV = [
  { to: "/",           label: "Dashboard",   icon: "⊞" },
  { to: "/instruments", label: "Instruments", icon: "🔬" },
  { to: "/devices",    label: "Devices",     icon: "📡" },
  { to: "/register",   label: "Register",    icon: "＋" },
  { to: "/logs",       label: "Logs",        icon: "📋" },
];

function OnlinePill() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    const load = () => getReaders().then(r => setCount(r.data.filter(d => d.active).length)).catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);
  if (count === null) return null;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${count > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {count} online
    </span>
  );
}

export default function Shell({ children, title }) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-52 bg-teal-800 text-white shrink-0">
        <div className="px-4 py-5 border-b border-teal-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">Raven Eye</p>
          <p className="text-base font-bold mt-0.5">RFID Tracker</p>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-teal-600 text-white font-medium" : "text-teal-100 hover:bg-teal-700"
                }`
              }
            >
              <span className="text-base leading-none">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-teal-700 text-xs text-teal-400">
          RFID Tracking System
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-base font-semibold text-slate-800">{title}</h1>
          <OnlinePill />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex z-20">
        {NAV.map(n => {
          const active = n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${active ? "text-teal-600 font-medium" : "text-slate-400"}`}
            >
              <span className="text-lg leading-none">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
