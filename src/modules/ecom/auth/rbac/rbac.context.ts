import type { Request, Response, NextFunction } from "express";
import type { AuthContext } from "./rbac.types";
import { resolveAuthContext } from "./rbac.service";
import { getUseSessionFromDB } from "../session/session.service";
import { redisClient } from "@/config/redis.config";
import { logger } from "@/modules/ecom/shared/logger";

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

    const session = await checkCachedSession(sid) ?? await getUseSessionFromDB(sid);

    if (!session || session.revoked) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    const authContext = await resolveAuthContext(session.userId);
    req.auth = authContext;

    next();
  } catch (error) {
    logger.error({ err: error }, "Authentication error");
    res.status(500).json({ error: "Authentication failed" });
  }
}

async function checkCachedSession(sid: string): Promise<Record<string, any> | null> {
  const key = `session:${sid}`;
  const rawSession = await redisClient.get(key);
  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession);
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      await redisClient.del(key);
      return null;
    }

    const now = Date.now();
    if (expiresAt.getTime() - now <= EXTEND_THRESHOLD_MS) {
      const newExpiresAt = new Date(now + EXTENSION_MS).toISOString();
      session.expiresAt = newExpiresAt;
      session.lastSeenAt = new Date().toISOString();

      const newTtl = Math.floor((new Date(newExpiresAt).getTime() - now) / 1000);
      await redisClient.set(key, JSON.stringify(session));
      await redisClient.expire(key, Math.max(1, newTtl));
    }

    return session;
  } catch {
    await redisClient.del(key);
    return null;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.auth) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}