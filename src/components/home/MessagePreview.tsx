"use client";
import { Message } from "./types";

export default function MessagePreview({ message }: { message?: Message }) {
  return (
    <div className="mb-3">
      <label className="text-sm text-gray-600 block mb-1">Mensagem Selecionada</label>
      {message ? (
        <div className="p-3 border rounded bg-gray-50">
          <div className="font-semibold text-gray-700">{message.titulo}</div>
          <div className="text-sm mt-1 text-gray-700">{message.texto}</div>
        </div>
      ) : (
        <div className="text-gray-400 italic">Não há mensagem selecionada. Escolha uma no painel a direita.</div>
      )}
    </div>
  );
}
