"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  clientName?: string;
  onConfirm: (days: 7 | 15 | 30) => void;
};

export default function SnoozeModal({ open, onClose, clientName, onConfirm }: Props) {
  const [days, setDays] = useState<7 | 15 | 30>(7);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-lg">
        <div className="mb-1 text-sm font-semibold text-gray-900">Por quanto tempo ele não quer comprar?</div>
        <div className="mb-4 text-xs text-gray-600">
          {clientName ? (
            <div className="truncate">
              Cliente: <span className="font-medium text-gray-900">{clientName}</span>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 mb-4">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d as 7 | 15 | 30)}
              className={[
                "flex-1 rounded-xl border px-3 py-2 text-sm text-gray-500 font-semibold",
                days === d ? "border-[#2323ff] border-2 bg-[#f6f6ff]" : "border-gray-200",
              ].join(" ")}
            >
              {d} dias
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(days)}
            className="rounded-xl bg-[#2323ff] px-3 py-2 text-sm text-white hover:bg-[#1717a6]"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
