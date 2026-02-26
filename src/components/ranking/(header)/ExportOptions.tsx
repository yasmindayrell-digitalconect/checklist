"use client";

import React, { useEffect } from "react";
import { X, FileDown } from "lucide-react";

type ExportKey =
  | "branches_monthly"
  | "branches_daily"
  | "sellers_week_goals"
  | "sellers_month_goals"
  | "sellers_positivation";

type ExportOption = {
  key: ExportKey;
  title: string;
  description: string;
};

const OPTIONS: ExportOption[] = [
  {
    key: "branches_monthly",
    title: "Filiais Mensal",
    description: "Consolidado mensal por filial.",
  },
  {
    key: "branches_daily",
    title: "Filiais Diário",
    description: "Detalhamento diário por filial.",
  },
  {
    key: "sellers_week_goals",
    title: "Vendedores meta semanal",
    description: "Metas semanal por vendedor.",
  },
  {
    key: "sellers_month_goals",
    title: "Vendedores meta mensal",
    description: "Metas do mês por vendedor.",
  },
  {
    key: "sellers_positivation",
    title: "Vendedores positivação",
    description: "Positivação por vendedor.",
  },
];

export default function ExportOptions({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (key: ExportKey) => void;
}) {
  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Opções de exportação"
    >
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Fechar exportação"
      />

      {/* modal */}
      <div className="relative max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-sm font-extrabold text-slate-700">Exportar dados</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              Selecione o tipo de exportação
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* options */}
        <div className="p-4">
          <div className="grid gap-3">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onSelect(opt.key)}
                className="group flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:bg-[#80ef80]/50"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                  <FileDown className="h-4 w-4" />
                </span>

                <span className="flex-1">
                  <span className="block text-sm font-bold text-slate-600">
                    {opt.title}
                  </span>
                  <span className="mt-0.5 block text-xs  text-slate-500">
                    {opt.description}
                  </span>
                </span>

                <span className="mt-1 ml-20 text-xs font-bold text-slate-400 group-hover:text-slate-600">
                  Exportar →
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 text-center text-[11px] font-semibold text-slate-400">
            Pressione <span className="font-bold text-slate-500">ESC</span> para fechar
          </div>
        </div>
      </div>
    </div>
  );
}