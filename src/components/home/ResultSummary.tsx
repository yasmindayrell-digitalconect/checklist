"use client";

export default function ResultSummary({ summary }: { summary: any }) {
  if (!summary) return null;

  const details = summary.details || [];

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="text-gray-800 font-semibold mb-2">Resumo de Envio</div>

      <div className="space-y-1 text-sm">
        <div><strong>Total:</strong> {summary.total}</div>
        <div className="text-green-600"><strong>Sucessos:</strong> {summary.successCount}</div>
        <div className="text-red-600"><strong>Falhas:</strong> {summary.failCount}</div>
      </div>

      {details.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-gray-700 hover:underline">
            Ver Detalhes ({details.length})
          </summary>
          <div className="mt-3 overflow-auto max-h-72 border-t border-gray-200 pt-2">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="py-2 px-3">Cliente ID</th>
                  <th className="py-2 px-3">Telefone</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Mensagem</th>
                </tr>
              </thead>
              <tbody>
                {details.map((d: any, i: number) => (
                  <tr key={i} className="border-b last:border-none">
                    <td className="py-2 px-3">{d.clientId}</td>
                    <td className="py-2 px-3">{d.telefone}</td>
                    <td
                      className={`py-2 px-3 font-medium ${
                        d.ok ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {d.ok ? "Sucesso" : "Erro"}
                    </td>
                    <td className="py-2 px-3">
                      {d.data?.data?.detail || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
