import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const deleteRoom = async (c: Context) => {
  const roomId = c.req.param("roomId");
  const authUser = c.get("userId");

  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }

    if (room.ownerId !== authUser.id) {
      return c.json({ error: "Unauthorized to delete this room" }, 403);
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return c.json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return c.json({ error: "Failed to delete room" }, 500);
  }
};
