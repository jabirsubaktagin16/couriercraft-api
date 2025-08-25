import z from "zod";

export const createHubZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  location: z
    .string({ error: "Address must be string" })
    .min(2, { message: "Address must be at least 2 characters long." })
    .max(500, { message: "Address cannot exceed 500 characters." }),
  contactNumber: z
    .string({ error: "Contact Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  coveredArea: z.array(z.string({ error: "Covered Area must be string" })),
});

export const updateHubZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  location: z
    .string({ error: "Address must be string" })
    .min(2, { message: "Address must be at least 2 characters long." })
    .max(500, { message: "Address cannot exceed 500 characters." })
    .optional(),
  contactNumber: z
    .string({ error: "Contact Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  coveredArea: z
    .array(z.string({ error: "Covered Area must be string" }))
    .optional(),
});
