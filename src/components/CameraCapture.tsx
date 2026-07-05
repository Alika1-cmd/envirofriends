"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WASTE_LABELS, type WasteCategory } from "@/lib/types";

const GREEN = "#16a34a";
const YELLOW = "#facc15";

type DetectResult = {
  label: string;
  confidence: number; // 0–1
  verified: boolean;
  category: WasteCategory;
};

type Status =
  | "init" // minta izin kamera
  | "ready" // kamera nyala, siap foto
  | "denied" // kamera tidak bisa diakses
  | "detecting" // sedang dicek robot
  | "success" // terverifikasi
  | "failed" // kurang jelas
  | "claiming" // sedang klaim poin
  | "claimed"; // poin masuk

const TIPS = [
  "Dekatkan kamera ke sampahnya ya",
  "Pastikan ruangan cukup terang",
  "Pegang ponsel supaya tidak goyang",
];

export default function CameraCapture({
  challengeId,
  userId,
  points,
}: {
  challengeId: string;
  userId: string;
  points: number;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<Status>("init");
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [earned, setEarned] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("init");
    setMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Kirim foto ke robot untuk dicek.
  const detect = useCallback(
    async (imageBase64: string) => {
      setStatus("detecting");
      setMessage(null);
      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, challengeId }),
        });
        if (!res.ok) throw new Error("detect gagal");
        const data = (await res.json()) as DetectResult;
        setResult(data);
        setStatus(data.verified ? "success" : "failed");
      } catch {
        setStatus("failed");
        setMessage("Robotnya lagi istirahat sebentar. Coba foto lagi ya!");
      }
    },
    [challengeId],
  );

  // Ambil frame dari video → JPEG base64.
  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPhoto(dataUrl);
    stopCamera();
    detect(dataUrl);
  }, [detect, stopCamera]);

  // Fallback: pilih foto dari galeri (untuk perangkat tanpa kamera).
  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPhoto(dataUrl);
        stopCamera();
        detect(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [detect, stopCamera],
  );

  // Klaim poin setelah terverifikasi.
  const claim = useCallback(async () => {
    setStatus("claiming");
    try {
      const res = await fetch("/api/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, challengeId, points }),
      });
      if (!res.ok) throw new Error("points gagal");
      const data = (await res.json()) as { pointsEarned?: number };
      setEarned(data.pointsEarned ?? points);
      setStatus("claimed");
      router.refresh(); // segarkan dashboard
    } catch {
      setStatus("success");
      setMessage("Gagal klaim poin. Coba lagi sebentar ya!");
    }
  }, [challengeId, points, userId, router]);

  const retry = useCallback(() => {
    setPhoto(null);
    setResult(null);
    setMessage(null);
    startCamera();
  }, [startCamera]);

  // ---- UI ----

  // Hasil sukses / klaim.
  if (status === "claimed") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="animate-bounce text-6xl" aria-hidden>
          🎉
        </div>
        <h2 className="mt-4 font-serif text-3xl text-gray-900">Hebat!</h2>
        <p className="mt-2 text-gray-600">Kamu berhasil menyelesaikan challenge.</p>
        <div
          className="mx-auto mt-5 inline-block rounded-full px-6 py-2 text-xl font-bold text-gray-900"
          style={{ backgroundColor: YELLOW }}
        >
          +{earned} poin
        </div>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-block rounded-full px-6 py-3 font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Kembali ke Beranda 🏠
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success" && result) {
    const label = WASTE_LABELS[result.category] ?? result.category;
    return (
      <div
        className="rounded-2xl border border-l-4 border-gray-100 bg-green-50 p-6 text-center shadow-sm"
        style={{ borderLeftColor: GREEN }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Foto sampahmu"
            className="mx-auto mb-4 h-40 w-40 rounded-2xl object-cover"
          />
        )}
        <div className="text-5xl" aria-hidden>
          ✅
        </div>
        <h2 className="mt-3 font-serif text-2xl text-gray-900">Terdeteksi!</h2>
        <p className="mt-1 text-gray-700">
          Ini <span className="font-bold">{label}</span> (
          {Math.round(result.confidence * 100)}% yakin)
        </p>
        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
        <button
          onClick={claim}
          className="mt-5 w-full rounded-full py-3 text-lg font-bold text-gray-900 transition-[filter] hover:brightness-95"
          style={{ backgroundColor: YELLOW }}
        >
          Klaim Poin! 🎉
        </button>
      </div>
    );
  }

  if (status === "claiming") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="text-5xl" aria-hidden>
          ⭐
        </div>
        <p className="mt-3 font-medium text-gray-700">Menyimpan poinmu…</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="rounded-2xl border border-l-4 border-gray-100 bg-yellow-50 p-6 text-center shadow-sm"
        style={{ borderLeftColor: YELLOW }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Foto sampahmu"
            className="mx-auto mb-4 h-40 w-40 rounded-2xl object-cover"
          />
        )}
        <div className="text-5xl" aria-hidden>
          🤔
        </div>
        <h2 className="mt-3 font-serif text-2xl text-gray-900">
          Kurang jelas, coba lagi!
        </h2>
        <p className="mt-1 text-gray-600">
          {message ?? "Robotku belum yakin ini sampah apa."}
        </p>
        <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-gray-600">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span aria-hidden>💡</span>
              {tip}
            </li>
          ))}
        </ul>
        <button
          onClick={retry}
          className="mt-5 w-full rounded-full py-3 text-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: GREEN }}
        >
          Foto Ulang 📸
        </button>
      </div>
    );
  }

  if (status === "detecting") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Foto sampahmu"
            className="mx-auto mb-4 h-48 w-48 rounded-2xl object-cover"
          />
        )}
        <div className="animate-bounce text-5xl" aria-hidden>
          🤖
        </div>
        <p className="mt-3 font-medium text-gray-700">
          Robotku lagi menebak sampahmu…
        </p>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <div className="text-5xl" aria-hidden>
          📷
        </div>
        <h2 className="mt-3 font-serif text-xl text-gray-900">
          Kameranya belum bisa dibuka
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Izinkan kamera di browser, atau pilih foto dari galeri ya.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={startCamera}
            className="w-full rounded-full py-3 font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            Coba Buka Kamera Lagi 📷
          </button>
          <label
            className="w-full cursor-pointer rounded-full border border-gray-300 py-3 font-semibold text-gray-700"
          >
            Pilih dari Galeri 🖼️
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPickFile}
              className="hidden"
            />
          </label>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // init / ready: tampilkan kamera.
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-[3/4] w-full object-cover"
        />
        {status === "init" && (
          <div className="absolute inset-0 grid place-items-center text-white">
            Membuka kamera…
          </div>
        )}
      </div>

      <button
        onClick={capture}
        disabled={status !== "ready"}
        className="mt-4 w-full rounded-full py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: GREEN }}
      >
        Jepret Sekarang 📸
      </button>

      <label className="mt-3 block cursor-pointer text-center text-sm font-medium text-gray-500">
        atau pilih foto dari galeri 🖼️
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickFile}
          className="hidden"
        />
      </label>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
