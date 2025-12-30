export type AppRole = "seller" | "admin";

export type AppUser = {
  role: AppRole;
  sellerId?: number;      // só quando role === "seller"
  sellerName: string;     // nome que aparece na UI
};
