"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ThreadDetailProps {
  thread: {
    id: number;
    number: number;
    name: string;
    color: string;
    hasBeen: boolean;
    items: { id: number; type: string; threadId: number }[];
  };
}

export function ThreadDetail({ thread }: ThreadDetailProps) {
  const smallItems = thread.items.filter((i) => i.type === "small");
  const bigItems = thread.items.filter((i) => i.type === "big");

  const [smallCount, setSmallCount] = useState(smallItems.length);
  const [bigCount, setBigCount] = useState(bigItems.length);

  async function addItem(type: "small" | "big") {
    const res = await fetch("/api/thread-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: thread.id, type }),
    });
    if (res.ok) {
      if (type === "small") setSmallCount((c) => c + 1);
      else setBigCount((c) => c + 1);
    }
  }

  async function removeItem(type: "small" | "big") {
    const items = type === "small" ? smallItems : bigItems;
    if (items.length === 0) return;

    const lastItem = items[items.length - 1];
    const res = await fetch("/api/thread-items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lastItem.id }),
    });
    if (res.ok) {
      if (type === "small") {
        smallItems.pop();
        setSmallCount((c) => Math.max(0, c - 1));
      } else {
        bigItems.pop();
        setBigCount((c) => Math.max(0, c - 1));
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-xl border-2"
          style={{ backgroundColor: thread.color || "#ccc" }}
        />
        <div>
          <h2 className="text-xl font-semibold">
            {thread.name || `Color #${thread.number}`}
          </h2>
          <p className="text-muted-foreground">#{thread.number}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Маленькие катушки</p>
              <p className="text-3xl font-bold mt-1">{smallCount}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => removeItem("small")}
                disabled={smallCount === 0}
              >
                −
              </Button>
              <Button size="icon" onClick={() => addItem("small")}>
                +
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Большие катушки</p>
              <p className="text-3xl font-bold mt-1">{bigCount}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => removeItem("big")}
                disabled={bigCount === 0}
              >
                −
              </Button>
              <Button size="icon" onClick={() => addItem("big")}>
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Всего: {smallCount + bigCount} катушек
      </div>
    </div>
  );
}
