import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: configuredBaseUrl.replace(/\/$/, ""),
});

export const getScans = () => api.get("/scans");
export const getInstruments = () => api.get("/instruments");
export const createInstrument = (payload) => api.post("/instruments", payload);
export const retireInstrument = (instrumentId, notes) =>
  api.post(`/instruments/${instrumentId}/retire`, { notes });
export const getAlerts = () => api.get("/alerts");

export default api;
