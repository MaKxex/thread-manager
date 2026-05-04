import { SignJWT, jwtVerify } from "jose";
import { UserRole, UserStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { validateInitData } from "@/lib/telegram";

export type AuthUser = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  role: UserRole;
  status: UserStatus;
};

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string; code: number };

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

export async function signInWithTelegram(initData: string): Promise<AuthResult> {
  const result = validateInitData(initData);

  if (!result || !result.valid) {
    return { ok: false, error: "Invalid init data", code: 401 };
  }

  const telegramUser = result.user!;
  const userId = String(telegramUser.id);

  const parsedUser = JSON.parse(
    new URLSearchParams(initData).get("user")!
  ) as Record<string, unknown>;

  const firstName: string | null = telegramUser.first_name ?? null;
  const lastName: string | null = (parsedUser.last_name as string) ?? null;
  const username: string | null = telegramUser.username ?? null;
  const photoUrl: string | null = (parsedUser.photo_url as string) ?? null;

  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;

  let user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const isAdmin = adminTelegramId && userId === adminTelegramId;
    user = await prisma.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        username,
        photoUrl,
        role: isAdmin ? UserRole.ADMIN : UserRole.USER,
        status: isAdmin ? UserStatus.ACTIVE : UserStatus.PENDING,
      },
    });
  } else {
    if (user.status === UserStatus.REJECTED) {
      return { ok: false, error: "Access denied", code: 403 };
    }

    if (user.status === UserStatus.PENDING) {
      return { ok: false, error: "Account pending approval", code: 403 };
    }

    user = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, username, photoUrl },
    });
  }

  return { ok: true, user: user as AuthUser };
}

export async function createSession(user: AuthUser): Promise<string> {
  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SEVEN_DAYS_SECONDS}s`)
    .setSubject(user.id)
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(
  token: string
): Promise<{ sub: string; role: UserRole } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      sub: payload.sub as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  request: Request
): Promise<AuthUser | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]*)/);
  if (!match) return null;

  const token = match[1];
  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  return (user as AuthUser) ?? null;
}

export async function requireAuth(
  request: Request,
  options?: { role?: "ADMIN" }
): Promise<AuthResult> {
  const user = await getCurrentUser(request);

  if (!user) {
    return { ok: false, error: "Not authenticated", code: 401 };
  }

  if (user.status === UserStatus.REJECTED) {
    return { ok: false, error: "Access denied", code: 403 };
  }

  if (user.status === UserStatus.PENDING) {
    return { ok: false, error: "Account pending approval", code: 403 };
  }

  if (options?.role === "ADMIN" && user.role !== UserRole.ADMIN) {
    return { ok: false, error: "Admin access required", code: 403 };
  }

  return { ok: true, user };
}

export function setAuthCookie(token: string): Record<string, string> {
  return {
    "Set-Cookie": `auth_token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SEVEN_DAYS_SECONDS}`,
  };
}

export function clearAuthCookie(): Record<string, string> {
  return {
    "Set-Cookie":
      "auth_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
  };
}