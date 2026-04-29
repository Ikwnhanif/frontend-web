"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle as XCircleIcon,
  AlertTriangle,
  Info,
  X,
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
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full no-print">
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
                <XCircleIcon size={20} className="text-red-600" />
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

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_kg: 0, total_hadir: 0 });

  // Set default tanggal hari ini format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State Toast Notification
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // State untuk print - SEPERTI HALAMAN PEMINJAMAN
  const [printData, setPrintData] = useState<any>(null);

  // Fungsi untuk menampilkan toast
  const showToast = (type: ToastType, title: string, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchHistory = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const res = await api.get(`/admin/history-rekap?date=${selectedDate}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setHistoryData(data);

      // Hitung Grand Total
      const totalKg = data.reduce(
        (acc: number, curr: any) => acc + (Number(curr.jumlah_kg) || 0),
        0,
      );
      const totalHadir = data.filter(
        (p: any) => Number(p.jumlah_kg) > 0,
      ).length;

      setStats({ total_kg: totalKg, total_hadir: totalHadir });

      // Reset ke halaman 1 saat data berubah
      setCurrentPage(1);

      if (data.length > 0) {
        showToast(
          "success",
          "DATA DITEMUKAN",
          `Ditemukan ${data.length} data penjual untuk tanggal ${formatDate(selectedDate)}.`,
        );
      }
    } catch (err) {
      console.error("Gagal mengambil data history", err);
      setHistoryData([]);
      setStats({ total_kg: 0, total_hadir: 0 });
      showToast(
        "error",
        "GAGAL MEMUAT DATA",
        "Tidak dapat mengambil data history. Periksa koneksi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  // Paginasi logic
  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historyData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fungsi cetak - SEPERTI HALAMAN PEMINJAMAN
  const handlePrint = () => {
    setPrintData({
      date: selectedDate,
      data: historyData,
      stats: stats,
    });
    showToast(
      "info",
      "SIAP CETAK",
      "Dokumen laporan akan ditampilkan. Gunakan dialog print browser untuk mencetak.",
    );
    setTimeout(() => window.print(), 500);
  };

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
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t-4 border-slate-100 no-print">
        <div className="text-sm font-bold text-slate-600 uppercase">
          Menampilkan {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, historyData.length)} dari{" "}
          {historyData.length} data
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
                  ? "bg-blue-600 text-white border-blue-600"
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
      {/* CSS UNTUK PRINT - SEPERTI HALAMAN PEMINJAMAN */}
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
            .animate-shrink { animation: shrink 4s linear forwards; }
            
            @media print {
              @page { size: A4 landscape; margin: 1.5cm; }
              body { background: white !important; }
              /* SEMBUNYIKAN SEMUA ELEMEN SAAT PRINT */
               aside, nav, header, .no-print { display: none !important; }
              /* TAMPILKAN HANYA DOKUMEN CETAK */
              .print-only { display: block !important; }
              .print-break { page-break-inside: avoid; }
  
              table { font-size: 11px; width: 100%; }
              th, td { padding: 6px 8px !important; }
            }
          `,
        }}
      />
      {/* DOKUMEN CETAK - MUNCUL HANYA SAAT PRINT */}
      {printData && (
        <div className="hidden print-only font-sans text-black leading-relaxed">
          {/* Header Laporan */}
          <div className="text-center mb-8 border-b-4 border-black pb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              MIE AYAM SPECIALL
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest mt-1">
              Sistem Operasional Distribusi & Kemitraan
            </p>
            <p className="text-xs mt-1">
              Jl. Contoh Alamat Pusat No. 123, Kota Anda | Telp Whatsapp:
              0813-9375-1133
            </p>
          </div>

          <h2 className="text-xl font-black uppercase text-center mb-6 underline underline-offset-4">
            LAPORAN HISTORY TRANSAKSI HARIAN
          </h2>

          {/* Info Ringkasan */}
          <div className="mb-6 p-4 border-2 border-black bg-gray-50">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Tanggal
                </p>
                <p className="text-sm font-black">
                  {formatDateShort(printData.date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Total Pengambilan
                </p>
                <p className="text-sm font-black">
                  {Number(printData.stats.total_kg).toFixed(2)} KG
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Penjual Aktif (Ambil Mie)
                </p>
                <p className="text-sm font-black">
                  {printData.stats.total_hadir} Orang
                </p>
              </div>
            </div>
          </div>

          {/* Tabel Cetak */}
          <table className="w-full border-collapse border-2 border-black mb-8">
            <thead className="bg-gray-200 font-black uppercase text-xs">
              <tr>
                <th className="border-2 border-black p-2 text-center w-12">
                  No
                </th>
                <th className="border-2 border-black p-2 text-left">
                  Nama Penjual
                </th>
                <th className="border-2 border-black p-2 text-left">Warung</th>
                <th className="border-2 border-black p-2 text-center w-24">
                  Status
                </th>
                <th className="border-2 border-black p-2 text-right w-28">
                  Total KG
                </th>
              </tr>
            </thead>
            <tbody>
              {printData.data.map((row: any, i: number) => (
                <tr key={i} className="print-break">
                  <td className="border-2 border-black p-2 text-center text-xs">
                    {i + 1}
                  </td>
                  <td className="border-2 border-black p-2 font-bold text-xs uppercase">
                    {row.nama_penjual}
                  </td>
                  <td className="border-2 border-black p-2 text-xs">
                    {row.nama_warung || "-"}
                  </td>
                  <td className="border-2 border-black p-2 text-center text-xs">
                    {Number(row.jumlah_kg) > 0 ? (
                      <span className="font-black">✓ JUALAN</span>
                    ) : (
                      <span className="text-gray-500">✗ LIBUR</span>
                    )}
                  </td>
                  <td className="border-2 border-black p-2 text-right font-mono font-bold text-xs">
                    {Number(row.jumlah_kg).toFixed(2)} KG
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-200 font-black">
              <tr>
                <td
                  colSpan={4}
                  className="border-2 border-black p-2 text-right text-xs uppercase"
                >
                  TOTAL PENGAMBILAN
                </td>
                <td className="border-2 border-black p-2 text-right font-mono font-black text-sm">
                  {Number(printData.stats.total_kg).toFixed(2)} KG
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Tanda Tangan */}
          <div className="flex justify-between text-center mt-12 px-10">
            <div>
              <p className="mb-16 text-xs font-bold">Mengetahui,</p>
              <p className="underline font-bold uppercase text-sm">
                ( Admin Operasional )
              </p>
            </div>
            <div>
              <p className="mb-4 text-xs text-gray-500">
                Dicetak: {new Date().toLocaleDateString("id-ID")}
              </p>
              <p className="text-xs font-bold text-gray-500">
                Sistem Distribusi & Kemitraan
              </p>
            </div>
          </div>
        </div>
      )}
      {/* UI WEB UTAMA */}
      <div className="no-print">
        {/* Header & Date Picker - RESPONSIVE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-2 md:gap-3">
              <FileText size={24} className="text-blue-600 md:hidden" />
              <FileText size={32} className="text-blue-600 hidden md:block" />
              History Transaksi
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Laporan Harian Penjualan Mitra
            </p>
          </div>

          {/* Filter & Action Bar */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Date Filter Compact */}
            <div className="flex items-center gap-1.5 md:gap-2 bg-white border-2 md:border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 md:p-3">
              <Calendar size={14} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[130px] md:w-auto py-1.5 md:py-2 px-2 border-2 border-slate-200 focus:border-blue-600 focus:outline-none font-bold text-xs md:text-sm text-slate-800 cursor-pointer bg-white rounded"
              />
              <button
                onClick={fetchHistory}
                className="bg-slate-900 text-white p-1.5 md:px-3 md:py-2 font-black text-[10px] md:text-xs uppercase hover:bg-blue-700 transition-colors flex items-center gap-1 md:gap-2 shrink-0 rounded"
              >
                <Search size={14} />
                <span className="hidden md:inline">Cari</span>
              </button>
            </div>

            {/* Print Button Compact */}
            <button
              onClick={handlePrint}
              disabled={historyData.length === 0}
              className="bg-green-600 text-white p-2 md:px-5 md:py-2.5 font-black text-[10px] md:text-xs uppercase tracking-wider border-2 md:border-4 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-700 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 rounded"
            >
              <Printer size={16} />
              <span className="hidden md:inline">Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - RESPONSIVE */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white border-2 md:border-4 border-slate-900 p-3 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="p-1.5 md:p-2 bg-blue-100 text-blue-600 border border-blue-300">
                <TrendingUp size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Total Pengambilan
              </p>
            </div>
            <div className="text-2xl md:text-4xl font-black text-blue-700">
              {Number(stats.total_kg).toFixed(2)}{" "}
              <span className="text-sm md:text-lg text-slate-400">KG</span>
            </div>
          </div>
          <div className="bg-white border-2 md:border-4 border-slate-900 p-3 md:p-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <div className="p-1.5 md:p-2 bg-green-100 text-green-600 border border-green-300">
                <Users size={16} className="md:w-5 md:h-5" />
              </div>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Penjual Aktif
              </p>
            </div>
            <div className="text-2xl md:text-4xl font-black text-slate-800">
              {stats.total_hadir}{" "}
              <span className="text-sm md:text-lg text-slate-400">Orang</span>
            </div>
          </div>
        </div>

        {/* Tabel Data - RESPONSIVE */}
        <div className="bg-white border-2 md:border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-slate-800 p-3 md:p-4 border-b-2 md:border-b-4 border-slate-900 flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-white font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1 md:gap-2">
              <Calendar size={12} className="text-blue-400 md:hidden" />
              <Calendar size={14} className="text-blue-400 hidden md:block" />
              <span className="hidden md:inline">Data Penjual: </span>
              <span className="text-blue-400 truncate max-w-[180px] md:max-w-none">
                {formatDate(selectedDate)}
              </span>
            </h2>
            <div className="flex items-center gap-2 md:gap-3">
              {loading && (
                <span className="text-[9px] md:text-[10px] text-white font-bold uppercase animate-pulse">
                  Memuat...
                </span>
              )}
              <span className="text-[9px] md:text-[10px] text-white font-bold uppercase bg-blue-600 px-2 md:px-3 py-0.5 md:py-1 rounded">
                {historyData.length} Data
              </span>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px] md:min-h-[400px]">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b-2 md:border-b-4 border-slate-800">
                <tr>
                  <th className="p-2 md:p-4 text-[8px] md:text-[10px] font-black uppercase w-8 md:w-12 text-center">
                    No
                  </th>
                  <th className="p-2 md:p-4 text-[8px] md:text-[10px] font-black uppercase">
                    Informasi Penjual
                  </th>
                  <th className="p-2 md:p-4 text-[8px] md:text-[10px] font-black uppercase text-center w-20 md:w-28">
                    Status
                  </th>
                  <th className="p-2 md:p-4 text-[8px] md:text-[10px] font-black uppercase text-right w-24 md:w-32">
                    Total KG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.length > 0 ? (
                  currentItems.map((row: any, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-slate-50 transition-colors ${
                        Number(row.jumlah_kg) === 0 ? "bg-red-50/30" : ""
                      }`}
                    >
                      <td className="p-2 md:p-4 border-r border-slate-100 font-black text-slate-400 w-8 md:w-12 text-center text-xs md:text-sm">
                        {indexOfFirstItem + i + 1}
                      </td>
                      <td className="p-2 md:p-4 border-r border-slate-100">
                        <p className="font-black text-slate-800 uppercase text-xs md:text-sm leading-tight">
                          {row.nama_penjual}
                        </p>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                          {row.nama_warung || "TANPA WARUNG"}
                        </p>
                      </td>
                      <td className="p-2 md:p-4 text-center border-r border-slate-100">
                        {Number(row.jumlah_kg) > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-1.5 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[10px] font-black uppercase border md:border-2 border-green-600 shadow-[1px_1px_0px_0px_rgba(34,197,94,0.5)] rounded">
                            <CheckCircle size={10} /> Jualan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-1.5 md:px-3 py-1 md:py-1.5 text-[8px] md:text-[10px] font-black uppercase border md:border-2 border-red-600 shadow-[1px_1px_0px_0px_rgba(239,68,68,0.5)] rounded">
                            <XCircle size={10} /> Libur
                          </span>
                        )}
                      </td>
                      <td className="p-2 md:p-4 text-right">
                        <span
                          className={`text-sm md:text-xl font-black font-mono ${
                            Number(row.jumlah_kg) > 0
                              ? "text-blue-700"
                              : "text-slate-300"
                          }`}
                        >
                          {Number(row.jumlah_kg).toFixed(2)}
                        </span>
                        <span className="text-[8px] md:text-[10px] text-slate-400 ml-0.5 md:ml-1">
                          KG
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 md:p-12 text-center text-slate-400 font-bold uppercase text-xs"
                    >
                      {loading ? (
                        <span className="animate-pulse">Memuat data...</span>
                      ) : (
                        "Tidak ada data ditemukan untuk tanggal tersebut."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginasi Component */}
          <Pagination />
        </div>
      </div>
    </div>
  );
}
