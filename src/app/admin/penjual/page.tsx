"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserPlus, Search, X, User, Printer } from "lucide-react";

export default function MasterPenjualPage() {
  const [penjual, setPenjual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nama_penjual: "",
    nama_warung: "",
    nomor_hp: "",
    pin: "",
  });

  const fetchPenjual = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/penjual");
      setPenjual(res.data || []);
    } catch (err) {
      console.error("Gagal load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenjual();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/penjual", formData);
      setShowModal(false);
      setFormData({ nama_penjual: "", nama_warung: "", nomor_hp: "", pin: "" });
      fetchPenjual();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menyimpan data");
    }
  };

  const filtered = penjual.filter(
    (p: any) =>
      p.nama_penjual.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_warung?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-8 print:p-0">
      {/* INJEKSI CSS KHUSUS PRINT
        Ini memastikan layout Sidebar yang overflow bisa tercetak semua halamannya (jika data panjang)
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          body, html, main { height: auto !important; overflow: visible !important; background: white !important; }
          aside { display: none !important; }
        }
      `,
        }}
      />

      {/* HEADER CETAK (Hanya Muncul Saat di-Print) */}
      <div className="hidden print:block text-center mb-8 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          DAFTAR KARTU PIN PELANGGAN
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest mt-1">
          by.Outsys - Sistem Monitoring Tenant
        </p>
        <p className="text-[10px] uppercase mt-2 font-bold">
          Dicetak pada: {new Date().toLocaleDateString("id-ID")}{" "}
          {new Date().toLocaleTimeString("id-ID")}
        </p>
      </div>

      {/* HEADER UI (Akan Sembunyi Saat di-Print) */}
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
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-neo hover:bg-slate-800 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Printer size={18} /> Cetak PIN (PDF)
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-neo hover:bg-blue-700 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <UserPlus size={18} /> Registrasi Baru
          </button>
        </div>
      </div>

      {/* TOOLBAR PENCARIAN (Akan Sembunyi Saat di-Print) */}
      <div className="mb-6 relative max-w-md print:hidden">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Cari nama atau warung..."
          className="w-full pl-12 p-4 border-4 border-slate-900 shadow-neo focus:outline-none font-black text-sm uppercase placeholder:text-slate-300"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABEL DATA PENJUAL */}
      <div className="bg-white border-4 border-slate-900 print:border-2 print:border-black shadow-neo print:shadow-none overflow-hidden">
        <table className="w-full text-left print:text-sm">
          <thead className="bg-slate-800 print:bg-gray-200 text-white print:text-black text-[10px] print:text-xs uppercase font-black tracking-widest border-b-4 print:border-b-2 border-slate-900 print:border-black">
            <tr>
              <th className="p-4 print:py-2 print:px-4">Penjual & Warung</th>
              <th className="p-4 print:py-2 print:px-4 text-center">
                Kontak (WA)
              </th>
              <th className="p-4 print:py-2 print:px-4 text-center border-l-4 print:border-l-2 border-slate-900 print:border-black bg-blue-600 print:bg-white text-white print:text-black">
                PIN Akses
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 print:divide-y border-slate-100 print:border-gray-300">
            {filtered.map((p: any) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50 group print:break-inside-avoid"
              >
                <td className="p-4 print:py-3 print:px-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors print:hidden">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-black text-slate-800 print:text-black uppercase text-sm print:text-base">
                        {p.nama_penjual}
                      </div>
                      <div className="font-bold text-slate-400 print:text-gray-600 text-[10px] uppercase mt-0.5">
                        {p.nama_warung || "TIDAK ADA WARUNG"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 print:py-3 print:px-4 text-center font-mono text-xs font-bold text-slate-500 print:text-black">
                  {p.nomor_hp || "-"}
                </td>
                <td className="p-4 print:py-3 print:px-4 text-center border-l-4 print:border-l-2 border-slate-100 print:border-black bg-slate-50 print:bg-white">
                  <span className="inline-block bg-slate-900 print:bg-white text-white print:text-black px-6 py-2 font-mono font-black text-xl border-b-4 print:border-2 border-blue-500 print:border-black tracking-widest">
                    {p.pin}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-10 text-center font-bold uppercase text-slate-400 text-xs"
                >
                  Data tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL REGISTRASI (Sembunyi Saat Print) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white border-4 border-slate-900 w-full max-w-md shadow-neo-lg">
            <div className="bg-slate-900 p-4 flex justify-between items-center">
              <h2 className="text-white font-black uppercase tracking-widest text-xs">
                Registrasi Pelanggan Baru
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-red-400"
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Nama Lengkap
                </label>
                <input
                  required
                  className="w-full p-3 border-4 border-slate-200 focus:border-slate-900 focus:outline-none font-black text-sm uppercase"
                  onChange={(e) =>
                    setFormData({ ...formData, nama_penjual: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Nama Warung (Opsional)
                </label>
                <input
                  className="w-full p-3 border-4 border-slate-200 focus:border-slate-900 focus:outline-none font-black text-sm uppercase"
                  onChange={(e) =>
                    setFormData({ ...formData, nama_warung: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  Nomor WA/HP
                </label>
                <input
                  required
                  className="w-full p-3 border-4 border-slate-200 focus:border-slate-900 focus:outline-none font-black text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_hp: e.target.value })
                  }
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-black uppercase text-xs border-4 border-slate-900 hover:bg-slate-50 transition-all btn-active-state"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white font-black uppercase text-xs border-4 border-slate-900 shadow-neo btn-active-state transition-all"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
