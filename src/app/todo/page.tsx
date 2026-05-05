import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { TodoList } from "@/components/todo-list";
import { TelegramGate } from "@/components/telegram-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return <TelegramGate />;
  }

  const authUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!authUser || authUser.status !== "ACTIVE") {
    return <TelegramGate />;
  }

  const todos = await prisma.todo.findMany({
    orderBy: { id: "asc" },
    include: { createdBy: true },
  });

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="flex-1 px-4 pt-4 pb-24">
        <TodoList todos={todos} />
      </div>

      <nav className="fixed bottom-0 inset-x-0 border-t bg-background px-4 py-2 flex justify-around">
        <Link
          href="/"
          className="flex flex-col items-center text-xs text-muted-foreground"
        >
          🧵 Каталог
        </Link>
        <Link
          href="/todo"
          className="flex flex-col items-center text-xs text-foreground"
        >
          📋 Покупки
        </Link>
        {authUser.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex flex-col items-center text-xs text-muted-foreground"
          >
            🛡️ Админ
          </Link>
        )}
      </nav>
    </div>
  );
}