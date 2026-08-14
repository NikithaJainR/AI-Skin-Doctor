export interface NearbyDoctor {
  id: string;
  doctorName: string | null;
  facilityName: string;
  type: "dermatologist" | "clinic" | "hospital" | "doctor";
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  directionsUrl: string;
  isDermatologySpecialist: boolean;
}

// Calculate Haversine distance in kilometers
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

// Overpass API fetch helper
async function queryOverpass(lat: number, lon: number, radiusMeters: number): Promise<any[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["healthcare"="dermatology"](around:${radiusMeters}, ${lat}, ${lon});
      node["healthcare"="doctor"](around:${radiusMeters}, ${lat}, ${lon});
      node["healthcare"="clinic"](around:${radiusMeters}, ${lat}, ${lon});
      node["amenity"="doctors"](around:${radiusMeters}, ${lat}, ${lon});
      node["amenity"="clinic"](around:${radiusMeters}, ${lat}, ${lon});
      node["amenity"="hospital"](around:${radiusMeters}, ${lat}, ${lon});
      way["healthcare"="dermatology"](around:${radiusMeters}, ${lat}, ${lon});
      way["healthcare"="clinic"](around:${radiusMeters}, ${lat}, ${lon});
      way["amenity"="doctors"](around:${radiusMeters}, ${lat}, ${lon});
      way["amenity"="clinic"](around:${radiusMeters}, ${lat}, ${lon});
      way["amenity"="hospital"](around:${radiusMeters}, ${lat}, ${lon});
    );
    out center body;
  `;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  ];

  let lastErr: any = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.elements)) {
          return data.elements;
        }
      }
    } catch (err) {
      lastErr = err;
      console.warn(`Overpass query failed on ${endpoint}, trying fallback...`, err);
    }
  }

  if (lastErr) throw lastErr;
  return [];
}

// Normalize raw Overpass OSM element to NearbyDoctor
export function normalizeOsmElement(element: any, userLat: number, userLon: number): NearbyDoctor | null {
  const tags = element.tags || {};

  // Extract coordinates
  let lat = element.lat;
  let lon = element.lon;
  if (element.center) {
    lat = element.center.lat;
    lon = element.center.lon;
  }

  if (typeof lat !== "number" || typeof lon !== "number") {
    return null;
  }

  const distanceKm = calculateHaversineDistance(userLat, userLon, lat, lon);

  // Check name & specialty
  const rawName = tags.name || tags.official_name || tags.brand || "";
  const doctorNameTag = tags["doctor:name"] || tags["person:name"] || tags["contact:person"] || null;

  let doctorName: string | null = null;
  if (doctorNameTag) {
    doctorName = doctorNameTag.startsWith("Dr.") ? doctorNameTag : `Dr. ${doctorNameTag}`;
  } else if (/^dr\.?\s/i.test(rawName) || /^doctor\s/i.test(rawName)) {
    doctorName = rawName;
  }

  let facilityName = rawName;
  if (!facilityName) {
    if (tags.healthcare === "dermatology") facilityName = "Dermatology Clinic";
    else if (tags.amenity === "clinic" || tags.healthcare === "clinic") facilityName = "Medical Clinic";
    else if (tags.amenity === "doctors" || tags.healthcare === "doctor") facilityName = "Doctor's Clinic";
    else if (tags.amenity === "hospital") facilityName = "Medical Center / Hospital";
    else facilityName = "Healthcare Provider";
  }

  // Detect dermatology specificity
  const isDermatology =
    tags.healthcare === "dermatology" ||
    tags["healthcare:speciality"] === "dermatology" ||
    tags.specialty === "dermatology" ||
    /dermatol|skin|derma|cutaneous|cosmetol/i.test(facilityName) ||
    (doctorName && /dermatol|skin/i.test(doctorName));

  let type: NearbyDoctor["type"] = "clinic";
  if (isDermatology) {
    type = "dermatologist";
  } else if (tags.amenity === "hospital") {
    type = "hospital";
  } else if (tags.amenity === "doctors" || tags.healthcare === "doctor") {
    type = "doctor";
  }

  // Construct Address from existing OSM tags
  const addressParts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"] || tags["addr:neighbourhood"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  let address = addressParts.length > 0 ? addressParts.join(", ") : tags["addr:full"] || null;

  if (!address) {
    address = "Address not listed";
  }

  // Phone number extraction
  const phone = tags.phone || tags["contact:phone"] || tags["phone:mobile"] || tags["contact:mobile"] || null;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

  return {
    id: `osm-${element.type}-${element.id}`,
    doctorName,
    facilityName,
    type,
    address,
    phone,
    latitude: lat,
    longitude: lon,
    distanceKm,
    directionsUrl,
    isDermatologySpecialist: Boolean(isDermatology),
  };
}

// Fetch nearby doctors using 5km radius first, then expanding to 10km if < 5 results
export async function findNearbyDoctors(userLat: number, userLon: number): Promise<NearbyDoctor[]> {
  let rawElements = await queryOverpass(userLat, userLon, 5000);

  let normalized = rawElements
    .map((el) => normalizeOsmElement(el, userLat, userLon))
    .filter((doc): doc is NearbyDoctor => doc !== null);

  // If fewer than 5 results found within 5km, expand search to 10km
  if (normalized.length < 5) {
    const rawElements10k = await queryOverpass(userLat, userLon, 10000);
    normalized = rawElements10k
      .map((el) => normalizeOsmElement(el, userLat, userLon))
      .filter((doc): doc is NearbyDoctor => doc !== null);
  }

  // Deduplicate by ID or location coordinates
  const seen = new Set<string>();
  const uniqueDocs: NearbyDoctor[] = [];
  for (const doc of normalized) {
    const key = `${doc.facilityName.toLowerCase()}-${doc.latitude.toFixed(4)}-${doc.longitude.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDocs.push(doc);
    }
  }

  // Sort prioritization:
  // 1. Dermatology specialists first
  // 2. Dermatology / skin clinics
  // 3. Doctors
  // 4. Hospitals
  // Then sort by distance (closest first)
  uniqueDocs.sort((a, b) => {
    if (a.isDermatologySpecialist && !b.isDermatologySpecialist) return -1;
    if (!a.isDermatologySpecialist && b.isDermatologySpecialist) return 1;

    // Type ranking: dermatologist (0) < clinic (1) < doctor (2) < hospital (3)
    const typeRank = { dermatologist: 0, clinic: 1, doctor: 2, hospital: 3 };
    const rankA = typeRank[a.type] ?? 2;
    const rankB = typeRank[b.type] ?? 2;
    if (rankA !== rankB) return rankA - rankB;

    return a.distanceKm - b.distanceKm;
  });

  return uniqueDocs;
}

// Geocode a city or area query using Nominatim OSM API
export async function geocodeCityAndFindDoctors(cityQuery: string): Promise<{
  cityFormatted: string;
  coords: { latitude: number; longitude: number } | null;
  doctors: NearbyDoctor[];
}> {
  const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cityQuery
  )}&limit=1`;

  const res = await fetch(nomUrl, {
    headers: {
      "User-Agent": "AISkinDoctor/1.0",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to geocode location.");
  }

  const data = await res.json();
  if (!data || data.length === 0) {
    return {
      cityFormatted: cityQuery,
      coords: null,
      doctors: [],
    };
  }

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);
  const cityFormatted = data[0].display_name || cityQuery;

  const doctors = await findNearbyDoctors(lat, lon);

  return {
    cityFormatted,
    coords: { latitude: lat, longitude: lon },
    doctors,
  };
}
