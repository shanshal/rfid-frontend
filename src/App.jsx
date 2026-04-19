// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Instruments from "./pages/Instruments.jsx";
import InstrumentDetail from "./pages/InstrumentDetail.jsx";
import Readers from "./pages/Readers.jsx";
import Scan from "./pages/Scan.jsx";
import Alerts from "./pages/Alerts.jsx";
import Support from "./pages/Support.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="readers" element={<Readers />} />
          <Route path="instruments" element={<Instruments />} />
          <Route path="instruments/:id" element={<InstrumentDetail />} />
          <Route path="scan" element={<Scan />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
