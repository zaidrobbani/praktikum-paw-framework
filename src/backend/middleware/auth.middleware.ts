import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/backend/lib/jwt";

export function withAuth<TContext = unknown>(
  handler: (
    req: NextRequest,
    context: TContext,
  ) => Promise<NextResponse | Response> | NextResponse | Response,
) {
  return async (req: NextRequest, context: TContext) => {
    // 1. Cek dari header Authorization
    let token = req.headers.get("authorization")?.split("Bearer ")[1];

    // 2. Jika tidak ada di header, cek dari cookie
    if (!token) {
      token = req.cookies.get("accessToken")?.value;
    }

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const payload = verifyAccessToken(token) as { userId: string };

      // ✅ Inject via NextRequest headers — body tidak ikut di-clone
      const newHeaders = new Headers(req.headers);
      newHeaders.set("x-user-id", payload.userId);

      const requestWithUser = new NextRequest(req.url, {
        method: req.method,
        headers: newHeaders,
        body: req.body, // ← stream langsung, tidak di-consume
        duplex: "half", // ← wajib kalau body di-forward
      });

      return handler(requestWithUser, context);
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
  };
}
