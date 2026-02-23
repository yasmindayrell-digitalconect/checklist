import type { AppAccess } from "@/lib/auth/access";

const ORDER: AppAccess[] = ["crm", "dashboard", "ranking", "finance"];

export function landingPath(accesses: AppAccess[]) {
  for (const a of ORDER) {
    if (accesses.includes(a)) {
      if (a === "crm") return "/crm";
      if (a === "dashboard") return "/dashboard";
      if (a === "ranking") return "/ranking";
      if (a === "finance") return "/finance";
    }
  }
  return "/login"; // fallback
}