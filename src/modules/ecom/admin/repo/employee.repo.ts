import { prisma } from "@/config/db.config";

export async function insertPendingList(email: string) {
  console.log(email, "from repo");
  return await prisma.pendingEmployee.create({
    data: {
      email: email,
      isPending: true,
    },
  });
}
