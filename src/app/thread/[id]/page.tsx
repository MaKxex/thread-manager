import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ThreadDetail } from "@/components/thread-detail";
import { TelegramGate } from "@/components/telegram-gate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");

  if (!userId) {
    return <TelegramGate />;
  }

  const authUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!authUser || authUser.status !== "ACTIVE") {
    return <TelegramGate />;
  }

  const { id } = await params;
  const thread = await prisma.thread.findUnique({
    where: { id: Number(id) },
    include: { catalog: true, items: true },
  });

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh">
        <p className="text-muted-foreground">Нитка не найдена</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">
            Назад
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="flex-1 px-4 pt-6 pb-24">
        <ThreadDetail thread={thread} />
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
          className="flex flex-col items-center text-xs text-muted-foreground"
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
