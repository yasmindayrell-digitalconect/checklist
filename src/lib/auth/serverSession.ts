//lib\auth\serverSession.ts


import { cookies } from "next/headers";
import crypto from "crypto";
import type { AppUser } from "@/types/auth";

const COOKIE_NAME = "app_user";
const SECRET = process.env.SESSION_SECRET || "";

function isHttpsEnv() {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL;
  return Boolean(url && url.startsWith("https://"));
}

function b64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function sign(payloadB64: string) {
  if (!SECRET) throw new Error("Missing SESSION_SECRET");
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest();
  return b64url(sig);
}

function encodeUser(user: AppUser) {
  const payload = b64url(JSON.stringify(user));
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

function decodeUser(raw: string): AppUser | null {
  try {
    const [payloadB64, sig] = raw.split(".");
    if (!payloadB64 || !sig) return null;

    const expected = sign(payloadB64);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

    const json = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const parsed = JSON.parse(json) as any;

    if (!parsed?.funcionarioId || !parsed?.cadastroId || !parsed?.cargoId || !parsed?.name || !Array.isArray(parsed?.accesses)) {
      return null;
    }

    return {
      funcionarioId: Number(parsed.funcionarioId),
      cadastroId: Number(parsed.cadastroId),
      cargoId: Number(parsed.cargoId),
      name: String(parsed.name),
      accesses: parsed.accesses,
    };
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<AppUser | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeUser(raw);
}

export async function setServerSession(user: AppUser): Promise<void> {
  const store = await cookies();
  const value = encodeUser(user);

  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsEnv(),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearServerSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsEnv(),
    path: "/",
    maxAge: 0,
  });
}