import z from "zod";

export const sendmessageSchema = z.object({
  content: z.string().min(1).max(1000),
});
