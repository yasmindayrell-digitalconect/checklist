//components\auth\login\LoginClient.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const [cadastroId, setCadastroId] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cadastro_id: cadastroId, senha }),
    }).catch(() => null);

    setLoading(false);

    if (!res || !res.ok) {
      const j = await res?.json().catch(() => null);
      setErr(j?.error || "Falha no login");
      return;
    }

    const j = await res.json().catch(() => null);
    router.replace(j?.redirectTo || "/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900">Entrar</h1>
        <p className="mt-1 text-sm text-gray-500">Use seu cadastro_id e senha.</p>
        <label htmlFor="cadastro_id" className="mt-5 block text-sm font-medium text-gray-700">
          Cadastro ID
        </label>
        <input
          id="cadastro_id"
          name="cadastro_id"
          value={cadastroId}
          onChange={(e) => setCadastroId(e.target.value)}
          inputMode="numeric"
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="ex: 12345"
        />
        <label htmlFor="senha" className="mt-4 block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          type="password"
          className="mt-2 w-full rounded-xl border px-3 py-2"
          placeholder="••••••••"
        />

        {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-3 text-xs text-gray-500">
          No primeiro acesso, a senha digitada será cadastrada.
        </p>
      </form>
    </div>
  );
}