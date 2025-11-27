"use client";
import type { Message } from "./types";

type Props = {
  messages: Message[];
  status?: string; // pode vir undefined
  title: string;
};

export default function MessagesTable({ messages, status, title }: Props) {
  // normaliza o status recebido
  const normalizedStatus = (status ?? "").toLowerCase().trim();

  const rows = messages.filter((m) => {
    const msgStatus = (m.status ?? "").toLowerCase().trim();

    // se não mandou status, não filtra por status (mostra todas)
    if (!normalizedStatus) return true;

    return msgStatus === normalizedStatus;
  });

  return (
    <div className="max-h-[37vh] w-full rounded-2xl bg-white shadow p-0 overflow-y-auto">
      <div className="sticky top-0 z-20 bg-white px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-400 italic">
          Nenhuma mensagem encontrada
        </div>
      ) : (
        <ul className="p-3 space-y-3">
          {rows.map((msg) => (
            <li
              key={msg.id_mensagem}
              className="rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition shadow-sm"
            >
              <div className="text-[13px] font-semibold text-slate-800 truncate">
                {msg.titulo}
              </div>

              <div className="text-[12px] text-slate-500 mt-0.5">
                {msg.categoria}
              </div>

              <div className="text-[12px] text-slate-600 mt-2 line-clamp-2">
                {msg.texto}
              </div>

              <div className="mt-2">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-block
                    ${
                      (msg.status ?? "").toLowerCase() === "pending"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : (msg.status ?? "").toLowerCase() === "rejected"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }
                  `}
                >
                  {(msg.status ?? "").toUpperCase()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
