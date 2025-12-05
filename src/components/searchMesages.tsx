// components/searchMesages.tsx
"use client";
import { Search } from "lucide-react";

interface Props {
  searchQuery: string;
  setSearchQuery?: (v: string) => void;
}

export default function SearchMensagens({ searchQuery, setSearchQuery }: Props) {
  return (
    <div className="w-full max-w-[65vh]">

      <div className="group relative bg-white rounded-2xl shadow px-3 py-2 flex items-center">
        <Search size={18} className="mr-2 text-gray-400 group-hover:text-blue-500 transition" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery?.(e.target.value)}
          placeholder="Pesquisar por status, categoria ou texto..."
          className="w-full bg-transparent outline-none text-gray-600 placeholder-gray-300 group-hover:placeholder-gray-400 focus:placeholder-gray-400 transition"
        />
      </div>
    </div>
  );
}
