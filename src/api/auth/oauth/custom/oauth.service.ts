import jwt from "jsonwebtoken";
import { prisma } from "@/config/db.config";
import { getGoogleAuthURL, getGoogleTokens, getGoogleProfile } from "./oauth.utils";

export async function initiateGoogleAuth(): Promise<string> {
  return getGoogleAuthURL();
}

export async function handleGoogleCallback(code: string): Promise<string> {
  const accessToken = await getGoogleTokens(code);
  const profile = await getGoogleProfile(accessToken);

  await prisma.oAuthAccount.upsert({
    where: { provider_providerId: { provider: "google", providerId: profile.id } },
    create: {
      provider: "google",
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    },
    update: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
    },
  });

  const jwtSecret = process.env.ACCESS_TOKEN_SECRET!;
  const token = jwt.sign(
    { name: profile.name, email: profile.email, avatar: profile.picture },
    jwtSecret,
    { expiresIn: "1h" },
  );

  return token;
}
