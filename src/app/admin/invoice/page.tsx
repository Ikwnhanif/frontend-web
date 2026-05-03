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
  DollarSign,
  TrendingDown,
  FileText,
  Calendar,
} from "lucide-react";

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");
  const [printData, setPrintData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const years = [];
  for (let i = startYear; i <= currentYear + 1; i++) years.push(i);

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

  const terbilang = (angka: number): string => {
    const satuan = [
      "",
      "Satu",
      "Dua",
      "Tiga",
      "Empat",
      "Lima",
      "Enam",
      "Tujuh",
      "Delapan",
      "Sembilan",
      "Sepuluh",
      "Sebelas",
    ];
    if (angka < 12) return satuan[angka];
    if (angka < 20) return terbilang(angka - 10) + " Belas";
    if (angka < 100)
      return (
        terbilang(Math.floor(angka / 10)) + " Puluh " + terbilang(angka % 10)
      );
    if (angka < 200) return "Seratus " + terbilang(angka - 100);
    if (angka < 1000)
      return (
        terbilang(Math.floor(angka / 100)) + " Ratus " + terbilang(angka % 100)
      );
    if (angka < 2000) return "Seribu " + terbilang(angka - 1000);
    if (angka < 1000000)
      return (
        terbilang(Math.floor(angka / 1000)) + " Ribu " + terbilang(angka % 1000)
      );
    if (angka < 1000000000)
      return (
        terbilang(Math.floor(angka / 1000000)) +
        " Juta " +
        terbilang(angka % 1000000)
      );
    return "";
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.nama_penjual.toLowerCase().includes(search.toLowerCase()),
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handlePrint = (inv: any) => {
    setPrintData(inv);
    setTimeout(() => window.print(), 300);
  };

  const namaBulan = new Date(0, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  const totalTagihan = filteredInvoices.reduce(
    (acc, inv) => acc + (inv.grand_total || 0),
    0,
  );
  const totalPotongan = filteredInvoices.reduce(
    (acc, inv) => acc + (inv.potongan_izin || 0),
    0,
  );
  const totalSewaKotor = filteredInvoices.reduce(
    (acc, inv) => acc + (inv.total_sewa_normal || 0),
    0,
  );

  const today = new Date();
  const tglCetak = today.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tglJatuhTempo = new Date(today.getFullYear(), today.getMonth(), 10);
  if (today.getDate() > 10)
    tglJatuhTempo.setMonth(tglJatuhTempo.getMonth() + 1);
  const jatuhTempo = tglJatuhTempo.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* CSS PRINT - AGGRESSIVE HIDE ALL UI */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
  @media print {
    @page { 
      size: A4 portrait; 
      margin: 1.8cm 2cm 1.8cm 2cm;
    }
    
    html, body {
      background: white !important;
      color: black !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* SEMBUNYIKAN SEMUA ELEMEN UI */
    aside,
    nav,
    header,
    .no-print,
    [class*="sidebar"],
    [class*="Sidebar"],
    [class*="fixed"],
    [class*="sticky"],
    [class*="backdrop"],
    [class*="z-50"],
    [class*="z-40"],
    [class*="z-[60]"],
    [class*="z-[70]"],
    [class*="z-[9999]"],
    .ToastContainer,
    [role="dialog"],
    [role="alertdialog"] {
      display: none !important;
    }
    
    /* TAMPILKAN DOKUMEN CETAK */
    .print-only {
      display: block !important;
      position: relative !important;
      visibility: visible !important;
      opacity: 1 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .print-only * {
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* Page break */
    .print-only tr {
      page-break-inside: avoid;
    }
  }
`,
        }}
      />

      {/* ==========================================
          TEMPLATE INVOICE CETAK - CORPORATE STYLE
          ========================================== */}
      {printData && (
        <div className="hidden print-only font-sans text-black bg-white">
          {/* Kop Surat dengan Garis */}
          <div className="border-b-4 border-black pb-5 mb-6">
            <div className="flex justify-between items-start">
              {/* Logo & Company Info */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-16 h-16 bg-black flex items-center justify-center">
                    <span className="text-white font-black text-xl">MA</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight leading-none">
                      Mie Ayam Speciall
                    </h1>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-600 mt-1">
                      -
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-gray-600 mt-3 leading-relaxed">
                  <p>Jl. Parangtritis KM 13 Patalan Jetis Bantul</p>
                  <p>Telp: 62-877-5687-0461 | 62-822-4409-5742 </p>
                </div>
              </div>

              {/* Invoice Title Box */}
              <div className="text-right">
                <div className="bg-black text-white px-6 py-3 inline-block">
                  <h2 className="text-2xl font-black tracking-wider">
                    INVOICE
                  </h2>
                  <p className="text-[8px] font-bold uppercase tracking-[0.3em]">
                    Tagihan Sewa Aset
                  </p>
                </div>
                <div className="mt-3 text-right">
                  <table className="text-[9px] ml-auto">
                    <tbody>
                      <tr>
                        <td className="font-bold uppercase text-gray-500 pr-3 text-right">
                          No. Invoice
                        </td>
                        <td className="font-black">
                          : INV/{tahun}/{String(bulan).padStart(2, "0")}/
                          {String(printData.penjual_id).padStart(4, "0")}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold uppercase text-gray-500 pr-3 text-right">
                          Periode
                        </td>
                        <td className="font-black">
                          : {namaBulan} {tahun}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold uppercase text-gray-500 pr-3 text-right">
                          Tgl. Cetak
                        </td>
                        <td className="font-black">: {tglCetak}</td>
                      </tr>
                      <tr>
                        <td className="font-bold uppercase text-gray-500 pr-3 text-right">
                          Jatuh Tempo
                        </td>
                        <td className="font-black">: {jatuhTempo}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Ship To */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border-2 border-gray-300 p-4 bg-gray-50">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest border-b-2 border-gray-300 pb-1">
                Ditagihkan Kepada (Bill To):
              </p>
              <p className="text-base font-black uppercase mb-1">
                {printData.nama_penjual}
              </p>
              <p className="text-xs text-gray-600 font-medium">
                {printData.nama_warung || "Mitra Distribusi"}
              </p>
              {printData.alamat_jualan && (
                <p className="text-[10px] text-gray-500 mt-1">
                  {printData.alamat_jualan}
                </p>
              )}
            </div>
            <div className="border-2 border-gray-300 p-4 bg-gray-50">
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2 tracking-widest border-b-2 border-gray-300 pb-1">
                Metode Pembayaran:
              </p>
              <div className="text-xs space-y-1.5 text-gray-700">
                <p className="font-bold">Transfer Bank / Tunai</p>
                <p>BCA: 1963149541 a.n. Anendra Restu </p>
                <p>Mandiri: 1370023767128 a.n. Anendra Restu </p>
                <p className="text-[10px] text-gray-500 mt-2">
                  Konfirmasi: 62-877-5687-0461
                </p>
              </div>
            </div>
          </div>

          {/* Tabel Rincian */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black p-3 text-left uppercase text-[10px] font-black w-8">
                  No
                </th>
                <th className="border-2 border-black p-3 text-left uppercase text-[10px] font-black">
                  Deskripsi
                </th>
                <th className="border-2 border-black p-3 text-center uppercase text-[10px] font-black w-20">
                  Qty
                </th>
                <th className="border-2 border-black p-3 text-right uppercase text-[10px] font-black w-36">
                  Harga Satuan
                </th>
                <th className="border-2 border-black p-3 text-right uppercase text-[10px] font-black w-40">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Item 1 - Sewa Aset */}
              <tr>
                <td className="border-2 border-black p-3 text-center text-xs font-bold">
                  1
                </td>
                <td className="border-2 border-black p-3">
                  <p className="text-xs font-bold">Sewa Aset Operasional</p>
                  <p className="text-[9px] text-gray-600 mt-1 leading-relaxed">
                    Biaya sewa aset aktif periode {namaBulan} {tahun} (
                    {printData.item_details}). Perhitungan berdasarkan tarif
                    harian dikalikan 30 hari operasional.
                  </p>
                </td>
                <td className="border-2 border-black p-3 text-center text-xs">
                  1 Bulan
                </td>
                <td className="border-2 border-black p-3 text-right text-xs font-mono">
                  {formatRupiah(printData.total_sewa_normal)}
                </td>
                <td className="border-2 border-black p-3 text-right text-xs font-mono font-bold">
                  {formatRupiah(printData.total_sewa_normal)}
                </td>
              </tr>

              {/* Item 2 - Potongan Izin (jika ada) */}
              {printData.potongan_izin > 0 && (
                <tr>
                  <td className="border-2 border-black p-3 text-center text-xs font-bold">
                    2
                  </td>
                  <td className="border-2 border-black p-3">
                    <p className="text-xs font-bold text-red-700">
                      Potongan Izin / Cuti Operasional
                    </p>
                    <p className="text-[9px] text-gray-600 mt-1 leading-relaxed">
                      Pengurangan biaya sewa berdasarkan laporan ketidakhadiran
                      mitra selama periode {namaBulan} {tahun}.
                    </p>
                  </td>
                  <td className="border-2 border-black p-3 text-center text-xs">
                    -
                  </td>
                  <td className="border-2 border-black p-3 text-right text-xs font-mono text-red-700">
                    - {formatRupiah(printData.potongan_izin)}
                  </td>
                  <td className="border-2 border-black p-3 text-right text-xs font-mono font-bold text-red-700">
                    - {formatRupiah(printData.potongan_izin)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              {/* Subtotal */}
              <tr>
                <td
                  colSpan={4}
                  className="border-2 border-black p-3 text-right text-[10px] font-black uppercase"
                >
                  Subtotal
                </td>
                <td className="border-2 border-black p-3 text-right text-xs font-mono font-bold">
                  {formatRupiah(printData.total_sewa_normal)}
                </td>
              </tr>
              {/* Potongan */}
              {printData.potongan_izin > 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="border-2 border-black p-3 text-right text-[10px] font-black uppercase text-red-700"
                  >
                    Potongan Izin
                  </td>
                  <td className="border-2 border-black p-3 text-right text-xs font-mono font-bold text-red-700">
                    - {formatRupiah(printData.potongan_izin)}
                  </td>
                </tr>
              )}
              {/* Grand Total */}
              <tr className="bg-black text-white">
                <td
                  colSpan={4}
                  className="border-2 border-black p-4 text-right text-sm font-black uppercase tracking-widest"
                >
                  Total Tagihan
                </td>
                <td className="border-2 border-black p-4 text-right text-lg font-black font-mono">
                  {formatRupiah(printData.grand_total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Terbilang */}
          <div className="border-2 border-black p-4 bg-gray-100 mb-6">
            <p className="text-[9px] font-black uppercase text-gray-500 mb-1">
              Terbilang:
            </p>
            <p className="text-sm font-bold italic text-gray-800">
              #{terbilang(printData.grand_total).trim() || "Nol"} Rupiah#
            </p>
          </div>

          {/* Notes & Syarat */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b-2 border-gray-300 pb-1">
                Syarat & Ketentuan:
              </p>
              <ul className="text-[9px] text-gray-600 space-y-1.5 leading-relaxed">
                <li>
                  1. Pembayaran dilakukan paling lambat tanggal 10 setiap
                  bulannya.
                </li>
                <li>
                  2. Keterlambatan pembayaran dikenakan denda 2% per bulan.
                </li>
                <li>3. Invoice ini sah sebagai dokumen penagihan resmi.</li>
                <li>
                  4. Pembayaran dapat dilakukan via transfer atau tunai ke
                  kasir.
                </li>
                <li>5. Konfirmasi pembayaran WA: 0813-9375-1133.</li>
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b-2 border-gray-300 pb-1">
                Rincian Aset Aktif:
              </p>
              <p className="text-[10px] text-gray-700 leading-relaxed">
                {printData.item_details}
              </p>
              <p className="text-[9px] text-gray-500 mt-2">
                * Sewa dihitung flat 30 hari per bulan
              </p>
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="flex justify-between mt-12 pt-8">
            <div className="text-center w-48">
              <p className="text-[10px] font-bold text-gray-500 mb-16">
                Diterima Oleh,
              </p>
              <div className="border-b-2 border-black w-full mb-1"></div>
              <p className="text-[11px] font-black uppercase">
                {printData.nama_penjual}
              </p>
              <p className="text-[9px] text-gray-500">Mitra</p>
            </div>
            <div className="text-center w-48">
              <p className="text-[10px] font-bold text-gray-500 mb-1">
                {tglCetak}
              </p>
              <div className="border-b-2 border-black w-full mb-1 mt-16"></div>
              <p className="text-[11px] font-black uppercase">
                Bagian Keuangan
              </p>
              <p className="text-[9px] text-gray-500">
                PT. Outsys Distribusi Indonesia
              </p>
            </div>
            <div className="text-center w-48">
              <p className="text-[10px] font-bold text-gray-500 mb-16">
                Menyetujui,
              </p>
              <div className="border-b-2 border-black w-full mb-1"></div>
              <p className="text-[11px] font-black uppercase">
                Direktur Operasional
              </p>
              <p className="text-[9px] text-gray-500">
                PT. Outsys Distribusi Indonesia
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-4 border-t-2 border-gray-300 text-center">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider">
              Dokumen ini dicetak secara otomatis oleh Sistem Operasional Mie
              Ayam Speciall
            </p>
            <p className="text-[8px] text-gray-400 mt-0.5">
              Invoice Sah Tanpa Tanda Tangan | builtby.outsys.space
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          UI WEB UTAMA
          ========================================== */}
      <div className="no-print">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Receipt size={28} className="text-orange-500" />
              Tagihan Sewa Aset
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Rekapitulasi invoice bulanan mitra
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-orange-400 cursor-pointer shadow-sm"
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
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:border-orange-400 cursor-pointer shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign size={16} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Total Tagihan
              </span>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {formatRupiah(totalTagihan)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown size={16} className="text-red-500" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Total Potongan
              </span>
            </div>
            <p className="text-xl font-bold text-red-500">
              - {formatRupiah(totalPotongan)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-green-600" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Sewa Kotor
              </span>
            </div>
            <p className="text-xl font-bold text-slate-800">
              {formatRupiah(totalSewaKotor)}
            </p>
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
            placeholder="Cari nama mitra..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Mitra & Item
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Sewa Kotor (30hr)
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Potongan Izin
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-orange-50/50">
                    Total Tagihan
                  </th>
                  <th className="px-5 py-3.5 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider w-20">
                    Cetak
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentData.map((inv, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {inv.nama_penjual}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calculator size={10} /> {inv.item_details}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-slate-600 font-mono">
                        {formatRupiah(inv.total_sewa_normal)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-red-500 font-mono">
                        - {formatRupiah(inv.potongan_izin)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right bg-orange-50/30">
                      <span className="text-base font-bold text-slate-800">
                        {formatRupiah(inv.grand_total)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handlePrint(inv)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Cetak Invoice"
                      >
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-slate-400">
                        <Receipt
                          size={40}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="text-sm font-medium">
                          Data tagihan tidak ditemukan
                        </p>
                        <p className="text-xs mt-1">
                          Coba ubah periode bulan/tahun
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredInvoices.length > 0 && (
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
                  <option value={25}>25</option>
                </select>
                <span className="text-xs text-slate-400">
                  dari {filteredInvoices.length} data
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Hal {currentPage} / {totalPages || 1}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((c) => Math.min(c + 1, totalPages))
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
      </div>
    </div>
  );
}
