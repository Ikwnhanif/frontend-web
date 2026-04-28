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
  CheckCircle2 as CheckCircle2Icon,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
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
                <CheckCircle2Icon size={20} className="text-green-600" />
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
// MODAL INPUT TANGGAL (Pengganti prompt)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white border-4 border-blue-500 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
        <div className="bg-blue-500 p-4 flex justify-between items-center">
          <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <Calendar size={16} /> Tanggal Pengembalian
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-blue-200"
          >
            <X />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="font-black text-sm uppercase text-slate-800 mb-2">
              Kembalikan Aset:
            </p>
            <div className="bg-slate-50 border-2 border-slate-200 p-3">
              <span className="text-slate-800 font-black uppercase">
                {itemName}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-[10px] font-black uppercase text-slate-400">
              Masukkan Tanggal Pengembalian
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 border-4 border-slate-300 focus:border-blue-500 focus:outline-none font-black text-sm uppercase"
            />
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
              onClick={() => onSubmit(date)}
              className="flex-1 py-4 bg-blue-500 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 1. TAMBAHKAN TYPE DEFINITION UNTUK TYPESCRIPT
type SewaGroup = {
  penjual: any;
  items: any[];
  total_tarif: number;
};

export default function PeminjamanAsetPage() {
  const [sewaList, setSewaList] = useState<any[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [katalogList, setKatalogList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // 2. TERAPKAN TYPE PADA STATE PRINT DATA & SELECTED MITRA
  const [printData, setPrintData] = useState<SewaGroup | null>(null);
  const [selectedMitraReturn, setSelectedMitraReturn] =
    useState<SewaGroup | null>(null);

  // State untuk pencarian mitra di dropdown
  const [searchMitra, setSearchMitra] = useState("");
  const [showMitraDropdown, setShowMitraDropdown] = useState(false);

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Jumlah item per halaman

  // State untuk modal input tanggal pengembalian
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState<any>(null);

  // State Toast Notification
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Form State
  const [formData, setFormData] = useState({
    penjual_id: "",
    tanggal_mulai: new Date().toISOString().split("T")[0],
  });

  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  // Fungsi untuk menampilkan toast
  const showToast = (type: ToastType, title: string, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove setelah 5 detik
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Fungsi untuk menghapus toast manual
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
      console.error("Gagal load data");
      showToast(
        "error",
        "GAGAL MEMUAT DATA",
        "Tidak dapat mengambil data peminjaman. Periksa koneksi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter mitra berdasarkan pencarian
  const filteredMitra = mitraList.filter((m: any) => {
    const searchLower = searchMitra.toLowerCase();
    return (
      m.nama_penjual.toLowerCase().includes(searchLower) ||
      (m.nama_warung && m.nama_warung.toLowerCase().includes(searchLower)) ||
      (m.no_whatsapp && m.no_whatsapp.includes(searchMitra))
    );
  });

  // 3. TERAPKAN TYPE 'Record<string, SewaGroup>' PADA REDUCE AGAR TS TIDAK BINGUNG
  const groupedSewaArray: SewaGroup[] = Object.values(
    sewaList.reduce((acc: Record<string, SewaGroup>, curr: any) => {
      if (!acc[curr.penjual_id]) {
        acc[curr.penjual_id] = {
          penjual: curr.penjual,
          items: [],
          total_tarif: 0,
        };
      }
      acc[curr.penjual_id].items.push(curr);
      acc[curr.penjual_id].total_tarif += curr.katalog_sewa?.harga_hari || 0;
      return acc;
    }, {}),
  );

  // Paginasi logic
  const totalPages = Math.ceil(groupedSewaArray.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = groupedSewaArray.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Reset ke halaman 1 saat data berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [sewaList]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleAssetToggle = (id: number) => {
    setSelectedAssets((prev) =>
      prev.includes(id)
        ? prev.filter((assetId) => assetId !== id)
        : [...prev, id],
    );
  };

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
        "PILIH MITRA",
        "Silakan pilih mitra terlebih dahulu sebelum melanjutkan.",
      );
      return;
    }
    if (selectedAssets.length === 0) {
      showToast(
        "warning",
        "CENTANG ASET",
        "Centang minimal 1 aset yang akan dipinjamkan.",
      );
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

      const selectedAssetNames = katalogList
        .filter((k) => selectedAssets.includes(k.id))
        .map((k) => k.nama_aset)
        .join(", ");

      showToast(
        "success",
        "PEMINJAMAN BERHASIL",
        `${selectedAssets.length} aset (${selectedAssetNames}) berhasil dipinjamkan. Total tarif akan dihitung per hari.`,
      );

      setShowModal(false);
      setFormData({ ...formData, penjual_id: "" });
      setSearchMitra("");
      setSelectedAssets([]);
      fetchData();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MENYIMPAN",
        err.response?.data?.error ||
          "Terjadi kesalahan saat menyimpan data peminjaman.",
      );
    }
  };

  // Buka modal input tanggal (pengganti prompt)
  const handleReturnClick = (item: any) => {
    setSelectedReturnItem(item);
    setShowDateModal(true);
  };

  // Proses pengembalian setelah tanggal dipilih
  const handleReturnConfirm = async (tglKembali: string) => {
    if (!selectedReturnItem) return;

    try {
      await api.put(`/admin/sewa/return/${selectedReturnItem.id}`, {
        tanggal_kembali: tglKembali + "T00:00:00Z",
      });

      showToast(
        "success",
        "ASET DIKEMBALIKAN",
        `Aset "${selectedReturnItem.katalog_sewa?.nama_aset}" berhasil dikembalikan per tanggal ${new Date(tglKembali).toLocaleDateString("id-ID")}.`,
      );

      setShowDateModal(false);
      setSelectedReturnItem(null);
      fetchData();
    } catch (err: any) {
      showToast(
        "error",
        "GAGAL MEMPROSES",
        err.response?.data?.error ||
          "Terjadi kesalahan saat memproses pengembalian aset.",
      );
    }
  };

  const handlePrintBA = (groupData: SewaGroup) => {
    setPrintData(groupData);
    showToast(
      "info",
      "SIAP CETAK",
      "Dokumen Berita Acara akan ditampilkan. Gunakan dialog print browser untuk mencetak.",
    );
    setTimeout(() => window.print(), 500);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const currentReturnGroup = selectedMitraReturn
    ? groupedSewaArray.find(
        (g) => g.penjual?.id === selectedMitraReturn.penjual?.id,
      )
    : null;

  // Komponen Paginasi
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t-4 border-slate-100">
        <div className="text-sm font-bold text-slate-600 uppercase">
          Menampilkan {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, groupedSewaArray.length)} dari{" "}
          {groupedSewaArray.length} data
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border-2 border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase text-xs"
          >
            <ChevronLeft size={16} />
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 border-2 border-slate-300 hover:bg-slate-100 font-bold text-xs"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-2 border-2 font-bold text-xs ${
                currentPage === number
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-slate-300 hover:bg-slate-100"
              }`}
            >
              {number}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 border-2 border-slate-300 hover:bg-slate-100 font-bold text-xs"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border-2 border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase text-xs"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Modal Input Tanggal Pengembalian */}
      <DateInputModal
        isOpen={showDateModal}
        onClose={() => {
          setShowDateModal(false);
          setSelectedReturnItem(null);
        }}
        onSubmit={handleReturnConfirm}
        itemName={selectedReturnItem?.katalog_sewa?.nama_aset || ""}
      />

      {/* CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .animate-shrink { animation: shrink 5s linear forwards; }
        
        @media print {
          @page { size: A4 portrait; margin: 2cm; }
          body { background: white !important; }
          aside, nav, .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `,
        }}
      />

      {/* SURAT BERITA ACARA (MUNCUL SAAT PRINT) */}
      {printData && printData.penjual && (
        <div className="hidden print-only font-serif text-black leading-relaxed">
          <div className="text-center mb-10 border-b-4 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              BUILTBY.OUTSYS
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
              {printData.items.map((item: any, index: number) => (
                <tr key={item.id} className="font-bold">
                  <td className="border-2 border-black p-3 text-center">
                    {index + 1}
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
            menjaga aset tersebut dengan baik. Apabila terjadi kerusakan atau
            kehilangan yang disebabkan oleh kelalaian PIHAK KEDUA, maka akan
            menjadi tanggung jawab PIHAK KEDUA. Biaya sewa akan ditagihkan
            secara berkala sesuai sistem yang berlaku.
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

      {/* UI WEB UTAMA */}
      <div className="no-print">
        {/* HEADER & TAB NAVIGASI */}
        <div className="mb-8">
          <div className="flex gap-4 border-b-4 border-slate-900 pb-4 mb-4">
            <button
              onClick={() => (window.location.href = "/admin/sewa")}
              className="bg-slate-200 text-slate-500 hover:bg-slate-300 font-black px-6 py-2 uppercase text-xs tracking-widest border-4 border-transparent transition-colors shadow-none"
            >
              Katalog Aset
            </button>
            <button className="bg-slate-900 text-white font-black px-6 py-2 uppercase text-xs tracking-widest border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Sirkulasi Peminjaman
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                <ArrowRightLeft size={32} className="text-orange-500" />{" "}
                Peminjam Aset
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                Daftar Mitra yang Sedang Menyewa Aset
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <PlusSquare size={18} /> Peminjaman Baru
            </button>
          </div>
        </div>

        {/* TABEL PEMINJAMAN (GROUP BY MITRA) */}
        <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-800 text-white text-[10px] uppercase font-black tracking-widest border-b-4 border-slate-900">
              <tr>
                <th className="p-4">Identitas Mitra</th>
                <th className="p-4">Rincian Sewa Aktif</th>
                <th className="p-4 text-right border-r-4 border-slate-900">
                  Total Tagihan / Hari
                </th>
                <th className="p-4 text-center">Aksi Dokumen & Return</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 border-slate-100">
              {currentItems.map((group: SewaGroup, idx: number) => (
                <tr key={idx} className="hover:bg-orange-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 border border-orange-300">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="font-black text-slate-800 uppercase text-sm">
                          {group.penjual?.nama_penjual || "Mitra Dihapus"}
                        </div>
                        <div className="font-bold text-slate-500 text-[10px] uppercase mt-0.5">
                          {group.penjual?.nama_warung || "TIDAK ADA WARUNG"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-black text-slate-800 uppercase text-xs flex items-center gap-2">
                      <Box size={14} className="text-orange-500" /> Meminjam{" "}
                      {group.items.length} Item Aset
                    </div>
                    <div
                      className="text-[10px] font-bold text-slate-500 uppercase mt-1 truncate max-w-[200px]"
                      title={group.items
                        .map((i: any) => i.katalog_sewa?.nama_aset)
                        .join(", ")}
                    >
                      (
                      {group.items
                        .map((i: any) => i.katalog_sewa?.nama_aset)
                        .join(", ")}
                      )
                    </div>
                  </td>
                  <td className="p-4 text-right border-r-4 border-slate-100">
                    <span className="inline-block bg-slate-900 text-orange-400 px-4 py-2 font-mono font-black text-sm tracking-widest">
                      {formatRupiah(group.total_tarif)}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handlePrintBA(group)}
                        className="px-4 py-2 bg-white border-4 border-slate-900 text-slate-900 hover:bg-orange-500 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Printer size={14} /> Cetak BAST
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMitraReturn(group);
                          setShowReturnModal(true);
                        }}
                        className="px-4 py-2 bg-blue-100 border-4 border-slate-900 text-blue-700 hover:bg-blue-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Undo2 size={14} /> Kelola Aset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center font-bold uppercase text-slate-400 text-xs"
                  >
                    Belum ada aset yang disewa oleh mitra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginasi Component */}
          <Pagination />
        </div>

        {/* MODAL INPUT PEMINJAMAN BARU */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col">
              <div className="bg-slate-900 p-4 flex justify-between items-center border-b-4 border-orange-500 shrink-0">
                <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <PlusSquare size={16} /> Form Peminjaman Aset Baru
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-orange-400"
                >
                  <X />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto flex-1 space-y-6"
              >
                {/* PILIH MITRA DENGAN SEARCH */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 inline-block border border-slate-200">
                    1. Identitas Peminjam (Ketik untuk mencari)
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Ketik nama mitra, warung, atau nomor WA..."
                        value={searchMitra}
                        onChange={(e) => {
                          setSearchMitra(e.target.value);
                          setShowMitraDropdown(true);
                          if (!e.target.value) {
                            setFormData({ ...formData, penjual_id: "" });
                          }
                        }}
                        onFocus={() => setShowMitraDropdown(true)}
                        className="w-full p-4 pl-10 border-4 border-slate-900 focus:border-orange-500 focus:outline-none font-bold text-xs uppercase bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      />
                    </div>

                    {/* Dropdown hasil pencarian */}
                    {showMitraDropdown && searchMitra && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-48 overflow-y-auto">
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
                              className="w-full text-left p-3 hover:bg-orange-50 border-b-2 border-slate-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-black text-xs uppercase text-slate-800">
                                {m.nama_penjual}
                              </div>
                              <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                                {m.nama_warung || "Tanpa warung"}
                                {m.no_whatsapp && ` • ${m.no_whatsapp}`}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">
                            Mitra tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mitra terpilih */}
                  {formData.penjual_id && (
                    <div className="mt-2 p-2 bg-green-50 border-2 border-green-300 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase">
                          Terpilih: {searchMitra}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 inline-block border border-slate-200">
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
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors"
                  />
                </div>

                {/* CENTANG MULTIPLE ASET */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 inline-block border border-slate-200">
                    3. Centang Aset Yang Dipinjam
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                    {katalogList.map((k: any) => (
                      <label
                        key={k.id}
                        className={`flex items-start gap-3 p-3 border-4 cursor-pointer transition-all ${
                          selectedAssets.includes(k.id)
                            ? "border-orange-500 bg-orange-50"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(k.id)}
                          onChange={() => handleAssetToggle(k.id)}
                          className="mt-1 w-5 h-5 accent-orange-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-black text-xs uppercase text-slate-800 leading-tight mb-1">
                            {k.nama_aset}
                          </div>
                          <div className="font-mono font-bold text-[10px] text-slate-500">
                            {formatRupiah(k.harga_hari)} / hari
                          </div>
                        </div>
                      </label>
                    ))}
                    {katalogList.length === 0 && (
                      <div className="col-span-2 text-center text-xs font-bold text-slate-400 p-4 border-2 border-dashed border-slate-200">
                        Tidak ada aset yang tersedia. Silakan input di Katalog
                        Aset.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-4 border-t-4 border-slate-100">
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
                    Simpan & Cetak Nanti
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL KELOLA RETURN ASET */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-slate-900 w-full max-w-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="bg-slate-900 p-4 flex justify-between items-center border-b-4 border-blue-500">
                <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                  <Undo2 size={16} /> Kelola Pengembalian Aset
                </h2>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-white hover:text-blue-400"
                >
                  <X />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 pb-4 border-b-4 border-slate-100">
                  <h3 className="font-black text-xl text-slate-800 uppercase">
                    {currentReturnGroup?.penjual?.nama_penjual}
                  </h3>
                  <p className="font-bold text-xs text-slate-500 uppercase">
                    {currentReturnGroup?.penjual?.nama_warung}
                  </p>
                </div>

                <p className="text-[10px] font-black uppercase text-slate-400 mb-3">
                  Daftar Aset Aktif:
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {currentReturnGroup?.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 border-4 border-slate-200 bg-slate-50"
                    >
                      <div>
                        <div className="font-black text-sm uppercase text-slate-800">
                          {item.katalog_sewa?.nama_aset}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 font-mono mt-1">
                          Disewa sejak:{" "}
                          {new Date(item.tanggal_mulai).toLocaleDateString(
                            "id-ID",
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleReturnClick(item)}
                        className="px-4 py-2 bg-red-100 text-red-600 border-2 border-red-200 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Kembalikan
                      </button>
                    </div>
                  ))}
                  {(!currentReturnGroup ||
                    currentReturnGroup.items.length === 0) && (
                    <div className="text-center p-6 text-sm font-bold text-slate-400 uppercase">
                      Semua aset sudah dikembalikan.
                    </div>
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
