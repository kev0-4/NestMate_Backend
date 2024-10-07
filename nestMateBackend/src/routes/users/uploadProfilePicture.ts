import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context } from "hono";

// Configure Cloudinary


export const uploadProfilePicture = async (c: Context) => {
  const userId = c.req.param("userId");
  const authUser = c.get("userId"); // Assuming authenticateToken middleware sets this
  cloudinary.config({
    cloud_name: c.env.CLOUDINARY_CLOUD_NAME,
    api_key: c.env.CLOUDINARY_API_KEY,
    api_secret: c.env.CLOUDINARY_API_SECRET,
  });
  if (authUser.id !== userId) {
    return c.json(
      { error: "Unauthorized to update this profile picture" },
      403
    );
  }

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.parseBody();
    const file = body["profilePicture"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file uploaded or invalid file" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "profile_pictures",
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId }, //@ts-ignore
      data: { profilePictureUrl: result.secure_url },
    });

    return c.json(
      {
        message: "Profile picture updated successfully",
        profilePictureUrl: updatedUser.profilePictureUrl,
      },
      200
    );
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return c.json({ error: "Failed to upload profile picture" }, 500);
  }
};

// import { v2 as cloudinary } from "cloudinary";
// import { PrismaClient } from "@prisma/client/edge";
// import { withAccelerate } from "@prisma/extension-accelerate";
// import { Context } from "hono";

// export const uploadProfilePicture = async (c: Context) => {
//   cloudinary.config({
//     cloud_name: c.env.CLOUDINARY_CLOUD_NAME,
//     api_key: c.env.CLOUDINARY_API_KEY,
//     api_secret: c.env.CLOUDINARY_API_SECRET,
//   });

//   const userId = c.req.param("userId");
//   const authUser = c.get("userId");

//   if (authUser !== userId)
//     return c.json(
//       { error: "Unauthorized to update this profile picture" },
//       403
//     );

//   try {
//     const prisma = new PrismaClient({
//       datasourceUrl: c.env.DATABASE_URL,
//     }).$extends(withAccelerate());

//     const formData = await c.req.raw.formData();
//     const file = formData.get("profilePicture") as File | null;

//     if (!file) return c.json({ error: "No file uploaded" }, 400);

//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const result = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: "profile_pictures",
//           transformation: [{ width: 500, height: 500, crop: "limit" }],
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );

//       uploadStream.end(buffer);
//     });

//     const updatedUser = await prisma.user.update({
//       where: { id: userId }, //@ts-ignore
//       data: { profilePictureUrl: result.secure_url },
//     });

//     return c.json(
//       {
//         message: "Profile picture updated successfully",
//         profilePictureUrl: updatedUser.profilePictureUrl,
//       },
//       200
//     );
//   } catch (error) {
//     console.error("Error uploading profile picture:", error);
//     return c.json({ error: "Failed to upload profile picture" }, 500);
//   }
// };
/* ignore
Open Postman and create a new request.
Set the HTTP method to POST.
Enter the URL for your endpoint. It should look something like:
http://your-api-url.com/users/{userId}/profile-picture
Replace {userId} with an actual user ID from your database.
In the request headers:

If you're using authentication, add your authentication header. This might be something like:
Authorization: Bearer your-auth-token-here


For the body of the request:

Select "form-data" (not "x-www-form-urlencoded")
Add a new key called "profilePicture"
To the right of "profilePicture", you'll see a dropdown. Select "File" instead of "Text"
Click "Select Files" and choose an image file from your computer


Your form-data should look something like this:
KeyValueDescriptionprofilePicture(File)The image file you're uploading
*/
