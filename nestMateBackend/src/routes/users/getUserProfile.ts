import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const getUserProfile = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = c.req.param("userId");
    const requestingUserId = c.get("userId");

    if (userId !== requestingUserId)
      return c.json({ error: "Unauthorized" }, 403);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        dob: true,
        profilePictureUrl: true,
        socialMediaLinks: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
        location: true,
      },
    });
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
