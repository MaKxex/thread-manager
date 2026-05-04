"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Catalog {
  id: number;
  name: string;
}

interface AddThreadDialogProps {
  catalogs: Catalog[];
  defaultCatalogId?: number;
}

export function AddThreadDialog({ catalogs, defaultCatalogId }: AddThreadDialogProps) {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [catalogId, setCatalogId] = useState(defaultCatalogId ? String(defaultCatalogId) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const colorInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim() || !catalogId) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: Number(number),
        catalogId: Number(catalogId),
        name: name.trim(),
        color: color,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setNumber("");
      setName("");
      setColor("");
      if (colorInputRef.current) {
        colorInputRef.current.value = "#000000";
      }
      setCatalogId("");
      setOpen(false);
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка при создании нитки");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">+ Нитка</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая нитка</DialogTitle>
          <DialogDescription>
            Выберите каталог и укажите номер нитки.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Каталог</label>
            <select
              value={catalogId}
              onChange={(e) => setCatalogId(e.target.value)}
              disabled={loading}
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
            >
              <option value="" disabled>
                Выберите каталог...
              </option>
              {catalogs.map((catalog) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Номер нитки</label>
            <Input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Например, 1234"
              disabled={loading}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Красный"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Цвет</label>
            <div className="flex items-center gap-2">
              <input
                key={open ? "picker-open" : "picker-closed"}
                ref={colorInputRef}
                type="color"
                defaultValue={color || "#000000"}
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                className="h-8 w-12 rounded-lg border border-input bg-transparent cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  setColor(val);
                  if (colorInputRef.current) {
                    colorInputRef.current.value = val || "#000000";
                  }
                }}
                placeholder="#ff0000"
                disabled={loading}
                className="flex-1"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter showCloseButton>
            <Button type="submit" disabled={loading || !number.trim() || !catalogId}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
