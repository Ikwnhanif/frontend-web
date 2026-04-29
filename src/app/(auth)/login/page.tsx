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
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"username" | "password" | null>(null);
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
      `,
        }}
      />

      {/* ==========================================
          LEFT SIDE - BRANDING (HIDDEN ON MOBILE)
          ========================================== */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 animate-gradient" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, #fff 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Decorative Blobs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "1s" }}
        />

        {/* Floating Elements */}
        <div
          className="absolute top-[15%] right-[10%] animate-float"
          style={{ animationDelay: "0s" }}
        >
          <div className="w-20 h-20 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <Sparkles size={28} className="text-orange-400" />
          </div>
        </div>
        <div
          className="absolute top-[45%] left-[15%] animate-float"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-16 h-16 bg-white/5 rounded-full backdrop-blur-sm border border-white/10" />
        </div>
        <div
          className="absolute bottom-[25%] right-[20%] animate-float"
          style={{ animationDelay: "4s" }}
        >
          <div className="w-24 h-24 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <Zap size={30} className="text-yellow-400" />
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex items-center justify-center w-full p-12 xl:p-16">
          <div className="text-center max-w-md">
            {/* Logo */}
            <div className="mb-8 inline-flex">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30 transform hover:rotate-3 transition-transform duration-300">
                  <Coffee size={44} className="text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              Mie Ayam<span className="text-orange-400"> Speciall</span>
            </h1>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 px-5 py-2.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Operational System v2.0
            </div>

            <p className="text-slate-300 text-base leading-relaxed mb-10 font-medium">
              Sistem manajemen distribusi, kemitraan, dan pengelolaan aset untuk
              memonitor performa bisnis secara real-time.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {["Dashboard", "Mitra", "Distribusi", "Keuangan", "Aset"].map(
                (item) => (
                  <span
                    key={item}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-default"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            {/* Bottom Info */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span>© 2026 Outsys</span>
                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                <span>builtby.outsys.space</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          RIGHT SIDE - LOGIN FORM
          ========================================== */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl shadow-orange-500/20 mb-4">
              <Coffee size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-800">
              Mie Ayam <span className="text-orange-500">Speciall</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Operational System
            </p>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl p-6 mb-8 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                <span className="text-2xl">👋</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">
                  Selamat Datang
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Masuk untuk mengelola operasional bisnis, monitoring mitra,
                  dan laporan keuangan.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-red-500 text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Login Gagal
                </p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all shrink-0"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2 ml-1">
                Username
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "username" ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focused === "username"
                      ? "text-orange-500"
                      : "text-slate-400"
                  }`}
                >
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused("username")}
                  onBlur={() => setFocused(null)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  className={`w-full pl-12 pr-4 py-3.5 bg-white border-2 rounded-2xl outline-none transition-all text-[15px] font-medium text-slate-800 placeholder:text-slate-400 ${
                    focused === "username"
                      ? "border-orange-400 ring-4 ring-orange-50 shadow-lg shadow-orange-100/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-slate-400 hover:text-orange-500 transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              <div
                className={`relative transition-all duration-300 ${
                  focused === "password" ? "scale-[1.02]" : ""
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                    focused === "password"
                      ? "text-orange-500"
                      : "text-slate-400"
                  }`}
                >
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-3.5 bg-white border-2 rounded-2xl outline-none transition-all text-[15px] font-medium text-slate-800 placeholder:text-slate-400 ${
                    focused === "password"
                      ? "border-orange-400 ring-4 ring-orange-50 shadow-lg shadow-orange-100/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
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
            <div className="flex items-center ml-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-lg peer-checked:border-orange-500 peer-checked:bg-orange-500 transition-all group-hover:border-slate-400 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                  Ingat saya di perangkat ini
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-[15px] transition-all duration-300 flex items-center justify-center gap-2.5 ${
                loading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98] animate-gradient bg-[length:200%_200%]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={14} className="text-green-500" />
              <span className="text-xs font-medium text-slate-400">
                Koneksi aman • Enkripsi SSL
              </span>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Hanya untuk personel yang berwenang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
