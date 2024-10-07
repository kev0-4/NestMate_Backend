import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getMatchesSchema } from "../../zod/match";

export const getMatches = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const authUser = c.get("userId");
    if (!authUser) return c.json({ error: "Unauthorized" }, 401);
    const query = c.req.query();
    const { page, limit, status } = getMatchesSchema.parse(query);

    const skip = (page - 1) * limit;

    const whereClause: any = {
      OR: [{ userId1: authUser.id }, { userId2: authUser.id }],
    };

    if (status) whereClause.status = status;

    const [matches, totalCount] = await Promise.all([
      prisma.match.findMany({
        where: whereClause,
        include: {
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
          user2: {
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
        orderBy: { matchDate: "desc" },
      }),
      prisma.match.count({ where: whereClause }),
    ]);

    // format matches to always show other users info
    const formattedMatches = matches.map((match) => ({
      ...match,
      otherUser: match.user1.id === authUser.id ? match.user2 : match.user1,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return c.json({
      matches: formattedMatches,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return c.json({ error: "Failed to fetch matches" }, 500);
  }
};
