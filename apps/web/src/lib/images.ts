export const CITY_IMAGES: Record<string, string> = {
  paris: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80",
  london: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80",
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80",
  "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80",
  dubai: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80",
  barcelona: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80",
  amsterdam: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&q=80",
  bangkok: "https://images.unsplash.com/photo-1508009603885-247a59a41f81?auto=format&fit=crop&q=80",
  singapore: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80",
  jaipur: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80",
  reykjavik: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&q=80",
  sydney: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80",
};

export const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80", // Mountains
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80", // Beach
  "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&q=80", // Japan
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80", // Road trip
  "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?auto=format&fit=crop&q=80", // Adventure
];

export function getTripImageUrl(name: string, id: string, providedUrl?: string | null, width: number = 800): string {
  if (providedUrl) return providedUrl;
  
  const normalizedName = (name || "").toLowerCase().trim();
  const matchedKey = Object.keys(CITY_IMAGES).find((k) => normalizedName.includes(k));
  
  let baseUrl = "";
  if (matchedKey) {
    baseUrl = CITY_IMAGES[matchedKey];
  } else {
    // Generate consistent default based on trip ID
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const coverIndex = hash % DEFAULT_COVERS.length;
    baseUrl = DEFAULT_COVERS[coverIndex];
  }
  
  return `${baseUrl}&w=${width}`;
}

export function getTripHeaderStyle(name: string, id: string, providedUrl?: string | null) {
  const bgUrl = getTripImageUrl(name, id, providedUrl, 2000);
  return {
    background: `linear-gradient(to right, rgba(10,10,10,0.98) 0%, rgba(10,10,10,0.85) 40%, rgba(10,10,10,0.4) 100%), url('${bgUrl}') center/cover`,
    padding: "var(--space-8) var(--space-6)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "inset 0 0 100px rgba(0,0,0,0.9)",
    marginBottom: "var(--space-6)",
    color: "#fff",
  };
}
