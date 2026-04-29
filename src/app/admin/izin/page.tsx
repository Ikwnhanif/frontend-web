"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  CalendarOff,
  PlusSquare,
  Trash2,
  X,
  Users,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  FileText,
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
}) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full no-print">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`bg-white rounded-xl shadow-lg border border-slate-200 animate-slideIn overflow-hidden ${toast.type === "success" ? "border-l-4 border-l-green-500" : ""} ${toast.type === "error" ? "border-l-4 border-l-red-500" : ""} ${toast.type === "info" ? "border-l-4 border-l-blue-500" : ""} ${toast.type === "warning" ? "border-l-4 border-l-yellow-500" : ""}`}
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

// ==========================================
// MODAL KONFIRMASI DELETE
// ==========================================
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemDetail,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemDetail: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] no-print">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-red-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} /> Batalkan Izin
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
            <p className="text-sm font-medium text-red-800">{itemName}</p>
            <p className="text-xs text-red-600 mt-1">{itemDetail}</p>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Jika dihapus, tagihan sewa untuk tanggal tersebut akan dihitung
            normal kembali.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 shadow-sm"
            >
              Ya, Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function IzinMitraPage() {
  const [izinList, setIzinList] = useState<any[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchMitra, setSearchMitra] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    penjual_id: "",
    tanggal_mulai: new Date().toISOString().split("T")[0],
    tanggal_akhir: new Date().toISOString().split("T")[0],
    keterangan: "",
  });

  // Toast & Confirm state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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

  const fetchData = async () => {
    try {
      const [resIzin, resMitra] = await Promise.all([
        api.get("/admin/sewa/izin"),
        api.get("/admin/penjual"),
      ]);
      setIzinList(resIzin.data || []);
      setMitraList(resMitra.data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast(
        "error",
        "Gagal Memuat Data",
        "Tidak dapat mengambil data izin mitra.",
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setSearchMitra("");
    setFormData({
      penjual_id: "",
      tanggal_mulai: new Date().toISOString().split("T")[0],
      tanggal_akhir: new Date().toISOString().split("T")[0],
      keterangan: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.penjual_id) {
      showToast("warning", "Pilih Mitra", "Silakan pilih mitra dari dropdown.");
      return;
    }
    if (new Date(formData.tanggal_akhir) < new Date(formData.tanggal_mulai)) {
      showToast(
        "error",
        "Tanggal Tidak Valid",
        "Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.",
      );
      return;
    }
    try {
      await api.post("/admin/sewa/izin", {
        penjual_id: parseInt(formData.penjual_id),
        tanggal_mulai: formData.tanggal_mulai + "T00:00:00Z",
        tanggal_akhir: formData.tanggal_akhir + "T00:00:00Z",
        keterangan: formData.keterangan,
      });
      const selectedMitra = mitraList.find(
        (m) => m.id.toString() === formData.penjual_id,
      );
      showToast(
        "success",
        "Izin Berhasil Disimpan",
        `Izin cuti untuk ${selectedMitra?.nama_penjual || "mitra"} telah dicatat.`,
      );
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menyimpan",
        err.response?.data?.error || "Terjadi kesalahan.",
      );
    }
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/admin/sewa/izin/${itemToDelete.id}`);
      showToast(
        "success",
        "Izin Dibatalkan",
        `Izin ${itemToDelete.penjual?.nama_penjual || "mitra"} berhasil dibatalkan. Tagihan akan dihitung normal.`,
      );
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      showToast(
        "error",
        "Gagal Menghapus",
        "Terjadi kesalahan saat membatalkan izin.",
      );
    }
  };

  const filteredMitra = mitraList.filter(
    (m) =>
      m.nama_penjual.toLowerCase().includes(searchMitra.toLowerCase()) ||
      (m.nama_warung &&
        m.nama_warung.toLowerCase().includes(searchMitra.toLowerCase())),
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIzinData = izinList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(izinList.length / itemsPerPage);

  // Hitung stats
  const totalIzinAktif = izinList.filter(
    (i: any) =>
      new Date(i.tanggal_akhir) >=
      new Date(new Date().toISOString().split("T")[0]),
  ).length;
  const totalSemuaIzin = izinList.length;

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
        itemName={itemToDelete?.penjual?.nama_penjual || ""}
        itemDetail={`${new Date(itemToDelete?.tanggal_mulai).toLocaleDateString("id-ID")} s/d ${new Date(itemToDelete?.tanggal_akhir).toLocaleDateString("id-ID")}`}
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

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarOff size={28} className="text-orange-500" />
            Cuti Operasional
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catatan izin mitra & pemberhentian tagihan sementara
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
        >
          <PlusSquare size={16} /> Input Izin Baru
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Total Izin
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{totalSemuaIzin}</p>
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
          <p className="text-2xl font-bold text-green-600">{totalIzinAktif}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-orange-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Expired
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-500">
            {totalSemuaIzin - totalIzinAktif}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-purple-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Mitra
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {mitraList.length}
          </p>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Mitra
                </th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Periode Izin
                </th>
                <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Alasan
                </th>
                <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentIzinData.map((item: any) => {
                const tglMulai = new Date(item.tanggal_mulai);
                const tglAkhir = new Date(item.tanggal_akhir);
                const diffTime = Math.abs(
                  tglAkhir.getTime() - tglMulai.getTime(),
                );
                const diffDays =
                  Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const isExpired = new Date() > tglAkhir;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/50 transition-colors ${isExpired ? "opacity-50" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                          <Users size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.penjual?.nama_penjual || "Mitra Dihapus"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.penjual?.nama_warung || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg">
                        <Calendar size={12} className="text-orange-500" />
                        <span className="text-xs font-semibold text-orange-700">
                          {tglMulai.toLocaleDateString("id-ID")} -{" "}
                          {tglAkhir.toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        {diffDays} hari bebas sewa
                      </p>
                      {isExpired && (
                        <span className="text-[10px] text-red-400 font-medium">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-1.5 text-sm text-slate-600 max-w-xs">
                        <MessageSquare
                          size={14}
                          className="mt-0.5 text-slate-400 shrink-0"
                        />
                        <span className="line-clamp-2">
                          {item.keterangan || "Tidak ada keterangan"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Batalkan Izin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {izinList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="text-slate-400">
                      <CalendarOff
                        size={40}
                        className="mx-auto mb-3 text-slate-300"
                      />
                      <p className="text-sm font-medium">Belum ada data izin</p>
                      <p className="text-xs mt-1">
                        Klik "Input Izin Baru" untuk menambahkan
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {izinList.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-600 outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-slate-400">
                dari {izinList.length} data
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                Hal {currentPage} / {totalPages || 1}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INPUT IZIN */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <PlusSquare size={18} className="text-orange-500" /> Input Cuti
                Operasional
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  1. Pilih Mitra
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchMitra}
                    onChange={(e) => {
                      setSearchMitra(e.target.value);
                      setShowDropdown(true);
                      if (formData.penjual_id)
                        setFormData({ ...formData, penjual_id: "" });
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Ketik nama mitra..."
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium"
                  />
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredMitra.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              penjual_id: m.id.toString(),
                            });
                            setSearchMitra(
                              `${m.nama_penjual} ${m.nama_warung ? `(${m.nama_warung})` : ""}`,
                            );
                            setShowDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {m.nama_penjual}
                          </p>
                          {m.nama_warung && (
                            <p className="text-[11px] text-slate-400">
                              {m.nama_warung}
                            </p>
                          )}
                        </div>
                      ))}
                      {filteredMitra.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-400">
                          Mitra tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    2. Dari Tanggal
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_mulai: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Sampai Tanggal
                  </label>
                  <input
                    required
                    type="date"
                    min={formData.tanggal_mulai}
                    value={formData.tanggal_akhir}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_akhir: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  3. Keterangan / Alasan
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Contoh: Pulang kampung ada hajatan"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 shadow-sm"
                >
                  Simpan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
