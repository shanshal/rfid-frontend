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
export const getInstrumentDetail = (id) => api.get(`/instruments/${id}/detail`);
export const transferInstrument = (id, payload) =>
  api.post(`/instruments/${id}/transfer`, payload);
export const getAlerts = () => api.get("/alerts");
export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`);
export const getReaders = () => api.get("/readers");
export const createReader = (payload) => api.post("/readers", payload);

export default api;
