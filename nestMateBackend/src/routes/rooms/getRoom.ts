import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const getRoom = async (c: Context) => {
  const roomId = c.req.param("roomId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        location: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    if (!room) {
      return c.json({ error: "Room not found" }, 404);
    }
    return c.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return c.json({ error: "Failed to fetch room" }, 500);
  }
};
