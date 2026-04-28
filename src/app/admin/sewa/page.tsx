"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  PackagePlus,
  Edit,
  Trash2,
  Package,
  Search,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

// ==========================================
// KOMPONEN TOAST NOTIFICATION
// ==========================================
type ToastType = "success" | "error" | "info" | "warning";

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
            ${toast.type === "warning" ? "border-l-yellow-500" : ""}
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
              {toast.type === "warning" && (
                <AlertTriangle size={20} className="text-yellow-600" />
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
                    : toast.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// MODAL KONFIRMASI DELETE
// ==========================================
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white border-4 border-red-500 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
        <div className="bg-red-500 p-4 flex justify-between items-center">
          <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <AlertTriangle size={16} /> {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
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
                {message}
              </p>
              <div className="bg-slate-50 border-2 border-slate-200 p-3">
                <div className="text-xs font-bold text-slate-600">
                  <span className="uppercase text-slate-400">Aset: </span>
                  <span className="text-slate-800 font-black">{itemName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-4">
            <p className="text-xs font-bold text-yellow-800 uppercase">
              ⚠️ Aset yang dinonaktifkan tidak bisa disewa lagi oleh mitra.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 font-black uppercase text-xs border-4 border-slate-900 hover:bg-slate-50 transition-all active:translate-y-1"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Ya, Nonaktifkan!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MasterSewaPage() {
  const [katalog, setKatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Form
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_aset: "",
    harga_hari: "",
    is_active: true,
  });

  // State untuk konfirmasi delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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

  const fetchKatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sewa/katalog");
      setKatalog(res.data || []);
    } catch (err) {
      console.error("Gagal load data katalog");
      showToast(
        "error",
        "GAGAL MEMUAT DATA",
        "Tidak dapat mengambil data katalog aset. Periksa koneksi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKatalog();
  }, []);

  const handleAddClick = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ nama_aset: "", harga_hari: "", is_active: true });
    setShowModal(true);
  };

  const handleEditClick = (item: any) => {
    setIsEdit(true);
    setEditId(item.id);
    setFormData({
      nama_aset: item.nama_aset,
      harga_hari: item.harga_hari.toString(),
      is_active: item.is_active,
    });
    setShowModal(true);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await api.delete(`/admin/sewa/katalog/${itemToDelete.id}`);

      showToast(
        "success",
        "ASET DINONAKTIFKAN",
        `Aset "${itemToDelete.nama_aset}" berhasil dinonaktifkan dan tidak bisa disewa lagi.`,
      );

      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchKatalog();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENONAKTIFKAN",
        err.response?.data?.error ||
          "Terjadi kesalahan saat menonaktifkan aset.",
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nama_aset: formData.nama_aset,
        harga_hari: parseFloat(formData.harga_hari),
        is_active: formData.is_active,
      };

      if (isEdit && editId) {
        await api.put(`/admin/sewa/katalog/${editId}`, payload);
        showToast(
          "success",
          "ASET BERHASIL DIUPDATE",
          `Data aset "${formData.nama_aset}" telah berhasil diperbarui dengan tarif ${formatRupiah(parseFloat(formData.harga_hari))}/hari.`,
        );
      } else {
        await api.post("/admin/sewa/katalog", payload);
        showToast(
          "success",
          "ASET BARU DITAMBAHKAN",
          `Aset "${formData.nama_aset}" berhasil ditambahkan ke katalog dengan tarif ${formatRupiah(parseFloat(formData.harga_hari))}/hari.`,
        );
      }
      setShowModal(false);
      fetchKatalog();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENYIMPAN DATA",
        err.response?.data?.error ||
          "Terjadi kesalahan saat menyimpan data aset. Pastikan nama aset tidak duplikat.",
      );
    }
  };

  const filtered = katalog.filter((item: any) =>
    item.nama_aset.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modal Konfirmasi Delete */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Konfirmasi Nonaktifkan"
        message="Anda akan menonaktifkan aset berikut:"
        itemName={itemToDelete?.nama_aset || ""}
      />

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
          `,
        }}
      />

      {/* HEADER & TAB NAVIGASI */}
      <div className="mb-8">
        <div className="flex gap-4 border-b-4 border-slate-900 pb-4 mb-4">
          <button className="bg-slate-900 text-white font-black px-6 py-2 uppercase text-xs tracking-widest border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Katalog Aset
          </button>
          <button
            onClick={() => (window.location.href = "/admin/sewa/peminjaman")}
            className="bg-slate-200 text-slate-500 hover:bg-slate-300 font-black px-6 py-2 uppercase text-xs tracking-widest border-4 border-transparent transition-colors shadow-none"
          >
            Sirkulasi Peminjaman
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
              <Package size={32} className="text-orange-500" /> Master Aset Sewa
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Katalog Barang & Tarif Pinjaman Mitra
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <PackagePlus size={18} /> Tambah Aset Baru
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6 relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Cari nama aset..."
          className="w-full pl-12 p-4 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none font-black text-sm uppercase placeholder:text-slate-300 focus:border-orange-500 transition-colors"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABEL DATA */}
      <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-800 text-white text-[10px] uppercase font-black tracking-widest border-b-4 border-slate-900">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nama Aset / Barang</th>
              <th className="p-4 text-right">Tarif Sewa (Per Hari)</th>
              <th className="p-4 text-center border-l-4 border-slate-900">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 border-slate-100">
            {filtered.map((item: any) => (
              <tr
                key={item.id}
                className={`hover:bg-orange-50 transition-colors ${!item.is_active ? "bg-slate-50 opacity-60 grayscale" : ""}`}
              >
                <td className="p-4 font-mono text-xs font-bold text-slate-500">
                  AST-{item.id.toString().padStart(3, "0")}
                </td>
                <td className="p-4">
                  <div className="font-black text-slate-800 uppercase text-sm flex items-center gap-2">
                    {item.nama_aset}
                    {!item.is_active && (
                      <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 border border-red-200">
                        NONAKTIF
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="inline-block bg-slate-100 text-slate-800 px-4 py-2 font-mono font-black text-lg border-2 border-slate-300">
                    {formatRupiah(item.harga_hari)}{" "}
                    <span className="text-xs text-slate-400">/hr</span>
                  </span>
                </td>
                <td className="p-4 align-middle text-center border-l-4 border-slate-100">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-3 bg-white border-4 border-slate-900 text-slate-900 hover:bg-orange-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      title="Edit Aset"
                    >
                      <Edit size={16} />
                    </button>
                    {item.is_active && (
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-3 bg-red-100 border-4 border-slate-900 text-red-600 hover:bg-red-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                        title="Nonaktifkan Aset"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-10 text-center font-bold uppercase text-slate-400 text-xs"
                >
                  Belum ada data aset.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-slate-900 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-slate-900 p-4 flex justify-between items-center border-b-4 border-orange-500">
              <h2 className="text-white font-black uppercase tracking-widest text-xs">
                {isEdit ? "Edit Master Aset" : "Tambah Aset Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-orange-400"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Toggle Aktif (Hanya untuk edit) */}
              {isEdit && (
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
                        Aset Tersedia (Bisa Disewa)
                      </span>
                    ) : (
                      <span className="text-red-500">Aset Ditarik / Rusak</span>
                    )}
                  </label>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Nama Aset / Barang
                </label>
                <input
                  required
                  value={formData.nama_aset}
                  placeholder="Contoh: Gerobak Tipe A"
                  className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm uppercase transition-colors"
                  onChange={(e) =>
                    setFormData({ ...formData, nama_aset: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Tarif Sewa Harian (Rp)
                </label>
                <div className="flex items-center">
                  <div className="bg-slate-200 border-y-4 border-l-4 border-slate-200 p-3 font-black text-sm text-slate-500">
                    Rp
                  </div>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.harga_hari}
                    placeholder="5000"
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors"
                    onChange={(e) =>
                      setFormData({ ...formData, harga_hari: e.target.value })
                    }
                  />
                </div>
                <p className="text-[9px] font-bold text-slate-400 italic pt-1">
                  *Isi 0 jika barang ini dipinjamkan secara gratis.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
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
                  {isEdit ? "Update Aset" : "Simpan Aset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
