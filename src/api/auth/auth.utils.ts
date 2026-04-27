import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
export async function hashPassword(password: string) {
  const hashedPassword = await argon2.hash(password);
  return hashedPassword;
}
export async function generateHashedToken(userId: number, tokenSecret: string) {
  const token = jwt.sign({ userId }, tokenSecret);
  return token;
}
export async function generateTokens(userId: number) {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  const accessToken = await generateHashedToken(userId, accessTokenSecret);
  const refreshToken = await generateHashedToken(userId, refreshTokenSecret);

  return { accessToken, refreshToken };
}

export async function verifyPassword(
  password: string,
  dbHashedPassword: string,
) {
  const isValid = await argon2.verify(dbHashedPassword, password);
  return isValid;
}
