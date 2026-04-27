"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { username, password });
      const { token, user } = res.data;

      // 1. Simpan di LocalStorage untuk Axios
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      // 2. Simpan di Cookie untuk Middleware (Expires dalam 3 hari)
      const expires = new Date();
      expires.setDate(expires.getDate() + 3);
      document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      document.cookie = `role=${user.role}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

      // 3. Redirect berdasarkan role
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/kasir");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white border border-slate-300 shadow-xl overflow-hidden">
        {/* Header Style Corporate */}
        <div className="bg-slate-800 p-6 text-center">
          <h1 className="text-white text-2xl font-black tracking-widest uppercase">
            Mie System <span className="text-blue-400">v1.0</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-tighter">
            Builtby.outsys.space
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 text-red-700 text-sm font-bold uppercase">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 p-3 border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  placeholder="Input Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  required
                  className="w-full pl-10 p-3 border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className={`w-full py-4 text-white font-bold uppercase tracking-widest transition shadow-lg ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 active:transform active:scale-95"
              }`}
            >
              {loading ? "Authenticating..." : "Login Ke Sistem"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-medium">
              Authorized Personnel Only &bull; Built for Outsys Server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
