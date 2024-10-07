import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { preferenceSchema } from "../../zod/user";

export const updatePreferences = async (c: Context) => {
  const userId = c.req.param("userId");
  const authUser = c.get("userId");

  if (authUser.id !== userId)
    return c.json({ error: "Unauthorized to update these preferences" }, 403);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const preferences = preferenceSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { preferences: preferences },
    });

    return c.json(
      {
        message: "Preferences updated successfully",
        preferences: updatedUser.preferences,
      },
      200
    );
  } catch (error) {
    console.error("Error updating preferences:", error);
    return c.json({ error: "Failed to update preferences" }, 500);
  }
};

export const getPreferences = async (c: Context) => {
  const userId = c.req.param("userId");
  const authUser = c.get("userId");

  if (authUser.id !== userId) {
    return c.json({ error: "Unauthorized to view these preferences" }, 403);
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ preferences: user.preferences }, 200);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return c.json({ error: "Failed to fetch preferences" }, 500);
  }
};
