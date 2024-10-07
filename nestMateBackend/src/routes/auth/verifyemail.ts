import { Context } from 'hono'
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import jwt from 'jsonwebtoken'

// send token that you email
export const verifyEmail = async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

  try {
    const token = c.req.query('token')

    if (!token) {
      return c.json({ error: 'Verification token is missing' }, 400)
    }

    if (!c.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in the environment variables')
      return c.json({ error: 'Internal server error' }, 500)
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, c.env.JWT_SECRET) as { userId: string }
    } catch (error) {
      return c.json({ error: 'Invalid or expired token' }, 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId }
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    if (user.verificationStatus) {
      return c.json({ message: 'Email already verified' }, 200)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationStatus: true }
    })

    return c.json({ message: 'Email verified successfully' }, 200)
  } catch (error) {
    console.error('Email verification error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
}