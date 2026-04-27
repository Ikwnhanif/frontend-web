import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar tetap diam di kiri */}
      <Sidebar />

      {/* Konten akan scroll di kanan */}
      <main className="flex-1 h-screen overflow-y-auto">{children}</main>
    </div>
  );
}
