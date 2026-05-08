import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RoomDetail from "./pages/RoomDetail";
import Instruments from "./pages/Instruments";
import InstrumentDetail from "./pages/InstrumentDetail";
import Devices from "./pages/Devices";
import DeviceDetail from "./pages/DeviceDetail";
import Register from "./pages/Register";
import SystemLogs from "./pages/SystemLogs";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/instruments" element={<Instruments />} />
        <Route path="/instruments/:id" element={<InstrumentDetail />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logs" element={<SystemLogs />} />
      </Routes>
    </BrowserRouter>
  );
}
