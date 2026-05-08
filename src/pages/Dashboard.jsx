import { useEffect, useState } from "react";
import Shell from "../layouts/Shell";
import StatCard from "../components/StatCard";
import HospitalMap from "../components/HospitalMap";
import ScanFeed from "../components/ScanFeed";
import { getInstruments, getRooms, getDevices, getAlerts, getReaders } from "../services/api";

export default function Dashboard() {
  const [instruments, setInstruments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [readers, setReaders] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = () => {
      getInstruments().then(r => setInstruments(r.data)).catch(() => {});
      getRooms().then(r => setRooms(r.data)).catch(() => {});
      getDevices().then(r => setDevices(r.data)).catch(() => {});
      getReaders().then(r => setReaders(r.data)).catch(() => {});
      getAlerts().then(r => setAlerts(r.data)).catch(() => {});
    };
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const active = instruments.filter(i => !i.status || i.status !== "retired");
  const counts = {
    total:        active.length,
    in_use:       active.filter(i => i.status === "in_use").length,
    sterilizing:  active.filter(i => i.status === "sterilizing").length,
    contaminated: active.filter(i => i.status === "contaminated").length,
    retired:      instruments.filter(i => i.status === "retired").length,
  };
  const onlineReaders = readers.filter(r => r.active).length;
  const unackedAlerts = alerts.filter(a => !a.acknowledged).length;

  return (
    <Shell title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Total"        value={counts.total}        accent="teal" />
        <StatCard label="In Use"       value={counts.in_use}       accent="blue" />
        <StatCard label="Sterilizing"  value={counts.sterilizing}  accent="amber" />
        <StatCard label="Contaminated" value={counts.contaminated} accent="red" />
        <StatCard label="Retired"      value={counts.retired}      accent="slate" />
        <StatCard
          label="Devices"
          value={`${onlineReaders} / ${readers.length}`}
          sub="online / total"
          accent="green"
        />
        <StatCard
          label="Alerts"
          value={unackedAlerts}
          sub={unackedAlerts > 0 ? "need attention" : "all clear"}
          accent={unackedAlerts > 0 ? "red" : "green"}
        />
      </div>

      {/* Floor plan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Hospital Floor Plan</h2>
          <span className="text-xs text-slate-400">Hover room to preview · Click to view detail</span>
        </div>
        <HospitalMap rooms={rooms} instruments={instruments} devices={devices} />
      </div>

      {/* Scan feed */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold text-slate-800 mb-3">Recent Scans</h2>
        <ScanFeed limit={20} refreshMs={5000} />
      </div>
    </Shell>
  );
}
