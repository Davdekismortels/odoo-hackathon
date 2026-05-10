import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ==================== 1. USERS ====================
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  language: text("language").default("en"),
  role: text("role", { enum: ["user", "admin"] }).default("user"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
}));

// ==================== 2. COUNTRIES ====================
export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),  // ISO 3166-1 alpha-2
  name: text("name").notNull(),
  currencyCode: text("currency_code").notNull(),
  currencySymbol: text("currency_symbol"),
  flagEmoji: text("flag_emoji"),
  region: text("region"),
  costIndex: real("cost_index"),  // 0-10
});

// ==================== 3. CITIES ====================
export const cities = sqliteTable("cities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  countryCode: text("country_code").references(() => countries.code),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  osmId: integer("osm_id"),
  population: integer("population"),
  popularity: integer("popularity").default(0),
  costIndex: real("cost_index"),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  countryIdx: index("idx_cities_country").on(table.countryCode),
  nameIdx: index("idx_cities_name").on(table.name),
}));

// ==================== 4. ACTIVITIES ====================
export const activities = sqliteTable("activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cityId: text("city_id").references(() => cities.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category", { enum: ["sightseeing", "food", "adventure", "culture", "nightlife", "shopping", "nature", "other"] }).notNull(),
  description: text("description"),
  estimatedCost: real("estimated_cost").default(0),
  durationMin: integer("duration_min").default(60),
  latitude: real("latitude"),
  longitude: real("longitude"),
  osmId: integer("osm_id"),
  imageUrl: text("image_url"),
  source: text("source", { enum: ["osm", "user", "seed"] }).default("seed"),
  createdBy: text("created_by").references(() => users.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  cityIdx: index("idx_activities_city").on(table.cityId),
  categoryIdx: index("idx_activities_category").on(table.category),
}));

// ==================== 5. TRIPS ====================
export const trips = sqliteTable("trips", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  coverImageUrl: text("cover_image_url"),
  budgetLimit: real("budget_limit"),
  currencyCode: text("currency_code").default("USD"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  status: text("status", { enum: ["planning", "booked", "completed", "archived"] }).default("planning"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
}, (table) => ({
  userIdx: index("idx_trips_user").on(table.userId),
  publicIdx: index("idx_trips_public").on(table.isPublic),
}));

// ==================== 6. STOPS ====================
export const stops = sqliteTable("stops", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  cityId: text("city_id").notNull().references(() => cities.id),
  arrivalDate: text("arrival_date").notNull(),
  departureDate: text("departure_date").notNull(),
  orderIndex: integer("order_index").notNull(),
  accommodation: text("accommodation"),
  accommodationCost: real("accommodation_cost").default(0),
  transportCost: real("transport_cost").default(0),
  mealCostPerDay: real("meal_cost_per_day").default(0),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  tripOrderIdx: index("idx_stops_trip").on(table.tripId, table.orderIndex),
}));

// ==================== 7. STOP_ACTIVITIES (junction) ====================
export const stopActivities = sqliteTable("stop_activities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stopId: text("stop_id").notNull().references(() => stops.id, { onDelete: "cascade" }),
  activityId: text("activity_id").notNull().references(() => activities.id),
  scheduledDate: text("scheduled_date"),
  scheduledTime: text("scheduled_time"),
  customCost: real("custom_cost"),
  notes: text("notes"),
  orderIndex: integer("order_index").default(0),
}, (table) => ({
  stopIdx: index("idx_stop_act_stop").on(table.stopId),
}));

// ==================== 8. BUDGET_ENTRIES ====================
export const budgetEntries = sqliteTable("budget_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  stopId: text("stop_id").references(() => stops.id, { onDelete: "cascade" }),
  category: text("category", { enum: ["transport", "stay", "meals", "activity", "shopping", "misc"] }).notNull(),
  amount: real("amount").notNull(),
  currencyCode: text("currency_code").default("USD"),
  description: text("description"),
  entryDate: text("entry_date"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  tripIdx: index("idx_budget_trip").on(table.tripId),
}));

// ==================== 9. PACKING_ITEMS ====================
export const packingItems = sqliteTable("packing_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category", { enum: ["clothing", "documents", "electronics", "toiletries", "medication", "misc"] }).default("misc"),
  isPacked: integer("is_packed", { mode: "boolean" }).default(false),
  quantity: integer("quantity").default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  tripIdx: index("idx_packing_trip").on(table.tripId),
}));

// ==================== 10. TRIP_NOTES ====================
export const tripNotes = sqliteTable("trip_notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  stopId: text("stop_id").references(() => stops.id, { onDelete: "cascade" }),
  title: text("title"),
  body: text("body").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (table) => ({
  tripIdx: index("idx_notes_trip").on(table.tripId),
}));

// ==================== 11. PUBLIC_ITINERARIES ====================
export const publicItineraries = sqliteTable("public_itineraries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tripId: text("trip_id").notNull().unique().references(() => trips.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  viewCount: integer("view_count").default(0),
  cloneCount: integer("clone_count").default(0),
  publishedAt: text("published_at").default(sql`(datetime('now'))`),
}, (table) => ({
  slugIdx: index("idx_public_slug").on(table.slug),
}));

// ==================== 12. SAVED_DESTINATIONS ====================
export const savedDestinations = sqliteTable("saved_destinations", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cityId: text("city_id").notNull().references(() => cities.id, { onDelete: "cascade" }),
  savedAt: text("saved_at").default(sql`(datetime('now'))`),
}, (table) => ({
  pkIdx: uniqueIndex("pk_saved_dest").on(table.userId, table.cityId),
}));

// ==================== 13. TRIP_CLONES (analytics) ====================
export const tripClones = sqliteTable("trip_clones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceTripId: text("source_trip_id").notNull().references(() => trips.id),
  clonedTripId: text("cloned_trip_id").notNull().references(() => trips.id),
  clonedBy: text("cloned_by").notNull().references(() => users.id),
  clonedAt: text("cloned_at").default(sql`(datetime('now'))`),
});

// ==================== 14. SESSIONS (refresh tokens) ====================
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  refreshTokenHash: text("refresh_token_hash").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  expiresAt: text("expires_at").notNull(),
  revoked: integer("revoked", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  userIdx: index("idx_sessions_user").on(table.userId),
}));

// ==================== 15. AUDIT_LOGS ====================
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: text("metadata"),  // JSON string
  ipAddress: text("ip_address"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (table) => ({
  userIdx: index("idx_audit_user").on(table.userId),
  createdIdx: index("idx_audit_created").on(table.createdAt),
}));
