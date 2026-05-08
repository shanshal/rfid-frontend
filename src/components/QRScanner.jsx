import { useEffect, useRef, useState } from "react";

function normalizeMac(raw) {
  const hex = raw.replace(/[^0-9a-fA-F]/g, "");
  if (hex.length !== 12) return null;
  return hex.match(/.{2}/g).join(":").toUpperCase();
}

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [supported] = useState(() => "BarcodeDetector" in window);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setActive(true);

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      intervalRef.current = setInterval(async () => {
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const mac = normalizeMac(codes[0].rawValue);
            if (mac) {
              onScan(mac);
              stop();
            }
          }
        } catch {}
      }, 500);
    } catch (err) {
      setError("Camera access denied or unavailable.");
    }
  }

  function stop() {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setActive(false);
  }

  useEffect(() => () => stop(), []);

  if (!supported) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!active
          ? <button onClick={start} className="text-sm px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              Scan QR Code
            </button>
          : <button onClick={stop} className="text-sm px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">
              Stop Camera
            </button>
        }
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      <video
        ref={videoRef}
        className={`rounded-lg w-full max-w-xs bg-black ${active ? "block" : "hidden"}`}
        muted
        playsInline
      />
    </div>
  );
}
