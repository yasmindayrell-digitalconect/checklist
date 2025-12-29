import { NextResponse } from "next/server";

type AppRole = "seller" | "admin";

type AppUser = {
  role: AppRole;
  sellerId?: number;
  sellerName: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as AppUser;

  if (!body?.role || !body?.sellerName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (body.role === "seller" && typeof body.sellerId !== "number") {
    return NextResponse.json({ error: "Missing sellerId" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  // cookie httpOnly => server consegue ler, client não
  res.cookies.set("app_user", JSON.stringify(body), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return res;
}
