"use client";
import { useEffect, useState } from "react";
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
} from "lucide-react";

export default function IzinMitraPage() {
  const [izinList, setIzinList] = useState<any[]>([]);
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  // State Khusus Searchable Dropdown
  const [searchMitra, setSearchMitra] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ==========================================
  // STATE PAGINASI
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Default 5 baris per halaman

  const [formData, setFormData] = useState({
    penjual_id: "",
    tanggal_mulai: new Date().toISOString().split("T")[0],
    tanggal_akhir: new Date().toISOString().split("T")[0],
    keterangan: "",
  });

  const fetchData = async () => {
    try {
      const [resIzin, resMitra] = await Promise.all([
        api.get("/admin/sewa/izin"),
        api.get("/admin/penjual"),
      ]);
      setIzinList(resIzin.data || []);
      setMitraList(resMitra.data || []);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali data baru ditarik
    } catch (err) {
      console.error("Gagal load data");
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
    if (!formData.penjual_id)
      return alert("Pilih Mitra dari daftar dropdwon terlebih dahulu!");

    if (new Date(formData.tanggal_akhir) < new Date(formData.tanggal_mulai)) {
      return alert("Tanggal akhir tidak boleh lebih kecil dari tanggal mulai!");
    }

    try {
      await api.post("/admin/sewa/izin", {
        penjual_id: parseInt(formData.penjual_id),
        tanggal_mulai: formData.tanggal_mulai + "T00:00:00Z",
        tanggal_akhir: formData.tanggal_akhir + "T00:00:00Z",
        keterangan: formData.keterangan,
      });
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menyimpan data izin");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Hapus data izin ini? Jika dihapus, tagihan sewa mitra untuk tanggal tersebut akan kembali dihitung normal.",
      )
    )
      return;
    try {
      await api.delete(`/admin/sewa/izin/${id}`);
      fetchData();
    } catch (err) {
      alert("Gagal menghapus izin");
    }
  };

  const filteredMitra = mitraList.filter(
    (m) =>
      m.nama_penjual.toLowerCase().includes(searchMitra.toLowerCase()) ||
      (m.nama_warung &&
        m.nama_warung.toLowerCase().includes(searchMitra.toLowerCase())),
  );

  // ==========================================
  // LOGIKA PEMOTONGAN DATA (PAGINASI)
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIzinData = izinList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(izinList.length / itemsPerPage);

  return (
    <div className="p-4 md:p-8">
      {/* HEADER HALAMAN */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
              <CalendarOff size={32} className="text-orange-500" /> Cuti
              Operasional
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Catatan Izin Mitra (Pemberhentian Tagihan Sementara)
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-600 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <PlusSquare size={18} /> Input Izin Baru
          </button>
        </div>
      </div>

      {/* KONTAINER TABEL & PAGINASI */}
      <div className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-800 text-white text-[10px] uppercase font-black tracking-widest border-b-4 border-slate-900">
              <tr>
                <th className="p-4">Identitas Mitra</th>
                <th className="p-4 text-center">Periode Izin (Libur)</th>
                <th className="p-4">Alasan / Keterangan</th>
                <th className="p-4 text-center border-l-4 border-slate-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 border-slate-100">
              {/* UBAH DARI izinList.map MENJADI currentIzinData.map */}
              {currentIzinData.map((item: any) => {
                const tglMulai = new Date(item.tanggal_mulai);
                const tglAkhir = new Date(item.tanggal_akhir);
                const diffTime = Math.abs(
                  tglAkhir.getTime() - tglMulai.getTime(),
                );
                const diffDays =
                  Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-orange-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-400 border border-slate-300">
                          <Users size={16} />
                        </div>
                        <div>
                          <div className="font-black text-slate-800 uppercase text-sm">
                            {item.penjual?.nama_penjual || "Mitra Dihapus"}
                          </div>
                          <div className="font-bold text-slate-500 text-[10px] uppercase mt-0.5">
                            {item.penjual?.nama_warung || "TIDAK ADA WARUNG"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-block bg-orange-100 border-2 border-orange-500 px-3 py-1 font-mono font-black text-xs text-orange-800">
                        {tglMulai.toLocaleDateString("id-ID")} s/d{" "}
                        {tglAkhir.toLocaleDateString("id-ID")}
                      </div>
                      <div className="text-[10px] font-black text-slate-500 mt-2 uppercase">
                        Durasi:{" "}
                        <span className="text-orange-600 bg-orange-100 px-1">
                          {diffDays} Hari
                        </span>{" "}
                        Bebas Sewa
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-600 uppercase flex items-start gap-2 max-w-xs">
                        <MessageSquare
                          size={14}
                          className="mt-0.5 text-slate-400 shrink-0"
                        />
                        {item.keterangan || "Tidak ada keterangan"}
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center border-l-4 border-slate-100">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-white border-4 border-slate-900 text-red-600 hover:bg-red-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mx-auto"
                        title="Batalkan Izin"
                      >
                        <Trash2 size={16} /> Batal / Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
              {izinList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center font-bold uppercase text-slate-400 text-xs"
                  >
                    Belum ada data izin/cuti mitra.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* KONTROL PAGINASI */}
        {izinList.length > 0 && (
          <div className="bg-slate-100 border-t-4 border-slate-900 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Tampilkan:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Kembali ke halaman 1 jika mengubah jumlah baris
                }}
                className="p-1 border-2 border-slate-300 font-bold text-xs outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value={5}>5 Baris</option>
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
              </select>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">
                Total Data: {izinList.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-widest">
                Hal {currentPage} dari {totalPages || 1}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border-2 border-slate-900 bg-white disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none active:translate-y-0.5 active:translate-x-0.5"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border-2 border-slate-900 bg-white disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none active:translate-y-0.5 active:translate-x-0.5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INPUT IZIN BARU */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-slate-900 w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-visible">
            <div className="bg-slate-900 p-4 flex justify-between items-center border-b-4 border-orange-500">
              <h2 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                <PlusSquare size={16} /> Input Cuti Operasional
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-orange-400"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* SEARCHABLE DROPDOWN UNTUK MITRA */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  1. Ketik & Pilih Mitra
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required={!formData.penjual_id}
                      type="text"
                      value={searchMitra}
                      onChange={(e) => {
                        setSearchMitra(e.target.value);
                        setShowDropdown(true);
                        if (formData.penjual_id)
                          setFormData({ ...formData, penjual_id: "" });
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() =>
                        setTimeout(() => setShowDropdown(false), 200)
                      }
                      placeholder="Ketik nama mitra atau warung..."
                      className="w-full p-4 pl-12 border-4 border-slate-900 focus:border-orange-500 focus:outline-none font-black text-xs uppercase bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors placeholder:text-slate-300"
                    />
                  </div>

                  {/* KOTAK HASIL PENCARIAN */}
                  {showDropdown && (
                    <div className="absolute z-50 w-full mt-2 max-h-48 overflow-y-auto bg-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                          className="p-3 border-b-2 border-slate-100 cursor-pointer hover:bg-orange-500 hover:text-white transition-colors group"
                        >
                          <div className="font-black text-xs uppercase text-slate-800 group-hover:text-white">
                            {m.nama_penjual}
                          </div>
                          {m.nama_warung && (
                            <div className="text-[10px] font-bold opacity-60 group-hover:opacity-100 text-slate-500 group-hover:text-white">
                              {m.nama_warung}
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredMitra.length === 0 && (
                        <div className="p-4 text-center font-bold text-xs text-slate-400 uppercase">
                          Mitra tidak ditemukan
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
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
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">
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
                    className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">
                  3. Keterangan / Alasan
                </label>
                <textarea
                  rows={2}
                  value={formData.keterangan}
                  placeholder="Contoh: Pulang kampung ada hajatan"
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  className="w-full p-3 border-4 border-slate-200 focus:border-orange-500 focus:outline-none font-black text-sm transition-colors resize-none uppercase"
                />
              </div>

              <div className="pt-4 flex gap-4 border-t-4 border-slate-100 mt-2">
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
