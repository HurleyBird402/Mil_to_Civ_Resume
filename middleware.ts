// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"], // Locks /admin and anything under it
};

export function middleware(req: NextRequest) {
  // 1. Get the username/password from the browser's built-in prompt
  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    // 2. CHECK CREDENTIALS (Change these!)
    // In a real app, these should be in process.env, but for a quick lock, this works.
    const validUser = "commander";
    const validPass = "omega-secure-123"; // matches your "adminPassword" concept

    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  // 3. If failed, trigger the browser's built-in Login Popup
  url.pathname = "/api/auth";
  return new NextResponse("Auth Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}