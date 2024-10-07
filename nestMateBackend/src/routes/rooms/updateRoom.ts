import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { updateRoomSchema } from "../../zod/room";

export const updateRoom = async (c: Context) => {
  const roomId = c.req.param("roomId");
  const authUser = c.get("userId");

  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!existingRoom) {
      return c.json({ error: "Room not found" }, 404);
    }

    if (existingRoom.ownerId !== authUser.id) {
      return c.json({ error: "Unauthorized to update this room" }, 403);
    }

    const body = await c.req.json();
    const validatedData = updateRoomSchema.parse(body);

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: validatedData,
    });

    return c.json({ message: "Room updated successfully", room: updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    return c.json({ error: "Failed to update room" }, 500);
  }
};
