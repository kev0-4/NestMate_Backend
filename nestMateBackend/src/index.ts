import { Hono } from "hono";
import auth from "./routes/auth";
// import userRoutes from './routes/users'
import { authMiddleware } from "./middleware/auth";
import roomRouter from "./routes/rooms";
import matchRouter from "./routes/matches";
import usersRouter from "./routes/users";
import chatRouter from "./routes/chat";
import reportRouter from "./routes/report";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    DIRECT_DATABASE_URL: string;
  };
}>();
// app.use(authMiddleware)
app.route("/auth", auth);
app.route("/users", usersRouter);

app.route("/rooms", roomRouter);
app.route("/matches", matchRouter);

app.route("/chats", chatRouter);
app.route("/reports", reportRouter);

export default app;
