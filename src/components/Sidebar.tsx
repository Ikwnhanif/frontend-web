"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // <--- Import Image Next.js
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Calendar,
  Archive,
  CalendarOff,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup sidebar mobile saat route berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Simpan preferensi collapsed di localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };

  // LOGOUT HANDLER (Mencegah Infinite Loop)
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    const host = window.location.hostname;
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = `token=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    document.cookie = `role=; path=/; domain=${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
    window.location.replace("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Data Mitra", path: "/admin/penjual", icon: <Users size={20} /> },
    { name: "Aset & Sewa", path: "/admin/sewa", icon: <Archive size={20} /> },
    {
      name: "Izin / Cuti",
      path: "/admin/izin",
      icon: <CalendarOff size={20} />,
    },
    {
      name: "Tagihan Invoice",
      path: "/admin/invoice",
      icon: <Receipt size={20} />,
    },
    {
      name: "History Rekap",
      path: "/admin/history",
      icon: <Calendar size={20} />,
    },
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === "/admin") return pathname === "/admin";
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] bg-white border border-orange-100 p-2.5 rounded-xl shadow-[0_4px_20px_rgb(234,88,12,0.1)] hover:bg-orange-50 transition-colors text-orange-600"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white/95 backdrop-blur-xl border-r border-orange-100/50
          flex flex-col shadow-[4px_0_24px_rgb(234,88,12,0.03)]
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[80px]" : "w-64"}
        `}
      >
        {/* Branding Header */}
        <div
          className={`flex items-center border-b border-orange-100/50 relative ${collapsed ? "p-5 justify-center" : "p-6 gap-4"}`}
        >
          {/* MENGGUNAKAN LOGO ASLI */}
          <div className="shrink-0 w-11 h-11 relative bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-md shadow-orange-500/10 border border-orange-50">
            <Image
              src="/192x192.png" // Pastikan nama file ini sesuai dengan yang ada di folder public/
              alt="Logo Mie Speciall"
              fill
              className="object-contain p-1" // p-1 agar logo tidak terlalu mepet ke pinggir kotak
              priority
            />
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 animate-in fade-in duration-300">
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                MIE SPECIALL
              </h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
                Admin Panel
              </p>
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute -right-3.5 top-8 w-7 h-7 bg-white border border-orange-200 rounded-full items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm z-10 text-slate-400"
          >
            {collapsed ? (
              <ChevronRight size={14} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={14} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 no-scrollbar">
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-400 mb-3 px-2 uppercase tracking-widest">
              Menu Utama
            </p>
          )}

          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.name : ""}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-2xl
                  font-semibold text-sm transition-all duration-300
                  group relative
                  ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-orange-50 to-amber-50/50 text-orange-600 shadow-sm border border-orange-100/50"
                      : "text-slate-500 hover:bg-orange-50/50 hover:text-orange-600 border border-transparent"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span
                  className={`shrink-0 transition-transform duration-300 ${isActive(item.path) ? "text-orange-500 scale-110" : "text-slate-400 group-hover:text-orange-500 group-hover:scale-110"}`}
                >
                  {item.icon}
                </span>

                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Active Indicator (Dot) */}
                {isActive(item.path) && !collapsed && (
                  <span className="absolute right-3 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_rgb(249,115,22)]" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div
          className={`border-t border-orange-100/50 bg-slate-50/30 ${collapsed ? "p-3" : "p-5"}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
                <span className="text-sm font-black">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  Admin System
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">
                    Online
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-2xl
              text-sm font-bold text-slate-500
              hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100
              ${collapsed ? "justify-center" : ""}
            `}
            title="Keluar"
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Keluar Akses</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
