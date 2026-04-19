import { useEffect, useState } from "react";

import { createReader, getReaders } from "../services/api";

function formatLastSeen(timestamp) {
  if (!timestamp) {
    return "Never seen";
  }
  return new Date(timestamp).toLocaleString();
}

export default function Readers() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    device_id: "",
    name: "",
    location: "",
    event_type: "",
  });

  useEffect(() => {
    const fetchReaders = async () => {
      try {
        setError("");
        const res = await getReaders();
        setReaders(res.data || []);
      } catch {
        setError("Could not load readers.");
      } finally {
        setLoading(false);
      }
    };

    fetchReaders();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.device_id.trim() || !form.name.trim() || !form.location.trim()) {
      setCreateError("Device ID, name, and location are required.");
      return;
    }

    setCreateError("");
    setCreating(true);
    try {
      const payload = {
        device_id: form.device_id.trim(),
        name: form.name.trim(),
        location: form.location.trim(),
        event_type: form.event_type.trim() || null,
        active: true,
      };
      const res = await createReader(payload);
      setReaders((current) => [...current, res.data]);
      setForm({ device_id: "", name: "", location: "", event_type: "" });
    } catch (err) {
      const backendMessage = err?.response?.data?.detail;
      setCreateError(backendMessage || "Could not register reader.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Reader Registration</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3"
      >
        <input
          type="text"
          placeholder="device_id (esp32-...-r0)"
          value={form.device_id}
          onChange={(e) => setForm((current) => ({ ...current, device_id: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Reader name"
          value={form.name}
          onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Event type (optional)"
          value={form.event_type}
          onChange={(e) => setForm((current) => ({ ...current, event_type: e.target.value }))}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-medical-green text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {creating ? "Saving..." : "Register Reader"}
        </button>
        {createError && <p className="md:col-span-5 text-sm text-red-600 dark:text-red-300">{createError}</p>}
      </form>

      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Registered Readers</h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading readers...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-300">{error}</p>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
              <tr>
                <th className="py-2">Device ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Event</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {readers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">
                    No readers registered yet.
                  </td>
                </tr>
              ) : (
                readers.map((reader) => (
                  <tr
                    key={reader.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 font-mono">{reader.device_id}</td>
                    <td>{reader.name}</td>
                    <td>{reader.location || "-"}</td>
                    <td>{reader.event_type || "-"}</td>
                    <td>{formatLastSeen(reader.last_seen_at)}</td>
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
