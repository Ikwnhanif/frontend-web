"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  ArrowRightLeft,
  Printer,
  Undo2,
  PlusSquare,
  X,
  CheckCircle2,
  Box,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  CreditCard,
  DollarSign,
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
// DATE INPUT MODAL (Modern)
// ==========================================
const DateInputModal = ({
  isOpen,
  onClose,
  onSubmit,
  itemName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
  itemName: string;
}) => {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[70] no-print">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" /> Tanggal
            Pengembalian
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">Kembalikan Aset</p>
            <p className="text-sm font-semibold text-slate-800">{itemName}</p>
          </div>
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Tanggal Pengembalian
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={() => onSubmit(date)}
              className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-sm"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type SewaGroup = { penjual: any; items: any[]; total_tarif: number };

export default function PeminjamanAsetPage() {
  const [sewaList, setSewaList] = useState<any[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [katalogList, setKatalogList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [printData, setPrintData] = useState<SewaGroup | null>(null);
  const [selectedMitraReturn, setSelectedMitraReturn] =
    useState<SewaGroup | null>(null);
  const [searchMitra, setSearchMitra] = useState("");
  const [showMitraDropdown, setShowMitraDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const [formData, setFormData] = useState({
    penjual_id: "",
    tanggal_mulai: new Date().toISOString().split("T")[0],
  });
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

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
      setLoading(true);
      const [resSewa, resMitra, resKatalog] = await Promise.all([
        api.get("/admin/sewa/assign"),
        api.get("/admin/penjual"),
        api.get("/admin/sewa/katalog"),
      ]);
      setSewaList(resSewa.data || []);
      setMitraList(resMitra.data || []);
      setKatalogList(resKatalog.data?.filter((k: any) => k.is_active) || []);
    } catch (err) {
      showToast(
        "error",
        "Gagal Memuat Data",
        "Tidak dapat mengambil data peminjaman.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMitra = mitraList.filter((m: any) => {
    const s = searchMitra.toLowerCase();
    return (
      m.nama_penjual.toLowerCase().includes(s) ||
      (m.nama_warung && m.nama_warung.toLowerCase().includes(s)) ||
      (m.no_whatsapp && m.no_whatsapp.includes(searchMitra))
    );
  });

  const groupedSewaArray: SewaGroup[] = Object.values(
    sewaList.reduce((acc: Record<string, SewaGroup>, curr: any) => {
      if (!acc[curr.penjual_id])
        acc[curr.penjual_id] = {
          penjual: curr.penjual,
          items: [],
          total_tarif: 0,
        };
      acc[curr.penjual_id].items.push(curr);
      acc[curr.penjual_id].total_tarif += curr.katalog_sewa?.harga_hari || 0;
      return acc;
    }, {}),
  );

  const totalPages = Math.ceil(groupedSewaArray.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedSewaArray.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sewaList]);

  const handlePageChange = (p: number) => setCurrentPage(p);
  const handleAssetToggle = (id: number) =>
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  const handleMitraSelect = (mitraId: string, mitraName: string) => {
    setFormData({ ...formData, penjual_id: mitraId });
    setSearchMitra(mitraName);
    setShowMitraDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.penjual_id) {
      showToast(
        "warning",
        "Pilih Mitra",
        "Silakan pilih mitra terlebih dahulu.",
      );
      return;
    }
    if (selectedAssets.length === 0) {
      showToast("warning", "Centang Aset", "Centang minimal 1 aset.");
      return;
    }
    try {
      await Promise.all(
        selectedAssets.map((assetId) =>
          api.post("/admin/sewa/assign", {
            penjual_id: parseInt(formData.penjual_id),
            katalog_sewa_id: assetId,
            tanggal_mulai: formData.tanggal_mulai + "T00:00:00Z",
          }),
        ),
      );
      showToast(
        "success",
        "Peminjaman Berhasil",
        `${selectedAssets.length} aset berhasil dipinjamkan.`,
      );
      setShowModal(false);
      setFormData({ ...formData, penjual_id: "" });
      setSearchMitra("");
      setSelectedAssets([]);
      fetchData();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Menyimpan",
        err.response?.data?.error || "Terjadi kesalahan.",
      );
    }
  };

  const handleReturnClick = (item: any) => {
    setSelectedReturnItem(item);
    setShowDateModal(true);
  };
  const handleReturnConfirm = async (tgl: string) => {
    if (!selectedReturnItem) return;
    try {
      await api.put(`/admin/sewa/return/${selectedReturnItem.id}`, {
        tanggal_kembali: tgl + "T00:00:00Z",
      });
      showToast(
        "success",
        "Aset Dikembalikan",
        `"${selectedReturnItem.katalog_sewa?.nama_aset}" berhasil dikembalikan.`,
      );
      setShowDateModal(false);
      setSelectedReturnItem(null);
      fetchData();
    } catch (err: any) {
      showToast(
        "error",
        "Gagal Memproses",
        err.response?.data?.error || "Terjadi kesalahan.",
      );
    }
  };

  const handlePrintBA = (groupData: SewaGroup) => {
    setPrintData(groupData);
    showToast("info", "Siap Cetak", "Gunakan dialog print browser.");
    setTimeout(() => window.print(), 500);
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);

  const currentReturnGroup = selectedMitraReturn
    ? groupedSewaArray.find(
        (g) => g.penjual?.id === selectedMitraReturn.penjual?.id,
      )
    : null;

  // Pagination Component (Modern)
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxV = 5;
    let sp = Math.max(1, currentPage - Math.floor(maxV / 2));
    let ep = Math.min(totalPages, sp + maxV - 1);
    if (ep - sp + 1 < maxV) sp = Math.max(1, ep - maxV + 1);
    for (let i = sp; i <= ep; i++) pages.push(i);
    return (
      <div className="flex items-center justify-between px-5 py-3 bg-white border-t border-slate-200">
        <span className="text-xs text-slate-500">
          Menampilkan {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, groupedSewaArray.length)} dari{" "}
          {groupedSewaArray.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          {sp > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                1
              </button>
              {sp > 2 && <span className="px-1 text-slate-300">...</span>}
            </>
          )}
          {pages.map((n) => (
            <button
              key={n}
              onClick={() => handlePageChange(n)}
              className={`w-8 h-8 text-xs font-medium rounded-lg ${currentPage === n ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {n}
            </button>
          ))}
          {ep < totalPages && (
            <>
              {ep < totalPages - 1 && (
                <span className="px-1 text-slate-300">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="w-8 h-8 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Hitung stats
  const totalMitraAktif = groupedSewaArray.length;
  const totalAsetDisewa = groupedSewaArray.reduce(
    (acc, g) => acc + g.items.length,
    0,
  );
  const totalTagihanHarian = groupedSewaArray.reduce(
    (acc, g) => acc + g.total_tarif,
    0,
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <DateInputModal
        isOpen={showDateModal}
        onClose={() => {
          setShowDateModal(false);
          setSelectedReturnItem(null);
        }}
        onSubmit={handleReturnConfirm}
        itemName={selectedReturnItem?.katalog_sewa?.nama_aset || ""}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-shrink { animation: shrink 4s linear forwards; }
        @media print { @page { size: A4 portrait; margin: 2cm; } body { background: white !important; } aside, nav, header, .no-print, [class*="fixed"], [class*="backdrop"] { display: none !important; } .print-only { display: block !important; position: static !important; } .print-only * { visibility: visible !important; } }
      `,
        }}
      />

      {/* ========== DOKUMEN CETAK BAST ========== */}
      {printData && printData.penjual && (
        <div className="hidden print-only font-serif text-black leading-relaxed">
          <div className="text-center mb-10 border-b-4 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              MIE AYAM SPECIALL
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-1">
              Sistem Distribusi & Kemitraan
            </p>
            <p className="text-xs mt-1">
              Jl. Contoh Alamat Pusat No. 123, Kota Anda | Telp: 0812-XXXX-XXXX
            </p>
          </div>
          <h2 className="text-xl font-black uppercase text-center mb-8 underline underline-offset-4">
            Berita Acara Serah Terima Aset
          </h2>
          <p className="mb-4">
            Pada hari ini, tanggal{" "}
            <strong>{new Date().toLocaleDateString("id-ID")}</strong>, telah
            dilakukan serah terima aset perusahaan dengan rincian sebagai
            berikut:
          </p>
          <div className="mb-6">
            <h3 className="font-black uppercase mb-2">
              PIHAK PERTAMA (Yang Menyerahkan):
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="w-40 py-1">Nama</td>
                  <td>: Admin Perusahaan</td>
                </tr>
                <tr>
                  <td className="py-1">Jabatan</td>
                  <td>: Bagian Operasional Distribusi</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <h3 className="font-black uppercase mb-2">
              PIHAK KEDUA (Yang Menerima):
            </h3>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="w-40 py-1">Nama Mitra</td>
                  <td>
                    : <strong>{printData.penjual.nama_penjual}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="py-1">Nama Warung</td>
                  <td>: {printData.penjual.nama_warung || "-"}</td>
                </tr>
                <tr>
                  <td className="py-1">No. WhatsApp</td>
                  <td>: {printData.penjual.no_whatsapp || "-"}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top">Alamat Jualan</td>
                  <td>: {printData.penjual.alamat_jualan || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mb-4">
            Telah menyerahkan dan menerima{" "}
            <strong>{printData.items.length} item barang pinjaman</strong>{" "}
            dengan rincian:
          </p>
          <table className="w-full border-collapse border-2 border-black mb-8 text-sm">
            <thead className="bg-gray-100 font-black uppercase text-center">
              <tr>
                <th className="border-2 border-black p-2 w-10">No</th>
                <th className="border-2 border-black p-2 text-left">
                  Nama Barang / Aset
                </th>
                <th className="border-2 border-black p-2">Tgl Mulai Sewa</th>
                <th className="border-2 border-black p-2 text-right">
                  Tarif / Hari
                </th>
              </tr>
            </thead>
            <tbody>
              {printData.items.map((item: any, i: number) => (
                <tr key={item.id} className="font-bold">
                  <td className="border-2 border-black p-3 text-center">
                    {i + 1}
                  </td>
                  <td className="border-2 border-black p-3">
                    {item.katalog_sewa?.nama_aset || "Aset Tidak Valid"}
                  </td>
                  <td className="border-2 border-black p-3 text-center">
                    {new Date(item.tanggal_mulai).toLocaleDateString("id-ID")}
                  </td>
                  <td className="border-2 border-black p-3 text-right">
                    {formatRupiah(item.katalog_sewa?.harga_hari || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-black uppercase">
              <tr>
                <td
                  colSpan={3}
                  className="border-2 border-black p-3 text-right"
                >
                  TOTAL TARIF SEWA KESELURUHAN PER HARI :
                </td>
                <td className="border-2 border-black p-3 text-right">
                  {formatRupiah(printData.total_tarif)}
                </td>
              </tr>
            </tfoot>
          </table>
          <p className="mb-12 text-sm text-justify">
            Dengan ditandatanganinya Berita Acara ini, PIHAK KEDUA bersedia
            menjaga aset tersebut dengan baik...
          </p>
          <div className="flex justify-between text-center mt-12 px-10">
            <div>
              <p className="mb-20">
                <strong>PIHAK PERTAMA</strong>
              </p>
              <p className="underline font-bold uppercase">
                ( Admin Perusahaan )
              </p>
            </div>
            <div>
              <p className="mb-20">
                <strong>PIHAK KEDUA</strong>
              </p>
              <p className="underline font-bold uppercase">
                ( {printData.penjual.nama_penjual} )
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== UI WEB UTAMA (MODERN CLASSY) ========== */}
      <div className="no-print">
        {/* TAB NAVIGASI */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => (window.location.href = "/admin/sewa")}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
          >
            Katalog Aset
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm">
            Sirkulasi Peminjaman
          </button>
        </div>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <ArrowRightLeft size={28} className="text-orange-500" />
              Peminjaman Aset
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftar mitra yang sedang menyewa aset
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm shadow-orange-500/25"
          >
            <PlusSquare size={16} /> Peminjaman Baru
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Mitra Aktif
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {totalMitraAktif}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Box size={16} className="text-orange-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Aset Disewa
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {totalAsetDisewa}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign size={16} className="text-green-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Tagihan/Hari
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {formatRupiah(totalTagihanHarian)}
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
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Rincian Sewa
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Tagihan / Hari
                  </th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((group, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                          <Users size={16} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {group.penjual?.nama_penjual || "Mitra Dihapus"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {group.penjual?.nama_warung || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                        <Box size={14} className="text-orange-500" />{" "}
                        {group.items.length} item
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {group.items
                          .map((i: any) => i.katalog_sewa?.nama_aset)
                          .join(", ")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        {formatRupiah(group.total_tarif)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handlePrintBA(group)}
                          className="px-3 py-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        >
                          <Printer size={14} /> BAST
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMitraReturn(group);
                            setShowReturnModal(true);
                          }}
                          className="px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                        >
                          <Undo2 size={14} /> Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="text-slate-400">
                        <Box
                          size={40}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="text-sm font-medium">
                          Belum ada aset yang disewa
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination />
        </div>

        {/* MODAL PEMINJAMAN BARU */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <PlusSquare size={18} className="text-orange-500" />{" "}
                  Peminjaman Aset Baru
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto flex-1 space-y-5"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    1. Identitas Peminjam
                  </label>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Ketik nama mitra..."
                      value={searchMitra}
                      onChange={(e) => {
                        setSearchMitra(e.target.value);
                        setShowMitraDropdown(true);
                        if (!e.target.value)
                          setFormData({ ...formData, penjual_id: "" });
                      }}
                      onFocus={() => setShowMitraDropdown(true)}
                      className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium"
                    />
                    {showMitraDropdown && searchMitra && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredMitra.length > 0 ? (
                          filteredMitra.map((m: any) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() =>
                                handleMitraSelect(
                                  m.id.toString(),
                                  `${m.nama_penjual} ${m.nama_warung ? `(${m.nama_warung})` : ""}`,
                                )
                              }
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                            >
                              <p className="text-sm font-semibold text-slate-800">
                                {m.nama_penjual}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {m.nama_warung || "Tanpa warung"}
                                {m.no_whatsapp && ` • ${m.no_whatsapp}`}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-400">
                            Mitra tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.penjual_id && (
                    <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        Terpilih: {searchMitra}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    2. Tanggal Mulai Sewa
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
                    3. Centang Aset Yang Dipinjam
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {katalogList.map((k: any) => (
                      <label
                        key={k.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAssets.includes(k.id) ? "border-orange-400 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(k.id)}
                          onChange={() => handleAssetToggle(k.id)}
                          className="mt-0.5 w-4 h-4 accent-orange-500"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {k.nama_aset}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatRupiah(k.harga_hari)} / hari
                          </p>
                        </div>
                      </label>
                    ))}
                    {katalogList.length === 0 && (
                      <div className="col-span-2 text-center text-sm text-slate-400 py-8">
                        Tidak ada aset tersedia
                      </div>
                    )}
                  </div>
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
                    Simpan Peminjaman
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL RETURN ASET */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Undo2 size={18} className="text-blue-500" /> Kelola
                  Pengembalian
                </h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="font-semibold text-slate-800">
                    {currentReturnGroup?.penjual?.nama_penjual}
                  </p>
                  <p className="text-sm text-slate-500">
                    {currentReturnGroup?.penjual?.nama_warung}
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-500 mb-3">
                  Daftar Aset Aktif:
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {currentReturnGroup?.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.katalog_sewa?.nama_aset}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Disewa:{" "}
                          {new Date(item.tanggal_mulai).toLocaleDateString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleReturnClick(item)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-all"
                      >
                        Kembalikan
                      </button>
                    </div>
                  ))}
                  {(!currentReturnGroup ||
                    currentReturnGroup.items.length === 0) && (
                    <p className="text-center text-sm text-slate-400 py-6">
                      Semua aset sudah dikembalikan.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
