import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { getRoomSchema } from "../../zod/room";

export const getRooms = async (c: Context) => {
  try {
    const query = c.req.query();
    const validatedQuery = getRoomSchema.parse(query);

    const { location, minRent, maxRent, roomType, availableFrom, page, limit } =
      validatedQuery;

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (location) {
      whereClause.location = {
        OR: [
          { subLocality: { contains: location, mode: "insensitive" } },
          { city: { contains: location, mode: "insensitive" } },
          { state: { contains: location, mode: "insensitive" } },
        ],
      };
    }

    if (minRent !== undefined)
      whereClause.rent = { ...whereClause.rent, gte: minRent };
    if (maxRent !== undefined)
      whereClause.rent = { ...whereClause.rent, lte: maxRent };
    if (roomType) whereClause.roomType = roomType;
    if (availableFrom)
      whereClause.availableFrom = { gte: new Date(availableFrom) };

    const [rooms, totalCount] = await Promise.all([
      prisma.room.findMany({
        where: whereClause,
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
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.room.count({ where: whereClause }),
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
    console.error("Error fetching rooms:", error);
    return c.json({ error: "Failed to fetch rooms" }, 500);
  }
};
