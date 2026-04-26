const DB_URL = process.env.DB_URL_NEON;

import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DB_URL_NEON}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

export async function initDB() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Error Connecting to the Database: ", error);
    process.exit(1);
  }
}

export { prisma };
