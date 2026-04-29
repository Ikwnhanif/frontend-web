"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  X,
  MapPin,
  User,
  Store,
  Phone,
  Home,
  Navigation,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const MapPickerNoSSR = dynamic(() => import("../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Memuat Peta...</p>
      </div>
    </div>
  ),
});

interface TambahMitraFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

export default function TambahMitraForm({
  isOpen,
  onClose,
  onSuccess,
}: TambahMitraFormProps) {
  const [formData, setFormData] = useState({
    nama_penjual: "",
    nama_warung: "",
    alamat_jualan: "",
    alamat_rumah: "",
    no_whatsapp: "",
    lat: 0,
    long: 0,
    is_active: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [successPin, setSuccessPin] = useState("");

  const resetForm = () => {
    setFormData({
      nama_penjual: "",
      nama_warung: "",
      alamat_jualan: "",
      alamat_rumah: "",
      no_whatsapp: "",
      lat: 0,
      long: 0,
      is_active: true,
    });
    setCurrentStep(1);
    setError("");
    setSuccessPin("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/penjual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan data");
      }

      setSuccessPin(data.pin);
      setCurrentStep(3);

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data mitra");
    } finally {
      setIsLoading(false);
    }
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `,
        }}
      />

      {/* Modal Container - Lebih Besar */}
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-slideUp overflow-hidden">
        {/* ==========================================
            HEADER
            ========================================== */}
        <div className="shrink-0 px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Pendaftaran Mitra Baru
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi data untuk mendaftarkan mitra baru
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* ==========================================
            STEP INDICATOR
            ========================================== */}
        <div className="shrink-0 px-8 py-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-center gap-2">
            {[
              { num: 1, label: "Data Diri" },
              { num: 2, label: "Lokasi & Peta" },
              { num: 3, label: "Selesai" },
            ].map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentStep === step.num
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : currentStep > step.num
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === step.num
                        ? "bg-white/20"
                        : currentStep > step.num
                          ? "bg-green-100"
                          : "bg-slate-200"
                    }`}
                  >
                    {currentStep > step.num ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      step.num
                    )}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      currentStep > step.num ? "bg-green-300" : "bg-slate-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            BODY - SCROLLABLE
            ========================================== */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} id="mitra-form">
            <div className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-fadeIn">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-lg">⚠️</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Gagal Menyimpan
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Data Diri */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <User size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-800">
                          Informasi Mitra
                        </p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Isi data diri mitra dengan lengkap. PIN akan
                          digenerate otomatis setelah pendaftaran.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_penjual}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_penjual: e.target.value,
                          })
                        }
                        placeholder="Nama lengkap mitra"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Nama Warung
                      </label>
                      <div className="relative">
                        <Store
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={formData.nama_warung}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              nama_warung: e.target.value,
                            })
                          }
                          placeholder="Nama warung (opsional)"
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="tel"
                        required
                        value={formData.no_whatsapp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            no_whatsapp: e.target.value,
                          })
                        }
                        placeholder="0812-XXXX-XXXX"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Alamat Jualan <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin
                          size={16}
                          className="absolute left-4 top-3 text-slate-400"
                        />
                        <textarea
                          required
                          rows={3}
                          value={formData.alamat_jualan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alamat_jualan: e.target.value,
                            })
                          }
                          placeholder="Alamat lengkap tempat jualan"
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium resize-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Alamat Rumah
                      </label>
                      <div className="relative">
                        <Home
                          size={16}
                          className="absolute left-4 top-3 text-slate-400"
                        />
                        <textarea
                          rows={3}
                          value={formData.alamat_rumah}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alamat_rumah: e.target.value,
                            })
                          }
                          placeholder="Alamat rumah (opsional)"
                          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Aktif */}
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-white transition-all">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700">
                        {formData.is_active ? "Akun Aktif" : "Akun Nonaktif"}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formData.is_active
                          ? "Mitra dapat langsung bertransaksi"
                          : "Mitra diblokir sementara"}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* STEP 2: Lokasi & Peta */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                        <Navigation size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          Tandai Lokasi Jualan
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Geser pin pada peta ke lokasi jualan mitra. Koordinat
                          akan tersimpan otomatis.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <MapPickerNoSSR
                      onLocationSelect={(lat, lng) =>
                        setFormData({ ...formData, lat, long: lng })
                      }
                    />
                  </div>

                  {/* Koordinat Display */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Latitude
                      </p>
                      <p className="text-lg font-bold text-slate-800 font-mono">
                        {formData.lat ? formData.lat.toFixed(6) : "-"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Longitude
                      </p>
                      <p className="text-lg font-bold text-slate-800 font-mono">
                        {formData.long ? formData.long.toFixed(6) : "-"}
                      </p>
                    </div>
                  </div>

                  {formData.lat !== 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        openGoogleMaps(formData.lat, formData.long)
                      }
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                    >
                      <ExternalLink size={16} /> Buka di Google Maps
                    </button>
                  )}
                </div>
              )}

              {/* STEP 3: Sukses */}
              {currentStep === 3 && (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Pendaftaran Berhasil!
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Mitra baru berhasil didaftarkan. PIN telah digenerate
                    otomatis.
                  </p>

                  {/* PIN Display */}
                  <div className="inline-block bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl mb-6">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      PIN Mitra
                    </p>
                    <p className="text-5xl font-black text-white tracking-[0.3em] font-mono">
                      {successPin}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400">
                    Simpan PIN ini untuk diberikan kepada mitra
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ==========================================
            FOOTER - ACTION BUTTONS
            ========================================== */}
        <div className="shrink-0 px-8 py-5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3">
          {currentStep === 3 ? (
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
            >
              Selesai & Tutup
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <div className="flex gap-2">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3.5 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    Kembali
                  </button>
                )}
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={
                      !formData.nama_penjual ||
                      !formData.alamat_jualan ||
                      !formData.no_whatsapp
                    }
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Lanjut ke Peta →
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="mitra-form"
                    disabled={isLoading}
                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Mitra"
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
