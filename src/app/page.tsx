"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
    } else {
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/kasir");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-800">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white font-black tracking-widest uppercase text-sm">
          Loading System...
        </p>
      </div>
    </div>
  );
}
