import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { matchSchema } from "../../zod/match";
import { calculateCompatibilityScore } from "../../utils/compatibilityScore";

export const createMatch = async (c: Context) => {
  const body = await c.req.json();
  const { userId1, userId2 } = matchSchema.parse(body);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId1 } }),
      prisma.user.findUnique({ where: { id: userId2 } }),
    ]);

    if (!user1 || !user2)
      return c.json({ error: "One or both users not found" }, 404);

    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { userId1: userId1, userId2: userId2 },
          { userId1: userId2, userId2: userId1 },
        ],
      },
    });

    if (existingMatch)
      return c.json({ error: "Match already exists between these users" }, 409);

    const compatabilityScore: number = calculateCompatibilityScore(
      user1.preferences,
      user2.preferences
    );
    const x = parseInt(compatabilityScore.toString());
    const newMatch = await prisma.match.create({
      data: {
        userId1: userId1,
        userId2: userId2,
        matchDate: new Date(),
        status: "pending",
        compatibilityScore: compatabilityScore,
        chats: [],
      },
    });
    return c.json(
      {
        message: `Match created successfully Compatibility Score ${compatabilityScore}`,
        match: newMatch,
      },
      201
    );
  } catch (error) {
    console.error("Error creating match:", error);
    return c.json({ error: "Failed to create match" }, 500);
  }
};
