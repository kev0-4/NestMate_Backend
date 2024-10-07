import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { resetPasswordSchema } from "../../zod/auth";
import jwt from "jsonwebtoken";
import { hashPassword } from "../../utils/crypto";
import { withAccelerate } from "@prisma/extension-accelerate";

export const resetPassword = async (c: Context) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const { token, newPassword } = resetPasswordSchema.parse(body);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, c.env.JWT_SECRET!) as { userId: string };
    } catch (error) {
      return c.json({ error: "Invalid or expired token" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return c.json({ message: "Password has been reset successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
