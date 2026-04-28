"use client";
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
  Receipt, // <-- Icon baru untuk modul Sewa
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    window.location.href = "/login";
  };

  const menuItems = [
    { name: "DASHBOARD", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "DATA MITRA", path: "/admin/penjual", icon: <Users size={20} /> },
    { name: "ASET & SEWA", path: "/admin/sewa", icon: <Archive size={20} /> }, // <-- Menu Baru Modul ERP
    {
      name: "IZIN / CUTI",
      path: "/admin/izin",
      icon: <CalendarOff size={20} />,
    }, // <-- MENU BARU
    {
      name: "TAGIHAN INVOICE",
      path: "/admin/invoice",
      icon: <Receipt size={20} />,
    }, // <-- MENU BARU
    {
      name: "HISTORY REKAP",
      path: "/admin/history",
      icon: <Calendar size={20} />,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-slate-300 flex flex-col border-r-4 border-slate-900">
      {/* BRANDING HEADER */}
      <div className="p-6 border-b-4 border-slate-900 flex items-center gap-3">
        <div className="bg-orange-500 p-2 border-2 border-slate-800 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
          <Package2 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-white font-black leading-none tracking-tight">
            Mie Speciall
          </h1>
          <p className="text-[9px] text-orange-500 font-bold tracking-widest uppercase mt-1">
            Admin Panel
          </p>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        <p className="text-[10px] font-black text-slate-600 mb-4 tracking-widest px-2 uppercase">
          Management Menu
        </p>

        {menuItems.map((item) => {
          // Logika pintar agar menu tetap aktif meskipun sedang di sub-folder
          const isActive =
            pathname === item.path || pathname.startsWith(`${item.path}/`);
          // Khusus dashboard agar tidak bentrok dengan /admin/xxx lainnya
          const isDashboardActive =
            item.path === "/admin" && pathname === "/admin";
          const finalActive =
            item.path === "/admin" ? isDashboardActive : isActive;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-4 font-black text-xs tracking-widest transition-all border-l-4 ${
                finalActive
                  ? "bg-slate-900 text-orange-400 border-orange-500 shadow-inner"
                  : "border-transparent hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="p-4 border-t-4 border-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-xs font-black text-red-500 hover:bg-red-950/40 hover:text-red-400 transition-all border-l-4 border-transparent uppercase tracking-widest group"
        >
          <LogOut
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Exit System
        </button>
      </div>
    </aside>
  );
}
