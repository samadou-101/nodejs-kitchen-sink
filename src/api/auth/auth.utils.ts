import * as argon2 from "argon2";
import jwt, { type SignOptions } from "jsonwebtoken";
export async function hashPassword(password: string) {
  const hashedPassword = await argon2.hash(password);
  return hashedPassword;
}
export async function generateHashedToken(
  userId: number,
  tokenSecret: string,
  expiresIn: Exclude<SignOptions["expiresIn"], undefined>,
) {
  const token = jwt.sign({ userId }, tokenSecret, { expiresIn });
  return token;
}
export async function generateTokens(userId: number) {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET! as string;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET! as string;

  const accessToken = await generateHashedToken(
    userId,
    accessTokenSecret,
    "15m",
  );
  const refreshToken = await generateHashedToken(
    userId,
    refreshTokenSecret,
    "7d",
  );

  return { accessToken, refreshToken };
}

export async function verifyPassword(
  password: string,
  dbHashedPassword: string,
) {
  const isValid = await argon2.verify(dbHashedPassword, password);
  return isValid;
}
