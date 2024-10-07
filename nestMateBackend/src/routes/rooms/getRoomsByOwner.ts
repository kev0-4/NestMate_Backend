import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { getRoomsByOwnerSchema } from "../../zod/room";

export const getRoomsByOwner = async (c: Context) => {
  const ownerId = c.req.param("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const query = c.req.query();
    const { page, limit } = getRoomsByOwnerSchema.parse(query);

    const skip = (page - 1) * limit;

    const [rooms, totalCount] = await Promise.all([
      prisma.room.findMany({
        where: { ownerId },
        include: {
          location: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.room.count({ where: { ownerId } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return c.json({
      rooms,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms by owner:", error);
    return c.json({ error: "Failed to fetch rooms" }, 500);
  }
};
