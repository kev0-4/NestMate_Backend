import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const getMatchById = async(c: Context)=>{
    const matchId = c.req.param('matchId')
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

    try{
        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
              user1: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
              user2: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profilePictureUrl: true,
                },
              },
            },
          });

    if(!match)
        return c.json({ error: 'Match not found' }, 404);

    return c.json(match);

    }
    catch(error){
        console.error('Error fetching match:', error);
    return c.json({ error: 'Failed to fetch match' }, 500);
  
    }
}