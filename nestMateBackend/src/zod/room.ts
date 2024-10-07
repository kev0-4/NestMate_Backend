import { z } from "zod";

export const getRoomSchema = z.object({
  location: z.string().optional(),
  minRent: z.string().transform(Number).optional(),
  maxRent: z.string().transform(Number).optional(),
  roomType: z.string().optional(),
  availableFrom: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

export const createRoomSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  subLocality: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  rent: z.number().positive(),
  roomType: z.string(),
  amenities: z.string(),
  photosUrl: z.array(z.string()),
  availableFrom: z.string().transform((str) => new Date(str)),
});

export const updateRoomSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  subLocality: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  rent: z.number().positive().optional(),
  roomType: z.string().optional(),
  amenities: z.string().optional(),
  photosUrl: z.array(z.string()).optional(),
  availableFrom: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
});

export const getRoomsByOwnerSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

/*
export const getRoomSchema = z.object({
  location: z.string().optional(),
  minRent: z.string().transform(Number).optional(),
  maxRent: z.string().transform(Number).optional(),
  roomType: z.string().optional(),
  availableFrom: z.string().optional(),
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});

export const createRoomSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  locationId: z.string(),
  rent: z.number().positive(),
  roomType: z.string(),
  amenities: z.string(),
  photosUrl: z.string(),
  availableFrom: z.string().transform((str) => new Date(str)),
});

export const updateRoomSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  rent: z.number().positive().optional(),
  roomType: z.string().optional(),
  amenities: z.string().optional(),
  photosUrl: z.string().optional(),
  availableFrom: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
});

export const getRoomsByOwnerSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
});
*/
