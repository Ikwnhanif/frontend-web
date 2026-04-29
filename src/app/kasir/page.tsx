"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import {
  Delete,
  XCircle,
  CheckCircle2,
  CreditCard,
  UserCheck,
  Scale,
  LogOut,
  RotateCcw,
  Send,
  ShoppingBag,
  ArrowRight,
  Smartphone,
  Radio,
  AlertCircle,
  Package,
  Zap,
} from "lucide-react";

export default function KasirPage() {
  const [pin, setPin] = useState("");
  const [kg, setKg] = useState("");
  const [mitra, setMitra] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rfidReady, setRfidReady] = useState(true);
  const [successAnim, setSuccessAnim] = useState(false);
  const kgInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // ----------------------------------------------------------------------
  // VERIFIKASI MITRA
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
          text: `${res.data.data.nama_penjual} berhasil diverifikasi`,
        });
        setPin("");
        setKg("");
        setCurrentStep(2);
        setTimeout(() => kgInputRef.current?.focus(), 150);
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.response?.data?.error || "PIN/Kartu tidak dikenali",
        });
        setPin("");
        shakePinBox();
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ----------------------------------------------------------------------
  // RFID LISTENER
  // ----------------------------------------------------------------------
  useEffect(() => {
    let rfidBuffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) rfidBuffer = "";
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (rfidBuffer.length > 4) {
          setRfidReady(false);
          verifyMitra("rfid", rfidBuffer);
          setTimeout(() => setRfidReady(true), 1500);
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
  // ANIMASI SHAKE
  // ----------------------------------------------------------------------
  const pinBoxRef = useRef<HTMLDivElement>(null);
  const shakePinBox = () => {
    if (pinBoxRef.current) {
      pinBoxRef.current.classList.add("animate-shake");
      setTimeout(
        () => pinBoxRef.current?.classList.remove("animate-shake"),
        500,
      );
    }
  };

  // ----------------------------------------------------------------------
  // NUMPAD HANDLER
  // ----------------------------------------------------------------------
  const handleNumpad = (val: string) => {
    if (!mitra) {
      const newPin = pin + val;
      if (newPin.length <= 4) {
        setPin(newPin);
        if (newPin.length === 4) verifyMitra("pin", newPin);
      }
    } else {
      if (val === "." && kg.includes(".")) return;
      if (val === "." && kg === "") {
        setKg("0.");
        return;
      }
      const newKg = kg + val;
      if (newKg.replace(".", "").length <= 5) setKg(newKg);
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
    setSuccessAnim(false);
    setCurrentStep(1);
  };

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    window.location.href = "/login";
  };

  // ----------------------------------------------------------------------
  // SUBMIT TRANSAKSI
  // ----------------------------------------------------------------------
  const handleSubmit = async () => {
    if (!mitra) {
      setMessage({ type: "error", text: "Verifikasi mitra terlebih dahulu!" });
      return;
    }
    if (!kg || parseFloat(kg) <= 0) {
      setMessage({ type: "error", text: "Masukkan jumlah KG!" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/kasir/check-in", {
        penjual_id: mitra.id,
        pin: mitra.pin,
        jumlah_kg: parseFloat(kg),
      });

      setMessage({
        type: "success",
        text: `✅ Transaksi berhasil! ${mitra.nama_penjual} - ${kg} KG`,
      });
      setSuccessAnim(true);

      setTimeout(() => {
        handleClear();
      }, 3000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Gagal menyimpan",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayKg = kg || "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center p-4 md:p-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        
        @keyframes successPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        .animate-success { animation: successPop 0.6s ease-in-out; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `,
        }}
      />

      <div className="w-full max-w-6xl">
        {/* ==========================================
            HEADER
            ========================================== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                Kasir Terminal
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Point of Sale • Transaksi Mitra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* RFID Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${rfidReady ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
              ></div>
              <span className="text-[11px] font-medium text-slate-500">
                {rfidReady ? "RFID Scanner Aktif" : "Memproses..."}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            STEP INDICATOR
            ========================================== */}
        <div className="flex items-center gap-0 mb-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentStep === 1
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Verifikasi Mitra
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentStep === 2
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-white text-slate-400 border border-slate-200"
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Input Berat & Simpan
          </div>
        </div>

        {/* ==========================================
            MESSAGE NOTIFICATION
            ========================================== */}
        {message.text && (
          <div
            className={`mb-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold animate-slideUp ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                message.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : (
                <AlertCircle size={20} className="text-red-600" />
              )}
            </div>
            <span>{message.text}</span>
          </div>
        )}

        {/* ==========================================
            MAIN GRID
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* KOLOM KIRI - INFO (3/5) */}
          <div className="lg:col-span-3 space-y-4">
            {/* CARD 1: VERIFIKASI MITRA */}
            <div
              ref={pinBoxRef}
              className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                successAnim ? "animate-success" : ""
              } ${
                mitra
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg shadow-green-100/30"
                  : "bg-white border-2 border-blue-200 shadow-lg shadow-blue-100/30 animate-pulse-glow"
              }`}
            >
              {/* Card Header */}
              <div
                className={`px-5 py-3 border-b flex items-center justify-between ${
                  mitra
                    ? "bg-green-100/50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {mitra ? (
                    <UserCheck size={16} className="text-green-600" />
                  ) : (
                    <CreditCard size={16} className="text-blue-600" />
                  )}
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      mitra ? "text-green-700" : "text-blue-700"
                    }`}
                  >
                    {mitra
                      ? "✓ Mitra Terverifikasi"
                      : "Langkah 1: Verifikasi Identitas"}
                  </span>
                </div>
                {!mitra && (
                  <div className="flex items-center gap-1.5">
                    <Radio size={12} className="text-blue-500" />
                    <span className="text-[10px] font-medium text-blue-500">
                      RFID Ready
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                {!mitra ? (
                  <div className="space-y-4">
                    {/* Instruksi */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={14} className="text-blue-600" />
                          <span className="text-[11px] font-bold text-blue-700">
                            TAP KARTU RFID
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-500 leading-relaxed">
                          Tempelkan kartu RFID ke scanner. Kursor tidak perlu
                          diarahkan ke mana pun.
                        </p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Smartphone size={14} className="text-amber-600" />
                          <span className="text-[11px] font-bold text-amber-700">
                            KETIK PIN 4 DIGIT
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-500 leading-relaxed">
                          Gunakan numpad di samping. PIN akan otomatis
                          diverifikasi setelah 4 digit.
                        </p>
                      </div>
                    </div>

                    {/* PIN Display */}
                    <div className="flex gap-3 justify-center">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-16 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all ${
                            pin[i]
                              ? "bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/25"
                              : "bg-slate-50 border-slate-200 text-transparent"
                          } ${pin.length === i ? "border-blue-400 ring-4 ring-blue-100" : ""}`}
                        >
                          {pin[i] || ""}
                        </div>
                      ))}
                    </div>

                    {pin.length > 0 && pin.length < 4 && (
                      <p className="text-center text-[10px] text-slate-400 mt-3">
                        Lanjutkan mengetik... ({4 - pin.length} digit lagi)
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                        <UserCheck size={26} className="text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">
                          {mitra.nama_penjual}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-500 font-mono">
                            PIN: {mitra.pin}
                          </span>
                          {mitra.no_whatsapp && (
                            <span className="text-xs text-slate-400">
                              WA: {mitra.no_whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleClear}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                      title="Batalkan & Mulai Ulang"
                    >
                      <XCircle size={22} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: INPUT BERAT */}
            <div
              className={`rounded-2xl overflow-hidden transition-all duration-500 border-2 ${
                mitra
                  ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 shadow-lg shadow-orange-100/30"
                  : "bg-white border-slate-200 opacity-50"
              }`}
            >
              <div
                className={`px-5 py-3 border-b ${
                  mitra
                    ? "bg-orange-100/50 border-orange-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Scale
                    size={16}
                    className={mitra ? "text-orange-600" : "text-slate-400"}
                  />
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      mitra ? "text-orange-700" : "text-slate-400"
                    }`}
                  >
                    Langkah 2: Jumlah Berat (KG)
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-end justify-center gap-2 mb-4">
                  <span
                    className={`text-7xl font-bold tracking-tight ${mitra ? "text-slate-800" : "text-slate-300"}`}
                  >
                    {displayKg}
                  </span>
                  <span className="text-2xl text-slate-400 mb-2 font-medium">
                    KG
                  </span>
                </div>

                <input
                  ref={kgInputRef}
                  type="text"
                  value={kg}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    if (val.split(".").length > 2) return;
                    if (val.replace(".", "").length > 5) return;
                    setKg(val);
                  }}
                  className={`w-full px-4 py-3 rounded-xl text-center text-lg font-semibold transition-all ${
                    mitra
                      ? "border-2 border-orange-300 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none"
                      : "border-2 border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  placeholder={
                    mitra
                      ? "Ketik berat atau gunakan numpad..."
                      : "Silakan verifikasi mitra terlebih dahulu"
                  }
                  disabled={!mitra}
                />

                {mitra && (
                  <p className="text-center text-[10px] text-slate-400 mt-2">
                    Gunakan numpad di samping atau ketik langsung
                  </p>
                )}
              </div>
            </div>

            {/* DESKTOP ACTION BUTTONS */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
              >
                <RotateCcw size={16} /> Reset Semua
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-medium hover:bg-slate-700 transition-all shadow-sm"
              >
                <LogOut size={16} /> Keluar Sistem
              </button>
            </div>
          </div>

          {/* KOLOM KANAN - NUMPAD (2/5) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Numpad */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumpad(num.toString())}
                    className="h-20 md:h-24 bg-slate-50 border border-slate-200 rounded-2xl text-3xl font-bold text-slate-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 hover:shadow-md active:bg-blue-50 active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="h-20 md:h-24 bg-red-50 border border-red-200 rounded-2xl text-red-500 hover:bg-red-100 hover:border-red-300 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Delete size={32} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !mitra}
              className={`w-full py-7 rounded-2xl text-xl font-bold transition-all flex items-center justify-center gap-3 ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : successAnim
                    ? "bg-green-500 text-white shadow-xl shadow-green-500/30"
                    : mitra
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 active:scale-[0.98]"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-dashed border-slate-300"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : successAnim ? (
                <>
                  <CheckCircle2 size={26} /> Transaksi Berhasil!
                </>
              ) : mitra ? (
                <>
                  <Send size={24} /> Simpan Transaksi
                </>
              ) : (
                <>
                  <ArrowRight size={24} /> Verifikasi Mitra Dulu
                </>
              )}
            </button>

            {/* Quick Info */}
            {!mitra && (
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 animate-float">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                    <Radio size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-800 mb-1">
                      Scanner RFID Aktif
                    </p>
                    <p className="text-xs text-blue-600 leading-relaxed">
                      Tempelkan kartu RFID mitra ke scanner, atau ketik PIN 4
                      digit menggunakan numpad.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mitra && (
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/25">
                    <Package size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800 mb-1">
                      Siap Input Berat
                    </p>
                    <p className="text-xs text-green-600 leading-relaxed">
                      Masukkan jumlah KG menggunakan numpad atau ketik langsung,
                      lalu klik Simpan.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MOBILE ACTION BUTTONS */}
            <div className="grid lg:hidden grid-cols-2 gap-3">
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 shadow-sm"
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-medium shadow-sm"
              >
                <LogOut size={16} /> Keluar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
