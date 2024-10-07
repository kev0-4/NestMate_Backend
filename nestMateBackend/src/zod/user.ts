import { z } from "zod";

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(10).optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dob: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .optional(),
    profilePictureUrl: z.string().url().optional(),
    socialMediaLinks: z.string().optional(),
    preferences: z.record(z.unknown()).optional(),
  })
  .strict();

  export const preferenceSchema = z.object({
    ageRange: z.object({
      min: z.number().min(18).max(100),
      max: z.number().min(18).max(100),
    }),
    gender: z.enum(["male", "female", "any"]),
    smoker: z.boolean(),
    pet: z.boolean(),
    rentRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }),
    roomType: z.enum(["shared", "private", "any"]),
    location: z.string().optional(),
    occupancy: z.enum(["immediate", "within1Month", "within3Months", "flexible"]),
  });
  