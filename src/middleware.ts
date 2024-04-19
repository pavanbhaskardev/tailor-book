import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/support",
    "/api/customer-order",
    "/(customer-order)(.*)",
  ],
  ignoredRoutes: ["/support"],
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Logged in user can't access the home page
    if (auth.userId && req.url === process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.redirect(new URL("/orders", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
