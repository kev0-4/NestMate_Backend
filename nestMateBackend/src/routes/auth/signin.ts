import { Context } from "hono";
import { signinSchema } from "../../zod/auth";
import { PrismaClient } from "@prisma/client/edge";
import jwt from "jsonwebtoken";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verifyPassword, isPasswordHashed } from "../../utils/crypto";

export const signin = async (c: Context) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const validatedData = signinSchema.parse(body);

    // Step 1: Check KV cache
    const cachedUser = await c.env.KV.get(`user:${validatedData.email}`);
    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET!, {
        expiresIn: "1d",
      });
      return c.json({ message: "Signed in (from KV cache)", token, cached: true });
    }

    // Step 2: DB Lookup
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (!user || !user.password)
      return c.json({ error: "Invalid Credentials" }, 401);

    if (!isPasswordHashed(user.password)) {
      console.error(`User ${user.id} has an unhashed password`);
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const isPasswordValid = await verifyPassword(
      user.password,
      validatedData.password
    );
    if (!isPasswordValid)
      return c.json({ error: "Invalid credentials" }, 401);

    // Step 3: Save to KV (cache for 1 hour)
    const userToCache = { id: user.id, email: user.email };
    await c.env.KV.put(`user:${validatedData.email}`, JSON.stringify(userToCache), {
      expirationTtl: 3600, // 1 hour
    });

    const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    return c.json({ message: "Signed in successfully", token, cached: false });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error occurred" }, 500);
  }
};


// import { Context } from "hono";
// import { signinSchema } from "../../zod/auth";
// import { PrismaClient } from "@prisma/client/edge";
// import jwt from "jsonwebtoken";
// import { withAccelerate } from "@prisma/extension-accelerate";
// import { verifyPassword, isPasswordHashed } from "../../utils/crypto";

// export const signin = async (c: Context) => {
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());

//   try {
//     const body = await c.req.json();
//     const validatedData = signinSchema.parse(body);

//     const user = await prisma.user.findUnique({
//       where: { email: validatedData.email },
//     });
//     if (!user || !user.password)
//       return c.json({ error: "Invalid Credentials" }, 401);

//     if (!isPasswordHashed(user.password)) {
//       console.error(`User ${user.id} has an unhashed password`);
//       return c.json({ error: 'Invalid credentials' }, 401);
//     }

//     const isPasswordValid = await verifyPassword(
//       user.password,
//       validatedData.password,

//     );
//     if (!isPasswordValid) return c.json({ error: "Invalid credentials" }, 401);
//     console.log(isPasswordValid)
//     const token = jwt.sign({ userId: user.id }, c.env.JWT_SECRET!, {
//       expiresIn: "1d",
//     });
//     return c.json({ message: "Signed in successful", token });
//   } catch (error) {
//     console.error(error);
//     return c.json({ error: "Internal server error occured",  }, 500);
//   }
// };
