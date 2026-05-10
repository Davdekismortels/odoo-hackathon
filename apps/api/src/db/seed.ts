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

// ==================== ACTIVITIES (expanded for all major cities) ====================
const activityData = [
  // Paris
  { cityName: "Paris", name: "Eiffel Tower Visit", category: "sightseeing" as const, description: "Iconic iron lattice tower with panoramic city views", estimatedCost: 25, durationMin: 120, latitude: 48.8584, longitude: 2.2945 },
  { cityName: "Paris", name: "Louvre Museum", category: "culture" as const, description: "World's largest art museum — home to Mona Lisa", estimatedCost: 17, durationMin: 180, latitude: 48.8606, longitude: 2.3376 },
  { cityName: "Paris", name: "Seine River Cruise", category: "sightseeing" as const, description: "Scenic boat ride past Notre-Dame and historic bridges", estimatedCost: 15, durationMin: 90, latitude: 48.8588, longitude: 2.2944 },
  { cityName: "Paris", name: "Croissant at Café de Flore", category: "food" as const, description: "Legendary Saint-Germain café since 1887", estimatedCost: 12, durationMin: 45, latitude: 48.8540, longitude: 2.3325 },
  { cityName: "Paris", name: "Montmartre & Sacré-Cœur", category: "sightseeing" as const, description: "Bohemian hilltop village with stunning basilica views", estimatedCost: 5, durationMin: 150, latitude: 48.8867, longitude: 2.3431 },
  // Tokyo
  { cityName: "Tokyo", name: "Senso-ji Temple", category: "culture" as const, description: "Tokyo's oldest Buddhist temple in Asakusa", estimatedCost: 0, durationMin: 90, latitude: 35.7148, longitude: 139.7967 },
  { cityName: "Tokyo", name: "Shibuya Crossing", category: "sightseeing" as const, description: "World's busiest pedestrian crossing", estimatedCost: 0, durationMin: 30, latitude: 35.6595, longitude: 139.7004 },
  { cityName: "Tokyo", name: "Tsukiji Outer Market Food Tour", category: "food" as const, description: "Fresh sushi, tamagoyaki, and street food paradise", estimatedCost: 30, durationMin: 120, latitude: 35.6654, longitude: 139.7707 },
  { cityName: "Tokyo", name: "TeamLab Borderless", category: "culture" as const, description: "Immersive digital art museum", estimatedCost: 32, durationMin: 150, latitude: 35.6267, longitude: 139.7838 },
  { cityName: "Tokyo", name: "Harajuku Takeshita Street", category: "shopping" as const, description: "Quirky fashion, crepes, and pop culture", estimatedCost: 20, durationMin: 90, latitude: 35.6699, longitude: 139.7028 },
  // London
  { cityName: "London", name: "British Museum", category: "culture" as const, description: "World history under one roof — Rosetta Stone, Elgin Marbles", estimatedCost: 0, durationMin: 180, latitude: 51.5194, longitude: -0.1270 },
  { cityName: "London", name: "Tower of London", category: "sightseeing" as const, description: "Historic castle housing the Crown Jewels", estimatedCost: 28, durationMin: 150, latitude: 51.5081, longitude: -0.0759 },
  { cityName: "London", name: "Borough Market", category: "food" as const, description: "London's oldest food market with artisan produce", estimatedCost: 20, durationMin: 90, latitude: 51.5055, longitude: -0.0910 },
  { cityName: "London", name: "Thames River Walk", category: "sightseeing" as const, description: "Walk from Tower Bridge to Westminster via South Bank", estimatedCost: 0, durationMin: 120, latitude: 51.5055, longitude: -0.0752 },
  { cityName: "London", name: "West End Show", category: "culture" as const, description: "World-class theatre on and around Shaftesbury Avenue", estimatedCost: 60, durationMin: 180, latitude: 51.5130, longitude: -0.1312 },
  // New York
  { cityName: "New York", name: "Central Park", category: "nature" as const, description: "843-acre urban oasis with lakes, meadows, and the zoo", estimatedCost: 0, durationMin: 120, latitude: 40.7851, longitude: -73.9683 },
  { cityName: "New York", name: "Empire State Building", category: "sightseeing" as const, description: "86th floor observation deck with 360° city views", estimatedCost: 44, durationMin: 90, latitude: 40.7484, longitude: -73.9857 },
  { cityName: "New York", name: "The Metropolitan Museum of Art", category: "culture" as const, description: "Largest art museum in the Americas", estimatedCost: 30, durationMin: 240, latitude: 40.7794, longitude: -73.9632 },
  { cityName: "New York", name: "NYC Pizza Slice & Deli Crawl", category: "food" as const, description: "Iconic dollar slices, Katz's pastrami, and bagels", estimatedCost: 25, durationMin: 120, latitude: 40.7222, longitude: -73.9874 },
  { cityName: "New York", name: "Brooklyn Bridge Walk", category: "sightseeing" as const, description: "Walk across the iconic 1883 suspension bridge", estimatedCost: 0, durationMin: 60, latitude: 40.7061, longitude: -73.9969 },
  // Bangkok
  { cityName: "Bangkok", name: "Grand Palace & Wat Phra Kaew", category: "culture" as const, description: "Former royal residence with the Emerald Buddha", estimatedCost: 15, durationMin: 180, latitude: 13.7500, longitude: 100.4913 },
  { cityName: "Bangkok", name: "Chatuchak Weekend Market", category: "shopping" as const, description: "One of the world's largest markets — 8,000 stalls", estimatedCost: 10, durationMin: 180, latitude: 13.7999, longitude: 100.5501 },
  { cityName: "Bangkok", name: "Tuk-tuk Street Food Tour", category: "food" as const, description: "Pad thai, mango sticky rice, and som tum street stalls", estimatedCost: 20, durationMin: 150, latitude: 13.7563, longitude: 100.5018 },
  { cityName: "Bangkok", name: "Chao Phraya River Cruise", category: "sightseeing" as const, description: "Sunset boat ride past temples and colonial facades", estimatedCost: 12, durationMin: 90, latitude: 13.7440, longitude: 100.4900 },
  // Istanbul
  { cityName: "Istanbul", name: "Hagia Sophia", category: "culture" as const, description: "6th-century marvel — once cathedral, mosque, now museum", estimatedCost: 8, durationMin: 120, latitude: 41.0086, longitude: 28.9802 },
  { cityName: "Istanbul", name: "Grand Bazaar", category: "shopping" as const, description: "60 streets, 4,000 shops — one of world's oldest markets", estimatedCost: 5, durationMin: 120, latitude: 41.0106, longitude: 28.9682 },
  { cityName: "Istanbul", name: "Bosphorus Cruise", category: "sightseeing" as const, description: "Sail between Europe and Asia at sunset", estimatedCost: 15, durationMin: 120, latitude: 41.0766, longitude: 29.0395 },
  { cityName: "Istanbul", name: "Turkish Breakfast in Kadıköy", category: "food" as const, description: "Spread of simit, menemen, olives, and çay", estimatedCost: 10, durationMin: 90, latitude: 40.9905, longitude: 29.0222 },
  // Dubai
  { cityName: "Dubai", name: "Burj Khalifa Observation Deck", category: "sightseeing" as const, description: "Views from the world's tallest building at 828m", estimatedCost: 40, durationMin: 120, latitude: 25.1972, longitude: 55.2744 },
  { cityName: "Dubai", name: "Dubai Desert Safari", category: "adventure" as const, description: "Dune bashing, camel riding, and BBQ dinner under stars", estimatedCost: 60, durationMin: 360, latitude: 24.9857, longitude: 55.2208 },
  { cityName: "Dubai", name: "The Dubai Mall & Aquarium", category: "shopping" as const, description: "World's largest mall with underwater tunnel", estimatedCost: 20, durationMin: 180, latitude: 25.1975, longitude: 55.2796 },
  { cityName: "Dubai", name: "Dubai Creek Abra Ride", category: "sightseeing" as const, description: "Traditional wooden boat across the historic creek", estimatedCost: 2, durationMin: 30, latitude: 25.2637, longitude: 55.2970 },
  // Singapore
  { cityName: "Singapore", name: "Gardens by the Bay", category: "nature" as const, description: "Futuristic Supertrees and Cloud Forest biodomes", estimatedCost: 28, durationMin: 180, latitude: 1.2816, longitude: 103.8636 },
  { cityName: "Singapore", name: "Hawker Centre Food Crawl", category: "food" as const, description: "Hainanese chicken rice, laksa, and char kway teow", estimatedCost: 15, durationMin: 120, latitude: 1.3521, longitude: 103.8198 },
  { cityName: "Singapore", name: "Marina Bay Sands Skypark", category: "sightseeing" as const, description: "Iconic infinity pool and 360° city panorama", estimatedCost: 24, durationMin: 90, latitude: 1.2838, longitude: 103.8607 },
  { cityName: "Singapore", name: "Sentosa Island", category: "adventure" as const, description: "Beach clubs, Universal Studios, and cable cars", estimatedCost: 35, durationMin: 300, latitude: 1.2494, longitude: 103.8303 },
  // Barcelona
  { cityName: "Barcelona", name: "Sagrada Família", category: "sightseeing" as const, description: "Gaudí's unfinished masterpiece — a UNESCO wonder", estimatedCost: 26, durationMin: 120, latitude: 41.4036, longitude: 2.1744 },
  { cityName: "Barcelona", name: "La Boqueria Market", category: "food" as const, description: "Iconic market with fresh seafood, jamón, and fruit", estimatedCost: 15, durationMin: 90, latitude: 41.3816, longitude: 2.1720 },
  { cityName: "Barcelona", name: "Park Güell", category: "nature" as const, description: "Gaudí's mosaic terraces with views over the city", estimatedCost: 10, durationMin: 120, latitude: 41.4145, longitude: 2.1527 },
  { cityName: "Barcelona", name: "Barceloneta Beach & Tapas", category: "food" as const, description: "Sunbathing followed by patatas bravas and sangria", estimatedCost: 20, durationMin: 180, latitude: 41.3793, longitude: 2.1900 },
  // Amsterdam
  { cityName: "Amsterdam", name: "Rijksmuseum", category: "culture" as const, description: "Dutch masters — Rembrandt and Vermeer in one building", estimatedCost: 22, durationMin: 180, latitude: 52.3600, longitude: 4.8852 },
  { cityName: "Amsterdam", name: "Anne Frank House", category: "culture" as const, description: "Moving museum in the hiding place of Anne Frank", estimatedCost: 16, durationMin: 90, latitude: 52.3752, longitude: 4.8840 },
  { cityName: "Amsterdam", name: "Canal Boat Tour", category: "sightseeing" as const, description: "See 17th-century merchant houses from the water", estimatedCost: 18, durationMin: 75, latitude: 52.3676, longitude: 4.9041 },
  { cityName: "Amsterdam", name: "Stroopwafel & Cheese Tasting", category: "food" as const, description: "Dutch caramel waffles and Gouda at the Albert Cuyp market", estimatedCost: 12, durationMin: 60, latitude: 52.3553, longitude: 4.8933 },
  // Berlin
  { cityName: "Berlin", name: "Brandenburg Gate", category: "sightseeing" as const, description: "Neoclassical symbol of Berlin's turbulent history", estimatedCost: 0, durationMin: 45, latitude: 52.5163, longitude: 13.3777 },
  { cityName: "Berlin", name: "Berlin Wall Memorial", category: "culture" as const, description: "Preserved stretch of the Iron Curtain with history panels", estimatedCost: 0, durationMin: 90, latitude: 52.5352, longitude: 13.3928 },
  { cityName: "Berlin", name: "Museum Island", category: "culture" as const, description: "Five world-class museums on a UNESCO island", estimatedCost: 18, durationMin: 240, latitude: 52.5169, longitude: 13.4019 },
  { cityName: "Berlin", name: "Street Food Thursday at Markthalle IX", category: "food" as const, description: "International food stalls in a historic iron market hall", estimatedCost: 15, durationMin: 90, latitude: 52.4991, longitude: 13.4322 },
  // Prague
  { cityName: "Prague", name: "Prague Castle", category: "sightseeing" as const, description: "Largest ancient castle complex in the world", estimatedCost: 15, durationMin: 180, latitude: 50.0906, longitude: 14.4008 },
  { cityName: "Prague", name: "Charles Bridge at Sunrise", category: "sightseeing" as const, description: "Medieval bridge with 30 Baroque statues over the Vltava", estimatedCost: 0, durationMin: 45, latitude: 50.0865, longitude: 14.4114 },
  { cityName: "Prague", name: "Old Town Square & Astronomical Clock", category: "culture" as const, description: "600-year-old mechanical clock performing every hour", estimatedCost: 0, durationMin: 60, latitude: 50.0870, longitude: 14.4213 },
  { cityName: "Prague", name: "Czech Beer Tasting", category: "food" as const, description: "Pilsner Urquell and svíčková in a cellar pub", estimatedCost: 18, durationMin: 120, latitude: 50.0818, longitude: 14.4332 },
  // Kyoto
  { cityName: "Kyoto", name: "Fushimi Inari Shrine", category: "sightseeing" as const, description: "Thousands of vermillion torii gates on a forested hill", estimatedCost: 0, durationMin: 180, latitude: 34.9671, longitude: 135.7727 },
  { cityName: "Kyoto", name: "Arashiyama Bamboo Grove", category: "nature" as const, description: "Tall swaying bamboo stalks lining a mystical pathway", estimatedCost: 0, durationMin: 90, latitude: 35.0094, longitude: 135.6717 },
  { cityName: "Kyoto", name: "Geisha District Walk in Gion", category: "culture" as const, description: "Traditional wooden machiya, teahouses, and maiko spotting", estimatedCost: 0, durationMin: 120, latitude: 35.0037, longitude: 135.7752 },
  { cityName: "Kyoto", name: "Tea Ceremony Experience", category: "culture" as const, description: "Traditional matcha preparation in a tatami room", estimatedCost: 30, durationMin: 60, latitude: 35.0116, longitude: 135.7681 },
  // Sydney
  { cityName: "Sydney", name: "Sydney Opera House Tour", category: "culture" as const, description: "Backstage tour of Jørn Utzon's UNESCO masterpiece", estimatedCost: 35, durationMin: 90, latitude: -33.8568, longitude: 151.2153 },
  { cityName: "Sydney", name: "Bondi to Coogee Coastal Walk", category: "nature" as const, description: "6km cliff-top walk with ocean pools and secluded beaches", estimatedCost: 0, durationMin: 150, latitude: -33.8908, longitude: 151.2743 },
  { cityName: "Sydney", name: "Sydney Harbour Bridge Climb", category: "adventure" as const, description: "Scale Australia's most iconic steel arch bridge", estimatedCost: 160, durationMin: 210, latitude: -33.8523, longitude: 151.2107 },
  { cityName: "Sydney", name: "Fish Market Breakfast", category: "food" as const, description: "Fresh oysters and barramundi at the world's busiest fish market", estimatedCost: 25, durationMin: 90, latitude: -33.8748, longitude: 151.1949 },
  // Mumbai
  { cityName: "Mumbai", name: "Gateway of India", category: "sightseeing" as const, description: "Colonial archway overlooking the Arabian Sea", estimatedCost: 0, durationMin: 60, latitude: 18.9220, longitude: 72.8347 },
  { cityName: "Mumbai", name: "Dharavi Slum Walking Tour", category: "culture" as const, description: "Insightful community tour of Asia's largest township", estimatedCost: 20, durationMin: 180, latitude: 19.0424, longitude: 72.8530 },
  { cityName: "Mumbai", name: "Vada Pav Street Food Trail", category: "food" as const, description: "Mumbai's iconic spiced potato burger and cutting chai", estimatedCost: 5, durationMin: 90, latitude: 19.0760, longitude: 72.8777 },
  { cityName: "Mumbai", name: "Chhatrapati Shivaji Terminus", category: "culture" as const, description: "UNESCO Victorian-Gothic railway station still in use", estimatedCost: 0, durationMin: 45, latitude: 18.9398, longitude: 72.8354 },
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
