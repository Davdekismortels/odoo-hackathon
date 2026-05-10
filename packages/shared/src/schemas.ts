import { z } from "zod";

// ==================== AUTH SCHEMAS ====================

export const signupSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120)
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// ==================== TRIP SCHEMAS ====================

export const createTripSchema = z
  .object({
    name: z.string().min(3, "Trip name must be at least 3 characters").max(150).trim(),
    startDate: z.string().date("Invalid date format"),
    endDate: z.string().date("Invalid date format"),
    description: z.string().max(2000).optional(),
    budgetLimit: z.number().positive().max(1e9).optional(),
    currencyCode: z.string().length(3).default("USD"),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const updateTripSchema = z.object({
  name: z.string().min(3).max(150).trim().optional(),
  description: z.string().max(2000).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  budgetLimit: z.number().positive().max(1e9).optional().nullable(),
  currencyCode: z.string().length(3).optional(),
  coverImageUrl: z.string().url().optional().nullable(),
  status: z.enum(["planning", "booked", "completed", "archived"]).optional(),
});

// ==================== PROFILE SCHEMAS ====================

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(120).trim().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  language: z.string().min(2).max(10).optional(),
});


// ==================== STOP SCHEMAS ====================

export const createStopSchema = z
  .object({
    cityId: z.string().uuid(),
    arrivalDate: z.string().date(),
    departureDate: z.string().date(),
    accommodation: z.string().max(200).optional(),
    accommodationCost: z.number().min(0).default(0),
    transportCost: z.number().min(0).default(0),
    mealCostPerDay: z.number().min(0).default(0),
    notes: z.string().max(5000).optional(),
  })
  .refine((d) => new Date(d.departureDate) >= new Date(d.arrivalDate), {
    message: "Departure must be on or after arrival",
    path: ["departureDate"],
  });

// ==================== ACTIVITY SCHEMAS ====================

export const addActivityToStopSchema = z.object({
  activityId: z.string().uuid(),
  scheduledDate: z.string().date().optional(),
  scheduledTime: z.string().optional(),
  customCost: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

// ==================== BUDGET SCHEMAS ====================

export const createBudgetEntrySchema = z.object({
  stopId: z.string().uuid().optional(),
  category: z.enum(["transport", "stay", "meals", "activity", "shopping", "misc"]),
  amount: z.number().min(0).max(1e9),
  currencyCode: z.string().length(3).default("USD"),
  description: z.string().max(255).optional(),
  entryDate: z.string().date().optional(),
});

// ==================== PACKING SCHEMAS ====================

export const createPackingItemSchema = z.object({
  name: z.string().min(1).max(120).trim(),
  category: z.enum(["clothing", "documents", "electronics", "toiletries", "medication", "misc"]).default("misc"),
  quantity: z.number().int().positive().default(1),
});

// ==================== NOTES SCHEMAS ====================

export const createNoteSchema = z.object({
  stopId: z.string().uuid().optional(),
  title: z.string().max(150).optional(),
  body: z.string().min(1).max(20000),
});

// ==================== SEARCH SCHEMAS ====================

export const citySearchSchema = z.object({
  q: z.string().min(1).max(80).trim(),
  country: z.string().length(2).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ==================== TYPE EXPORTS ====================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateStopInput = z.infer<typeof createStopSchema>;
export type AddActivityToStopInput = z.infer<typeof addActivityToStopSchema>;
export type CreateBudgetEntryInput = z.infer<typeof createBudgetEntrySchema>;
export type CreatePackingItemInput = z.infer<typeof createPackingItemSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CitySearchInput = z.infer<typeof citySearchSchema>;

