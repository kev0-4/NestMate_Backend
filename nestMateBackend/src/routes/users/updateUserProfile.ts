import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";
import { updateUserSchema } from "../../zod/user";

export const updateUserProfile = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const userId = c.req.param("userId");
    const requestingUserId = c.get("userId"); // Set by authMiddleware

    if (userId !== requestingUserId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const body = await c.req.json();
    const validatedData = updateUserSchema.parse(body);

    // Ensure preferences and similar JSON-like fields are converted into valid JSON
    const preferences = validatedData.preferences
      ? JSON.stringify(validatedData.preferences)
      : undefined;

    // Spread the validatedData object but handle preferences separately
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        preferences: preferences ? JSON.parse(preferences) : undefined, // Ensure valid JSON type
      },
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

    return c.json(updatedUser);
  } catch (error) {
    console.error("Update user profile error:", error);
    if (error.code === "P2002") {
      return c.json({ error: "Email already in use" }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
};
