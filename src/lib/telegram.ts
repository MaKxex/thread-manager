import { createHmac } from "crypto";

const RAW_BOT_TOKEN = process.env.BOT_TOKEN?.replace(/^["']|["']$/g, "").trim() ?? "";
const BOT_TOKEN = RAW_BOT_TOKEN === "your-telegram-bot-token" ? "" : RAW_BOT_TOKEN;

function hmacSHA256(key: Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

export type ValidateResult =
  | { valid: true; user: { id: number; first_name: string; username?: string } }
  | { valid: false; reason: string };

export function validateInitData(initData: string): ValidateResult {
  try {
    if (!BOT_TOKEN) {
      return { valid: false, reason: "Bot token not configured on server" };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return { valid: false, reason: "Missing hash in Telegram data" };
    }

    params.delete("hash");

    const secretKey = hmacSHA256(
      Buffer.from(BOT_TOKEN, "utf-8"),
      "WebAppData"
    );

    const checkString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const computedHash = createHmac("sha256", secretKey)
      .update(checkString)
      .digest("hex");

    if (computedHash !== hash) {
      return { valid: false, reason: "Hash mismatch (wrong bot token?)" };
    }

    const userJson = params.get("user");
    if (!userJson) {
      return { valid: false, reason: "Missing user in Telegram data" };
    }
    const user = JSON.parse(userJson);

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 7 * 86400) {
      return { valid: false, reason: "Telegram data expired (auth_date too old)" };
    }

    return { valid: true, user };
  } catch (err) {
    return { valid: false, reason: "Validation exception: " + (err as Error).message };
  }
}