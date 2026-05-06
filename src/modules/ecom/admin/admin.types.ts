import type { Prisma, User } from "@/generated/prisma/client";

export type AdminData = Omit<User, "id"> & {
  id?: number;
};

export type AdminLoginData = Omit<User, "name" | "id">;
