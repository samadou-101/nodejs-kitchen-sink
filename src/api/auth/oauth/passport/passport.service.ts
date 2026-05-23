import jwt from "jsonwebtoken";
import { prisma } from "@/config/db.config";
import type { Profile } from "passport-google-oauth20";

export async function handleGoogleCallback(profile: Profile): Promise<string> {
  const id = profile.id;
  const email = profile.emails?.[0]?.value ?? "";
  const name = profile.displayName;
  const avatarUrl = profile.photos?.[0]?.value ?? "";

  await prisma.oAuthAccount.upsert({
    where: { provider_providerId: { provider: "google", providerId: id } },
    create: {
      provider: "google",
      providerId: id,
      email,
      name,
      avatarUrl,
    },
    update: {
      email,
      name,
      avatarUrl,
    },
  });

  const jwtSecret = process.env.ACCESS_TOKEN_SECRET!;
  const token = jwt.sign(
    { name, email, avatar: avatarUrl },
    jwtSecret,
    { expiresIn: "1h" },
  );

  return token;
}
