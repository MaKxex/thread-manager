"use client";

import { useState, useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { Button } from "@/components/ui/button";

export function TelegramGate() {
  const [status, setStatus] = useState<
    "loading" | "active" | "pending" | "rejected" | "new" | "no_telegram" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        const data = await res.json().catch(() => ({}));
        const err = data.error || "Unknown error";

        if (res.status === 403) {
          if (err.includes("pending")) {
            setStatus("pending");
            return;
          }
          if (err.includes("denied") || err.includes("rejected")) {
            setStatus("rejected");
            setErrorMessage(err);
            return;
          }
        }

        // Любая другая ошибка (401, 400, 500) — показываем текст ошибки
        setStatus("error");
        setErrorMessage(err);
      })
      .catch((e) => {
        setStatus("error");
        setErrorMessage("Network error: " + (e as Error).message);
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
        setErrorMessage(data.error);
      } else {
        setStatus("pending");
      }
    } catch (e) {
      setErrorMessage("Ошибка при отправке запроса: " + (e as Error).message);
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

        {status === "error" && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-500">Ошибка авторизации</p>
            <div className="rounded-md bg-muted p-3 text-left">
              <p className="text-xs text-muted-foreground break-words">
                {errorMessage}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Если ошибка &quot;Hash mismatch&quot; — проверь, что BOT_TOKEN в Vercel от того же бота, через которого открываешь приложение.
            </p>
          </div>
        )}

        {errorMessage && status !== "error" && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
