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
  Box,
  DollarSign,
  Tag,
} from "lucide-react";

// ==========================================
// TOAST NOTIFICATION (Modern)
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-white rounded-xl shadow-lg border border-slate-200 animate-slideIn overflow-hidden
            ${toast.type === "success" ? "border-l-4 border-l-green-500" : ""}
            ${toast.type === "error" ? "border-l-4 border-l-red-500" : ""}
            ${toast.type === "info" ? "border-l-4 border-l-blue-500" : ""}
            ${toast.type === "warning" ? "border-l-4 border-l-yellow-500" : ""}
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
              {toast.type === "warning" && (
                <AlertTriangle size={18} className="text-yellow-500" />
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
              className={`h-full animate-shrink ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : toast.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// MODAL KONFIRMASI DELETE (Modern)
// ==========================================
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] no-print">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-red-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} /> Nonaktifkan Aset
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
            <p className="text-sm font-medium text-red-800">{itemName}</p>
            <p className="text-xs text-red-600 mt-1">
              Aset ini akan dinonaktifkan dari katalog
            </p>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Aset yang dinonaktifkan tidak bisa disewa lagi oleh mitra.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all shadow-sm"
            >
              Nonaktifkan
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

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama_aset: "",
    harga_hari: "",
    is_active: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

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

  const fetchKatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sewa/katalog");
      setKatalog(res.data || []);
    } catch (err) {
      showToast(
        "error",
        "Gagal Memuat Data",
        "Tidak dapat mengambil data katalog aset.",
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
        "Aset Dinonaktifkan",
        `"${itemToDelete.nama_aset}" berhasil dinonaktifkan.`,
      );
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchKatalog();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menonaktifkan",
        err.response?.data?.error || "Terjadi kesalahan.",
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
          "Aset Berhasil Diupdate",
          `"${formData.nama_aset}" diperbarui dengan tarif ${formatRupiah(parseFloat(formData.harga_hari))}/hari.`,
        );
      } else {
        await api.post("/admin/sewa/katalog", payload);
        showToast(
          "success",
          "Aset Baru Ditambahkan",
          `"${formData.nama_aset}" ditambahkan ke katalog.`,
        );
      }
      setShowModal(false);
      fetchKatalog();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menyimpan",
        err.response?.data?.error || "Pastikan nama aset tidak duplikat.",
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

  // Hitung statistik
  const totalAset = katalog.length;
  const asetAktif = katalog.filter((k: any) => k.is_active).length;
  const asetNonaktif = totalAset - asetAktif;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        itemName={itemToDelete?.nama_aset || ""}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-shrink { animation: shrink 4s linear forwards; }
      `,
        }}
      />

      {/* TAB NAVIGASI */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm">
          Katalog Aset
        </button>
        <button
          onClick={() => (window.location.href = "/admin/sewa/peminjaman")}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
        >
          Sirkulasi Peminjaman
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Box size={28} className="text-orange-500" />
            Master Aset Sewa
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Katalog barang & tarif pinjaman mitra
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
        >
          <PackagePlus size={16} /> Tambah Aset Baru
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalAset}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Aktif
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">{asetAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle size={16} className="text-red-500" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Nonaktif
            </span>
          </div>
          <p className="text-2xl font-bold text-red-500">{asetNonaktif}</p>
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
          placeholder="Cari nama aset..."
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
                <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24">
                  ID
                </th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Nama Aset
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tarif / Hari
                </th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-28">
                  Status
                </th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item: any) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/50 transition-colors ${!item.is_active ? "opacity-50 bg-slate-50" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span className="inline-block bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold">
                      AST-{item.id.toString().padStart(3, "0")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <Box size={14} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.nama_aset}
                        </p>
                        {!item.is_active && (
                          <span className="text-[10px] text-red-500 font-medium">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {formatRupiah(item.harga_hari)}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1">
                      /hari
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-medium rounded-full">
                        <CheckCircle2 size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-medium rounded-full">
                        <XCircle size={12} /> Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Edit Aset"
                      >
                        <Edit size={16} />
                      </button>
                      {item.is_active && (
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Nonaktifkan"
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
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="text-slate-400">
                      <Box size={40} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-sm font-medium">Belum ada data aset</p>
                      <p className="text-xs mt-1">
                        Klik "Tambah Aset Baru" untuk menambahkan
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {isEdit ? "Edit Aset" : "Tambah Aset Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isEdit && (
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
                    {formData.is_active
                      ? "Aset Tersedia"
                      : "Aset Ditarik / Rusak"}
                  </span>
                </label>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nama Aset *
                </label>
                <input
                  required
                  value={formData.nama_aset}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_aset: e.target.value })
                  }
                  placeholder="Contoh: Gerobak Tipe A"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Tarif Sewa Harian (Rp) *
                </label>
                <div className="flex items-center gap-0">
                  <span className="px-4 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm font-medium text-slate-500">
                    Rp
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.harga_hari}
                    onChange={(e) =>
                      setFormData({ ...formData, harga_hari: e.target.value })
                    }
                    placeholder="5000"
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-r-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  *Isi 0 jika dipinjamkan secara gratis.
                </p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
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
