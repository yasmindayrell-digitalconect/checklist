import { CircleUserRound } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import HeaderTabs from "./Tabs";
import HeaderActions from "./HeaderClient";
import type { AppAccess } from "@/lib/auth/access";

export default function Header({
  sellerName,
  accesses,
}: {
  sellerName?: string;
  accesses: AppAccess[];
}) {
  return (
    <header className="fixed top-0 left-0 right-0 h-28 sm:h-16 bg-[#2323ff] shadow-2xl z-50">
      <div className="h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <ProfileAvatar
            name={sellerName}
            size={35}
            className="shrink-0 ring-2 ring-white/20"
            fallback={<CircleUserRound size={24} strokeWidth={1} className="text-white" />}
          />
          <div className="text-sm font-semibold text-white/80 hidden sm:block">
            Olá, {sellerName}
          </div>
        </div>

        <div className="hidden sm:flex flex-1 justify-center px-6">
          <HeaderTabs accesses={accesses} />
        </div>

        <HeaderActions sellerName={sellerName} />
      </div>

      <div className="sm:hidden px-4 pb-3">
        <HeaderTabs accesses={accesses} />
      </div>
    </header>
  );
}