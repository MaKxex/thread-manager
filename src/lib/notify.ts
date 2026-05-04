import { BOT_TOKEN } from "@/bot/config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function notifyAdminAccessRequest(user: {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminId || !BOT_TOKEN) return;

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.username || user.id;

  const text = `🔔 Новый запрос на доступ:\n\nИмя: ${displayName}\nUsername: ${user.username ? "@" + user.username : "—"}\nID: ${user.id}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Принять", callback_data: `approve_user:${user.id}` },
        { text: "❌ Отклонить", callback_data: `reject_user:${user.id}` },
      ],
    ],
  };

  try {
    await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminId,
          text,
          reply_markup: keyboard,
        }),
      }
    );
  } catch (error) {
    console.error("Failed to notify admin:", error);
  }
}