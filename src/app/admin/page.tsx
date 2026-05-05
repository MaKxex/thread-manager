import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPanel } from "@/components/admin-panel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userRole = headersList.get("x-user-role");

  if (!userId || userRole !== "ADMIN") {
    redirect("/");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect("/");
  }

  const pendingUsers = await prisma.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">🛡️ Админ-панель</h1>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Каталог
        </Link>
      </div>

      <div className="flex-1 px-4 pb-20">
        <AdminPanel adminUser={user} pendingUsers={pendingUsers} />
      </div>

      <nav className="fixed bottom-0 inset-x-0 border-t bg-background px-4 py-2 flex">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground"
        >
          🧵 Каталог
        </Link>
        <Link
          href="/todo"
          className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground"
        >
          📋 Покупки
        </Link>
      </nav>
    </div>
  );
}