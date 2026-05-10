import type { Request, Response, NextFunction } from "express";
import type { AuthContext } from "./rbac.types";
import { resolveAuthContext, attachAuthContext } from "./rbac.service";
import { getUseSessionFromDB } from "@/api/auth/password/session.service";
import { redisClient } from "@/config/redis.config";
import { Prisma } from "@/generated/prisma/client";

export interface AuthenticatedRequest extends Request {
  auth?: AuthContext;
}

const EXTEND_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;
const EXTENSION_MS = 7 * 24 * 60 * 60 * 1000;

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sid = req.cookies.sid ?? null;
    if (!sid) {
      res.status(401).json({ error: "No session provided" });
      return;
    }

    const cachedSession = await checkCachedSession(sid);
    let session;

    if (cachedSession) {
      const cached = await redisClient.get(`session:${sid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        session = parsed;
      }
    }

    if (!session) {
      session = await getUseSessionFromDB(sid);
      if (!session || session.revoked) {
        res.status(401).json({ error: "Invalid or expired session" });
        return;
      }
    }

    const authContext = await resolveAuthContext(session.userId);
    await attachAuthContext(req as AuthenticatedRequest, authContext);

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

async function checkCachedSession(sid: string): Promise<boolean> {
  const key = `session:${sid}`;
  const rawSession = await redisClient.get(key);
  if (!rawSession) return false;

  try {
    const session = JSON.parse(rawSession);
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      await redisClient.del(key);
      return false;
    }

    const now = Date.now();
    if (expiresAt.getTime() - now <= EXTEND_THRESHOLD_MS) {
      const newExpiresAt = new Date(now + EXTENSION_MS).toISOString();
      session.expires_at = newExpiresAt;
      session.lastSeenAt = new Date().toISOString();

      const newTtl = Math.floor((new Date(newExpiresAt).getTime() - now) / 1000);
      await redisClient.set(key, JSON.stringify(session));
      await redisClient.expire(key, Math.max(1, newTtl));
    }

    return true;
  } catch {
    await redisClient.del(key);
    return false;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}