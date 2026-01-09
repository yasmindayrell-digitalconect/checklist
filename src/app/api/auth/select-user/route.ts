//app\api\auth\select-user\route.ts

import { NextResponse } from "next/server";
import type { AppUser } from "@/types/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as AppUser;

  if (!body?.role || !body?.sellerName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.role === "seller" && typeof body.sellerId !== "number") {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  const value = encodeURIComponent(JSON.stringify(body));

  const isHttps =
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ||
    process.env.APP_URL?.startsWith("https://");

  res.cookies.set("app_user", value, {
    httpOnly: true,
    sameSite: "lax",
    secure: Boolean(isHttps), // 
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
