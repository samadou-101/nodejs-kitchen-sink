import type { Prisma, User } from "@/generated/prisma/client";

export type AdminData = User;

export type AdminLoginData = Omit<User, "name">;
