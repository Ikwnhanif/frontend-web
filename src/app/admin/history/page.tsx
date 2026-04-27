"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Calendar, CheckCircle, XCircle } from "lucide-react";

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_kg: 0, total_hadir: 0 });

  // Set default tanggal hari ini format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchHistory = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const res = await api.get(`/admin/history-rekap?date=${selectedDate}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setHistoryData(data);

      // Hitung Grand Total (Paksa konversi ke Number agar aman dari error string API)
      const totalKg = data.reduce(
        (acc: number, curr: any) => acc + (Number(curr.jumlah_kg) || 0),
        0,
      );
      const totalHadir = data.filter(
        (p: any) => Number(p.jumlah_kg) > 0,
      ).length;

      setStats({ total_kg: totalKg, total_hadir: totalHadir });
    } catch (err) {
      console.error("Gagal mengambil data history", err);
      setHistoryData([]);
      setStats({ total_kg: 0, total_hadir: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedDate]);

  return (
    <div className="p-8">
      {/* Header & Date Picker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            History Transaksi
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Laporan Berdasarkan Tanggal
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-slate-900 shadow-neo p-2 flex items-center gap-3">
            <label className="text-[10px] font-black uppercase text-slate-500 pl-2">
              Pilih Tanggal:
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-slate-200 focus:border-blue-600 focus:outline-none font-black text-slate-800 cursor-pointer"
              />
            </div>
            <button
              onClick={fetchHistory}
              className="bg-slate-900 text-white px-4 py-2 font-black text-xs uppercase hover:bg-blue-700 transition-colors"
            >
              Cari
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="hidden md:block bg-green-600 text-white px-6 py-4 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-neo hover:bg-green-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Stats Hari Tersebut */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border-4 border-slate-900 p-6 shadow-neo">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Total Ambil (KG)
          </p>
          <div className="text-4xl font-black text-blue-700">
            {Number(stats.total_kg).toFixed(2)}{" "}
            <span className="text-lg text-slate-400">KG</span>
          </div>
        </div>
        <div className="bg-white border-4 border-slate-900 p-6 shadow-neo">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            Total Penjual Aktif
          </p>
          <div className="text-4xl font-black text-slate-800">
            {stats.total_hadir}{" "}
            <span className="text-lg text-slate-400">Orang</span>
          </div>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white border-4 border-slate-900 shadow-neo">
        <div className="bg-slate-800 p-4 border-b-4 border-slate-900 flex justify-between items-center">
          <h2 className="text-white font-black text-xs uppercase tracking-widest">
            Data Penjual Tanggal:{" "}
            <span className="text-blue-400">{selectedDate}</span>
          </h2>
          {loading && (
            <span className="text-[10px] text-white font-bold uppercase animate-pulse">
              Memuat...
            </span>
          )}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b-4 border-slate-800">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase">No</th>
                <th className="p-4 text-[10px] font-black uppercase">
                  Informasi Penjual
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-center">
                  Status Kehadiran
                </th>
                <th className="p-4 text-[10px] font-black uppercase text-right">
                  Total KG
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 border-slate-100">
              {historyData.length > 0 ? (
                historyData.map((row: any, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-r-2 border-slate-100 font-black text-slate-300 w-12 text-center">
                      {i + 1}
                    </td>
                    <td className="p-4 border-r-2 border-slate-100">
                      <p className="font-black text-slate-800 uppercase text-sm">
                        {row.nama_penjual}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {row.nama_warung || "TANPA WARUNG"}
                      </p>
                    </td>
                    <td className="p-4 text-center border-r-2 border-slate-100">
                      {Number(row.jumlah_kg) > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 text-[10px] font-black uppercase border-2 border-green-600">
                          <CheckCircle size={12} /> Jualan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 text-[10px] font-black uppercase border-2 border-red-600">
                          <XCircle size={12} /> Libur
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-xl font-black ${Number(row.jumlah_kg) > 0 ? "text-blue-700" : "text-slate-300"}`}
                      >
                        {Number(row.jumlah_kg) > 0
                          ? Number(row.jumlah_kg).toFixed(2)
                          : "0.00"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-12 text-center text-slate-400 font-bold uppercase text-xs"
                  >
                    Tidak ada data ditemukan untuk tanggal tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
