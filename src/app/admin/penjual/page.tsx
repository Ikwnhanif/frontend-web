"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  UserPlus,
  Search,
  X,
  User,
  Printer,
  MapPin,
  Edit,
  Map,
  ExternalLink,
  CreditCard,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Phone,
  Navigation,
} from "lucide-react";
import dynamic from "next/dynamic";

const MapPickerNoSSR = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-sm text-slate-400 font-medium">
      Memuat Peta...
    </div>
  ),
});

// ==========================================
// TOAST NOTIFICATION
// ==========================================
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

const ToastContainer = ({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: number) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-white rounded-xl shadow-lg border border-slate-200 animate-slideIn overflow-hidden
            ${toast.type === "success" ? "border-l-4 border-l-green-500" : ""}
            ${toast.type === "error" ? "border-l-4 border-l-red-500" : ""}
            ${toast.type === "info" ? "border-l-4 border-l-blue-500" : ""}
          `}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <CheckCircle2 size={18} className="text-green-500" />
              )}
              {toast.type === "error" && (
                <XCircle size={18} className="text-red-500" />
              )}
              {toast.type === "info" && (
                <Info size={18} className="text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {toast.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="h-1 bg-slate-100">
            <div
              className={`h-full animate-shrink ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MasterPenjualPage() {
  const [penjual, setPenjual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_penjual: "",
    nama_warung: "",
    no_whatsapp: "",
    alamat_jualan: "",
    alamat_rumah: "",
    lat: 0,
    long: 0,
    is_active: true,
  });

  const [showRfidModal, setShowRfidModal] = useState(false);
  const [selectedPenjual, setSelectedPenjual] = useState<any>(null);
  const [rfidForm, setRfidForm] = useState({
    label: "Kartu Utama",
    rfid_tag: "",
  });
  const rfidInputRef = useRef<HTMLInputElement>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<any>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // State untuk print data
  const [printData, setPrintData] = useState<any[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);

  const showToast = (type: ToastType, title: string, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchPenjual = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/penjual");
      setPenjual(res.data || []);
      if (selectedPenjual) {
        const updated = res.data.find((p: any) => p.id === selectedPenjual.id);
        if (updated) setSelectedPenjual(updated);
      }
    } catch (err) {
      showToast(
        "error",
        "Gagal Memuat Data",
        "Tidak dapat mengambil data mitra.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenjual();
  }, []);

  // AUTOFOCUS RFID
  useEffect(() => {
    if (showRfidModal) {
      const focusInput = () => {
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      };
      focusInput();
      const timer1 = setTimeout(focusInput, 100);
      const timer2 = setTimeout(focusInput, 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [showRfidModal]);

  useEffect(() => {
    if (showRfidModal && selectedPenjual) {
      setRfidForm({
        label: `Kartu ${(selectedPenjual.cards?.length || 0) + 1}`,
        rfid_tag: "",
      });
    }
  }, [showRfidModal, selectedPenjual?.id]);

  const handleAddClick = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({
      nama_penjual: "",
      nama_warung: "",
      no_whatsapp: "",
      alamat_jualan: "",
      alamat_rumah: "",
      lat: 0,
      long: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditClick = (p: any) => {
    setIsEdit(true);
    setEditId(p.id);
    setFormData({
      nama_penjual: p.nama_penjual,
      nama_warung: p.nama_warung || "",
      no_whatsapp: p.no_whatsapp || "",
      alamat_jualan: p.alamat_jualan || "",
      alamat_rumah: p.alamat_rumah || "",
      lat: p.lat || 0,
      long: p.long || 0,
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const handleOpenRfid = (p: any) => {
    setSelectedPenjual(p);
    setShowRfidModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        await api.put(`/admin/penjual/${editId}`, formData);
        showToast(
          "success",
          "Data Berhasil Diupdate",
          `Data mitra ${formData.nama_penjual} telah diperbarui.`,
        );
      } else {
        const res = await api.post("/admin/penjual", formData);
        showToast(
          "success",
          "Mitra Baru Terdaftar",
          `${formData.nama_penjual} berhasil didaftarkan dengan PIN: ${res.data.pin}`,
        );
      }
      setShowModal(false);
      fetchPenjual();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menyimpan",
        err.response?.data?.error || "Terjadi kesalahan.",
      );
    }
  };

  const handleRfidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidForm.rfid_tag) return;
    try {
      await api.post("/admin/penjual/rfid", {
        penjual_id: selectedPenjual.id,
        rfid_tag: rfidForm.rfid_tag,
        label: rfidForm.label,
      });
      showToast(
        "success",
        "Kartu RFID Ditambahkan",
        `Kartu "${rfidForm.label}" berhasil dipasangkan.`,
      );
      setRfidForm({
        label: `Kartu ${(selectedPenjual.cards?.length || 0) + 2}`,
        rfid_tag: "",
      });
      fetchPenjual();
      setTimeout(() => {
        if (rfidInputRef.current) rfidInputRef.current.focus();
      }, 100);
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menambahkan RFID",
        err.response?.data?.error || "Kartu mungkin sudah terdaftar.",
      );
      setRfidForm((prev) => ({ ...prev, rfid_tag: "" }));
      setTimeout(() => {
        if (rfidInputRef.current) rfidInputRef.current.focus();
      }, 100);
    }
  };

  const handleDeleteClick = (card: any) => {
    setCardToDelete(card);
    setShowDeleteConfirm(true);
  };

  const handleDeleteRFID = async () => {
    if (!cardToDelete) return;
    try {
      await api.delete(`/admin/penjual/rfid/${cardToDelete.id}`);
      showToast(
        "success",
        "Kartu RFID Dihapus",
        `Kartu "${cardToDelete.label}" berhasil dihapus.`,
      );
      setShowDeleteConfirm(false);
      setCardToDelete(null);
      fetchPenjual();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menghapus",
        err.response?.data?.error || "Terjadi kesalahan.",
      );
    }
  };

  // FUNGSI CETAK - Diperbaiki
  const handlePrint = () => {
    const dataToPrint = searchTerm ? filtered : penjual;
    setPrintData(dataToPrint);
    setIsPrinting(true);
    showToast(
      "info",
      "Siap Cetak",
      `Mencetak ${dataToPrint.length} data mitra. Gunakan dialog print browser.`,
    );
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const filtered = penjual.filter(
    (p: any) =>
      p.nama_penjual.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_warung?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-shrink { animation: shrink 4s linear forwards; }
        
        /* CSS PRINT */
        @media print {
          @page { size: A4 landscape; margin: 1.5cm; }
          body { background: white !important; }
          
          /* SEMBUNYIKAN SEMUA UI */
          aside, nav, header, .no-print,
          [class*="fixed"], [class*="backdrop"] { 
            display: none !important; 
          }
          
          /* TAMPILKAN DOKUMEN CETAK */
          .print-only { 
            display: block !important; 
            position: static !important;
            visibility: visible !important;
          }
          .print-only * {
            visibility: visible !important;
          }
          .print-break { page-break-inside: avoid; }
        }
      `,
        }}
      />

      {/* ==========================================
          DOKUMEN CETAK - MUNCUL HANYA SAAT PRINT
          ========================================== */}
      {printData.length > 0 && (
        <div className="hidden print-only font-sans text-black">
          {/* Header */}
          <div className="text-center mb-8 border-b-4 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              MIE AYAM SPECIALL
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-1">
              Sistem Operasional Distribusi & Kemitraan
            </p>
            <p className="text-xs mt-1">
              Jl. Contoh Alamat Pusat No. 123 | Telp: 0813-9375-1133
            </p>
          </div>

          <h2 className="text-xl font-black uppercase text-center mb-2 underline underline-offset-4">
            DAFTAR MITRA & PIN
          </h2>
          <p className="text-center text-xs mb-6">
            Dicetak: {formatDate()} | Total: {printData.length} Mitra
          </p>

          {/* Tabel Cetak */}
          <table className="w-full border-collapse border-2 border-black mb-8">
            <thead className="bg-gray-200 font-black uppercase text-[11px]">
              <tr>
                <th className="border-2 border-black p-2 text-center w-10">
                  No
                </th>
                <th className="border-2 border-black p-2 text-left">
                  Nama Penjual
                </th>
                <th className="border-2 border-black p-2 text-left">Warung</th>
                <th className="border-2 border-black p-2 text-left">
                  No. WhatsApp
                </th>
                <th className="border-2 border-black p-2 text-center w-24">
                  PIN
                </th>
                <th className="border-2 border-black p-2 text-center w-16">
                  RFID
                </th>
                <th className="border-2 border-black p-2 text-center w-20">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {printData.map((p: any, i: number) => (
                <tr key={p.id} className="print-break">
                  <td className="border-2 border-black p-2 text-center text-xs">
                    {i + 1}
                  </td>
                  <td className="border-2 border-black p-2 font-bold text-xs uppercase">
                    {p.nama_penjual}
                  </td>
                  <td className="border-2 border-black p-2 text-xs">
                    {p.nama_warung || "-"}
                  </td>
                  <td className="border-2 border-black p-2 text-xs font-mono">
                    {p.no_whatsapp || "-"}
                  </td>
                  <td className="border-2 border-black p-2 text-center font-mono font-black text-sm">
                    {p.pin}
                  </td>
                  <td className="border-2 border-black p-2 text-center text-xs">
                    {p.cards?.length || 0}
                  </td>
                  <td className="border-2 border-black p-2 text-center text-xs font-bold">
                    {p.is_active ? "AKTIF" : "NONAKTIF"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="text-center text-xs mt-8">
            <p className="font-bold">
              Builtby.Outsys - Sistem Distribusi & Kemitraan
            </p>
            <p className="text-gray-500 mt-1">
              Dokumen ini dicetak secara otomatis oleh sistem
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          UI WEB UTAMA
          ========================================== */}
      <div className="no-print">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Data Mitra
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Database pelanggan & kemitraan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={penjual.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer size={16} />{" "}
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
            >
              <UserPlus size={16} />{" "}
              <span className="hidden sm:inline">Registrasi Baru</span>
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama atau warung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Mitra
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Kontak & Alamat
                  </th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    PIN / RFID
                  </th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p: any) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/50 transition-colors ${!p.is_active ? "opacity-50 bg-slate-50" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                          <User size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {p.nama_penjual}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.nama_warung || "Tanpa warung"}
                          </p>
                          {!p.is_active && (
                            <span className="text-[10px] text-red-500 font-medium">
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                        <Phone size={12} /> {p.no_whatsapp || "-"}
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                        <MapPin size={12} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-1">
                          {p.alamat_jualan || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block bg-slate-800 text-white px-4 py-1.5 rounded-lg font-mono font-bold text-sm tracking-wider">
                        {p.pin}
                      </span>
                      <div className="mt-1.5 text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                        <CreditCard size={10} /> {p.cards?.length || 0} kartu
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenRfid(p)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="RFID"
                        >
                          <CreditCard size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {p.lat !== 0 && (
                          <button
                            onClick={() => openGoogleMaps(p.lat, p.long)}
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Lokasi"
                          >
                            <Navigation size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="text-slate-400">
                        <User
                          size={40}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="text-sm font-medium">
                          Belum ada data mitra
                        </p>
                        <p className="text-xs mt-1">
                          Klik "Registrasi Baru" untuk menambahkan
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM MITRA */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">
                  {isEdit ? "Edit Data Mitra" : "Registrasi Mitra Baru"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
              >
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span
                    className={`text-sm font-medium ${formData.is_active ? "text-green-600" : "text-red-500"}`}
                  >
                    {formData.is_active ? "Akun Aktif" : "Akun Nonaktif"}
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      required
                      value={formData.nama_penjual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nama_penjual: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium transition-all"
                      placeholder="Nama mitra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Nama Warung
                    </label>
                    <input
                      value={formData.nama_warung}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nama_warung: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium transition-all"
                      placeholder="Nama warung"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Nomor WhatsApp *
                  </label>
                  <input
                    required
                    value={formData.no_whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_whatsapp: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium transition-all"
                    placeholder="0812-XXXX-XXXX"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Alamat Jualan *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.alamat_jualan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alamat_jualan: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium resize-none transition-all"
                      placeholder="Alamat lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                      Alamat Rumah
                    </label>
                    <textarea
                      rows={2}
                      value={formData.alamat_rumah}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          alamat_rumah: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium resize-none transition-all"
                      placeholder="Alamat rumah (opsional)"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-500">
                      Titik Lokasi Jualan
                    </label>
                    {formData.lat !== 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openGoogleMaps(formData.lat, formData.long)
                        }
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Buka Maps
                      </button>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <MapPickerNoSSR
                      initialPosition={{
                        lat: formData.lat,
                        lng: formData.long,
                      }}
                      onLocationSelect={(lat, lng) =>
                        setFormData({ ...formData, lat, long: lng })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
                  >
                    {isEdit ? "Update Data" : "Simpan Mitra"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RFID */}
        {showRfidModal && selectedPenjual && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-500" /> Kelola
                  Kartu RFID
                </h2>
                <button
                  onClick={() => setShowRfidModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="font-semibold text-slate-800">
                    {selectedPenjual.nama_penjual}
                  </p>
                  <p className="text-sm text-slate-500">
                    {selectedPenjual.nama_warung || "-"}
                  </p>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Kartu Terdaftar ({selectedPenjual.cards?.length || 0})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedPenjual.cards?.length > 0 ? (
                      selectedPenjual.cards.map((card: any) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {card.label}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {card.rfid_tag}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(card)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm text-slate-400 py-4">
                        Belum ada kartu
                      </p>
                    )}
                  </div>
                </div>
                <form
                  onSubmit={handleRfidSubmit}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-100"
                >
                  <p className="text-sm font-semibold text-blue-700 mb-3">
                    + Pairing Kartu Baru
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Label Kartu
                      </label>
                      <input
                        type="text"
                        value={rfidForm.label}
                        onChange={(e) =>
                          setRfidForm({ ...rfidForm, label: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        TAP KARTU SEKARANG
                      </label>
                      <input
                        ref={rfidInputRef}
                        type="text"
                        placeholder="Tempelkan kartu RFID..."
                        value={rfidForm.rfid_tag}
                        onChange={(e) =>
                          setRfidForm({ ...rfidForm, rfid_tag: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-mono text-sm font-medium bg-white placeholder:text-blue-300 transition-all"
                        autoFocus
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        *Kursor otomatis fokus ke sini. Tempelkan kartu.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
                    >
                      Simpan Kartu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {showDeleteConfirm && cardToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
              <div className="px-6 py-4 border-b border-red-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                  <AlertTriangle size={18} /> Konfirmasi Hapus
                </h2>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCardToDelete(null);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                  <p className="text-sm text-red-800">
                    <strong>{cardToDelete.label}</strong>
                  </p>
                  <p className="text-xs text-red-600 font-mono mt-1">
                    TAG: {cardToDelete.rfid_tag}
                  </p>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Kartu yang dihapus tidak dapat digunakan lagi untuk transaksi.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setCardToDelete(null);
                    }}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteRFID}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600"
                  >
                    Hapus Kartu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
