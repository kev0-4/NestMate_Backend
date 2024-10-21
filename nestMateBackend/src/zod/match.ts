import { z } from "zod";

export const matchSchema = z.object({
  userId1: z.string(),
  userId2: z.string(),
});

export const getMatchesSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  status: z.enum(["pending", "accepted", "rejected"]).optional(),
});

// export const getMatchesByIdSchema = z.object({
//   matchId: z.string()
// }); //nope, just send as query param

export const updateMatchStatusSchema = z.object({
  status: z.enum([
    "pending",
    "accepted",
    "rejected",
    "swiped_right",
    "swiped_left",
  ]),
});

// export const filterMatchSchema = z.object({
//   userId: z.string(),
//   location: z.string().optional(),
//   minBudget: z.string().transform(Number).optional(),
//   maxBudget: z.string().transform(Number).optional(),
//   ageMin: z.string().transform(Number).optional(),
//   ageMax: z.string().transform(Number).optional(),
//   gender: z.string().optional(),
//   page: z.string().transform(Number).default("1"),
//   limit: z.string().transform(Number).default("10"),
// });
export const filterMatchSchema = z.object({
  userId: z.string(),
  location: z.string().optional(),
  minBudget: z.string().transform((val) => val ? Number(val) : undefined).optional(),
  maxBudget: z.string().transform((val) => val ? Number(val) : undefined).optional(),
  ageMin: z.string().transform((val) => val ? Number(val) : undefined).optional(),
  ageMax: z.string().transform((val) => val ? Number(val) : undefined).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  page: z.string().transform((val) => Number(val || "1")).default("1"),
  limit: z.string().transform((val) => Number(val || "10")).default("10"),
});
