"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  TrendingUp,
  Users,
  RefreshCcw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboard() {
  const [rekapHarian, setRekapHarian] = useState([]);
  const [stats, setStats] = useState({ total_kg: 0, total_hadir: 0 });
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchData = async () => {
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

      // PERBAIKAN: Paksa konversi ke Number sebelum ditambah
      const totalKg = rekapData.reduce(
        (acc: number, curr: any) => acc + (Number(curr.jumlah_kg) || 0),
        0,
      );
      // PERBAIKAN: Paksa konversi ke Number juga untuk filter kehadiran
      const totalHadir = rekapData.filter(
        (p: any) => Number(p.jumlah_kg) > 0,
      ).length;

      setStats({ total_kg: totalKg, total_hadir: totalHadir });
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Gagal ambil data dashboard", err);
      setRekapHarian([]);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
            Ringkasan Operasional
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Update Terakhir: {lastUpdate || "Loading..."}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-4 bg-white border-4 border-slate-800 shadow-neo hover:bg-slate-50 btn-active-state"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-blue-600 border-4 border-slate-900 p-6 shadow-neo-lg text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
            Total Distribusi Hari Ini
          </p>
          <h3 className="text-5xl font-black italic">
            {/* PERBAIKAN: Format agar rapi */}
            {Number(stats.total_kg).toFixed(2)}{" "}
            <span className="text-xl not-italic">KG</span>
          </h3>
        </div>
        <div className="bg-white border-4 border-slate-900 p-6 shadow-neo-lg text-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Penjual Aktif Hari Ini
          </p>
          <h3 className="text-5xl font-black italic">
            {stats.total_hadir}{" "}
            <span className="text-xl not-italic text-slate-400">Orang</span>
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* REKAP HARIAN SEMUA PENJUAL */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border-4 border-slate-900 shadow-neo">
            <div className="bg-slate-800 p-4 border-b-4 border-slate-900 flex justify-between items-center">
              <h2 className="text-white font-black text-xs uppercase tracking-widest">
                Rekap Absensi & Order (Hari Ini)
              </h2>
              <span className="bg-white text-slate-800 px-2 py-1 text-[10px] font-black uppercase">
                Live Status
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b-4 border-slate-800">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase">
                      Penjual
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-center">
                      Status
                    </th>
                    <th className="p-4 text-[10px] font-black uppercase text-right">
                      Ambil (KG)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 border-slate-100">
                  {rekapHarian.length > 0 ? (
                    rekapHarian.map((row: any, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 border-r-2 border-slate-100">
                          <p className="font-black text-slate-800 uppercase text-sm">
                            {row.nama_penjual}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            {row.nama_warung || "-"}
                          </p>
                        </td>
                        <td className="p-4 text-center border-r-2 border-slate-100">
                          {/* PERBAIKAN: Cek Number(row.jumlah_kg) */}
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
                            className={`text-lg font-black ${Number(row.jumlah_kg) > 0 ? "text-blue-700" : "text-slate-300"}`}
                          >
                            {/* PERBAIKAN: Format toFixed(2) agar rapi */}
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
                        colSpan={3}
                        className="p-10 text-center text-slate-400 font-bold uppercase text-xs"
                      >
                        Belum ada data penjual terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TOP RANKING */}
        <div className="space-y-6">
          <div className="bg-white border-4 border-slate-900 shadow-neo">
            <div className="bg-blue-600 p-4 border-b-4 border-slate-900">
              <h2 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight size={16} /> Top 5 Penjual Terbesar
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {ranking.slice(0, 5).map((r: any, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b-2 border-slate-50 pb-2"
                >
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase">
                      {r.nama_penjual}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {/* PERBAIKAN: Format Total Ranking */}
                      Total: {Number(r.total_kg).toFixed(2)} KG
                    </p>
                  </div>
                  <div className="text-xl font-black text-slate-200">
                    #0{i + 1}
                  </div>
                </div>
              ))}
              {ranking.length === 0 && (
                <p className="text-center text-slate-300 py-4 text-xs font-bold uppercase">
                  No Data
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
