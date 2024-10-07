import { Hono } from "hono";
import { signup } from "./signup";
import { signin } from "./signin";
import { forgotPassword } from './forgotPassword'
import { resetPassword } from './resetPassword'
import { verifyEmail } from "./verifyemail";



const auth = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

auth.post("/signup", signup);
auth.post("/signin", signin);
auth.post('/forgot-password', forgotPassword)
auth.post('/reset-password', resetPassword)
auth.get('/verify-email', verifyEmail)


export default auth;
