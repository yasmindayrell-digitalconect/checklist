// app/(app)/layout.tsx
import Header from "@/components/header/Header";
import { getServerSession } from "@/lib/auth/serverSession";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  // opcional, mas recomendado: trava tudo do (app)
  if (!session) redirect("/login");

  return (
    <>
      <Header sellerName={session.name} accesses={session.accesses} />
      <main className="pt-16 min-w-0">{children}</main>
    </>
  );
}