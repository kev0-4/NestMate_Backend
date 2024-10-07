import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { filterMatchSchema } from "../../zod/match";

export const filterMatches = async (c: Context) => {
  try {
    const query = c.req.query();
    const validatedQuery = filterMatchSchema.parse(query);

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const {
      userId,
      location,
      minBudget,
      maxBudget,
      ageMin,
      ageMax,
      gender,
      page,
      limit,
    } = validatedQuery;

    const skip = (page - 1) * limit;

    const userMatches = await prisma.match.findMany({
      where: {
        OR: [{ userId1: userId }, { userId2: userId }],
        status: "accepted", // consider accepted matches, else just remove it
      },
      select: {
        userId1: true,
        userId2: true,
      },
    });

    const matchedUserIds = userMatches
      .flatMap((match) => [match.userId1, match.userId2])
      .filter((id) => id !== userId);

    const whereClause: any = {
      id: { in: matchedUserIds },
    };

    if (location) {
      whereClause.location = {
        OR: [
          { subLocality: { contains: location, mode: "insensitive" } },
          { city: { contains: location, mode: "insensitive" } },
          { state: { contains: location, mode: "insensitive" } },
        ],
      };
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      whereClause.preferences = whereClause.preferences || {};
      whereClause.preferences.budget = {};
      if (minBudget !== undefined)
        whereClause.preferences.budget.gte = minBudget;
      if (maxBudget !== undefined)
        whereClause.preferences.budget.lte = maxBudget;
    }

    if (ageMin !== undefined || ageMax !== undefined) {
      const now = new Date();
      if (ageMin !== undefined) {
        const maxDob = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate()
        );
        whereClause.dob = { ...(whereClause.dob || {}), lte: maxDob };
      }
      if (ageMax !== undefined) {
        const minDob = new Date(
          now.getFullYear() - ageMax - 1,
          now.getMonth(),
          now.getDate()
        );
        whereClause.dob = { ...(whereClause.dob || {}), gte: minDob };
      }
    }

    if (gender) whereClause.gender = gender;

    const [filteredMatches, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          gender: true,
          dob: true,
          profilePictureUrl: true,
          location: true,
          preferences: true,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return c.json({
      matches: filteredMatches,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error filtering matches:", error);
    return c.json({ error: "Failed to filter matches" }, 500);
  }
};
