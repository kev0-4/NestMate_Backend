// Authorization: Bearer your_jwt_token_here

import { Context, Next } from "hono";
import jwt from "jsonwebtoken";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET!) as {
      userId: string;
    };
    c.set("userId", decoded.userId);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
};
