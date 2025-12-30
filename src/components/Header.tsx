"use client";

import Image from "next/image";
import { useMemo } from "react";

function firstName(fullName?: string) {
  if (!fullName) return "";
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  return cleaned.split(" ")[0] ?? "";
}

export default function Header({ sellerName }: { sellerName?: string }) {
  const name = useMemo(() => firstName(sellerName), [sellerName]);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 h-16
        bg-[#2323ff] shadow-2xl
        flex items-center justify-between
        px-3 z-50
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src="/150x50.png"
          alt="Logo"
          width={200}
          height={200}
          className="h-14 w-auto"
          priority
        />
      </div>

      {name && (
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-white/80">
            Olá,
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
            {name}
          </span>
        </div>
      )}
    </header>
  );
}
