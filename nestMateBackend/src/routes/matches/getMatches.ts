import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getMatchesSchema } from "../../zod/match";

export const getMatches = async (c: Context) => {
  try {
    // Initialize Prisma
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    // Get user ID from context
    const userId = c.get("userId");
    //console.log("👤 Authenticated User ID:", userId);
    if (!userId) return c.json({ error: "Unauthorized" }, 401);

    // Parse query params
    const rawQuery = c.req.query();
    //console.log("🔍 Raw Query Params:", rawQuery);

    const { page, limit, status } = getMatchesSchema.parse(rawQuery);
    //console.log("✅ Parsed Query Params:", { page, limit, status });

    // Pagination
    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      OR: [{ userId1: userId }, { userId2: userId }],
      ...(status ? { status } : {}),
    };
    //console.log("📦 Match Filter:", where);

    // Fetch data from DB
    const [matches, totalCount] = await Promise.all([
      prisma.match.findMany({
        where,
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
      prisma.match.count({ where }),
    ]);

    //console.log("📥 Raw Matches from DB:", matches);
    //console.log("🔢 Total Matches Found:", totalCount);

    // Reformat to always show the 'other user'
    const formattedMatches = matches.map((match) => {
      const otherUser = match.user1.id === userId ? match.user2 : match.user1;
      return { ...match, otherUser };
    });

    //console.log("🎯 Final Formatted Matches:", formattedMatches);

    // Pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    //console.log("📊 Pagination Info:", pagination);

    // Final response
    return c.json({
      matches: formattedMatches,
      pagination,
    });
  } catch (err) {
    console.error("❌ Error fetching matches:", err);
    return c.json({ error: "Failed to fetch matches" }, 500);
  }
};
