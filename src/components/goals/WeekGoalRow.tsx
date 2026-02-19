"use client";

import React from "react";
import { formatBRL} from "@/components/utils";

export default function WeekMetaRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-3 py-2">
      <div className="text-sm text-gray-700">
        <span className="text-xs text-gray-500 mr-2">Semana</span>
        <span className="font-semibold text-[#212529]">{label}</span>
      </div>

      <div className="text-sm font-semibold text-[#212529]">
        {formatBRL(value)}
      </div>
    </div>
  );
}
