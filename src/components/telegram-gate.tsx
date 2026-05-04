"use client";

import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { Button } from "@/components/ui/button";

export function TelegramGate() {
  const [status, setStatus] = useState<
    "loading" | "active" | "pending" | "rejected" | "new" | "no_telegram"
  >("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const initData = WebApp.initData;

    if (!initData) {
      setStatus("no_telegram");
      return;
    }

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then(async (res) => {
        if (res.ok) {
          window.location.reload();
          return;
        }

        if (res.status === 403) {
          const data = await res.json();
          if (data.error?.includes("pending")) {
            setStatus("pending");
          } else if (data.error?.includes("denied") || data.error?.includes("rejected")) {
            setStatus("rejected");
          } else {
            setStatus("new");
          }
          return;
        }

        setStatus("new");
      })
      .catch(() => {
        setStatus("new");
      });
  }, []);

  async function requestAccess() {
    const initData = WebApp.initData;
    if (!initData) {
      setStatus("no_telegram");
      return;
    }

    try {
      const res = await fetch("/api/auth/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      const data = await res.json();

      if (data.status === "pending") {
        setStatus("pending");
      } else if (data.status === "active") {
        window.location.reload();
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setStatus("pending");
      }
    } catch {
      setMessage("Ошибка при отправке запроса");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center space-y-4">
        <div className="text-4xl">🧵</div>
        <h1 className="text-lg font-semibold">Thread Manager</h1>

        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Загрузка...</p>
        )}

        {status === "no_telegram" && (
          <p className="text-sm text-muted-foreground">
            Это приложение доступно только через Telegram
          </p>
        )}

        {status === "pending" && (
          <p className="text-sm text-muted-foreground">
            Запрос отправлен. Ожидайте подтверждения.
          </p>
        )}

        {status === "rejected" && (
          <div className="space-y-2">
            <p className="text-sm text-red-500">Доступ отклонён.</p>
          </div>
        )}

        {status === "new" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Для доступа необходимо авторизоваться
            </p>
            <Button onClick={requestAccess} className="w-full">
              Запросить доступ
            </Button>
          </div>
        )}

        {message && (
          <p className="text-xs text-red-500">{message}</p>
        )}
      </div>
    </div>
  );
}