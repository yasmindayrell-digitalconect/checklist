import { cookies } from "next/headers";

export type AppRole = "seller" | "admin";

export type AppUser = {
  role: AppRole;
  sellerId?: number;
  sellerName: string;
};

export async function getServerSession(): Promise<AppUser | null> {
  const cookieStore = await cookies(); // 👈 AGORA É ASYNC
  const raw = cookieStore.get("app_user")?.value;

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    return null;
  }
}
