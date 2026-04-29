"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import {
  TrendingUp,
  Users,
  RefreshCcw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  AlertTriangle,
  Package,
  DollarSign,
  BarChart3,
  Info,
  CheckCircle2,
  XCircle as XCircleIcon,
  X,
} from "lucide-react";

// ==========================================
// TOAST NOTIFICATION COMPONENT
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
                <XCircleIcon size={18} className="text-red-500" />
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
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [rekapHarian, setRekapHarian] = useState([]);
  const [stats, setStats] = useState({ total_kg: 0, total_hadir: 0 });
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

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

  const fetchData = async (showNotification = false) => {
    try {
      setLoading(true);
      const [resRekap, resRank] = await Promise.all([
        api.get("/admin/daily-rekap"),
        api.get("/admin/ranking"),
      ]);

      const rekapData = Array.isArray(resRekap.data)
        ? resRekap.data
        : resRekap.data?.data || [];
      const rankData = Array.isArray(resRank.data)
        ? resRank.data
        : resRank.data?.data || [];

      setRekapHarian(rekapData);
      setRanking(rankData);

      const totalKg = rekapData.reduce(
        (acc: number, curr: any) => acc + (Number(curr.jumlah_kg) || 0),
        0,
      );
      const totalHadir = rekapData.filter(
        (p: any) => Number(p.jumlah_kg) > 0,
      ).length;

      setStats({ total_kg: totalKg, total_hadir: totalHadir });
      setLastUpdate(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      if (showNotification) {
        showToast(
          "success",
          "Data Diperbarui",
          `Dashboard berhasil diperbarui. Total distribusi: ${totalKg.toFixed(2)} KG`,
        );
      }
    } catch (err) {
      console.error("Gagal ambil data dashboard", err);
      if (showNotification) {
        showToast(
          "error",
          "Gagal Memperbarui",
          "Terjadi kesalahan saat mengambil data. Silakan coba lagi.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true); // Tampilkan toast saat pertama kali load
  }, []);

  const handleRefresh = () => {
    fetchData(true); // Tampilkan toast saat refresh manual
  };

  // Hitung persentase kehadiran
  const persentaseHadir =
    rekapHarian.length > 0
      ? Math.round((stats.total_hadir / rekapHarian.length) * 100)
      : 0;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideIn { animation: slideIn 0.3s ease-out; }
          `,
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Selamat Datang, Admin 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Update terakhir: {lastUpdate || "Memuat..."}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Total Distribusi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-full">
              Hari Ini
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">
            {Number(stats.total_kg).toFixed(1)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total KG Tersalurkan</p>
        </div>

        {/* Penjual Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <span className="text-[10px] font-semibold text-green-600 uppercase bg-green-50 px-2 py-1 rounded-full">
              {persentaseHadir}% Hadir
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">
            {stats.total_hadir}
          </p>
          <p className="text-xs text-slate-500 mt-1">Penjual Aktif</p>
        </div>

        {/* Total Mitra */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">
            {rekapHarian.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total Mitra Terdaftar</p>
        </div>

        {/* Rata-rata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-orange-600" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-800">
            {stats.total_hadir > 0
              ? (stats.total_kg / stats.total_hadir).toFixed(1)
              : "0.0"}
          </p>
          <p className="text-xs text-slate-500 mt-1">Rata-rata KG / Penjual</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Rekap Tabel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Rekap Aktivitas Hari Ini
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status pengambilan mie oleh mitra
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {stats.total_hadir} Aktif
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium text-red-500">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  {rekapHarian.length - stats.total_hadir} Libur
                </span>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-5 md:px-6 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Penjual
                    </th>
                    <th className="px-5 md:px-6 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 md:px-6 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      KG
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekapHarian.length > 0 ? (
                    rekapHarian.map((row: any, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 md:px-6 py-3">
                          <p className="text-sm font-semibold text-slate-800">
                            {row.nama_penjual}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {row.nama_warung || "-"}
                          </p>
                        </td>
                        <td className="px-5 md:px-6 py-3 text-center">
                          {Number(row.jumlah_kg) > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-medium rounded-full">
                              <CheckCircle size={12} /> Jualan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-500 text-[11px] font-medium rounded-full">
                              <XCircle size={12} /> Libur
                            </span>
                          )}
                        </td>
                        <td className="px-5 md:px-6 py-3 text-right">
                          <span
                            className={`text-sm font-semibold font-mono ${Number(row.jumlah_kg) > 0 ? "text-slate-800" : "text-slate-300"}`}
                          >
                            {Number(row.jumlah_kg).toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-slate-400">
                          <AlertTriangle
                            size={32}
                            className="mx-auto mb-3 text-slate-300"
                          />
                          <p className="text-sm font-medium">Belum ada data</p>
                          <p className="text-xs mt-1">
                            Data penjual akan muncul di sini
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Ranking */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 md:px-6 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <ArrowUpRight size={16} className="text-blue-500" />
                Top Penjual
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Berdasarkan total pengambilan
              </p>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              {ranking.slice(0, 7).map((r: any, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : i === 1
                          ? "bg-slate-100 text-slate-600"
                          : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {r.nama_penjual}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {Number(r.total_kg).toFixed(1)} KG
                    </p>
                  </div>
                  {i === 0 && <span className="text-lg">🥇</span>}
                  {i === 1 && <span className="text-lg">🥈</span>}
                  {i === 2 && <span className="text-lg">🥉</span>}
                </div>
              ))}
              {ranking.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400 font-medium">
                    Belum ada data ranking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
