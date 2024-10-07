import { Context } from "hono";
import { signupSchema } from "../../zod/auth";
import { PrismaClient } from "@prisma/client/edge";
import jwt from "jsonwebtoken";
import { withAccelerate } from "@prisma/extension-accelerate";
import { hashPassword } from "../../utils/crypto";
import { sendEmail } from '../../utils/email' // Make sure this is implemented

export const signup = async (c: Context) => {

const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  console.log(c.env.JWT_SECRET)
  try {
    const body = await c.req.json();
    const validatedData = signupSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) return c.json({ error: "User already exists" }, 400);

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        verificationStatus: false,
        preferences: {},
      },
    });

    const verificationToken = jwt.sign({ userId: newUser.id }, c.env.JWT_SECRET, { expiresIn: '1d' })
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    await sendEmail({
      to: newUser.email,
      subject: 'Verify Your Email',
      text: `Please click on the following link to verify your email: ${verificationLink}`
    })

    const token = jwt.sign({ userId: newUser.id }, c.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return c.json({ message: "User created successfully", token }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error occured" }, 500);
  }
};
