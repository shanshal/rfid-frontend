/** src/layouts/MainLayout.jsx */
import logo from "../assets/logo.png";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";
function MainLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setDarkMode(html.classList.contains("dark"));
  };

  return (
    <div className="flex min-h-screen bg-medical-light dark:bg-gray-900 text-gray-800 dark:text-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-medical-green text-white p-6 flex flex-col">
         {/* Logo */}
        <img src={logo} alt="Hospital RFID Logo" className="w-32 h-auto mb-4" />
        <h1 className="text-2xl font-bold mb-8">Raven Eye</h1>
        <nav className="flex flex-col space-y-4">
          <Link to="/" className="hover:text-medical-turquoise">Dashboard</Link>
          <Link to="/readers" className="hover:text-medical-turquoise">Readers</Link>
          <Link to="/instruments" className="hover:text-medical-turquoise">Instruments</Link>
          <Link to="/scan" className="hover:text-medical-turquoise">Scan</Link>
          <Link to="/alerts" className="hover:text-medical-turquoise">Alerts</Link>
          <Link to="/support" className="hover:text-medical-turquoise">Support</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col p-6 bg-medical-light dark:bg-gray-900 text-gray-800 dark:text-gray-100">

        {/* Only show dashboard header/status */}
        {isDashboard && (
          <div className="flex justify-between items-start mb-6 flex-wrap gap-6">
            {/* Dashboard welcome + system status + profile (same as before) */}
            <div className="flex-1 min-w-[300px]">
              <h1 className="text-2xl font-bold text-medical-dark dark:text-gray-100">
                Welcome to Raven Eye the RFID Surgical Tracking System
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Monitor instruments, track scans, and detect missing surgical tools in real time.
              </p>
              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 text-sm min-w-[150px]">
                  <p className="text-gray-500 dark:text-gray-400">RFID Reader</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">Online</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 text-sm min-w-[150px]">
                  <p className="text-gray-500 dark:text-gray-400">Scanner Activity</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">Normal</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 text-sm min-w-[150px]">
                  <p className="text-gray-500 dark:text-gray-400">Database</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">Connected</p>
                </div>
              </div>
            </div>

            {/* Profile + notifications */}
            <div className="flex flex-col items-end gap-4 min-w-[150px]">
              <div className="flex gap-3 items-center">
                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-200 cursor-pointer" />
                <button onClick={toggleDarkMode}>
                  {darkMode ? (
                    <Sun className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <Moon className="w-6 h-6 text-gray-600 dark:text-gray-200" />
                  )}
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Dr. Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">System Operator</p>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 mt-6">
          Biomedical Engineering Senior Project — Raven Eye the RFID Surgical Tracking System
        </footer>
      </main>

    </div>
  );
}

export default MainLayout;
