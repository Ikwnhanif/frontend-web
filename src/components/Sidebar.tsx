"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Package2,
  Calendar,
} from "lucide-react"; // <-- Tambah Calendar

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
    { name: "DATA PENJUAL", path: "/admin/penjual", icon: <Users size={20} /> },
    {
      name: "HISTORY REKAP",
      path: "/admin/history",
      icon: <Calendar size={20} />,
    }, // <-- Menu Baru
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-slate-300 flex flex-col border-r-4 border-slate-900">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 shadow-neo-blue">
          <Package2 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-white font-black leading-none tracking-tight">
            builtby.outsys
          </h1>
          <p className="text-[9px] text-blue-400 font-bold tracking-widest uppercase mt-1">
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <p className="text-[10px] font-black text-slate-600 mb-4 tracking-widest px-2 uppercase">
          Management
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-4 font-black text-xs tracking-widest transition-all border-l-4 ${
                isActive
                  ? "bg-slate-900 text-white border-blue-500 shadow-inner"
                  : "border-transparent hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-xs font-black text-red-500 hover:bg-red-950/20 transition-all border-l-4 border-transparent uppercase tracking-widest"
        >
          <LogOut size={20} /> Exit System
        </button>
      </div>
    </aside>
  );
}
