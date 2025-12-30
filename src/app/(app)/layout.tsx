import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex pt-16 min-w-0">
        {/* Sidebar: ocupa espaço e fica preso abaixo do header */}
        <div className="shrink-0">
          <div className="sticky top-16 h-[calc(100vh-64px)]">
            <Sidebar />
          </div>
        </div>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </>
  );
}
