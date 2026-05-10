import { eq, like, desc } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { cities, countries, activities } from "../db/schema.js";

// GET /api/v1/cities?q=&country=
export function searchCities(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? "");
    const country = String(req.query.country ?? "");
    const limit = Math.min(Number(req.query.limit ?? 20), 50);

    let query = db
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
      .from(cities);

    const results = query.all().filter((c) => {
      const matchesQ = !q || c.name.toLowerCase().includes(q.toLowerCase());
      const matchesCountry = !country || c.countryCode === country;
      return matchesQ && matchesCountry;
    }).slice(0, limit);

    res.json({ success: true, data: { cities: results } });
  } catch (err) { next(err); }
}

// GET /api/v1/cities/:id/activities
export function getCityActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const results = db
      .select()
      .from(activities)
      .where(eq(activities.cityId, String(req.params.id)))
      .all();
    res.json({ success: true, data: { activities: results } });
  } catch (err) { next(err); }
}

// GET /api/v1/countries
export function listCountries(req: Request, res: Response, next: NextFunction) {
  try {
    const results = db.select().from(countries).all();
    res.json({ success: true, data: { countries: results } });
  } catch (err) { next(err); }
}
