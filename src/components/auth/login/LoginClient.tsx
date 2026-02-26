// components/auth/login/LoginClient.tsx
"use client";

import React, { useMemo, useState } from "react";   
import { MonitorCog, Lock } from "lucide-react";
import Image from "next/image";

export const nav = {
  hardRedirect(dest: string) {
    window.location.assign(dest);
  },
};

export default function LoginClient() {
  const [cadastroId, setCadastroId] = useState("");
  const [senha, setSenha] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const cadastroIdClean = useMemo(() => cadastroId.replace(/\D/g, ""), [cadastroId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cadastro_id: cadastroIdClean, senha, remember }),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      const j = await res?.json().catch(() => null);
      setErr(j?.error || "Falha no login");
      return;
    }

    const j = await res.json().catch(() => ({} as any));
    const dest =
      typeof j?.redirectTo === "string" && j.redirectTo.trim()
        ? j.redirectTo
        : "/";

    nav.hardRedirect(dest); // 👈 aqui
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-10">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/BACKGROUND.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0b0f3a]/55" />
      </div>

      {/* CONTEÚDO CENTRAL */}
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
      <div className="w-full">
        {/* LOGO (em cima do card) */}
        <div className="flex justify-center -mb-20 -mt-30">
          <div className="relative w-64 sm:w-80 md:w-400 aspect-1.5/1">
            <Image
              src="/LOGO.png"
              alt="Conecta 360"
              fill
              priority
              className="object-contain object-[center_20%]"
            />
          </div>
        </div>

        {/* CARD */}
        <form
          onSubmit={onSubmit}
          className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Entrar
              </h1>
              <p className="text-sm text-white/60">
                Acesse com seu <span className="text-white/80">código de cadastro</span> e senha.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="cadastro_id" className="block text-sm font-medium text-white/80">
                Cadastro ID
              </label>
              <div
                className={[
                  "mt-2 flex items-center gap-2 rounded-2xl border bg-white/5 px-3 py-2.5",
                  err ? "border-red-500/40" : "border-white/10",
                ].join(" ")}
              >
                <MonitorCog className="h-5 w-5 text-white/60" />
                <input
                  id="cadastro_id"
                  name="cadastro_id"
                  value={cadastroId}
                  onChange={(e) => setCadastroId(e.target.value)}
                  inputMode="numeric"
                  autoComplete="username"
                  className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
                  placeholder="Seu código"
                />
              </div>
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-white/80">
                Senha
              </label>
              <div
                className={[
                  "mt-2 flex items-center gap-2 rounded-2xl border bg-white/5 px-3 py-2.5",
                  err ? "border-red-500/40" : "border-white/10",
                ].join(" ")}
              >
                <Lock className="h-5 w-5 text-white/60" />
                <input
                  id="senha"
                  name="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
                  placeholder="••••••••"
                />
              </div>
            </div>


            {err ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              disabled={loading || !cadastroIdClean || !senha}
              className="mt-1 w-full rounded-2xl px-4 py-2.5 text-[15px] font-semibold text-[#0b0f3a] shadow-lg transition
                         disabled:cursor-not-allowed disabled:opacity-60
                         bg-[#80ef80] hover:brightness-95 active:brightness-90"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="pt-1 text-xs text-white/45">
              No primeiro acesso, a senha digitada será cadastrada.
            </p>
          </div>

          {/* Rodapé sutil */}
          <div className="mt-6 flex items-center justify-between text-xs text-white/35">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#80ef80]/80" />
              By Digital Conect
            </span>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}