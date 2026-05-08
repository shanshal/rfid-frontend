const ago = (mins) => new Date(Date.now() - mins * 60000).toISOString();

export const MOCK_ROOMS = [
  { id: 1, name: "OR-1" },
  { id: 2, name: "OR-2" },
  { id: 3, name: "ICU" },
  { id: 4, name: "Recovery" },
  { id: 5, name: "Sterile Processing" },
  { id: 6, name: "Storage" },
];

export const MOCK_INSTRUMENTS = [
  { id: "i1", name: "Scalpel #10",         rfid: "A1001", status: "in_use",      location: "OR-1",              updated_at: ago(5)   },
  { id: "i2", name: "Tissue Forceps",      rfid: "A1002", status: "in_use",      location: "OR-1",              updated_at: ago(8)   },
  { id: "i3", name: "Retractor Set",       rfid: "A1003", status: "sterilizing", location: "Sterile Processing", updated_at: ago(30)  },
  { id: "i4", name: "Needle Driver",       rfid: "A1004", status: "available",   location: "Storage",           updated_at: ago(120) },
  { id: "i5", name: "Hemostat Clamp",      rfid: "A1005", status: "in_use",      location: "OR-2",              updated_at: ago(3)   },
  { id: "i6", name: "Suction Tip",         rfid: "A1006", status: "contaminated",location: "OR-2",              updated_at: ago(15)  },
  { id: "i7", name: "Electrocautery Pen",  rfid: "A1007", status: "sterilizing", location: "Sterile Processing", updated_at: ago(60)  },
  { id: "i8", name: "Rib Spreader",        rfid: "A1008", status: "in_use",      location: "ICU",               updated_at: ago(20)  },
  { id: "i9", name: "Mayo Scissors",       rfid: "A1009", status: "available",   location: "Storage",           updated_at: ago(90)  },
  { id: "i10", name: "Bone Saw (Vintage)", rfid: "A1010", status: "retired",     location: null,                updated_at: ago(2880)},
  { id: "i11", name: "Trocar Set",         rfid: "A1011", status: "in_use",      location: "OR-1",              updated_at: ago(10)  },
  { id: "i12", name: "Aortic Clamp",       rfid: "A1012", status: "in_use",      location: "ICU",               updated_at: ago(25)  },
];

export const MOCK_INSTRUMENT_DETAILS = Object.fromEntries(
  MOCK_INSTRUMENTS.map(inst => [
    inst.id,
    {
      ...inst,
      lifecycle_history: [
        { event_type: "created",      actor: "admin",     details: "Initial enrollment", timestamp: ago(4320) },
        { event_type: "transfer_in",  actor: "web-admin", details: `Moved to ${inst.location ?? "Storage"}`, timestamp: ago(inst.status === "retired" ? 2900 : 120) },
        inst.status === "sterilizing" && { event_type: "sterilization_in", actor: "system", details: null, timestamp: ago(60) },
        inst.status === "in_use"      && { event_type: "or_usage_start",   actor: "system", details: null, timestamp: ago(10) },
        inst.status === "retired"     && { event_type: "deleted",          actor: "admin",  details: "End of service life", timestamp: ago(2880) },
      ].filter(Boolean),
      recent_scans: Array.from({ length: 5 }, (_, i) => ({
        device_mac: `AA:BB:CC:DD:EE:0${i + 1}`,
        room: inst.location,
        outcome: i === 2 ? "unknown_rfid" : "instrument_moved",
        timestamp: ago(i * 15),
      })),
    },
  ])
);

export const MOCK_DEVICES = [
  { id: "d1", name: "OR-1 Reader",               mac_address: "AA:BB:CC:DD:EE:01", room_id: 1, local_ip: "192.168.1.101", firmware: "v2.3.1", scan_topic: "rfid/scan/reader-001", last_activity_at: ago(0.5), active: true  },
  { id: "d2", name: "OR-2 Reader",               mac_address: "AA:BB:CC:DD:EE:02", room_id: 2, local_ip: "192.168.1.102", firmware: "v2.3.1", scan_topic: "rfid/scan/reader-002", last_activity_at: ago(1),   active: true  },
  { id: "d3", name: "ICU Reader",                mac_address: "AA:BB:CC:DD:EE:03", room_id: 3, local_ip: "192.168.1.103", firmware: "v2.1.0", scan_topic: "rfid/scan/reader-003", last_activity_at: ago(45),  active: false },
  { id: "d4", name: "Recovery Reader",           mac_address: "AA:BB:CC:DD:EE:04", room_id: 4, local_ip: "192.168.1.104", firmware: "v2.3.1", scan_topic: "rfid/scan/reader-004", last_activity_at: ago(2),   active: true  },
  { id: "d5", name: "Sterile Processing Reader", mac_address: "AA:BB:CC:DD:EE:05", room_id: 5, local_ip: "192.168.1.105", firmware: "v2.3.0", scan_topic: "rfid/scan/reader-005", last_activity_at: ago(0.2), active: true  },
];

