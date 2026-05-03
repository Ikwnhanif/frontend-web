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
  Search,
  MapPin,
  ChevronRight,
  AlertCircle,
  Fingerprint,
  UtensilsCrossed, // Ikon khusus tema kuliner
} from "lucide-react";

export default function KasirPage() {
  const [pin, setPin] = useState("");
  const [kg, setKg] = useState("");
  const [mitra, setMitra] = useState<any>(null);

  // State untuk pencarian
  const [allMitra, setAllMitra] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMitra, setFilteredMitra] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rfidReady, setRfidReady] = useState(true);
  const [successAnim, setSuccessAnim] = useState(false);

  const kgInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pinBoxRef = useRef<HTMLDivElement>(null);

  // LOAD DATA MITRA
  useEffect(() => {
    const fetchSemuaMitra = async () => {
      try {
        const res = await api.get("/kasir/penjual-aktif");
        setAllMitra(res.data || []);
      } catch (err) {}
    };
    fetchSemuaMitra();
  }, []);

  // Filter Dropdown
  useEffect(() => {
    if (searchQuery.length > 0) {
      const lower = searchQuery.toLowerCase();
      const filtered = allMitra.filter(
        (m) =>
          m.is_active &&
          (m.nama_penjual?.toLowerCase().includes(lower) ||
            m.alamat_jualan?.toLowerCase().includes(lower) ||
            m.nama_warung?.toLowerCase().includes(lower)),
      );
      setFilteredMitra(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchQuery, allMitra]);

  // VERIFIKASI MITRA
  const verifyMitra = useCallback(
    async (type: "rfid" | "pin", value: string) => {
      if (!value) return;
      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const res = await api.post("/kasir/verify-mitra", { type, value });
        handleMitraSelected(res.data.data);
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err.response?.data?.error || "Akses Ditolak",
        });
        setPin("");
        shakePinBox();
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleMitraSelected = (selectedMitra: any) => {
    setMitra(selectedMitra);
    setPin(selectedMitra.pin); // <--- KUNCI PENTING: Set pin dengan PIN asli mitra
    setSearchQuery("");
    setShowDropdown(false);
    setMessage({
      type: "success",
      text: `${selectedMitra.nama_penjual} Terhubung`,
    });
    setTimeout(() => kgInputRef.current?.focus(), 300);
  };

  // RFID LISTENER
  useEffect(() => {
    let rfidBuffer = "";
    let lastKeyTime = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
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
      } else if (e.key.length === 1) rfidBuffer += e.key;
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verifyMitra]);

  const shakePinBox = () => {
    if (pinBoxRef.current) {
      pinBoxRef.current.classList.add("animate-shake");
      setTimeout(
        () => pinBoxRef.current?.classList.remove("animate-shake"),
        500,
      );
    }
  };

  // NUMPAD HANDLER
  const handleNumpad = (val: string) => {
    if (!mitra) {
      if (val === ".") return;
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
    setSearchQuery("");
    setShowDropdown(false);
    setMessage({ type: "", text: "" });
    setSuccessAnim(false);
  };

  // LOGOUT HANDLER (Mencegah Infinite Loop)
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    const host = window.location.hostname;
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = `token=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    document.cookie = `role=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    window.location.replace("/login");
  };

  const handleSubmit = async () => {
    if (!mitra || !kg || parseFloat(kg) <= 0) return;
    setLoading(true);
    try {
      // Pastikan kita mengirim PIN dari state `pin` ATAU dari `mitra.pin`
      await api.post("/kasir/check-in", {
        penjual_id: mitra.id,
        pin: pin || mitra.pin, // <--- Tambahkan parameter pin
        jumlah_kg: parseFloat(kg),
      });

      setSuccessAnim(true);
      setTimeout(() => handleClear(), 2500);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Gagal memproses transaksi",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#FFF9F5] flex flex-col overflow-hidden font-sans text-slate-800 relative selection:bg-orange-200">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-8px); } 40%, 80% { transform: translateX(8px); } }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .ambient-blob { position: absolute; filter: blur(90px); opacity: 0.35; z-index: 0; pointer-events: none; }
      `,
        }}
      />

      {/* AMBIENT BACKGROUND GLOWS (Warm Food Tone) */}
      <div className="ambient-blob bg-orange-400 w-[500px] h-[500px] rounded-full top-[-200px] left-[-200px]" />
      <div className="ambient-blob bg-amber-300 w-[600px] h-[600px] rounded-full bottom-[-200px] right-[-200px]" />

      {/* TOP NAVBAR */}
      <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-orange-100 px-8 flex items-center justify-between z-50 shadow-[0_4px_20px_rgb(234,88,12,0.03)]">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <UtensilsCrossed size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              MIE SPECIAL{" "}
              <span className="font-light text-orange-600">| POS</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${rfidReady ? "bg-emerald-400 shadow-emerald-400" : "bg-red-400 shadow-red-400"}`}
              />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {rfidReady ? "Terminal Aktif" : "Memproses..."}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => window.location.reload()}
            className="p-3 bg-white hover:bg-orange-50 rounded-full text-slate-400 hover:text-orange-500 shadow-sm border border-slate-100 transition-all active:scale-95"
          >
            <RotateCcw size={20} />
          </button>
          <div className="h-8 w-px bg-orange-100" />
          <button
            className="flex items-center gap-4 group"
            onClick={handleLogout}
          >
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Kasir Aktif</p>
              <p className="text-xs text-slate-400 group-hover:text-orange-600 transition-colors">
                Tutup Shift (Logout)
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all text-orange-600">
              <LogOut size={20} />
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 overflow-hidden z-10">
        {/* =========================================================
            KOLOM KIRI (7/12) - IDENTIFIKASI & TIMBANGAN 
            ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-8 overflow-y-auto pr-2 no-scrollbar">
          {/* KARTU 1: IDENTIFIKASI MITRA */}
          <section
            ref={pinBoxRef}
            className={`relative rounded-[36px] transition-all duration-500 overflow-visible p-8 ${
              mitra
                ? "bg-gradient-to-br from-orange-600 to-amber-600 border border-orange-500 shadow-2xl shadow-orange-600/30 text-white"
                : "bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(234,88,12,0.06)]"
            }`}
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${mitra ? "bg-white/20 text-white" : "bg-orange-50 text-orange-600"}`}
                >
                  {mitra ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <Fingerprint size={20} />
                  )}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-[0.2em] ${mitra ? "text-orange-50" : "text-slate-500"}`}
                >
                  {mitra ? "Mitra Terverifikasi" : "Identifikasi Mitra"}
                </span>
              </div>
              {mitra && (
                <button
                  onClick={handleClear}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-all active:scale-90"
                >
                  <XCircle size={24} />
                </button>
              )}
            </div>

            {!mitra ? (
              <div className="space-y-8 relative z-10">
                {/* Visualizer PIN */}
                <div className="flex flex-col items-center">
                  <div className="flex gap-5 justify-center">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-16 h-20 rounded-[20px] flex items-center justify-center text-4xl transition-all duration-300 ${
                          pin[i]
                            ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 text-white scale-110"
                            : "bg-orange-50/50 border-2 border-dashed border-orange-200 text-transparent"
                        }`}
                      >
                        {pin[i] ? "•" : ""}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 px-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent flex-1" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.3em]">
                    Atau Cari Manual
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent flex-1" />
                </div>

                {/* SEARCH BOX */}
                <div className="relative">
                  <div className="relative group">
                    <Search
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                      size={22}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Ketik Nama Mitra / Alamat Warung..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[24px] font-medium text-lg text-slate-800 shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>

                  {/* DROPDOWN RESULTS */}
                  {showDropdown && (
                    <div className="absolute w-full mt-3 bg-white/95 backdrop-blur-xl border border-white rounded-3xl shadow-2xl shadow-orange-900/10 max-h-[280px] overflow-y-auto no-scrollbar z-50 p-2">
                      {filteredMitra.length > 0 ? (
                        filteredMitra.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleMitraSelected(m)}
                            className="w-full p-4 hover:bg-orange-50 rounded-2xl flex items-center gap-4 transition-all text-left mb-1 group"
                          >
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all text-orange-600">
                              <UserCheck size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-slate-800">
                                {m.nama_penjual}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} className="text-orange-400" />{" "}
                                {m.alamat_jualan || m.nama_warung || "-"}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                PIN
                              </span>
                              <span className="text-sm font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg">
                                {m.pin}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-6 py-8 text-center text-slate-400 font-medium flex flex-col items-center gap-3">
                          <AlertCircle size={32} className="text-slate-300" />
                          Tidak ada mitra yang cocok
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[28px] flex items-center justify-center text-white shadow-lg border border-white/30">
                  <UserCheck size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight mb-3 drop-shadow-md">
                    {mitra.nama_penjual}
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="flex items-center gap-2 text-sm text-orange-50 font-medium bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      <MapPin size={16} className="text-orange-200" />{" "}
                      {mitra.alamat_jualan ||
                        mitra.nama_warung ||
                        "Lokasi tidak disetel"}
                    </p>
                    <span className="text-sm text-orange-100 font-mono font-bold bg-black/10 px-4 py-2 rounded-xl backdrop-blur-md">
                      ID: {mitra.id}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* Watermark Aesthetic (Hanya muncul saat active) */}
            {mitra && (
              <CreditCard
                size={240}
                className="absolute -right-10 -bottom-10 text-white/[0.08] rotate-12 pointer-events-none"
              />
            )}
          </section>

          {/* KARTU 2: INPUT BERAT */}
          <section
            className={`flex-1 rounded-[36px] transition-all duration-700 flex flex-col items-center justify-center p-8 relative overflow-hidden ${
              mitra
                ? "bg-white/90 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(234,88,12,0.06)]"
                : "bg-white/40 border border-transparent opacity-60 grayscale pointer-events-none"
            }`}
          >
            <div
              className={`absolute top-8 left-8 flex items-center gap-3 ${mitra ? "text-orange-600" : "text-slate-400"}`}
            >
              <div className="p-2 bg-orange-50 rounded-xl">
                <Scale size={18} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Jumlah Berat Mie
              </span>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex items-baseline gap-4">
                <span
                  className={`text-[130px] font-light leading-none tracking-tighter transition-colors duration-300 ${successAnim ? "text-emerald-500 drop-shadow-lg" : "text-slate-800"}`}
                >
                  {kg || "0.0"}
                </span>
                <span className="text-4xl font-black text-slate-200 uppercase tracking-widest">
                  Kg
                </span>
              </div>
              <input
                ref={kgInputRef}
                type="text"
                value={kg}
                disabled={!mitra}
                onChange={(e) => setKg(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full max-w-[240px] text-center py-4 bg-transparent border-b-2 border-slate-200 font-bold text-2xl text-slate-800 outline-none focus:border-orange-500 transition-colors placeholder:text-slate-300 selection:bg-orange-200"
                placeholder={mitra ? "Input nominal..." : ""}
              />
            </div>
          </section>
        </div>

        {/* =========================================================
            KOLOM KANAN (5/12) - SMART NUMPAD & SUBMIT 
            ========================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* SOFT 3D NUMPAD */}
          <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-[36px] border border-white shadow-[0_8px_30px_rgb(234,88,12,0.06)] p-8 flex flex-col">
            <div className="grid grid-cols-3 gap-5 flex-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumpad(num.toString())}
                  className="rounded-[24px] bg-[#FFFBF9] text-3xl font-semibold text-slate-700 
                             shadow-[0_6px_0_0_#FDE6D5] hover:shadow-[0_4px_0_0_#FDE6D5] hover:translate-y-[2px] hover:bg-orange-50 hover:text-orange-600
                             active:shadow-none active:translate-y-[6px] active:bg-orange-100
                             transition-all flex items-center justify-center border border-orange-50/50"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="rounded-[24px] bg-red-50 text-red-500 
                           shadow-[0_6px_0_0_#fee2e2] hover:shadow-[0_4px_0_0_#fee2e2] hover:translate-y-[2px] hover:bg-red-100
                           active:shadow-none active:translate-y-[6px] 
                           transition-all flex items-center justify-center border border-red-50"
              >
                <Delete size={32} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* MASSIVE SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={!mitra || !kg || loading}
            className={`group h-28 rounded-[36px] text-2xl font-black tracking-widest flex items-center justify-center gap-4 transition-all duration-300 relative overflow-hidden ${
              !mitra || !kg
                ? "bg-slate-200/50 text-slate-400 border-2 border-dashed border-slate-300"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_12px_30px_-10px_rgba(245,158,11,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.6)] hover:-translate-y-1 active:scale-[0.98]"
            }`}
          >
            {/* Shimmer effect for active button */}
            {mitra && kg && !loading && !successAnim && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            )}

            {loading ? (
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            ) : successAnim ? (
              <div className="flex items-center gap-3 animate-in zoom-in duration-300">
                <CheckCircle2 size={32} /> BERHASIL
              </div>
            ) : (
              <>
                <span className="relative z-10">SIMPAN DATA</span>
                <ChevronRight
                  size={28}
                  className="relative z-10 group-hover:translate-x-2 transition-transform"
                />
              </>
            )}
          </button>

          {/* STATUS NOTIFICATION */}
          {message.text && (
            <div
              className={`p-5 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 shadow-lg ${
                message.type === "error"
                  ? "bg-red-500 text-white shadow-red-500/20"
                  : "bg-emerald-500 text-white shadow-emerald-500/20"
              }`}
            >
              {message.type === "error" ? (
                <AlertCircle size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
              <span className="text-sm font-bold uppercase tracking-wider">
                {message.text}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
