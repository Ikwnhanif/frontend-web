"use client";
import { useState } from "react";
import api from "@/lib/api";
import { Scale, Delete, XCircle, Hash, CheckCircle2 } from "lucide-react";

export default function KasirPage() {
  const [pin, setPin] = useState("");
  const [kg, setKg] = useState("");
  const [activeInput, setActiveInput] = useState<"pin" | "kg">("pin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleNumpad = (val: string) => {
    if (activeInput === "pin") {
      if (pin.length < 4) setPin((prev) => prev + val);
      if (pin.length === 3) setTimeout(() => setActiveInput("kg"), 200);
    } else {
      if (val === "." && kg.includes(".")) return;
      if (val === "." && kg === "") {
        setKg("0.");
        return;
      }
      setKg((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    if (activeInput === "pin") setPin(pin.slice(0, -1));
    else setKg(kg.slice(0, -1));
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
    if (pin.length < 4) {
      setMessage({ type: "error", text: "PIN HARUS 4 DIGIT!" });
      setActiveInput("pin");
      return;
    }
    if (!kg || parseFloat(kg) <= 0) {
      setMessage({ type: "error", text: "BERAT HARUS DIISI!" });
      setActiveInput("kg");
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await api.post("/kasir/check-in", {
        pin: pin,
        jumlah_kg: parseFloat(kg),
      });

      setMessage({
        type: "success",
        text: `BERHASIL: ${res.data.nama} | ${kg} KG`,
      });
      setPin("");
      setKg("");
      setActiveInput("pin");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "PIN SALAH / ERROR",
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
            className={`mb-6 p-5 font-black text-center border-4 shadow-neo flex items-center justify-center gap-3 text-lg uppercase ${
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
            {/* Box PIN */}
            <div
              onClick={() => setActiveInput("pin")}
              className={`cursor-pointer border-4 transition-all p-6 shadow-neo ${
                activeInput === "pin"
                  ? "bg-blue-600 border-slate-900 ring-4 ring-blue-300"
                  : "bg-white border-slate-800"
              }`}
            >
              <div
                className={`text-[10px] font-black uppercase mb-4 ${activeInput === "pin" ? "text-white" : "text-slate-400"}`}
              >
                1. INPUT PIN PENJUAL
              </div>
              <div className="flex gap-3 justify-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-14 h-20 border-4 flex items-center justify-center text-5xl font-black ${
                      activeInput === "pin"
                        ? "bg-white border-slate-900 text-slate-900 shadow-inner"
                        : pin[i]
                          ? "bg-slate-50 border-slate-400 text-slate-800"
                          : "bg-slate-100 border-slate-200 text-slate-200"
                    }`}
                  >
                    {pin[i] || ""}
                  </div>
                ))}
              </div>
            </div>

            {/* Box Berat */}
            <div
              onClick={() => setActiveInput("kg")}
              className={`cursor-pointer border-4 transition-all p-6 shadow-neo ${
                activeInput === "kg"
                  ? "bg-blue-600 border-slate-900 ring-4 ring-blue-300"
                  : "bg-white border-slate-800"
              }`}
            >
              <div
                className={`text-[10px] font-black uppercase mb-2 ${activeInput === "kg" ? "text-white" : "text-slate-400"}`}
              >
                2. JUMLAH BERAT (KG)
              </div>
              <div
                className={`text-center text-7xl font-black italic tracking-tighter ${activeInput === "kg" ? "text-white" : kg ? "text-slate-800" : "text-slate-200"}`}
              >
                {kg || "0.0"}{" "}
                <span className="text-xl not-italic opacity-50">KG</span>
              </div>
            </div>

            {/* Clear & Logout (Tablet Desktop View) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => {
                  setPin("");
                  setKg("");
                  setActiveInput("pin");
                }}
                className="py-4 border-4 border-slate-900 bg-white font-black uppercase text-xs shadow-neo btn-active-state"
              >
                Clear Inputs
              </button>
              <button
                onClick={handleLogout}
                className="py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-neo btn-active-state"
              >
                Logout System
              </button>
            </div>
          </div>

          {/* KOLOM KANAN: NUMPAD */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 bg-slate-800 p-4 border-4 border-slate-900 shadow-neo-lg">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumpad(num.toString())}
                  className="h-20 md:h-24 bg-white border-4 border-slate-900 font-black text-4xl text-slate-900 shadow-neo btn-active-state"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-20 md:h-24 bg-red-500 border-4 border-slate-900 text-white font-black flex items-center justify-center shadow-neo btn-active-state"
              >
                <Delete size={40} />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-8 border-4 border-slate-900 font-black text-4xl uppercase tracking-tighter shadow-neo-lg transition-all ${
                loading
                  ? "bg-slate-400 text-slate-600 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 active:translate-x-2 active:translate-y-2 active:shadow-none"
              }`}
            >
              {loading ? "SAVING..." : "SIMPAN DATA"}
            </button>

            {/* Action Buttons (Mobile View) */}
            <div className="grid lg:hidden grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPin("");
                  setKg("");
                  setActiveInput("pin");
                }}
                className="py-4 border-4 border-slate-900 bg-white font-black uppercase text-xs shadow-neo"
              >
                Clear
              </button>
              <button
                onClick={handleLogout}
                className="py-4 border-4 border-slate-900 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest shadow-neo"
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
