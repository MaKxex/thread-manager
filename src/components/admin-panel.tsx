"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthUser } from "@/lib/auth";

interface PendingUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  createdAt: Date;
}

interface AdminPanelProps {
  adminUser: AuthUser;
  pendingUsers: PendingUser[];
}

export function AdminPanel({
  adminUser,
  pendingUsers: initialPending,
}: AdminPanelProps) {
  const [pendingUsers, setPendingUsers] = useState(initialPending);
  const [telegramId, setTelegramId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [addMessage, setAddMessage] = useState<string | null>(null);

  async function approveUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}/approve`, { method: "POST" });
    if (res.ok) {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  async function rejectUser(id: string) {
    const res = await fetch(`/api/admin/users/${id}/reject`, { method: "POST" });
    if (res.ok) {
      setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    if (!telegramId.trim()) return;

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegramId: telegramId.trim(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        username: username || undefined,
      }),
    });

    if (res.ok) {
      setTelegramId("");
      setFirstName("");
      setLastName("");
      setUsername("");
      setAddMessage("Пользователь добавлен");
    } else {
      const data = await res.json();
      setAddMessage(data.error || "Ошибка");
    }

    setTimeout(() => setAddMessage(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="font-semibold">Добавить пользователя</h2>
        <form onSubmit={addUser} className="space-y-3">
          <Input
            placeholder="Telegram ID *"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button type="submit" className="w-full">Добавить</Button>
        </form>
        {addMessage && (
          <p className="text-sm text-muted-foreground">{addMessage}</p>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h2 className="font-semibold">Ожидающие подтверждения</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет ожидающих пользователей</p>
        ) : (
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 border rounded-lg p-3"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt=""
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm">
                    {(user.firstName || "?")[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName || ""} {user.lastName || ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username || user.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => approveUser(user.id)}
                  >
                    ✅ Принять
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectUser(user.id)}
                  >
                    ❌ Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}