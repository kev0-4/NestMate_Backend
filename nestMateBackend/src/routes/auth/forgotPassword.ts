import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { forgotPasswordSchema } from "../../zod/auth";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/email";
import { withAccelerate } from "@prisma/extension-accelerate";

export const forgotPassword = async (c: Context) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user)
      return c.json(
        {
          message:
            "If a user with that email exists, a password reset link has been sent.",
        },
        200
      );
    const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    const resetLink = `${c.env.FRONTEND_URL}/reset-password?token=${token}`;

    await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `Click the following link to reset your password: ${resetLink}`
      })

    return c.json(
      {
        message:
          "If a user with that email exists, a password reset link has been sent.",
      },
      200
    );
  } catch (error) {
    console.error(error)
    return c.json({ error: 'Internal server error' }, 500)
  }
};
