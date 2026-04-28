"use client";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
  Scale,
  Delete,
  XCircle,
  CheckCircle2,
  CreditCard,
  UserCheck,
} from "lucide-react";

export default function KasirPage() {
  const [pin, setPin] = useState("");
  const [kg, setKg] = useState("");
  const [mitra, setMitra] = useState<any>(null); // State baru untuk menyimpan profil mitra
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ----------------------------------------------------------------------
  // INVISIBLE RFID LISTENER: Menangkap tap kartu tanpa perlu input box
  // ----------------------------------------------------------------------
  const verifyMitra = useCallback(
    async (type: "rfid" | "pin", value: string) => {
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const res = await api.post("/kasir/verify-mitra", { type, value });
        setMitra(res.data.data);
        setMessage({
          type: "success",
          text: `MITRA: ${res.data.data.nama_penjual}`,
        });
        setPin(""); // Bersihkan PIN
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.response?.data?.error || "KARTU/PIN TIDAK DIKENALI",
        });
        setPin("");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let rfidBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika user kebetulan sedang fokus di elemen input lain
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const currentTime = Date.now();
      // Alat RFID mengetik sangat cepat (biasanya < 30ms per karakter)
      if (currentTime - lastKeyTime > 100) {
        rfidBuffer = ""; // Jika jeda terlalu lama, berarti itu ketikan manusia, reset buffer
      }
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (rfidBuffer.length > 4) {
          // Jika panjang string > 4 dan sangat cepat, dipastikan itu RFID
          verifyMitra("rfid", rfidBuffer);
        }
        rfidBuffer = "";
      } else if (e.key.length === 1) {
        rfidBuffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verifyMitra]);

  // ----------------------------------------------------------------------
  // LOGIKA NUMPAD BERDASARKAN STATE
  // ----------------------------------------------------------------------
  const handleNumpad = (val: string) => {
    if (!mitra) {
      // JIKA MITRA BELUM ADA -> NUMPAD UNTUK PIN
      const newPin = pin + val;
      if (newPin.length <= 4) {
        setPin(newPin);
        // Auto-verify jika sudah 4 digit
        if (newPin.length === 4) {
          verifyMitra("pin", newPin);
        }
      }
    } else {
      // JIKA MITRA SUDAH ADA -> NUMPAD UNTUK KG
      if (val === "." && kg.includes(".")) return;
      if (val === "." && kg === "") {
        setKg("0.");
        return;
      }
      setKg((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    if (!mitra) setPin(pin.slice(0, -1));
    else setKg(kg.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
    setKg("");
    setMitra(null);
    setMessage({ type: "", text: "" });
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    window.location.href = "/login";
  };

  const handleSubmit = async () => {
    if (!mitra) {
      setMessage({ type: "error", text: "VERIFIKASI MITRA DULU!" });
      return;
    }
    if (!kg || parseFloat(kg) <= 0) {
      setMessage({ type: "error", text: "BERAT HARUS DIISI!" });
      return;
    }

    setLoading(true);
    try {
      // Asumsi backend menggunakan penjual_id. Kita sertakan pin juga agar backward-compatible
      const res = await api.post("/kasir/check-in", {
        penjual_id: mitra.id,
        pin: mitra.pin,
        jumlah_kg: parseFloat(kg),
      });

      setMessage({
        type: "success",
        text: `TRANSAKSI SUKSES: ${mitra.nama_penjual} | ${kg} KG`,
      });
      // Reset flow
      setPin("");
      setKg("");
      setMitra(null);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "GAGAL MENYIMPAN TRANSAKSI",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-end mb-6 border-b-4 border-slate-900 pb-2">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tighter uppercase">
            MONITORING <span className="text-blue-600">TERMINAL</span>
          </h1>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            KASIR AREA &bull; OUTSYS
          </div>
        </div>

        {/* Status Message */}
        {message.text && (
          <div
            className={`mb-6 p-5 font-black text-center border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 text-lg uppercase ${
              message.type === "success"
                ? "bg-green-100 border-green-600 text-green-800"
                : "bg-red-100 border-red-600 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={28} />
            ) : (
              <XCircle size={28} />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KOLOM KIRI: STACKED INPUT */}
          <div className="space-y-4">
            {/* BOX 1: PIN / IDENTITAS MITRA */}
            {!mitra ? (
              // TAMPILAN JIKA BELUM ADA MITRA (Minta PIN)
              <div className="border-4 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-blue-600 border-slate-900 ring-4 ring-blue-300 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-black uppercase text-white">
                    1. INPUT PIN ATAU TAP KARTU
                  </div>
                  <div className="animate-pulse flex items-center gap-1 text-white bg-blue-800 px-2 py-1 text-[9px] font-black border border-blue-400">
                    <CreditCard size={12} /> READY SCAN
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-14 h-20 border-4 flex items-center justify-center text-5xl font-black ${
                        pin[i]
                          ? "bg-white border-slate-900 text-slate-900 shadow-inner"
                          : "bg-blue-500 border-blue-400 text-transparent"
                      }`}
                    >
                      {pin[i] || ""}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // TAMPILAN JIKA MITRA SUDAH TERVERIFIKASI
              <div className="border-4 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-500 border-slate-900 transition-all flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-green-900 mb-1 flex items-center gap-1">
                    <UserCheck size={12} /> MITRA TERIDENTIFIKASI
                  </div>
                  <div className="text-3xl font-black text-white uppercase tracking-tighter">
                    {mitra.nama_penjual}
                  </div>
                  <div className="text-xs font-bold text-green-900">
                    PIN: {mitra.pin} | WA: {mitra.no_whatsapp || "-"}
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="bg-white p-3 border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white transition-all active:translate-y-1 active:translate-x-1 active:shadow-none"
                  title="Batal Transaksi"
                >
                  <XCircle size={24} />
                </button>
              </div>
            )}

            {/* BOX 2: BERAT KG */}
            <div
              className={`border-4 transition-all p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                mitra
                  ? "bg-orange-500 border-slate-900 ring-4 ring-orange-300"
                  : "bg-slate-100 border-slate-300 opacity-60"
              }`}
            >
              <div
                className={`text-[10px] font-black uppercase mb-2 ${mitra ? "text-white" : "text-slate-400"}`}
              >
                2. JUMLAH BERAT (KG)
              </div>
              <div
                className={`text-center text-7xl font-black italic tracking-tighter ${mitra ? "text-white" : kg ? "text-slate-800" : "text-slate-300"}`}
              >
                {kg || "0.0"}{" "}
                <span className="text-xl not-italic opacity-50">KG</span>
              </div>
            </div>

            {/* Clear & Logout (Tablet Desktop View) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={handleClear}
                className="py-4 border-4 border-slate-900 bg-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Clear Flow
              </button>
              <button
                onClick={handleLogout}
                className="py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-800 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Logout System
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: NUMPAD */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 bg-slate-800 p-4 border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumpad(num.toString())}
                  className="h-20 md:h-24 bg-white border-4 border-slate-900 font-black text-4xl text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-20 md:h-24 bg-red-500 border-4 border-slate-900 text-white font-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                <Delete size={40} />
              </button>
            </div>

            {/* TOMBOL SIMPAN (Hanya aktif jika mitra sudah ada) */}
            <button
              onClick={handleSubmit}
              disabled={loading || !mitra}
              className={`w-full py-8 border-4 border-slate-900 font-black text-4xl uppercase tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                loading || !mitra
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none translate-x-1 translate-y-1"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:translate-x-2 active:translate-y-2 active:shadow-none"
              }`}
            >
              {loading ? "SAVING..." : "SIMPAN DATA"}
            </button>

            {/* Action Buttons (Mobile View) */}
            <div className="grid lg:hidden grid-cols-2 gap-4">
              <button
                onClick={handleClear}
                className="py-4 border-4 border-slate-900 bg-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Clear
              </button>
              <button
                onClick={handleLogout}
                className="py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
