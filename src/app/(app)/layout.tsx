// app/(app)/layout.tsx

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getServerSession } from "@/lib/serverSession";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <>
      {/* Header fixo */}
      <Header sellerName={session?.sellerName} />

      <div className="flex pt-16 min-w-0">
        {/* Sidebar: ocupa espaço e fica presa abaixo do header */}
        <div className="shrink-0">
          <div className="sticky top-16 h-[calc(100vh-64px)]">
            <Sidebar sellerName={session?.sellerName} />
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
