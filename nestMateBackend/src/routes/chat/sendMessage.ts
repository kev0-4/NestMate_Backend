import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sendmessageSchema } from "../../zod/chat";

export const sendMessage = async (c: Context) => {
  const matchId = c.req.param("matchid");
  const senderId = c.get("userId");

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { content } = sendmessageSchema.parse(body);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return c.json({ error: "match not found" }, 404);

    if (match.userId1 !== senderId && match.userId2 !== senderId)
      return c.json(
        { error: "Unauthorized to send message in this chat" },
        403
      );

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        chats: {
          push: {
            senderId,
            content,
            timestamp: new Date(),
          },
        },
      },
    });

    return c.json(
      {
        message: "Message sent successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
};
