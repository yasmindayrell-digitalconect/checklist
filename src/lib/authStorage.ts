// //lib/authStorage.ts

// import type { AppUser } from "@/types/auth";

// const KEY = "app_user_v1";

// export function loadUser(): AppUser | null {
//   if (typeof window === "undefined") return null;
//   try {
//     const raw = localStorage.getItem(KEY);
//     if (!raw) return null;
//     return JSON.parse(raw) as AppUser;
//   } catch {
//     return null;
//   }
// }

// export function saveUser(user: AppUser) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(KEY, JSON.stringify(user));
// }

// export function clearUser() {
//   if (typeof window === "undefined") return;
//   localStorage.removeItem(KEY);
// }
