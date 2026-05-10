import { db, getRawDb } from "./index.js";
import { sql } from "drizzle-orm";

console.log("🗄️  Running migrations...\n");

const sqlite = getRawDb();

// Create all tables using raw SQL (Drizzle push approach for SQLite)
sqlite.exec(`
  -- 1. USERS
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    language TEXT DEFAULT 'en',
    role TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  -- 2. COUNTRIES
  CREATE TABLE IF NOT EXISTS countries (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    currency_code TEXT NOT NULL,
    currency_symbol TEXT,
    flag_emoji TEXT,
    region TEXT,
    cost_index REAL
  );

  -- 3. CITIES
  CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    country_code TEXT REFERENCES countries(code),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    osm_id INTEGER,
    population INTEGER,
    popularity INTEGER DEFAULT 0,
    cost_index REAL,
    description TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_code);
  CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);

  -- 4. ACTIVITIES
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('sightseeing','food','adventure','culture','nightlife','shopping','nature','other')),
    description TEXT,
    estimated_cost REAL DEFAULT 0,
    duration_min INTEGER DEFAULT 60,
    latitude REAL,
    longitude REAL,
    osm_id INTEGER,
    image_url TEXT,
    source TEXT DEFAULT 'seed' CHECK (source IN ('osm','user','seed')),
    created_by TEXT REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_activities_city ON activities(city_id);
  CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);

  -- 5. TRIPS
  CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    cover_image_url TEXT,
    budget_limit REAL,
    currency_code TEXT DEFAULT 'USD',
    is_public INTEGER DEFAULT 0,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning','booked','completed','archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
  CREATE INDEX IF NOT EXISTS idx_trips_public ON trips(is_public);

  -- 6. STOPS
  CREATE TABLE IF NOT EXISTS stops (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id),
    arrival_date TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    accommodation TEXT,
    accommodation_cost REAL DEFAULT 0,
    transport_cost REAL DEFAULT 0,
    meal_cost_per_day REAL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_stops_trip ON stops(trip_id, order_index);

  -- 7. STOP_ACTIVITIES
  CREATE TABLE IF NOT EXISTS stop_activities (
    id TEXT PRIMARY KEY,
    stop_id TEXT NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL REFERENCES activities(id),
    scheduled_date TEXT,
    scheduled_time TEXT,
    custom_cost REAL,
    notes TEXT,
    order_index INTEGER DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_stop_act_stop ON stop_activities(stop_id);

  -- 8. BUDGET_ENTRIES
  CREATE TABLE IF NOT EXISTS budget_entries (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id TEXT REFERENCES stops(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('transport','stay','meals','activity','shopping','misc')),
    amount REAL NOT NULL CHECK (amount >= 0),
    currency_code TEXT DEFAULT 'USD',
    description TEXT,
    entry_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_budget_trip ON budget_entries(trip_id);

  -- 9. PACKING_ITEMS
  CREATE TABLE IF NOT EXISTS packing_items (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'misc' CHECK (category IN ('clothing','documents','electronics','toiletries','medication','misc')),
    is_packed INTEGER DEFAULT 0,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_packing_trip ON packing_items(trip_id);

  -- 10. TRIP_NOTES
  CREATE TABLE IF NOT EXISTS trip_notes (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id TEXT REFERENCES stops(id) ON DELETE CASCADE,
    title TEXT,
    body TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_notes_trip ON trip_notes(trip_id);

  -- 11. PUBLIC_ITINERARIES
  CREATE TABLE IF NOT EXISTS public_itineraries (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    view_count INTEGER DEFAULT 0,
    clone_count INTEGER DEFAULT 0,
    published_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_public_slug ON public_itineraries(slug);

  -- 12. SAVED_DESTINATIONS
  CREATE TABLE IF NOT EXISTS saved_destinations (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id TEXT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    saved_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, city_id)
  );

  -- 13. TRIP_CLONES
  CREATE TABLE IF NOT EXISTS trip_clones (
    id TEXT PRIMARY KEY,
    source_trip_id TEXT NOT NULL REFERENCES trips(id),
    cloned_trip_id TEXT NOT NULL REFERENCES trips(id),
    cloned_by TEXT NOT NULL REFERENCES users(id),
    cloned_at TEXT DEFAULT (datetime('now'))
  );

  -- 14. SESSIONS
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    expires_at TEXT NOT NULL,
    revoked INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

  -- 15. AUDIT_LOGS
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`);

console.log("✅ All 15 tables created successfully!");
console.log("   Tables: users, countries, cities, activities, trips, stops,");
console.log("   stop_activities, budget_entries, packing_items, trip_notes,");
console.log("   public_itineraries, saved_destinations, trip_clones, sessions, audit_logs");

process.exit(0);
