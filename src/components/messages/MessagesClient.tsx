// components/messages/MessagesClient.tsx
"use client";

import type { Message } from "./types";
import MessagesTable from "./MessagesTable";

type Props = { messages: Message[] };

export default function MessagesClient({ messages }: Props) {
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full bg-[#cacdd4]">
      <div className="flex flex-row items-start gap-4 mx-auto w-full max-w-screen-2xl px-6 xl:px-12 py-5">
            <MessagesTable
              title="Mensagens Pendentes"
              messages={messages}
              status="pending"
            />

            <MessagesTable
              title="Mensagens Recusadas"
              messages={messages}
              status="rejected"
            />
          {/* </section> */}
        {/* </div> */}
      </div>
    </main>
  );
}
