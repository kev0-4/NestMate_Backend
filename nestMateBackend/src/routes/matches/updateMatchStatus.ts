import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { updateMatchStatusSchema } from "../../zod/match";

export const updateMatchStatus = async (c: Context) => {
  const matchId = c.req.param("matchId");
  const authUser = c.get("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const { status } = updateMatchStatusSchema.parse(body);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return c.json({ error: "Match not found" }, 404);

    if (match.userId1 !== authUser.id && match.userId2 !== authUser.id)
      return c.json({ error: "Unauthorized to update this match" }, 403);

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status },
    });

    return c.json({
      message: "Match status updated successfully",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Error updating match status:", error);
    return c.json({ error: "Failed to update match status" }, 500);
  }
};
