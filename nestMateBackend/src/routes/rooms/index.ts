import { Hono } from "hono";
import { createRoom } from "./createRoom";
import { getRooms } from "./getRooms";
import { authMiddleware } from "../../middleware/auth";
import { getRoom } from "./getRoom";
import { updateRoom } from "./updateRoom";
import { deleteRoom } from "./deleteRoom";
import { getRoomsByOwner } from "./getRoomsByOwner";

const roomRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
}>();

roomRouter.use(authMiddleware);

roomRouter.post("/", createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/:roomId", getRoom);
roomRouter.put("/:roomId", updateRoom);
roomRouter.delete('/:roomId', deleteRoom)
roomRouter.get('/:roomId', getRoomsByOwner)

export default roomRouter