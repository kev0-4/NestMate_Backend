import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const deleteUser = async (c: Context) => {
  const userId = c.req.param("userId");
  const authUser = c.get("userId");

  // if (authUser.id !== userId) return c.json({ error: "Unauthorized" }, 403);
  if (authUser !== userId) return c.json({ error: "Unauthorized" }, 403);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    await prisma.match.deleteMany({
      where: { OR: [{ userId1: userId }, { userId2: userId }] },
    });
    await prisma.report.deleteMany({
      where: { OR: [{ reporterId: userId }, { reportedUserId: userId }] },
    });
    await prisma.room.deleteMany({ where: { ownerId: userId } });
    await prisma.location.deleteMany({ where: { userId: userId } });
    await prisma.user.delete({ where: { id: userId } });

    return c.json({ message: "User account deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user account" }, 500);
  }
};
