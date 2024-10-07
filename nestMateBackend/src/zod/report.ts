import z from "zod";
export const reportSchema = z.object({
  reportedUserId: z.string(),
  reason: z.string().min(1).max(500),
});
