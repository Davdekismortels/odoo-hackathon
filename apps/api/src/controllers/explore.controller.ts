import { eq, like, and, desc } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { cities, countries, activities } from "../db/schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/v1/cities?q=&country=&limit=
export const searchCities = asyncHandler(async (req: Request, res: Response) => {
  const q = String(req.query.q ?? "").trim();
  const country = String(req.query.country ?? "").trim();
  const limit = Math.min(Number(req.query.limit ?? 20), 50);

  // Build SQL-level filter conditions — never load all rows into memory
  const conditions = [];
  if (q) conditions.push(like(cities.name, `%${q}%`));
  if (country) conditions.push(eq(cities.countryCode, country));

  const results = db
    .select({
      id: cities.id,
      name: cities.name,
      countryCode: cities.countryCode,
      latitude: cities.latitude,
      longitude: cities.longitude,
      description: cities.description,
      imageUrl: cities.imageUrl,
      popularity: cities.popularity,
    })
    .from(cities)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(cities.popularity))
    .limit(limit)
    .all();

  res.json({ success: true, data: { cities: results } });
});


// GET /api/v1/cities/:id/activities
export const getCityActivities = asyncHandler(async (req: Request, res: Response) => {
  const results = db
    .select()
    .from(activities)
    .where(eq(activities.cityId, String(req.params.id)))
    .all();
  res.json({ success: true, data: { activities: results } });
});

// GET /api/v1/countries
export const listCountries = asyncHandler(async (req: Request, res: Response) => {
  const results = db.select().from(countries).all();
  res.json({ success: true, data: { countries: results } });
});
