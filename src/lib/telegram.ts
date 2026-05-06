import { createHmac } from "crypto";

const RAW_BOT_TOKEN = process.env.BOT_TOKEN?.replace(/^["']|["']$/g, "").trim() ?? "";
const BOT_TOKEN = RAW_BOT_TOKEN === "your-telegram-bot-token" ? "" : RAW_BOT_TOKEN;

function hmacSHA256(key: Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

export function validateInitData(initData: string): {
  valid: boolean;
  tokenMissing?: boolean;
  user?: { id: number; first_name: string; username?: string };
} | null {
  try {
    if (!BOT_TOKEN) {
      console.error("[telegram] BOT_TOKEN is not configured in .env");
      return { valid: false, tokenMissing: true };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      console.error("[telegram] initData missing hash");
      return { valid: false };
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
      console.error("[telegram] Hash mismatch. Computed:", computedHash, "Expected:", hash);
      console.error("[telegram] Check string:", checkString);
      return { valid: false };
    }

    const userJson = params.get("user");
    const user = userJson ? JSON.parse(userJson) : undefined;

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      console.error("[telegram] auth_date expired:", authDate);
      return { valid: false };
    }

    return { valid: true, user };
  } catch (err) {
    console.error("[telegram] validateInitData exception:", err);
    return null;
  }
}