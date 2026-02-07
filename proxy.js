import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/posts/create") ||
    req.nextUrl.pathname.startsWith("/posts/update");

  if (isProtectedRoute && !isLoggedIn) {
    // Arahkan ke halaman login jika mencoba akses rute terproteksi
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

// Tentukan folder mana saja yang akan dicek oleh middleware ini
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/posts/create",
    "/posts/update/:path*",
  ],
};
