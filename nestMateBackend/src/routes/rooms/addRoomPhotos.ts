import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

export const addRoomPhotos = async (c: Context) => {
  type CloudinaryUploadResult = {
    secure_url: string;
    public_id: string;
  };

  cloudinary.config({
    cloud_name: c.env.CLOUDINARY_CLOUD_NAME,
    api_key: c.env.CLOUDINARY_API_KEY,
    api_secret: c.env.CLOUDINARY_API_SECRET,
  });

  const roomId = c.req.param('roomId');
  const authUser = c.get('userId');

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { owner: true }
    });

    if (!room) 
      return c.json({ error: 'Room not found' }, 404);

    if (room.owner.id !== authUser.id) 
      return c.json({ error: 'Unauthorized to add photos to this room' }, 403);

    const body = await c.req.parseBody();
    const file = body['photo'];

    if (!file || !(file instanceof File)) 
      return c.json({ error: 'No file uploaded or invalid file' }, 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'room_photos', transformation: [{ width: 1000, height: 1000, crop: 'limit' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        photosUrl: {
          push: result.secure_url // Push the  URL to the existing array
        }
      }
    });

    return c.json({
      message: 'Photo added successfully',
      room: updatedRoom,
      photoUrl: result.secure_url,
      photoId: result.public_id
    }, 200);
  } catch (error) {
    console.error('Error adding room photo:', error);
    return c.json({ error: 'Failed to add room photo' }, 500);
  }
};

// import { v2 as cloudinary } from "cloudinary";
// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";
// import { Context } from "hono";

// export const addRoomPhotos = async (c:Context)=>{
//     type CloudinaryUploadResult = {
//         secure_url: string;
//         public_id: string;
//       };

//     cloudinary.config({
//         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//         api_key: process.env.CLOUDINARY_API_KEY,
//         api_secret: process.env.CLOUDINARY_API_SECRET,
//       });
    
//     const roomId = c.req.param('roomId')
//     const authUser = c.get('userId')

//     try{
//         const prisma = new PrismaClient({
//             datasourceUrl: c.env.DATABASE_URL,
//           }).$extends(withAccelerate());
     
//           const room = await prisma.room.findUnique({
//             where: { id: roomId },
//             include: { owner: true }
//           });
      
//           if (!room) 
//             return c.json({ error: 'Room not found' }, 404);
          
      
//           if (room.owner.id !== authUser.id) 
//             return c.json({ error: 'Unauthorized to add photos to this room' }, 403);
          

//           const body = await c.req.parseBody();
//     const file = body['photo'];

//     if (!file || !(file instanceof File)) 
//       return c.json({ error: 'No file uploaded or invalid file' }, 400);
    
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           { folder: 'room_photos', transformation: [{ width: 1000, height: 1000, crop: 'limit' }] },
//           (error, result) => {
//             if (error) reject(error);
//             else resolve(result as CloudinaryUploadResult);
//           }
//         );
  
//         uploadStream.end(buffer);
//       });

//         // Update the room's photosUrl
//         const updatedPhotosUrl = room.photosUrl
//       ? `${room.photosUrl},${result.secure_url}`
//       : result.secure_url;

//     const updatedRoom = await prisma.room.update({
//       where: { id: roomId },
//       data: { photosUrl: updatedPhotosUrl }
//     });
// /* 
// const updatedRoom = await prisma.room.update({
//   where: { id: roomId },
//   data: { 
//     photosUrl: {
//       push: result.secure_url
//     }
//   }
// });
// */
//     return c.json({ 
//       message: 'Photo added successfully', 
//       room: updatedRoom,
//       photoUrl: result.secure_url,
//       photoId: result.public_id
//     }, 200);}
//     catch(error){
//         console.error('Error adding room photo:', error);
//     return c.json({ error: 'Failed to add room photo' }, 500);
//     }
// }