"use client";
import SearchMensagens from "../searchMesages";
import MessagesTable from "./MessagesTable";
import { Message } from "./types";

type Props = {
  messages: Message[];
  search: string;
  setSearch: (v: string) => void;
  selectedMessageID: string;
  onSelectMessage: (id: string) => void;
};

export default function MessagesPanel({
  messages, search, setSearch, selectedMessageID, onSelectMessage,
}: Props) {
  return (
    <>
      <div className="bg-white rounded-xl shadow">
        <SearchMensagens searchQuery={search} setSearchQuery={setSearch} />
      </div>

      <div className=" rounded-xl  shadow overflow-auto max-h-[70vh]">
        <MessagesTable
          messages={messages}
          searchQuery={search}
          selectedMessageID={selectedMessageID}
          onSelectMessage={onSelectMessage}
        />
      </div>
    </>
  );
}
