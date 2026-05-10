import { db } from "./index.js";
import { countries, cities, activities } from "./schema.js";

console.log("🌱 Seeding database...\n");

// ==================== COUNTRIES (top 50) ====================
const countryData = [
  { code: "IN", name: "India", currencyCode: "INR", currencySymbol: "₹", flagEmoji: "🇮🇳", region: "Asia", costIndex: 2.5 },
  { code: "US", name: "United States", currencyCode: "USD", currencySymbol: "$", flagEmoji: "🇺🇸", region: "Americas", costIndex: 7.5 },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", currencySymbol: "£", flagEmoji: "🇬🇧", region: "Europe", costIndex: 8.0 },
  { code: "FR", name: "France", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇫🇷", region: "Europe", costIndex: 7.0 },
  { code: "DE", name: "Germany", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇩🇪", region: "Europe", costIndex: 6.5 },
  { code: "IT", name: "Italy", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇮🇹", region: "Europe", costIndex: 6.5 },
  { code: "ES", name: "Spain", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇪🇸", region: "Europe", costIndex: 5.5 },
  { code: "JP", name: "Japan", currencyCode: "JPY", currencySymbol: "¥", flagEmoji: "🇯🇵", region: "Asia", costIndex: 7.0 },
  { code: "TH", name: "Thailand", currencyCode: "THB", currencySymbol: "฿", flagEmoji: "🇹🇭", region: "Asia", costIndex: 3.0 },
  { code: "AU", name: "Australia", currencyCode: "AUD", currencySymbol: "A$", flagEmoji: "🇦🇺", region: "Oceania", costIndex: 8.0 },
  { code: "NL", name: "Netherlands", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇳🇱", region: "Europe", costIndex: 7.0 },
  { code: "CH", name: "Switzerland", currencyCode: "CHF", currencySymbol: "Fr", flagEmoji: "🇨🇭", region: "Europe", costIndex: 9.5 },
  { code: "PT", name: "Portugal", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇵🇹", region: "Europe", costIndex: 5.0 },
  { code: "GR", name: "Greece", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇬🇷", region: "Europe", costIndex: 5.0 },
  { code: "TR", name: "Turkey", currencyCode: "TRY", currencySymbol: "₺", flagEmoji: "🇹🇷", region: "Asia", costIndex: 3.5 },
  { code: "AE", name: "United Arab Emirates", currencyCode: "AED", currencySymbol: "د.إ", flagEmoji: "🇦🇪", region: "Asia", costIndex: 7.5 },
  { code: "SG", name: "Singapore", currencyCode: "SGD", currencySymbol: "S$", flagEmoji: "🇸🇬", region: "Asia", costIndex: 8.0 },
  { code: "MY", name: "Malaysia", currencyCode: "MYR", currencySymbol: "RM", flagEmoji: "🇲🇾", region: "Asia", costIndex: 3.0 },
  { code: "ID", name: "Indonesia", currencyCode: "IDR", currencySymbol: "Rp", flagEmoji: "🇮🇩", region: "Asia", costIndex: 2.5 },
  { code: "VN", name: "Vietnam", currencyCode: "VND", currencySymbol: "₫", flagEmoji: "🇻🇳", region: "Asia", costIndex: 2.0 },
  { code: "MX", name: "Mexico", currencyCode: "MXN", currencySymbol: "$", flagEmoji: "🇲🇽", region: "Americas", costIndex: 3.5 },
  { code: "BR", name: "Brazil", currencyCode: "BRL", currencySymbol: "R$", flagEmoji: "🇧🇷", region: "Americas", costIndex: 4.0 },
  { code: "CA", name: "Canada", currencyCode: "CAD", currencySymbol: "C$", flagEmoji: "🇨🇦", region: "Americas", costIndex: 7.0 },
  { code: "EG", name: "Egypt", currencyCode: "EGP", currencySymbol: "£", flagEmoji: "🇪🇬", region: "Africa", costIndex: 2.5 },
  { code: "ZA", name: "South Africa", currencyCode: "ZAR", currencySymbol: "R", flagEmoji: "🇿🇦", region: "Africa", costIndex: 3.5 },
  { code: "KR", name: "South Korea", currencyCode: "KRW", currencySymbol: "₩", flagEmoji: "🇰🇷", region: "Asia", costIndex: 6.0 },
  { code: "NZ", name: "New Zealand", currencyCode: "NZD", currencySymbol: "NZ$", flagEmoji: "🇳🇿", region: "Oceania", costIndex: 7.5 },
  { code: "AT", name: "Austria", currencyCode: "EUR", currencySymbol: "€", flagEmoji: "🇦🇹", region: "Europe", costIndex: 7.0 },
  { code: "CZ", name: "Czech Republic", currencyCode: "CZK", currencySymbol: "Kč", flagEmoji: "🇨🇿", region: "Europe", costIndex: 4.5 },
  { code: "IS", name: "Iceland", currencyCode: "ISK", currencySymbol: "kr", flagEmoji: "🇮🇸", region: "Europe", costIndex: 9.0 },
];

// ==================== CITIES (top 60) ====================
const cityData = [
  { name: "Paris", countryCode: "FR", latitude: 48.8566, longitude: 2.3522, population: 2161000, popularity: 95, costIndex: 7.5, description: "City of Light — iconic architecture, world-class cuisine, and timeless romance" },
  { name: "Tokyo", countryCode: "JP", latitude: 35.6762, longitude: 139.6503, population: 13960000, popularity: 90, costIndex: 7.0, description: "Where ancient temples meet neon-lit skyscrapers in a cultural kaleidoscope" },
  { name: "London", countryCode: "GB", latitude: 51.5074, longitude: -0.1278, population: 8982000, popularity: 92, costIndex: 8.5, description: "History, theatre, and world-class museums in a cosmopolitan metropolis" },
  { name: "New York", countryCode: "US", latitude: 40.7128, longitude: -74.0060, population: 8336000, popularity: 93, costIndex: 9.0, description: "The city that never sleeps — Broadway, Central Park, and infinite energy" },
  { name: "Rome", countryCode: "IT", latitude: 41.9028, longitude: 12.4964, population: 2873000, popularity: 88, costIndex: 6.5, description: "Eternal city of ancient ruins, Renaissance art, and incredible pasta" },
  { name: "Barcelona", countryCode: "ES", latitude: 41.3874, longitude: 2.1686, population: 1621000, popularity: 86, costIndex: 6.0, description: "Gaudí's masterpieces, Mediterranean beaches, and vibrant nightlife" },
  { name: "Amsterdam", countryCode: "NL", latitude: 52.3676, longitude: 4.9041, population: 872680, popularity: 84, costIndex: 7.5, description: "Canals, bicycles, tulips, and world-renowned museums" },
  { name: "Bangkok", countryCode: "TH", latitude: 13.7563, longitude: 100.5018, population: 10539000, popularity: 82, costIndex: 3.0, description: "Ornate temples, bustling street food markets, and tropical vibes" },
  { name: "Dubai", countryCode: "AE", latitude: 25.2048, longitude: 55.2708, population: 3331000, popularity: 85, costIndex: 7.5, description: "Futuristic skyline, luxury shopping, and desert adventures" },
  { name: "Singapore", countryCode: "SG", latitude: 1.3521, longitude: 103.8198, population: 5686000, popularity: 80, costIndex: 8.0, description: "Garden city with hawker food, Marina Bay, and multicultural charm" },
  { name: "Istanbul", countryCode: "TR", latitude: 41.0082, longitude: 28.9784, population: 15462000, popularity: 78, costIndex: 4.0, description: "Where East meets West — bazaars, mosques, and Bosphorus views" },
  { name: "Sydney", countryCode: "AU", latitude: -33.8688, longitude: 151.2093, population: 5312000, popularity: 81, costIndex: 8.0, description: "Harbour Bridge, Opera House, and stunning coastal walks" },
  { name: "Lisbon", countryCode: "PT", latitude: 38.7223, longitude: -9.1393, population: 505526, popularity: 76, costIndex: 5.0, description: "Pastel-colored hills, tram rides, and custard tarts by the river" },
  { name: "Prague", countryCode: "CZ", latitude: 50.0755, longitude: 14.4378, population: 1309000, popularity: 75, costIndex: 4.5, description: "Fairy-tale Old Town, Gothic spires, and legendary beer culture" },
  { name: "Berlin", countryCode: "DE", latitude: 52.5200, longitude: 13.4050, population: 3645000, popularity: 77, costIndex: 6.0, description: "History, art, techno, and an unbeatable creative energy" },
  { name: "Mumbai", countryCode: "IN", latitude: 19.0760, longitude: 72.8777, population: 20411000, popularity: 70, costIndex: 2.5, description: "Bollywood capital, street food paradise, and India's financial heart" },
  { name: "Delhi", countryCode: "IN", latitude: 28.7041, longitude: 77.1025, population: 16788000, popularity: 68, costIndex: 2.5, description: "Mughal monuments, bustling markets, and rich culinary heritage" },
  { name: "Jaipur", countryCode: "IN", latitude: 26.9124, longitude: 75.7873, population: 3073000, popularity: 72, costIndex: 2.0, description: "The Pink City — royal palaces, vibrant bazaars, and desert forts" },
  { name: "Goa", countryCode: "IN", latitude: 15.2993, longitude: 74.1240, population: 1458000, popularity: 74, costIndex: 3.0, description: "Golden beaches, Portuguese heritage, and legendary sunsets" },
  { name: "Varanasi", countryCode: "IN", latitude: 25.3176, longitude: 82.9739, population: 1201000, popularity: 65, costIndex: 1.5, description: "India's spiritual capital — Ganges ghats, temples, and ancient rituals" },
  { name: "Bali", countryCode: "ID", latitude: -8.3405, longitude: 115.0920, population: 4225000, popularity: 83, costIndex: 3.0, description: "Tropical paradise of rice terraces, temples, and surf beaches" },
  { name: "Kyoto", countryCode: "JP", latitude: 35.0116, longitude: 135.7681, population: 1475000, popularity: 79, costIndex: 6.5, description: "Ancient capital with 2000 temples, geishas, and bamboo forests" },
  { name: "Reykjavik", countryCode: "IS", latitude: 64.1466, longitude: -21.9426, population: 131136, popularity: 71, costIndex: 9.0, description: "Gateway to Northern Lights, geysers, and volcanic landscapes" },
  { name: "Santorini", countryCode: "GR", latitude: 36.3932, longitude: 25.4615, population: 15550, popularity: 80, costIndex: 7.0, description: "White-washed cliffs, blue domes, and legendary Aegean sunsets" },
  { name: "Zurich", countryCode: "CH", latitude: 47.3769, longitude: 8.5417, population: 421878, popularity: 60, costIndex: 9.5, description: "Pristine lakes, Alpine views, and Swiss precision" },
  { name: "Vienna", countryCode: "AT", latitude: 48.2082, longitude: 16.3738, population: 1897000, popularity: 73, costIndex: 7.0, description: "Imperial palaces, classical music, and legendary Viennese coffee" },
  { name: "Seoul", countryCode: "KR", latitude: 37.5665, longitude: 126.9780, population: 9776000, popularity: 76, costIndex: 6.0, description: "K-pop, ancient palaces, neon districts, and incredible street food" },
  { name: "Kuala Lumpur", countryCode: "MY", latitude: 3.1390, longitude: 101.6869, population: 7564000, popularity: 67, costIndex: 3.5, description: "Petronas Towers, hawker food courts, and cultural diversity" },
  { name: "Hanoi", countryCode: "VN", latitude: 21.0285, longitude: 105.8542, population: 8054000, popularity: 69, costIndex: 2.0, description: "Old Quarter charm, phở bowls, and French colonial elegance" },
  { name: "Mexico City", countryCode: "MX", latitude: 19.4326, longitude: -99.1332, population: 9209944, popularity: 72, costIndex: 3.5, description: "Ancient Aztec ruins, world-class museums, and vibrant street culture" },
  { name: "Rio de Janeiro", countryCode: "BR", latitude: -22.9068, longitude: -43.1729, population: 6748000, popularity: 77, costIndex: 4.5, description: "Christ the Redeemer, Copacabana, samba, and Carnival" },
  { name: "Cape Town", countryCode: "ZA", latitude: -33.9249, longitude: 18.4241, population: 4618000, popularity: 74, costIndex: 4.0, description: "Table Mountain, penguins, wine country, and dramatic coastlines" },
  { name: "Cairo", countryCode: "EG", latitude: 30.0444, longitude: 31.2357, population: 9540000, popularity: 70, costIndex: 2.5, description: "Pyramids, pharaohs, and the bustling heart of the Arab world" },
  { name: "Toronto", countryCode: "CA", latitude: 43.6532, longitude: -79.3832, population: 2794000, popularity: 66, costIndex: 7.0, description: "Multicultural mosaic with CN Tower views and diverse neighborhoods" },
  { name: "San Francisco", countryCode: "US", latitude: 37.7749, longitude: -122.4194, population: 874961, popularity: 75, costIndex: 9.0, description: "Golden Gate, tech hub, foggy hills, and eclectic neighborhoods" },
  { name: "Los Angeles", countryCode: "US", latitude: 34.0522, longitude: -118.2437, population: 3979576, popularity: 78, costIndex: 8.0, description: "Hollywood glamour, beach culture, and year-round sunshine" },
  { name: "Florence", countryCode: "IT", latitude: 43.7696, longitude: 11.2558, population: 382258, popularity: 77, costIndex: 6.5, description: "Renaissance birthplace — Uffizi, Duomo, and Tuscan cuisine" },
  { name: "Venice", countryCode: "IT", latitude: 45.4408, longitude: 12.3155, population: 261905, popularity: 79, costIndex: 8.0, description: "Floating city of gondolas, bridges, and timeless beauty" },
  { name: "Athens", countryCode: "GR", latitude: 37.9838, longitude: 23.7275, population: 3154000, popularity: 71, costIndex: 5.0, description: "Acropolis, ancient philosophy, and Mediterranean warmth" },
  { name: "Auckland", countryCode: "NZ", latitude: -36.8485, longitude: 174.7633, population: 1657000, popularity: 62, costIndex: 7.5, description: "City of sails between two harbors with volcanic landscapes" },
];

// ==================== ACTIVITIES (samples for top cities) ====================
const activityData = [
  // Paris
  { cityName: "Paris", name: "Eiffel Tower Visit", category: "sightseeing" as const, description: "Iconic iron lattice tower with panoramic city views", estimatedCost: 25, durationMin: 120, latitude: 48.8584, longitude: 2.2945 },
  { cityName: "Paris", name: "Louvre Museum", category: "culture" as const, description: "World's largest art museum — home to Mona Lisa", estimatedCost: 17, durationMin: 180, latitude: 48.8606, longitude: 2.3376 },
  { cityName: "Paris", name: "Seine River Cruise", category: "sightseeing" as const, description: "Scenic boat ride past Notre-Dame and historic bridges", estimatedCost: 15, durationMin: 90, latitude: 48.8588, longitude: 2.2944 },
  { cityName: "Paris", name: "Croissant at Café de Flore", category: "food" as const, description: "Legendary Saint-Germain café since 1887", estimatedCost: 12, durationMin: 45, latitude: 48.8540, longitude: 2.3325 },
  // Tokyo
  { cityName: "Tokyo", name: "Senso-ji Temple", category: "culture" as const, description: "Tokyo's oldest Buddhist temple in Asakusa", estimatedCost: 0, durationMin: 90, latitude: 35.7148, longitude: 139.7967 },
  { cityName: "Tokyo", name: "Shibuya Crossing", category: "sightseeing" as const, description: "World's busiest pedestrian crossing", estimatedCost: 0, durationMin: 30, latitude: 35.6595, longitude: 139.7004 },
  { cityName: "Tokyo", name: "Tsukiji Outer Market Food Tour", category: "food" as const, description: "Fresh sushi, tamagoyaki, and street food paradise", estimatedCost: 30, durationMin: 120, latitude: 35.6654, longitude: 139.7707 },
  { cityName: "Tokyo", name: "TeamLab Borderless", category: "culture" as const, description: "Immersive digital art museum", estimatedCost: 32, durationMin: 150, latitude: 35.6267, longitude: 139.7838 },
  // Goa
  { cityName: "Goa", name: "Baga Beach", category: "nature" as const, description: "Golden sand beach with water sports and shacks", estimatedCost: 5, durationMin: 180, latitude: 15.5551, longitude: 73.7513 },
  { cityName: "Goa", name: "Old Goa Churches", category: "culture" as const, description: "UNESCO World Heritage basilicas and cathedrals", estimatedCost: 0, durationMin: 120, latitude: 15.5010, longitude: 73.9116 },
  { cityName: "Goa", name: "Dudhsagar Falls Trek", category: "adventure" as const, description: "Stunning four-tiered waterfall in the Western Ghats", estimatedCost: 20, durationMin: 360, latitude: 15.3144, longitude: 74.3143 },
  // Jaipur
  { cityName: "Jaipur", name: "Amber Fort", category: "sightseeing" as const, description: "Majestic hilltop fort with mirror palace", estimatedCost: 5, durationMin: 150, latitude: 26.9855, longitude: 75.8513 },
  { cityName: "Jaipur", name: "Hawa Mahal", category: "sightseeing" as const, description: "Palace of Winds — 953 small windows in pink sandstone", estimatedCost: 2, durationMin: 60, latitude: 26.9239, longitude: 75.8267 },
  { cityName: "Jaipur", name: "Johari Bazaar Shopping", category: "shopping" as const, description: "Traditional jewelry, textiles, and handicrafts", estimatedCost: 30, durationMin: 120, latitude: 26.9214, longitude: 75.8236 },
  // Bali
  { cityName: "Bali", name: "Tegallalang Rice Terraces", category: "nature" as const, description: "Iconic emerald rice paddies with jungle swing", estimatedCost: 10, durationMin: 120, latitude: -8.4312, longitude: 115.2792 },
  { cityName: "Bali", name: "Uluwatu Temple Sunset", category: "culture" as const, description: "Cliffside temple with Kecak dance at sunset", estimatedCost: 5, durationMin: 150, latitude: -8.8291, longitude: 115.0849 },
  { cityName: "Bali", name: "Surfing at Kuta Beach", category: "adventure" as const, description: "Beginner-friendly waves with board rental", estimatedCost: 15, durationMin: 180, latitude: -8.7180, longitude: 115.1689 },
  // Rome
  { cityName: "Rome", name: "Colosseum Tour", category: "sightseeing" as const, description: "Ancient amphitheatre — gladiatorial arena", estimatedCost: 18, durationMin: 120, latitude: 41.8902, longitude: 12.4922 },
  { cityName: "Rome", name: "Vatican Museums & Sistine Chapel", category: "culture" as const, description: "Michelangelo's ceiling and millennia of papal art", estimatedCost: 20, durationMin: 240, latitude: 41.9065, longitude: 12.4536 },
  { cityName: "Rome", name: "Trastevere Food Walk", category: "food" as const, description: "Carbonara, supplì, and gelato in cobblestone alleys", estimatedCost: 25, durationMin: 150, latitude: 41.8862, longitude: 12.4679 },
];

// ==================== INSERT DATA ====================

try {
  // Insert countries
  console.log("  📍 Inserting countries...");
  for (const country of countryData) {
    db.insert(countries).values(country).onConflictDoNothing().run();
  }
  console.log(`  ✅ ${countryData.length} countries inserted`);

  // Insert cities
  console.log("  🏙️  Inserting cities...");
  const cityIds: Record<string, string> = {};
  for (const city of cityData) {
    const id = crypto.randomUUID();
    cityIds[city.name] = id;
    db.insert(cities).values({ id, ...city }).onConflictDoNothing().run();
  }
  console.log(`  ✅ ${cityData.length} cities inserted`);

  // Insert activities
  console.log("  🎯 Inserting activities...");
  let actCount = 0;
  for (const act of activityData) {
    const cityId = cityIds[act.cityName];
    if (cityId) {
      db.insert(activities).values({
        id: crypto.randomUUID(),
        cityId,
        name: act.name,
        category: act.category,
        description: act.description,
        estimatedCost: act.estimatedCost,
        durationMin: act.durationMin,
        latitude: act.latitude,
        longitude: act.longitude,
        source: "seed",
      }).onConflictDoNothing().run();
      actCount++;
    }
  }
  console.log(`  ✅ ${actCount} activities inserted`);

  console.log("\n🎉 Seed complete!\n");
} catch (error) {
  console.error("❌ Seed failed:", error);
  process.exit(1);
}

process.exit(0);
