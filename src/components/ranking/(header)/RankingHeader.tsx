"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { formatBRL, formatPct } from "@/components/utils";
import RankingBranchRow from "./RankingBranchRow";
import type { BranchRow, RankingSellerRow } from "@/types/ranking";
import { FileDown } from "lucide-react";
import ExportOptions from "./ExportOptions";
import RankingExportRender from "./RankingExportRender";
import { toPng } from "html-to-image";

type ExportKey =
  | "branches_monthly"
  | "branches_daily"
  | "sellers_week_goals"
  | "sellers_month_goals"
  | "sellers_positivation";

type SortKey = "week" | "monthGoal" | "positivity";
type SortDir = "desc" | "asc";

export default function RankingHeader({
  weekOffset,
  weekLabel,
  monthLabel,
  totalMonthGoal,
  totalMonthSold,
  totalMonthPct,
  byBranch,
  sellers,
  sortKey,
  sortDir,
  onChangeSortKey,
  onToggleSortDir,
}: {
  weekOffset: number;
  weekLabel: string;
  monthLabel: string;
  totalMonthGoal: number;
  totalMonthSold: number;
  totalMonthPct: number;
  byBranch: BranchRow[];
  sellers: RankingSellerRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSortKey: (k: SortKey) => void;
  onToggleSortDir: () => void;
}) {
  const [showBranches, setShowBranches] = useState(true);
  const [showExport, setShowExport] = useState(false);

  const [exportKey, setExportKey] = useState<ExportKey | null>(null);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  async function handleSelect(key: ExportKey) {
    setShowExport(false);
    setExporting(true);
    setExportKey(key);

    // 1) aguarda render + layout
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    // 2) aguarda fonts (se existir)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (document as any).fonts?.ready?.catch?.(() => null);

    // 3) mais 1 frame pra garantir medidas corretas
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    const node = exportRef.current;
    if (!node) {
      setExporting(false);
      setExportKey(null);
      return;
    }

    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width || 1080);
    const height = Math.ceil(rect.height || 1200);

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        width,
        height,
      });

      const safeKey = key.replaceAll("_", "-");
      const fileName = `ranking-${safeKey}-${new Date().toISOString().slice(0, 10)}.png`;

      // dataURL -> Blob
      const blob = await (await fetch(dataUrl)).blob();

      // ✅ Tenta copiar a imagem pro clipboard (melhor experiência no desktop)
      if (navigator.clipboard && "ClipboardItem" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ClipboardItemAny = (window as any).ClipboardItem;

        await navigator.clipboard.write([
          new ClipboardItemAny({ "image/png": blob }),
        ]);

        window.open("https://web.whatsapp.com", "_blank", "noopener,noreferrer");
        alert("Imagem copiada! No WhatsApp Web, escolha o chat e cole (Ctrl+V) para enviar.");
        return;
      }

      // fallback: abre WhatsApp Web e baixa o arquivo (caso clipboard não suporte)
      window.open("https://web.whatsapp.com", "_blank", "noopener,noreferrer");

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    } catch (e) {
      console.error("export png failed", e);
    } finally {
      setExporting(false);
      setExportKey(null);
    }
  }

  return (
    <>
      {/* ✅ Top bar ORIGINAL (com botões) */}
      <div className="px-4 sm:px-6 py-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
        {/* Left */}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-[#212529]">Ranking</h1>
          <p className="text-xs text-[#495057]">
            Acompanhe o desempenho semanal e a projeção mensal.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Link
              href="/goals"
              className="inline-flex items-center justify-center rounded-md bg-[#58da58] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition"
            >
              Editar metas
            </Link>

            <button
              type="button"
              onClick={() => setShowBranches((v) => !v)}
              className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition"
            >
              {showBranches ? "Ocultar filiais" : "Ver filiais"}
            </button>

            <button
              type="button"
              className="flex gap-1 items-center justify-center rounded-md bg-white px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition disabled:opacity-60"
              onClick={() => setShowExport(true)}
              disabled={exporting}
            >
              {exporting ? "Gerando..." : "Exportar"}{" "}
              <FileDown className="h-4 w-4 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Right (KPIs + week) */}
        <div className="flex flex-col gap-12 sm:flex-row sm:items-center sm:justify-end">
          <div className="text-center sm:text-left">
            <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Meta geral mês
            </div>
            <div className="text-2xl font-extrabold tabular-nums text-slate-900">
              {formatBRL(totalMonthGoal)}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">{monthLabel}</div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Realizado
            </div>
            <div className="text-2xl font-extrabold tabular-nums text-slate-400">
              {formatBRL(totalMonthSold)}
            </div>
            <div className="text-right font-bold text-sm text-[#80ef80]">
              {formatPct(totalMonthPct)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/ranking?weekOffset=${weekOffset - 1}`}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                aria-label="Semana anterior"
              >
                ‹
              </Link>

              <div className="text-center">
                <div className="text-[11px] font-semibold text-slate-600">Semana</div>
                <div className="text-sm font-extrabold tabular-nums text-slate-900">
                  {weekLabel}
                </div>
              </div>

              <Link
                href={`/ranking?weekOffset=${weekOffset + 1}`}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                aria-label="Próxima semana"
              >
                ›
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filiais */}
      {showBranches && <RankingBranchRow rows={byBranch} />}

      {/* Sticky header de colunas + sort */}
      <div className="sticky top-0 z-30 mt-5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-gray-100 backdrop-blur border-y border-slate-200">
        <div className="grid grid-cols-[280px_1fr_1fr_0.5fr_0.1fr] gap-6 items-start">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-10">
            Vendedor
          </div>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-10">
            Semana
            <div className="text-[11px] font-semibold text-slate-400 normal-case tracking-normal">
              {weekLabel}
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-12">
            Meta Mensal
            <div className="text-[11px] font-semibold text-slate-400 normal-case tracking-normal">
              {monthLabel}
            </div>
          </div>

          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-8">
            Positivação
            <div className="text-[11px] font-semibold text-slate-400 normal-case tracking-normal">
              {monthLabel}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-3">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Ordenar
            </span>

            <select
              value={sortKey}
              onChange={(e) => onChangeSortKey(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
            >
              <option value="week">Meta Semanal</option>
              <option value="monthGoal">Meta mensal</option>
              <option value="positivity">Positivação</option>
            </select>

            <button
              type="button"
              onClick={onToggleSortDir}
              disabled={sortKey === "week"}
              className={[
                "h-8 rounded-lg border px-2 text-xs font-bold",
                sortKey === "week"
                  ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              title={sortKey === "week" ? "Ordenação padrão da semana" : "Alternar asc/desc"}
            >
              {sortDir === "desc" ? "↓" : "↑"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de export */}
      {showExport && (
        <ExportOptions
          open={showExport}
          onClose={() => setShowExport(false)}
          onSelect={handleSelect}
        />
      )}

      {/* Render oculto pro PNG */}
     <div
      style={{ position: "fixed", left: -10000, top: 0, width: 800, pointerEvents: "none", zIndex: -1 }}
    >
      <RankingExportRender
        ref={exportRef}
        exportKey={exportKey}
        weekLabel={weekLabel}
        monthLabel={monthLabel}
        sellers={sellers}
        byBranch={byBranch}
      />
    </div>
    </>
  );
}