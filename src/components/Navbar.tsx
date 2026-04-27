"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  return (
    <nav className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center border-b border-slate-700 shadow-md">
      <div className="font-black text-lg tracking-tighter">
        MIE SYSTEM <span className="text-blue-400">H.ENGINE</span>
      </div>
      <button
        onClick={logout}
        className="text-xs bg-red-600 px-3 py-1 font-bold hover:bg-red-700 transition"
      >
        LOGOUT
      </button>
    </nav>
  );
}
