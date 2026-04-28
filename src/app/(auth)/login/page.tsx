"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Zap,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  Coffee,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { username, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      const expires = new Date();
      expires.setDate(expires.getDate() + 3);
      document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      document.cookie = `role=${user.role}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;

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
    <div className="flex min-h-screen bg-slate-50">
      {/* ==========================================
          LEFT SIDE - BRANDING & ILLUSTRATION
          ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        {/* Decorative Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          {/* Logo */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/30">
            <Coffee size={40} className="text-white" />
          </div>

          <h1 className="text-4xl font-black text-white mb-3 tracking-tight">
            Mie Ayam Speciall
          </h1>

          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2 rounded-full font-bold text-xs tracking-widest uppercase mb-6">
            Operational System
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Sistem Operasional Distribusi dan Manajemen Sewa Aset Mie Ayam
            Speciall
          </p>

          {/* Features List */}
          <div className="space-y-3 text-left inline-block">
            {[
              { icon: "📊", text: "Dashboard Analytics Real-time" },
              { icon: "🤝", text: "Manajemen Mitra & Penjual" },
              { icon: "📦", text: "Tracking Distribusi Sewa Aset " },
              { icon: "💰", text: "Laporan Keuangan Harian" },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-slate-400 text-xs">© 2026 Outsys Space</p>
            <p className="text-slate-500 text-[10px] mt-1">
              builtby.outsys.space
            </p>
          </div>
        </div>
      </div>

      {/* ==========================================
          RIGHT SIDE - LOGIN FORM
          ========================================== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg mb-4">
              <Coffee size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">
              Mie Ayam Special
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Operational System
            </p>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Selamat Datang 👋
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Silakan login untuk mengakses dashboard dan mengelola operasional
              bisnis Anda.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <div className="shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-sm">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Login Gagal
                </p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-slate-400 hover:text-orange-500 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 accent-orange-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  Ingat saya di perangkat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk ke Sistem</span>
                </>
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield size={14} className="text-green-500" />
              <span className="text-xs font-medium text-slate-400">
                Koneksi aman terenkripsi
              </span>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Personnel Use Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
