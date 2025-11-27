"use client";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
};

export default function HistoryFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
      {/* Busca */}
      <div className="flex-1">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Buscar
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cliente, telefone ou título da mensagem..."
          className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      {/* Filtro de status */}
      <div className="w-full md:w-48">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-600 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full border border-gray-300 text-gray-500 rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">Todos</option>
          <option value="sent">Enviado</option>
          <option value="failed">Falhou</option>
          <option value="read">Lido</option>
        </select>
      </div>
    </div>
  );
}
