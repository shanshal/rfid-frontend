import axios from "axios";
import * as mock from "./mockData.js";

const base = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const http = axios.create({ baseURL: base });
const ACTOR = "web-admin";
const MOCK = import.meta.env.VITE_MOCK === "true";

const ok = (data) => Promise.resolve({ data });
const noop = () => ok({});

// Scans
export const getScans = (limit = 200) =>
  MOCK ? ok(mock.MOCK_SCANS.slice(0, limit)) : http.get("/scans", { params: { limit } });

// Instruments
export const getInstruments = () =>
  MOCK ? ok(mock.MOCK_INSTRUMENTS) : http.get("/instruments");

export const getInstrumentDetail = (id) =>
  MOCK ? ok(mock.MOCK_INSTRUMENT_DETAILS[id] ?? mock.MOCK_INSTRUMENTS.find(i => i.id === id) ?? null) : http.get(`/instruments/${id}/detail`);

export const createInstrument = (payload) =>
  MOCK ? ok({ id: "new-mock", ...payload }) : http.post("/instruments", payload);

export const retireInstrument = (id, notes = null) =>
  MOCK ? noop() : http.post(`/instruments/${id}/retire`, { notes });

export const transferInstrument = (id, to_room_id) =>
  MOCK ? noop() : http.post(`/instruments/${id}/transfer`, { to_room_id, actor: ACTOR });

// Rooms
export const getRooms = () =>
  MOCK ? ok(mock.MOCK_ROOMS) : http.get("/rooms");

export const getRoom = (id) =>
  MOCK ? ok(mock.MOCK_ROOMS.find(r => String(r.id) === String(id)) ?? null) : http.get(`/rooms/${id}`);

export const createRoom = (name) =>
  MOCK ? ok({ id: Date.now(), name }) : http.post("/rooms", { name }, { params: { actor: ACTOR } });

// Devices
export const getDevices = () =>
  MOCK ? ok(mock.MOCK_DEVICES) : http.get("/devices");

export const getDevice = (id) =>
  MOCK ? ok(mock.MOCK_DEVICES.find(d => d.id === id) ?? null) : http.get(`/devices/${id}`);

export const registerDevice = (payload) =>
  MOCK ? ok({ id: "new-mock", ...payload }) : http.post("/devices/register", payload);

export const assignDeviceRoom = (id, room_id, name = null) =>
  MOCK ? noop() : http.put(`/devices/${id}/assign-room`, { room_id, name }, { params: { actor: ACTOR } });

export const getDeviceLogs = (id, limit = 100) =>
  MOCK ? ok((mock.MOCK_DEVICE_LOGS[id] ?? []).slice(0, limit)) : http.get(`/devices/${id}/logs`, { params: { limit } });

export const getPendingDevices = () =>
  MOCK ? ok(mock.MOCK_PENDING_DEVICES) : http.get("/devices/pending");

// Alerts
export const getAlerts = (limit = 200) =>
  MOCK ? ok(mock.MOCK_ALERTS.slice(0, limit)) : http.get("/alerts", { params: { limit } });

export const acknowledgeAlert = (id) =>
  MOCK ? noop() : http.patch(`/alerts/${id}/acknowledge`);

// Readers
export const getReaders = () =>
  MOCK ? ok(mock.MOCK_DEVICES) : http.get("/readers");

// Diagnostics
export const getUnknownScans = (limit = 30) =>
  MOCK ? ok(mock.MOCK_UNKNOWN_SCANS.slice(0, limit)) : http.get("/diagnostics/traces", { params: { outcome: "unknown_rfid", limit } });

// Procedures
export const getProcedures = () =>
  MOCK ? ok(mock.MOCK_PROCEDURES) : http.get("/procedures");

export const getProcedure = (id) =>
  MOCK ? ok(mock.MOCK_PROCEDURES.find(p => p.id === id) ?? null) : http.get(`/procedures/${id}`);

export const createProcedure = (payload) =>
  MOCK ? ok({ id: "new-mock", ...payload }) : http.post("/procedures/", payload, { params: { actor: ACTOR } });

export const getProcedureSteps = (id) =>
  MOCK ? ok([]) : http.get(`/procedures/${id}/steps`);

// System logs & MQTT (new)
export const getLogs = (limit = 300) =>
  MOCK ? ok(mock.MOCK_LOGS.slice(0, limit)) : http.get("/system/logs", { params: { limit } });

export const getMqttMessages = (limit = 100) =>
  MOCK ? ok(mock.MOCK_MQTT.slice(0, limit)) : http.get("/system/mqtt-log", { params: { limit } });

export const getWsBase = () =>
  base.replace(/^http/, "ws").replace("/api/v1", "");

export default http;
