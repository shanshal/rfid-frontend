import { useEffect, useState } from "react";

import { createInstrument, getInstruments } from "../services/api";

export default function Instruments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newInstrument, setNewInstrument] = useState({
    rfid: "",
    name: "",
    status: "Available",
    location: "",
  });

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setError("");
        const res = await getInstruments();
        setInstruments(res.data);
      } catch (err) {
        console.error("Failed to fetch instruments:", err);
        setError("Could not load instruments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstruments();
  }, []);

  const filteredInstruments = instruments.filter((instrument) => {
    const matchesSearch =
      instrument.name.toLowerCase().includes(search.toLowerCase()) ||
      instrument.rfid.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" || instrument.status === statusFilter;

    const matchesLocation =
      locationFilter === "" || instrument.location === locationFilter;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const locationOptions = [...new Set(instruments.map((instrument) => instrument.location).filter(Boolean))];

  const handleCreateInstrument = async (event) => {
    event.preventDefault();
    if (!newInstrument.rfid.trim()) {
      setCreateError("RFID is required.");
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const payload = {
        rfid: newInstrument.rfid.trim(),
        name: newInstrument.name.trim() || "Unknown",
        status: newInstrument.status,
        location: newInstrument.location.trim() || null,
      };
      const res = await createInstrument(payload);
      setInstruments((current) => [...current, res.data]);
      setNewInstrument({ rfid: "", name: "", status: "Available", location: "" });
      setShowCreateForm(false);
    } catch (err) {
      const backendMessage = err?.response?.data?.detail;
      setCreateError(backendMessage || "Could not create instrument. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">
          Instrument Inventory
        </h1>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            setCreateError("");
            setShowCreateForm((open) => !open);
          }}
        >
          + Add Instrument
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={handleCreateInstrument}
          className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            type="text"
            placeholder="RFID (required)"
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            value={newInstrument.rfid}
            onChange={(e) => setNewInstrument((current) => ({ ...current, rfid: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Instrument name"
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            value={newInstrument.name}
            onChange={(e) => setNewInstrument((current) => ({ ...current, name: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Location"
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            value={newInstrument.location}
            onChange={(e) => setNewInstrument((current) => ({ ...current, location: e.target.value }))}
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-medical-green text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {creating ? "Saving..." : "Save"}
          </button>
          {createError && (
            <p className="md:col-span-4 text-sm text-red-600 dark:text-red-300">{createError}</p>
          )}
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search instruments..."
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Sterile">Sterile</option>
          <option value="In Use">In Use</option>
          <option value="Missing">Missing</option>
        </select>

        <select
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        >
          <option value="">All Locations</option>
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm">
            <tr>
              <th className="py-2">RFID Tag</th>
              <th>Instrument</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Loading instruments...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-red-600 dark:text-red-300">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && filteredInstruments.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No instruments found.
                </td>
              </tr>
            )}

            {!loading && !error && filteredInstruments.map((instrument) => (
              <tr key={instrument.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="py-2 font-mono">{instrument.rfid}</td>
                <td>{instrument.name}</td>
                <td>
                  {instrument.status === "Sterile" && (
                    <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-xs">
                      Sterile
                    </span>
                  )}

                  {instrument.status === "In Use" && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-xs">
                      In Use
                    </span>
                  )}

                  {instrument.status === "Missing" && (
                    <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded text-xs">
                      Missing
                    </span>
                  )}
                  {!["Sterile", "In Use", "Missing"].includes(instrument.status) && (
                    <span className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-2 py-1 rounded text-xs">
                      {instrument.status}
                    </span>
                  )}
                </td>
                <td>{instrument.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
