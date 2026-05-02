import type { NextFunction, Request, Response } from "express";
import { hashPassword, isExpired, verifyPassword } from "../auth.utils";
import { prisma } from "@/config/db.config";
import { Prisma } from "@/generated/prisma/client";
import type { SessionData } from "./auth.types";
import { redisClient } from "@/config/redis.config";

export async function checkAuthSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("testing session");
  try {
    const sid = req.cookies.sid ?? null;
    if (!sid) {
      res.status(401).send("Invalid Session");
      return;
    }
    const cachedSession = await checkCachedSession(sid);
    if (cachedSession) {
      return next();
    }

    const session = await getUseSessionFromDB(sid);
    if (!session) {
      res.status(401).send("Unauthorized");
      return;
    }

    return next();
  } catch (error: any) {
    res.status(500).send(`Something Went Wrong: " ${error.message}`);
  }
}

export async function registerUserSession(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const hashedPassword = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const sessionData = await createSession(user.id);
    if (sessionData !== null) {
      await cacheUserSession(sessionData);
    }
    res.cookie("sid", sessionData?.sessionId, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(201).send({ name: user.name, email: user.email });
    return;
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.send("User Already Exists (note: bad for security)");
        return;
      }
      res.send(error.message);
    }
    res.status(500).send(error.message);
  }
}

export async function loginUserSession(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      res.send(400).send("Already exists");
      return;
    }
    const isPasswordValid = await verifyPassword(
      password,
      existingUser?.password,
    );
    if (!isPasswordValid) {
      res.send(401).send("Invalid Credentials");
      return;
    }
    const sessionData = await createSession(existingUser.id);
    if (sessionData !== null) {
      await cacheUserSession(sessionData);
    }
    res.cookie("sid", sessionData?.sessionId, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res
      .status(200)
      .send({ name: existingUser.name, email: existingUser.email });
  } catch (error) {}
}

export async function createSession(
  userId: number,
): Promise<SessionData | null> {
  try {
    const session = await prisma.session.create({
      data: {
        userId,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      },
    });
    const sessionData: SessionData = {
      sessionId: session.id,
      userId,
      expires_at: session.expires_at.toISOString(),
      createdAT: session.created_at.toISOString(),
      lastSeenAt: new Date().toISOString(),
    };

    return sessionData;
  } catch (error: any) {
    console.log("Error creation the session", error.message);
    return null;
  }
}

export async function cacheUserSession(sessionData: SessionData) {
  const sessionKey = `session:${sessionData.sessionId}`;
  try {
    await redisClient.set(sessionKey, JSON.stringify(sessionData), {
      expiration: { type: "EX", value: 60 * 60 * 24 * 7 },
    });
  } catch (error: any) {
    console.log("Failed to cache session", error.meessage);
  }
}

export async function revokeSession(sid: string) {
  try {
    await redisClient.del(`session:${sid}`);
    await prisma.session.delete({
      where: {
        id: sid,
      },
    });
    return true;
  } catch (error: any) {
    return false;
  }
}

export async function checkCachedSession(sid: string): Promise<boolean> {
  const EXTEND_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
  const EXTENSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  const key = `session:${sid}`;

  const rawSession = await redisClient.get(key);
  if (!rawSession) return false;

  let session: SessionData;

  try {
    session = JSON.parse(rawSession);
  } catch {
    await redisClient.del(key);
    return false;
  }

  const now = Date.now();

  if (isExpired(session.expires_at)) {
    await revokeSession(sid);
    return false;
  }

  session.lastSeenAt = new Date().toISOString();

  const expiresAtMs = new Date(session.expires_at).getTime();

  if (expiresAtMs - now <= EXTEND_THRESHOLD_MS) {
    session.expires_at = new Date(now + EXTENSION_MS).toISOString();
  }

  const newTtlSeconds = Math.max(
    1,
    Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000),
  );
  try {
    await redisClient.set(key, JSON.stringify(session));
    await redisClient.expire(key, newTtlSeconds);
    return true;
  } catch (error: any) {
    console.log("Error Updating the session", error.message);
    return false;
  }
}

export async function getUseSessionFromDB(sid: string) {
  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sid,
      },
    });
    return session;
  } catch (error) {
    console.log("Error fetching the user session");
  }
}
