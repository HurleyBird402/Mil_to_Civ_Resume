import { NextRequest, NextResponse } from "next/server";

export const config = {
  // Let's make the matcher explicitly catch the root and subpaths
  matcher: ["/admin", "/admin/:path*"], 
};

export function middleware(req: NextRequest) {
  // --- DEBUG LOG ---
  console.log("🛡️ MIDDLEWARE TRIGGERED on path:", req.nextUrl.pathname);

  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    const validUser = "commander";
    const validPass = "omega-secure-123";

    if (user === validUser && pwd === validPass) {
      console.log("✅ Auth Successful");
      return NextResponse.next();
    }
  }

  console.log("⛔ Auth Failed/Missing - Showing Popup");
  url.pathname = "/api/auth";
  return new NextResponse("Auth Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}