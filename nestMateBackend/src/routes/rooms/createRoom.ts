import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createRoomSchema } from "../../zod/room";

export const createRoom = async (c: Context) => {
  const authUser = c.get("userId");

  if (!authUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body = await c.req.json();
    const validatedData = createRoomSchema.parse(body);

    const newRoom = await prisma.room.create({
      data: {
        ...validatedData,
        ownerId: authUser,
      },
    });

    return c.json({ message: "Room created successfully", room: newRoom }, 201);
  } catch (error) {
    console.error("Error creating room:", error);
    return c.json({ error: "Failed to create room" }, 500);
  }
};
// import { Context } from "hono";
// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";
// import { createRoomSchema } from "../../zod/room";
// export const createRoom = async (c: Context) => {

//     const authUser = c.get('userId');

//     if (!authUser) {
//       return c.json({ error: 'Unauthorized' }, 401);
//     }

//     const prisma = new PrismaClient({
//         datasourceUrl: c.env.DATABASE_URL,
//       }).$extends(withAccelerate());

//     try {
//       const body = await c.req.json();
//       const validatedData = createRoomSchema.parse(body);

//       const newRoom = await prisma.room.create({
//         data: {
//           ...validatedData,
//           ownerId: authUser.id,
//         },
//       });

//       return c.json({ message: 'Room created successfully', room: newRoom }, 201);
//     } catch (error) {
//       console.error('Error creating room:', error);
//       return c.json({ error: 'Failed to create room' }, 500);
//     }
//   };
