import { z } from "zod";

const BaseCreateTripSchema = z.object({
  name: z.string().min(1, "Trip name is required").max(100),
  description: z.string().max(1000).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  coverImageUrl: z.string().url().optional(),
  budgetLimit: z.number().min(0).optional(),
  currencyCode: z.string().length(3).optional(),
});

export const CreateTripSchema = BaseCreateTripSchema.refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Start date must be before or equal to end date",
  path: ["startDate"],
});

export const UpdateTripSchema = BaseCreateTripSchema.partial().extend({
  isPublic: z.boolean().optional(),
  status: z.enum(["planning", "booked", "completed", "archived"]).optional(),
}).refine((data: any) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"],
});

const BaseCreateStopSchema = z.object({
  cityId: z.string().min(1, "City ID is required"),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  accommodation: z.string().optional(),
  accommodationCost: z.number().min(0).optional(),
  transportCost: z.number().min(0).optional(),
  mealCostPerDay: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const CreateStopSchema = BaseCreateStopSchema.refine((data) => new Date(data.arrivalDate) <= new Date(data.departureDate), {
  message: "Arrival date must be before or equal to departure date",
  path: ["arrivalDate"],
});

export const UpdateStopSchema = BaseCreateStopSchema.partial().refine((data: any) => {
  if (data.arrivalDate && data.departureDate) {
    return new Date(data.arrivalDate) <= new Date(data.departureDate);
  }
  return true;
}, {
  message: "Arrival date must be before or equal to departure date",
  path: ["arrivalDate"],
});

export const AddActivitySchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),
  customCost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const ReorderStopsSchema = z.object({
  stopIds: z.array(z.string().uuid()),
});

export const AddNoteSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, "Note body is required"),
});

export const UpdateNoteSchema = AddNoteSchema.partial();

export const AddPackingItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.enum(["clothing", "documents", "electronics", "toiletries", "medication", "misc"]).optional(),
  quantity: z.number().min(1).optional(),
});

export const TogglePackingItemSchema = z.object({
  isPacked: z.boolean(),
});
