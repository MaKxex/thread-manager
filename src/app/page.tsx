import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Input } from "@/components/ui/input";
import { AddCatalogDialog } from "@/components/add-catalog-dialog";
import { CatalogSection } from "@/components/catalog-section";
import { TelegramGate } from "@/components/telegram-gate";
import Link from "next/link";
export const dynamic = "force-dynamic";

type ViewMode = "color" | "traffic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let authUser = null;

  if (token) {
    const payload = await verifySession(token);
    if (payload) {
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user && user.status === "ACTIVE") {
        authUser = user;
      }
    }
  }

  if (!authUser) {
    return <TelegramGate />;
  }

  const { q, view } = await searchParams;

  const catalogs = await prisma.catalog.findMany({
    include: { threads: { orderBy: { number: "asc" }, include: { items: true } } },
    orderBy: { id: "asc" },
  });

  if (catalogs[0]?.threads[0]) {
    console.log("Thread sample:", catalogs[0].threads[0].number, catalogs[0].threads[0].color);
  }

  const search = (q || "").toLowerCase();
  const currentView: ViewMode = view === "traffic" ? "traffic" : "color";

  const filtered = catalogs.map((catalog) => ({
    ...catalog,
    threads: catalog.threads.filter(
      (t) =>
        !search ||
        String(t.number).includes(search) ||
        String(t.number).padStart(4, "0").includes(search)
    ),
  }));

  const totalThreads = filtered.reduce((sum, c) => sum + c.threads.length, 0);

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <div className="px-4 py-3 space-y-3">
        <form>
          <Input
            name="q"
            placeholder="Поиск по номеру..."
            defaultValue={search}
            className="w-full"
          />
        </form>
        <div className="flex gap-2">
          <Link
            href={`?${new URLSearchParams({ ...(search ? { q: search } : {}), view: "color" }).toString()}`}
            className={`flex-1 text-center text-xs py-1.5 rounded-md border transition-colors ${
              currentView === "color"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border"
            }`}
          >
            🎨 По цвету
          </Link>
          <Link
            href={`?${new URLSearchParams({ ...(search ? { q: search } : {}), view: "traffic" }).toString()}`}
            className={`flex-1 text-center text-xs py-1.5 rounded-md border transition-colors ${
              currentView === "traffic"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted border-border"
            }`}
          >
            🚦 Светофор
          </Link>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-6">
        {filtered.map((catalog) => (
          <CatalogSection
            key={catalog.id}
            catalog={catalog}
            view={currentView}
            allCatalogs={catalogs.map((c) => ({ id: c.id, name: c.name }))}
          />
        ))}
        <div className="pt-4">
          <AddCatalogDialog />
        </div>
      </div>

      <nav className="fixed bottom-0 inset-x-0 border-t bg-background px-4 py-2 flex">
        <Link
          href="/"
          className="flex flex-1 flex-col items-center justify-center text-xs text-foreground"
        >
          🧵 Каталог
        </Link>
        <Link
          href="/todo"
          className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground"
        >
          📋 Покупки
        </Link>
        {authUser.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground"
          >
            🛡️ Админ
          </Link>
        )}
      </nav>
    </div>
  );
}
