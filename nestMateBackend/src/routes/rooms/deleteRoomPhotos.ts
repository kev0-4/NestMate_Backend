import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";



// Configure Cloudinary


export const deleteRoomPhoto = async (c: Context) => {
    cloudinary.config({
        cloud_name: c.env.CLOUDINARY_CLOUD_NAME,
        api_key: c.env.CLOUDINARY_API_KEY,
        api_secret: c.env.CLOUDINARY_API_SECRET
      });

  const roomId = c.req.param('roomId');
  const photoId = c.req.param('photoId'); // The Cloudinary public_id of the photo
  const authUser = c.get('userId'); // Assuming authenticateToken middleware sets this

  try {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    // Check if the room exists and belongs to the authenticated user
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { owner: true }
    });

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    if (room.owner.id !== authUser.id) {
      return c.json({ error: 'Unauthorized to delete photos from this room' }, 403);
    }

    // Search for the photo URL to delete based on the photoId
    const photoToDelete = room.photosUrl.find(url => url.includes(photoId));

    if (!photoToDelete) {
      return c.json({ error: 'Photo not found' }, 404);
    }

    // Delete the photo from Cloudinary using its public_id
    await cloudinary.uploader.destroy(photoId);

    // Filter out the deleted photo from the array of URLs
    const updatedPhotosUrl = room.photosUrl.filter(url => url !== photoToDelete);

    // Update the room's photosUrl array in Prisma
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { photosUrl: updatedPhotosUrl }
    });

    return c.json({ message: 'Photo deleted successfully', room: updatedRoom }, 200);
  } catch (error) {
    console.error('Error deleting room photo:', error);
    return c.json({ error: 'Failed to delete room photo' }, 500);
  }
};
