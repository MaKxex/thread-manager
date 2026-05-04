"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ThreadCard } from "@/components/thread-card";
import { AddThreadDialog } from "@/components/add-thread-dialog";

interface Catalog {
  id: number;
  name: string;
}

interface CatalogSectionProps {
  catalog: {
    id: number;
    name: string;
    threads: {
      id: number;
      number: number;
      color: string;
      hasBeen: boolean;
      items: { id: number; type: string; threadId: number }[];
    }[];
  };
  view: "color" | "traffic";
  allCatalogs: Catalog[];
}

export function CatalogSection({ catalog, view, allCatalogs }: CatalogSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (catalog.threads.length === 0) return null;

  return (
    <section key={catalog.id}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1 text-left"
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <h2 className="text-sm font-medium text-muted-foreground">
            {catalog.name}
            <span className="ml-1 text-xs text-muted-foreground/70">
              ({catalog.threads.length})
            </span>
          </h2>
        </button>
        <AddThreadDialog catalogs={allCatalogs} defaultCatalogId={catalog.id} />
      </div>

      {isOpen && (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
          {catalog.threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              view={view}
              color={thread.color}
            />
          ))}
        </div>
      )}
    </section>
  );
}
