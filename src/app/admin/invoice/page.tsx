"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Receipt,
  Search,
  Printer,
  ChevronLeft,
  ChevronRight,
  Calculator,
} from "lucide-react";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  // STATE CETAK
  const [printData, setPrintData] = useState<any>(null);

  // STATE PAGINASI
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // LOGIKA TAHUN DINAMIS
  const currentYear = new Date().getFullYear();
  const startYear = 2024; // Tahun mulai operasional
  const years = [];
  for (let i = startYear; i <= currentYear + 1; i++) {
    years.push(i);
  }

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/sewa/invoice-preview?bulan=${bulan}&tahun=${tahun}`,
      );
      setInvoices(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Gagal load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [bulan, tahun]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.nama_penjual.toLowerCase().includes(search.toLowerCase()),
  );

  // LOGIKA PAGINASI
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handlePrint = (inv: any) => {
    setPrintData(inv);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const namaBulan = new Date(0, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  return (
    <div className="p-4 md:p-8">
      {/* CSS KHUSUS PRINT INVOICE */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          body { background: white !important; color: black !important; }
          aside, nav, .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `,
        }}
      />

      {/* TEMPLATE INVOICE (HANYA MUNCUL SAAT PRINT) */}
      {printData && (
        <div className="hidden print-only font-sans text-black">
          <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-black uppercase">
                MIE AYAM SPECIALL
              </h1>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-600">
                Sistem Operasional Distribusi
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-gray-300">INVOICE</h2>
              <p className="text-sm font-bold uppercase tracking-tighter">
                Periode: {namaBulan} {tahun}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase">
                Ditujukan Kepada:
              </p>
              <h3 className="text-xl font-black uppercase">
                {printData.nama_penjual}
              </h3>
              <p className="font-bold text-sm italic text-gray-700">
                {printData.nama_warung || "Mitra Outsys"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase">
                Nomor Tagihan:
              </p>
              <p className="font-bold text-sm uppercase">
                INV/{tahun}/{bulan}/{printData.penjual_id}
              </p>
              <p className="text-[10px] font-black text-gray-500 uppercase mt-2">
                Tanggal Cetak:
              </p>
              <p className="font-bold text-sm">
                {new Date().toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-black">
                <th className="p-3 text-left uppercase text-xs font-black">
                  Deskripsi Sewa Aset
                </th>
                <th className="p-3 text-right uppercase text-xs font-black">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-2 border-gray-200">
                <td className="p-4 text-sm font-bold">
                  Sewa Aset Aktif ({printData.item_details})
                  <p className="text-[10px] text-gray-500 italic mt-1 font-normal">
                    *Tagihan kotor periode 1 bulan penuh (30 hari)
                  </p>
                </td>
                <td className="p-4 text-right font-mono font-bold">
                  {formatRupiah(printData.total_sewa_normal)}
                </td>
              </tr>
              <tr className="text-red-600 bg-red-50 border-b-2 border-gray-200">
                <td className="p-4 text-sm font-bold">
                  Potongan Izin / Cuti Operasional
                  <p className="text-[10px] italic mt-1 font-normal">
                    *Pengurangan berdasarkan laporan ketidakhadiran
                  </p>
                </td>
                <td className="p-4 text-right font-mono font-bold">
                  - {formatRupiah(printData.potongan_izin)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-black text-white">
                <td className="p-4 text-sm font-black uppercase tracking-widest text-right">
                  Total Yang Harus Dibayar
                </td>
                <td className="p-4 text-right font-mono text-xl font-black">
                  {formatRupiah(printData.grand_total)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="grid grid-cols-2 mt-12 gap-10">
            <div className="border-2 border-dashed border-gray-300 p-4">
              <p className="text-[10px] font-black uppercase mb-2">
                Instruksi Pembayaran:
              </p>
              <ul className="text-[9px] space-y-1 font-bold italic text-gray-600 uppercase">
                <li>1. Pembayaran tunai via Kasir Pusat</li>
                <li>2. Batas akhir tgl 10 tiap bulannya</li>
                <li>3. Harap simpan invoice ini sebagai bukti sah</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase mb-16">
                Bagian Keuangan
              </p>
              <div className="w-40 h-px bg-black mx-auto mb-1"></div>
              <p className="text-[10px] font-black uppercase italic text-gray-400">
                Mie Ayam Speciall
              </p>
            </div>
          </div>
        </div>
      )}

      {/* UI WEB UTAMA */}
      <div className="no-print">
        {/* HEADER */}
        <div className="mb-8 border-b-4 border-slate-900 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
                <Receipt size={32} className="text-orange-500" /> Tagihan Sewa
                Aset
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                Rekapitulasi Invoice Bulanan Mitra
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={bulan}
                onChange={(e) => setBulan(Number(e.target.value))}
                className="p-3 border-4 border-slate-900 font-black text-xs uppercase outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="p-3 border-4 border-slate-900 font-black text-xs uppercase outline-none bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6 relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama mitra..."
            className="w-full pl-12 p-4 border-4 border-slate-900 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none focus:border-orange-500 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-800 text-white text-[10px] uppercase font-black border-b-4 border-slate-900">
                <tr>
                  <th className="p-4">Mitra & Item</th>
                  <th className="p-4 text-right">Sewa Kotor (30 Hr)</th>
                  <th className="p-4 text-right text-red-400">Potongan Izin</th>
                  <th className="p-4 text-right border-l-4 border-slate-900 bg-slate-700">
                    Total Tagihan
                  </th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 border-slate-100">
                {currentData.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-sm uppercase text-slate-800">
                        {inv.nama_penjual}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1 mt-1">
                        <Calculator size={10} /> {inv.item_details}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-600">
                      {formatRupiah(inv.total_sewa_normal)}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-red-500">
                      - {formatRupiah(inv.potongan_izin)}
                    </td>
                    <td className="p-4 text-right border-l-4 border-slate-100 bg-orange-50">
                      <div className="text-lg font-black text-slate-900 italic">
                        {formatRupiah(inv.grand_total)}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrint(inv)}
                        className="bg-white border-4 border-slate-900 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-500 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        title="Cetak Invoice"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="bg-slate-100 border-t-4 border-slate-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-500">
                Baris:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 border-2 border-slate-900 font-black text-xs cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-tighter">
                Hal {currentPage} / {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => c - 1)}
                  className="p-2 border-2 border-slate-900 bg-white disabled:opacity-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((c) => c + 1)}
                  className="p-2 border-2 border-slate-900 bg-white disabled:opacity-30 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none hover:bg-slate-900 hover:text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredInvoices.length === 0 && !loading && (
          <div className="p-10 text-center font-black text-slate-400 uppercase text-xs border-t-4 border-slate-900 bg-white">
            Data tagihan tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
