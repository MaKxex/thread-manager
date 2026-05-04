import { createHmac } from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN!;

function hmacSHA256(key: Buffer, data: string): Buffer {
  return createHmac("sha256", key).update(data).digest();
}

export function validateInitData(initData: string): {
  valid: boolean;
  user?: { id: number; first_name: string; username?: string };
} | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { valid: false };

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

    if (computedHash !== hash) return { valid: false };

    const userJson = params.get("user");
    const user = userJson ? JSON.parse(userJson) : undefined;

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) return { valid: false };

    return { valid: true, user };
  } catch {
    return null;
  }
}