import { useState, useEffect } from "react";
import { getScans } from "../services/api";

export default function Scan() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Function to fetch scans from backend
    const fetchScans = async () => {
      try {
        setError("");
        const res = await getScans();
        const normalizedScans = (res.data || []).map((scan) => ({
          ...scan,
          instrument: scan.instrument || "Unknown",
          timestamp: scan.timestamp || scan.received_at || null,
        }));
        setScans(normalizedScans);
      } catch (err) {
        console.error("Failed to fetch scans:", err);
        setError("Could not load scans. Please check backend connectivity.");
      } finally {
        setLoading(false);
      }
    };

    fetchScans();

    // Poll backend every 3 seconds for live updates
    const interval = setInterval(fetchScans, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">
        RFID Live Scan
      </h1>

      {/* Scanner Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Scanner Status
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connected to RFID Reader
          </p>
        </div>
        <span className="px-4 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-sm">
          Online
        </span>
      </div>

      {/* Scan Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Recent RFID Scans
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading scans...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-300">{error}</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="py-2">RFID Tag</th>
                <th>Instrument</th>
                <th>Location</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No scans yet.
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-2 font-mono">{scan.rfid_tag}</td>
                      <td>{scan.instrument}</td>
                      <td>{scan.room}</td>
                      <td>{scan.timestamp ? new Date(scan.timestamp).toLocaleString() : "-"}</td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
