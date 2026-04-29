"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Package2,
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

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    window.location.href = "/login";
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
        className="lg:hidden fixed top-4 left-4 z-[60] bg-white border-2 border-slate-200 p-2 rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
      >
        {mobileOpen ? (
          <X size={20} className="text-slate-700" />
        ) : (
          <Menu size={20} className="text-slate-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white border-r border-slate-200
          flex flex-col shadow-xl shadow-slate-200/50
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[72px]" : "w-64"}
        `}
      >
        {/* Branding Header */}
        <div
          className={`flex items-center border-b border-slate-200 ${collapsed ? "p-4 justify-center" : "p-5 gap-3"}`}
        >
          <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Package2 className="text-white" size={20} />
          </div>

          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                Mie Speciall
              </h1>
              <p className="text-[10px] text-orange-500 font-semibold tracking-wide">
                Admin Panel
              </p>
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            {collapsed ? (
              <ChevronRight size={12} className="text-slate-500" />
            ) : (
              <ChevronLeft size={12} className="text-slate-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-400 mb-3 px-3 uppercase tracking-widest">
              Menu Utama
            </p>
          )}

          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                title={collapsed ? item.name : ""}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  font-medium text-sm transition-all duration-200
                  group relative
                  ${
                    isActive(item.path)
                      ? "bg-orange-50 text-orange-600 font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span
                  className={`shrink-0 ${isActive(item.path) ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}`}
                >
                  {item.icon}
                </span>

                {!collapsed && <span className="truncate">{item.name}</span>}

                {/* Active Indicator */}
                {isActive(item.path) && !collapsed && (
                  <span className="absolute right-3 w-1.5 h-1.5 bg-orange-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div
          className={`border-t border-slate-200 ${collapsed ? "p-3" : "p-4"}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  Admin
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Administrator
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium text-red-500
              hover:bg-red-50 transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
            title="Keluar"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
