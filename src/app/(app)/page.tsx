import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/serverSession";
import { landingPath } from "@/lib/auth/landing";

export default async function Page() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  redirect(landingPath(session.accesses));
}