export const MOCK_DEVICE_LOGS = Object.fromEntries(
  MOCK_DEVICES.map(d => [
    d.id,
    Array.from({ length: 20 }, (_, i) => ({
      id: `${d.id}-log${i}`,
      rfid_uid: MOCK_INSTRUMENTS[i % MOCK_INSTRUMENTS.length].rfid,
      outcome: i % 7 === 0 ? "unknown_rfid" : "instrument_moved",
      from_room_id: i > 0 ? (((i - 1) % 4) + 1) : null,
      to_room_id: d.room_id,
      handler_started_at:  ago(i * 8 + 0.02),
      handler_finished_at: ago(i * 8),
      backend_received_at: ago(i * 8 + 0.05),
    })),
  ])
);

export const MOCK_SCANS = Array.from({ length: 25 }, (_, i) => ({
  id: `sc${i + 1}`,
  rfid_tag:   MOCK_INSTRUMENTS[i % MOCK_INSTRUMENTS.length].rfid,
  instrument: i % 8 === 0 ? "Unknown" : MOCK_INSTRUMENTS[i % MOCK_INSTRUMENTS.length].name,
  room:       MOCK_ROOMS[i % 4].name,
  timestamp:  ago(i * 0.4),
}));

export const MOCK_ALERTS = [
  { id: "al1", type: "unknown_rfid",           message: "Unknown RFID tag scanned in OR-2: X9988",               severity: "warning",  acknowledged: false, created_at: ago(5)   },
  { id: "al2", type: "instrument_missing",      message: "Scalpel #10 not scanned for 2h during active procedure", severity: "critical", acknowledged: false, created_at: ago(12)  },
  { id: "al3", type: "reader_offline",          message: "ICU Reader went offline",                                severity: "warning",  acknowledged: true,  created_at: ago(40)  },
  { id: "al4", type: "sterilization_overdue",   message: "Retractor Set has been in sterilization for 48h",        severity: "info",     acknowledged: true,  created_at: ago(120) },
];

export const MOCK_PENDING_DEVICES = [
  { id: "pd1", device_id: "reader-999", first_seen: ago(30), scan_count: 3 },
];

export const MOCK_UNKNOWN_SCANS = [
  { id: "u1", rfid_uid: "X9988", device_id: "d2", outcome: "unknown_rfid", backend_received_at: ago(5)  },
  { id: "u2", rfid_uid: "X7712", device_id: "d1", outcome: "unknown_rfid", backend_received_at: ago(42) },
];

export const MOCK_PROCEDURES = [
  { id: "p1", name: "Appendectomy Protocol",          step_count: 5, created_at: ago(2880) },
  { id: "p2", name: "Laparoscopic Cholecystectomy",   step_count: 7, created_at: ago(5760) },
];

const LOG_POOL = {
  INFO:  [
    "RFID scan processed: instrument_moved",
    "Device heartbeat received from reader-001",
    "Instrument status updated to sterilizing",
    "Alert acknowledged by web-admin",
    "WebSocket client connected from 192.168.1.50",
    "Room assignment updated for Scalpel #10",
    "Scan batch committed: 4 records",
  ],
  DEBUG: [
    "Cache hit for instrument list (TTL: 30s)",
    "SQL SELECT executed in 4ms",
    "WebSocket ping sent to client",
    "MQTT message queued for delivery",
    "Heartbeat ACK sent to reader-002",
  ],
  WARN:  [
    "Slow database query: 320ms (threshold: 200ms)",
    "MQTT broker reconnecting (attempt 2/5)",
    "Unknown RFID tag received: X9988",
    "ICU reader missed 3 consecutive heartbeats",
    "Alert queue depth: 47 (high)",
  ],
  ERROR: [
    "Failed to persist scan: duplicate key violation on rfid_uid",
    "MQTT connection dropped unexpectedly",
    "Device reader-003 timed out after 45s",
    "DB pool exhausted: waited 5s for connection",
  ],
};

const LOG_SOURCES = ["mqtt-broker", "scan-processor", "alert-engine", "api-server", "rfid-handler", "db-pool"];
const LEVEL_WEIGHTS = ["INFO","INFO","INFO","INFO","DEBUG","DEBUG","WARN","WARN","ERROR"];

export const MOCK_LOGS = Array.from({ length: 80 }, (_, i) => {
  const level = LEVEL_WEIGHTS[i % LEVEL_WEIGHTS.length];
  const pool  = LOG_POOL[level];
  return {
    id:        `log${i}`,
    level,
    source:    LOG_SOURCES[i % LOG_SOURCES.length],
    message:   pool[i % pool.length],
    timestamp: ago(i * 0.12),
  };
});

const MQTT_TOPICS = [
  "rfid/scan/reader-001",
  "rfid/scan/reader-002",
  "rfid/scan/reader-004",
  "rfid/status/reader-001",
  "rfid/status/reader-003",
  "rfid/alert",
];

export const MOCK_MQTT = Array.from({ length: 40 }, (_, i) => {
  const topic = MQTT_TOPICS[i % MQTT_TOPICS.length];
  let payload;
  if (topic.includes("scan")) {
    payload = JSON.stringify({ rfid: MOCK_INSTRUMENTS[i % MOCK_INSTRUMENTS.length].rfid, rssi: -(60 + (i % 20)) });
  } else if (topic.includes("status")) {
    payload = JSON.stringify({ online: i % 5 !== 0, uptime_s: 3600 * (i + 1) });
  } else {
    payload = JSON.stringify({ type: "unknown_rfid", tag: `X${9000 + i}` });
  }
  return { id: `mq${i}`, topic, payload, timestamp: ago((40 - i) * 0.3) };
});
