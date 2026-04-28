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
} from "lucide-react";
import dynamic from "next/dynamic";

const MapPickerNoSSR = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] bg-slate-100 border-4 border-slate-900 flex items-center justify-center font-black uppercase text-xs text-slate-400">
      Memuat Peta...
    </div>
  ),
});

// ==========================================
// KOMPONEN TOAST NOTIFICATION
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
            animate-slideIn bg-white overflow-hidden
            ${toast.type === "success" ? "border-l-green-500" : ""}
            ${toast.type === "error" ? "border-l-red-500" : ""}
            ${toast.type === "info" ? "border-l-blue-500" : ""}
          `}
          style={{ borderLeftWidth: "12px" }}
        >
          <div className="p-4 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <CheckCircle2 size={20} className="text-green-600" />
              )}
              {toast.type === "error" && (
                <XCircle size={20} className="text-red-600" />
              )}
              {toast.type === "info" && (
                <Info size={20} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-xs uppercase text-slate-800 mb-1">
                {toast.title}
              </div>
              <div className="text-[11px] font-bold text-slate-600 leading-tight">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-slate-100">
            <div
              className={`h-full animate-shrink ${
                toast.type === "success"
                  ? "bg-green-500"
                  : toast.type === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
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

  // State Form Profil
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

  // State Form RFID
  const [showRfidModal, setShowRfidModal] = useState(false);
  const [selectedPenjual, setSelectedPenjual] = useState<any>(null);
  const [rfidForm, setRfidForm] = useState({
    label: "Kartu Utama",
    rfid_tag: "",
  });
  const rfidInputRef = useRef<HTMLInputElement>(null);

  // State untuk konfirmasi hapus RFID
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<any>(null);

  // State Toast Notification
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Fungsi untuk menampilkan toast
  const showToast = (type: ToastType, title: string, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove setelah 4 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fungsi untuk menghapus toast manual
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchPenjual = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/penjual");
      setPenjual(res.data || []);

      // Update selected penjual data if RFID modal is open
      if (selectedPenjual) {
        const updatedPenjual = res.data.find(
          (p: any) => p.id === selectedPenjual.id,
        );
        if (updatedPenjual) setSelectedPenjual(updatedPenjual);
      }
    } catch (err) {
      console.error("Gagal load data");
      showToast(
        "error",
        "GAGAL MEMUAT DATA",
        "Tidak dapat mengambil data mitra. Periksa koneksi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenjual();
  }, []);

  // Autofocus input RFID saat modal dibuka
  useEffect(() => {
    if (showRfidModal && rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, [showRfidModal]);

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
    setRfidForm({ label: `Kartu ${p.cards?.length + 1 || 1}`, rfid_tag: "" });
    setShowRfidModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && editId) {
        await api.put(`/admin/penjual/${editId}`, formData);
        showToast(
          "success",
          "DATA BERHASIL DIUPDATE",
          `Data mitra ${formData.nama_penjual} telah berhasil diperbarui.`,
        );
      } else {
        const res = await api.post("/admin/penjual", formData);
        showToast(
          "success",
          "MITRA BARU TERDAFTAR",
          `${formData.nama_penjual} berhasil didaftarkan dengan PIN: ${res.data.pin}`,
        );
      }
      setShowModal(false);
      fetchPenjual();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENYIMPAN DATA",
        err.response?.data?.error ||
          "Terjadi kesalahan saat menyimpan data mitra.",
      );
    }
  };

  // Fungsi Submit RFID
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
        "KARTU RFID DITAMBAHKAN",
        `Kartu "${rfidForm.label}" dengan tag ${rfidForm.rfid_tag} berhasil dipasangkan ke ${selectedPenjual.nama_penjual}.`,
      );

      // Bersihkan input agar siap di-tap kartu selanjutnya
      setRfidForm({
        label: `Kartu ${selectedPenjual.cards.length + 2}`,
        rfid_tag: "",
      });
      fetchPenjual();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENAMBAHKAN RFID",
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Kartu mungkin sudah terdaftar di mitra lain.",
      );
      setRfidForm({ ...rfidForm, rfid_tag: "" });
    }
  };

  // Fungsi untuk membuka konfirmasi hapus RFID
  const handleDeleteClick = (card: any) => {
    setCardToDelete(card);
    setShowDeleteConfirm(true);
  };

  // Fungsi untuk menghapus RFID
  const handleDeleteRFID = async () => {
    if (!cardToDelete) return;

    try {
      await api.delete(`/admin/penjual/rfid/${cardToDelete.id}`);

      showToast(
        "success",
        "KARTU RFID DIHAPUS",
        `Kartu "${cardToDelete.label}" (${cardToDelete.rfid_tag}) berhasil dihapus dari ${selectedPenjual?.nama_penjual}.`,
      );

      setShowDeleteConfirm(false);
      setCardToDelete(null);
      fetchPenjual();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENGHAPUS RFID",
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Terjadi kesalahan saat menghapus kartu RFID.",
      );
    }
  };

  const filtered = penjual.filter(
    (p: any) =>
      p.nama_penjual.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_warung?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div className="p-4 md:p-8 print:p-0">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* CSS untuk animasi toast */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideIn {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            
            @keyframes shrink {
              from {
                width: 100%;
              }
              to {
                width: 0%;
              }
            }
            
            .animate-slideIn {
              animation: slideIn 0.3s ease-out;
            }
            
            .animate-shrink {
              animation: shrink 4s linear forwards;
            }

            @media print { 
              @page { size: A4 portrait; margin: 1.5cm; } 
              body, html, main { height: auto !important; overflow: visible !important; background: white !important; } 
              aside { display: none !important; } 
              .no-print { display: none !important; } 
            }
          `,
        }}
      />

      <div className="hidden print:block text-center mb-8 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          DAFTAR MITRA & PIN
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest mt-1">
          by.Outsys - Sistem Distribusi
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
            Master Penjual
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Database Pelanggan Tetap Mi Ayam
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Printer size={18} /> Cetak (PDF)
          </button>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <UserPlus size={18} /> Registrasi Baru
          </button>
        </div>
      </div>

      <div className="mb-6 relative max-w-md print:hidden">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Cari nama atau warung..."
          className="w-full pl-12 p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-black text-sm uppercase placeholder:text-slate-300 focus:border-orange-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border-4 border-slate-900 print:border-2 print:border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:shadow-none overflow-x-auto">
        <table className="w-full text-left print:text-sm min-w-[800px]">
          <thead className="bg-slate-800 print:bg-gray-200 text-white print:text-black text-[10px] print:text-xs uppercase font-black tracking-widest border-b-4 print:border-b-2 border-slate-900 print:border-black">
            <tr>
              <th className="p-4 print:py-2">Penjual & Warung</th>
              <th className="p-4 print:py-2">Kontak & Alamat</th>
              <th className="p-4 print:py-2 text-center border-l-4 print:border-l-2 border-slate-900 bg-orange-500 print:bg-white text-white print:text-black">
                PIN / RFID
              </th>
              <th className="p-4 print:py-2 text-center no-print border-l-4 border-slate-900">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 print:divide-y border-slate-100 print:border-gray-300">
            {filtered.map((p: any) => (
              <tr
                key={p.id}
                className={`hover:bg-orange-50 group print:break-inside-avoid transition-colors ${!p.is_active ? "opacity-60 bg-gray-50 grayscale" : ""}`}
              >
                <td className="p-4 print:py-3 align-top">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 mt-1 bg-slate-100 text-slate-400 transition-colors print:hidden ${p.is_active ? "group-hover:bg-orange-500 group-hover:text-white" : ""}`}
                    >
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-black text-slate-800 print:text-black uppercase text-sm flex items-center gap-2">
                        {p.nama_penjual}
                        {!p.is_active && (
                          <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 border border-red-200">
                            NONAKTIF
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-orange-600 print:text-gray-600 text-[10px] uppercase mt-1">
                        {p.nama_warung || "TIDAK ADA NAMA WARUNG"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 print:py-3 align-top">
                  <div className="font-mono text-xs font-black text-slate-700 mb-1">
                    WA: {p.no_whatsapp || "-"}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase leading-relaxed max-w-xs flex items-start gap-1">
                    <Map size={12} className="min-w-[12px] mt-0.5" />{" "}
                    {p.alamat_jualan || "Alamat belum diisi"}
                  </div>
                </td>
                <td className="p-4 print:py-3 text-center align-middle border-l-4 print:border-l-2 border-slate-100 print:border-black bg-slate-50 print:bg-white">
                  <span className="block bg-slate-900 print:bg-white text-orange-400 print:text-black px-4 py-2 font-mono font-black text-xl border-b-4 print:border-2 border-orange-500 print:border-black tracking-widest">
                    {p.pin}
                  </span>
                  <div className="mt-2 text-[10px] font-black uppercase text-slate-400 flex items-center justify-center gap-1">
                    <CreditCard size={12} /> {p.cards?.length || 0} Kartu Aktif
                  </div>
                </td>
                <td className="p-4 align-middle text-center no-print border-l-4 border-slate-100">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenRfid(p)}
                      className="p-3 bg-blue-100 border-4 border-slate-900 text-blue-700 hover:bg-blue-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      title="Kelola Kartu RFID"
                    >
                      <CreditCard size={16} />
                    </button>
                    <button
                      onClick={() => handleEditClick(p)}
                      className="p-3 bg-white border-4 border-slate-900 text-slate-900 hover:bg-orange-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      title="Edit Data"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL REGISTRASI/EDIT MITRA */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden overflow-y-auto">
          <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-8">
            <div className="bg-slate-900 p-4 flex justify-between items-center sticky top-0 z-10 border-b-4 border-orange-500">
              <h2 className="text-white font-black uppercase tracking-widest text-xs">
                {isEdit ? "Edit Data Pelanggan" : "Registrasi Pelanggan Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white hover:text-orange-400"
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 p-3 bg-slate-50 border-4 border-slate-200">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs font-black uppercase cursor-pointer flex-1"
                >
                  {formData.is_active ? (
                    <span className="text-green-600">
                      Akun Aktif (Bisa Transaksi)
                    </span>
                  ) : (
                    <span className="text-red-500">
                      Akun Nonaktif (Diblokir sementara)
                    </span>
                  )}
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    value={formData.nama_penjual}
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm uppercase transition-colors"
                    onChange={(e) =>
                      setFormData({ ...formData, nama_penjual: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Nama Warung
                  </label>
                  <input
                    value={formData.nama_warung}
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm uppercase transition-colors"
                    onChange={(e) =>
                      setFormData({ ...formData, nama_warung: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Nomor WA/HP
                </label>
                <input
                  required
                  value={formData.no_whatsapp}
                  className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors"
                  onChange={(e) =>
                    setFormData({ ...formData, no_whatsapp: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Alamat Jualan
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={formData.alamat_jualan}
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm uppercase resize-none transition-colors"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        alamat_jualan: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Alamat Rumah (Darurat)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.alamat_rumah}
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm uppercase resize-none transition-colors"
                    onChange={(e) =>
                      setFormData({ ...formData, alamat_rumah: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t-4 border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Titik Lokasi Jualan (Geser/Klik Peta)
                  </label>
                  {formData.lat !== 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        openGoogleMaps(formData.lat, formData.long)
                      }
                      className="flex gap-1 items-center text-[10px] font-black uppercase bg-blue-100 text-blue-700 px-2 py-1 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Buka Maps <ExternalLink size={10} />
                    </button>
                  )}
                </div>
                <div className="border-4 border-slate-200 focus-within:border-orange-500 relative z-0 transition-colors">
                  <MapPickerNoSSR
                    initialPosition={{ lat: formData.lat, lng: formData.long }}
                    onLocationSelect={(lat, lng) =>
                      setFormData({ ...formData, lat, long: lng })
                    }
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-black uppercase text-xs border-4 border-slate-900 hover:bg-slate-50 transition-all active:translate-y-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-orange-500 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  {isEdit ? "Update Data" : "Simpan & Cetak PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA KARTU RFID */}
      {showRfidModal && selectedPenjual && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border-4 border-slate-900 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-blue-600 p-4 flex justify-between items-center border-b-4 border-slate-900">
              <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <CreditCard size={16} /> Kelola Kartu RFID
              </h2>
              <button
                type="button"
                onClick={() => setShowRfidModal(false)}
                className="text-white hover:text-red-200"
              >
                <X />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-black uppercase text-xl text-slate-800">
                  {selectedPenjual.nama_penjual}
                </h3>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  {selectedPenjual.nama_warung || "-"}
                </p>
              </div>

              {/* List Kartu Terdaftar */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b-2 border-slate-100 pb-1">
                  Kartu Terdaftar ({selectedPenjual.cards?.length || 0})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedPenjual.cards && selectedPenjual.cards.length > 0 ? (
                    selectedPenjual.cards.map((card: any) => (
                      <div
                        key={card.id}
                        className="flex justify-between items-center p-3 bg-slate-50 border-4 border-slate-200 group hover:border-red-300 transition-colors"
                      >
                        <div>
                          <div className="font-black text-sm uppercase text-slate-800">
                            {card.label}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            TAG: {card.rfid_tag}
                          </div>
                        </div>
                        {/* Tombol Hapus Kartu */}
                        <button
                          onClick={() => handleDeleteClick(card)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-300 transition-all"
                          title="Hapus kartu RFID ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-xs font-bold text-slate-400 uppercase border-4 border-dashed border-slate-200">
                      Belum ada kartu
                    </div>
                  )}
                </div>
              </div>

              {/* Form Pairing Kartu Baru */}
              <form
                onSubmit={handleRfidSubmit}
                className="bg-blue-50 p-4 border-4 border-blue-200"
              >
                <p className="text-[10px] font-black uppercase text-blue-600 mb-3 flex items-center gap-1">
                  + Pairing Kartu Baru
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      Label Pemegang Kartu
                    </label>
                    <input
                      type="text"
                      value={rfidForm.label}
                      onChange={(e) =>
                        setRfidForm({ ...rfidForm, label: e.target.value })
                      }
                      className="w-full p-2 border-4 border-slate-300 focus:border-blue-600 focus:outline-none font-black text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500">
                      TAP KARTU SEKARANG
                    </label>
                    <input
                      ref={rfidInputRef}
                      type="text"
                      placeholder="Tunggu tap dari mesin..."
                      value={rfidForm.rfid_tag}
                      onChange={(e) =>
                        setRfidForm({ ...rfidForm, rfid_tag: e.target.value })
                      }
                      className="w-full p-4 border-4 border-blue-400 focus:border-blue-700 focus:outline-none font-mono font-black text-sm uppercase bg-white placeholder:text-blue-300"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 italic">
                      *Kursor harus berada di dalam kotak ini saat menempelkan
                      kartu.
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Simpan Kartu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS RFID */}
      {showDeleteConfirm && cardToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white border-4 border-red-500 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <div className="bg-red-500 p-4 flex justify-between items-center">
              <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <AlertTriangle size={16} /> Konfirmasi Hapus RFID
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCardToDelete(null);
                }}
                className="text-white hover:text-red-200"
              >
                <X />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-100 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-slate-800 mb-2">
                    Anda akan menghapus kartu RFID berikut:
                  </p>
                  <div className="bg-slate-50 border-2 border-slate-200 p-3 space-y-1">
                    <div className="text-xs font-bold text-slate-600">
                      <span className="uppercase text-slate-400">Label: </span>
                      <span className="text-slate-800">
                        {cardToDelete.label}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-600">
                      <span className="uppercase text-slate-400">TAG: </span>
                      <span className="text-slate-800">
                        {cardToDelete.rfid_tag}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      <span className="uppercase text-slate-400">Mitra: </span>
                      <span className="text-slate-800">
                        {selectedPenjual?.nama_penjual}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
                <p className="text-xs font-bold text-yellow-800 uppercase">
                  ⚠️ Kartu yang dihapus TIDAK dapat digunakan lagi untuk
                  transaksi.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCardToDelete(null);
                  }}
                  className="flex-1 py-4 font-black uppercase text-xs border-4 border-slate-900 hover:bg-slate-50 transition-all active:translate-y-1"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRFID}
                  className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Ya, Hapus Kartu!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
