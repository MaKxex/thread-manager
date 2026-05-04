import { Bot, InlineKeyboard } from "grammy";
import { BOT_TOKEN } from "./config";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();
const bot = new Bot(BOT_TOKEN);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app";

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard().webApp(
    "🧵 Открыть Thread Manager",
    APP_URL
  );

  await ctx.reply("Добро пожаловать в Thread Manager!", {
    reply_markup: keyboard,
  });
});

bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const callbackUserId = ctx.callbackQuery.from.id;

  if (!data.startsWith("approve_user:") && !data.startsWith("reject_user:")) {
    return;
  }

  const telegramId = data.split(":")[1];

  try {
    const user = await prisma.user.findUnique({ where: { id: telegramId } });

    if (!user) {
      await ctx.answerCallbackQuery("Пользователь не найден.");
      return;
    }

    const displayName = user.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user.username || telegramId;

    if (data.startsWith("approve_user:")) {
      await prisma.user.update({
        where: { id: telegramId },
        data: { status: "ACTIVE" },
      });

      await ctx.editMessageText(`✅ Пользователь ${displayName} одобрен`);

      await ctx.answerCallbackQuery();

      try {
        await bot.api.sendMessage(
          telegramId,
          "🎉 Ваш запрос на доступ одобрен! Откройте Thread Manager заново."
        );
      } catch {}
    } else {
      await prisma.user.update({
        where: { id: telegramId },
        data: { status: "REJECTED" },
      });

      await ctx.editMessageText(`❌ Пользователь ${displayName} отклонён`);

      await ctx.answerCallbackQuery();

      try {
        await bot.api.sendMessage(
          telegramId,
          "Ваш запрос на доступ отклонён."
        );
      } catch {}
    }
  } catch (error) {
    console.error("Error handling callback query:", error);
    await ctx.answerCallbackQuery("Произошла ошибка.");
  }
});

export function startBot() {
  console.log("Bot started");
  bot.start();
}

export { bot };