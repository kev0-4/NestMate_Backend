import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const getChatMessages = async (c: Context) => {
  const matchId = c.req.param("matchId");
  const userId = c.get("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return c.json({ error: "match not found" }, 404);

    if (match.userId1 !== userId && match.userId2 !== userId)
      return c.json({ error: "Unauthorized to view this chat" }, 403);

    const chatMessages = match.chats;

    return c.json({
      matchId: match.id,
      messages: chatMessages,
    });
  } catch (error) {
    console.error("Error retrieving chat messages:", error);
    return c.json({ error: "Failed to retrieve chat messages" }, 500);
  }
};
