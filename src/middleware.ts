import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil token dari cookie (untuk middleware, cookie lebih stabil daripada localStorage)
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika mencoba akses admin/kasir tapi tidak ada token -> ke login
  if (
    !token &&
    (pathname.startsWith("/admin") || pathname.startsWith("/kasir"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Jika sudah login tapi mau ke /login lagi -> lempar ke dashboard
  if (token && pathname.startsWith("/login")) {
    const role = request.cookies.get("role")?.value;
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/kasir", request.url),
    );
  }

  return NextResponse.next();
}

// Hanya jalankan middleware di rute tertentu
export const config = {
  matcher: ["/admin/:path*", "/kasir/:path*", "/login"],
};
