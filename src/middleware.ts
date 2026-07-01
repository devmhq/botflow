import { auth } from "@/auth";
import { NextResponse } from "next/server";

const SUPERADMIN_PATHS = /^\/superadmin(\/.*)?$/;
const DASHBOARD_PATHS = /^\/dashboard(\/.*)?$/;

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isSuperadminRoute = SUPERADMIN_PATHS.test(pathname);
  const isDashboardRoute = DASHBOARD_PATHS.test(pathname);

  if (!isSuperadminRoute && !isDashboardRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSuperadminRoute && session.user.role !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/superadmin/:path*", "/dashboard/:path*"],
};
