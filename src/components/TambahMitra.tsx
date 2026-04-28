"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios"; // Atau gunakan fetch biasa

// PENTING: Load komponen peta tanpa Server-Side Rendering (SSR)
const MapPickerNoSSR = dynamic(() => import("../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      Memuat Peta...
    </div>
  ),
});

export default function TambahMitraForm() {
  const [formData, setFormData] = useState({
    nama_penjual: "",
    nama_warung: "",
    alamat_jualan: "",
    alamat_rumah: "",
    no_whatsapp: "",
    lat: 0,
    long: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Tembak ke API yang baru kita buat
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/penjual`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Sesuaikan dengan cara Anda nyimpan token
          },
        },
      );

      alert(`Sukses! Mitra terdaftar dengan PIN: ${response.data.pin}`);
      // Redirect atau bersihkan form...
    } catch (error) {
      alert("Gagal menyimpan data mitra.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Pendaftaran Mitra Baru
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Text Standar */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Penjual
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full border rounded-md p-2"
              onChange={(e) =>
                setFormData({ ...formData, nama_penjual: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Warung
            </label>
            <input
              type="text"
              className="mt-1 block w-full border rounded-md p-2"
              onChange={(e) =>
                setFormData({ ...formData, nama_warung: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            No. WhatsApp
          </label>
          <input
            type="tel"
            className="mt-1 block w-full border rounded-md p-2"
            onChange={(e) =>
              setFormData({ ...formData, no_whatsapp: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alamat Jualan
            </label>
            <textarea
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
              onChange={(e) =>
                setFormData({ ...formData, alamat_jualan: e.target.value })
              }
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alamat Rumah
            </label>
            <textarea
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
              onChange={(e) =>
                setFormData({ ...formData, alamat_rumah: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        {/* AREA PETA */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tandai Lokasi Jualan (Koordinat)
          </label>
          <MapPickerNoSSR
            onLocationSelect={(lat, lng) =>
              setFormData({ ...formData, lat, long: lng })
            }
          />
          <div className="mt-2 text-sm text-gray-500 flex gap-4">
            <span>Lat: {formData.lat || "-"}</span>
            <span>Long: {formData.long || "-"}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md mt-6 hover:bg-blue-700 transition"
        >
          {isLoading ? "Menyimpan..." : "Simpan Mitra & Generate PIN"}
        </button>
      </form>
    </div>
  );
}
