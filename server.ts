import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// CORS headers
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Increase payload limit for media uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to safely obtain Gemini AI client
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in environment variables. If deploying on Vercel, please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint (matches both /api/health and /health)
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok", service: "AI Skin Doctor API" });
});

// Helper to convert data URL to inlineData part
function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+|video\/[a-zA-Z+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      inlineData: {
        mimeType: matches[1],
        data: matches[2],
      },
    };
  }
  // Fallback assuming jpeg
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Data,
    },
  };
}

// 1. Primary AI Skin Analysis Endpoint (matches both /api/analyze-skin and /analyze-skin)
app.post(["/api/analyze-skin", "/analyze-skin"], async (req, res) => {
  try {
    const { images = [], videoFrames = [], patientInfo = {}, language = "English" } = req.body;

    const ai = getAiClient();

    const mediaParts: any[] = [];

    // Add image parts
    for (const img of images) {
      if (typeof img === "string" && img.startsWith("data:")) {
        mediaParts.push(parseDataUrl(img));
      }
    }

    // Add video frames
    for (const frame of videoFrames) {
      if (typeof frame === "string" && frame.startsWith("data:")) {
        mediaParts.push(parseDataUrl(frame));
      }
    }

    const patientSummary = `
Patient Age: ${patientInfo.age || "Not specified"}
Gender: ${patientInfo.gender || "Not specified"}
Skin Tone / Type: ${patientInfo.skinTone || "Not specified"} / ${patientInfo.skinType || "Not specified"}
Symptom Duration: ${patientInfo.duration || "Not specified"}
Reported Symptoms: ${(patientInfo.symptoms || []).join(", ") || "None selected"}
Medical History: ${patientInfo.medicalHistory || "None reported"}
Current Medications: ${patientInfo.medications || "None"}
Known Allergies: ${patientInfo.allergies || "None"}
Patient's Spoken Description: "${patientInfo.spokenTranscript || "None provided"}"
    `.trim();

    const promptText = `
You are a highly experienced board-certified consultant dermatologist providing educational preliminary guidance.
Analyze all attached skin lesion images and video frames carefully alongside the patient's case notes.

CRITICAL MEDICAL & SAFETY INSTRUCTIONS:
1. Provide thoughtful educational assessment based on visual skin findings and patient history.
2. ALWAYS express appropriate medical uncertainty and highlight that this is NOT a definitive diagnosis.
3. Identify potential region bounding boxes on the primary image if applicable, using 0-100 normalized percentage coordinates: [ymin, xmin, ymax, xmax].
4. Output response strictly in JSON matching the specified schema.
5. Provide all descriptive text fields in the requested language: "${language}".

Patient Case Profile:
${patientSummary}
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        possible_condition: { type: Type.STRING, description: "Most plausible skin condition name" },
        confidence_score: { type: Type.INTEGER, description: "Educational confidence percentage between 30 and 95" },
        severity: { type: Type.STRING, description: "Severity category: low, moderate, high, or urgent" },
        summary: { type: Type.STRING, description: "Concise summary of preliminary findings" },
        visual_observations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key visible dermatological signs (erythema, papules, scaling, border regularity, color variation)",
        },
        possible_causes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Potential underlying triggers or differential causes",
        },
        supporting_reasoning: { type: Type.STRING, description: "Clinical reasoning linking symptoms and images to condition" },
        recommended_home_care: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Safe gentle non-invasive home management tips",
        },
        recommended_otc_products: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Common over-the-counter soothing options (e.g., hydrocortisone, zinc oxide, gentle cleanser)",
        },
        ingredients_to_look_for: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Beneficial skincare active ingredients (e.g., ceramides, niacinamide, colloidal oatmeal)",
        },
        ingredients_to_avoid: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Potentially irritating ingredients to avoid (e.g., harsh fragrances, strong retinoids, sulfates)",
        },
        lifestyle_changes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Practices to prevent aggravation (e.g., wear loose cotton, avoid hot showers)",
        },
        diet_recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Hydration and dietary considerations",
        },
        when_to_visit_doctor: { type: Type.STRING, description: "Explicit criteria for seeking professional dermatological care" },
        red_flags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Urgent red flag symptoms requiring immediate medical evaluation",
        },
        follow_up_questions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Targeted follow-up questions to help refine understanding",
        },
        prevention_tips: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Long term preventative skin wellness advice",
        },
        medical_disclaimer: { type: Type.STRING, description: "Standard medical disclaimer" },
        annotated_regions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              description: { type: Type.STRING },
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: "[ymin, xmin, ymax, xmax] as percentage integers 0-100",
              },
              color: { type: Type.STRING, description: "Hex or CSS color string e.g. #ef4444" },
            },
          },
        },
      },
      required: [
        "possible_condition",
        "confidence_score",
        "severity",
        "summary",
        "visual_observations",
        "possible_causes",
        "supporting_reasoning",
        "recommended_home_care",
        "recommended_otc_products",
        "ingredients_to_look_for",
        "ingredients_to_avoid",
        "lifestyle_changes",
        "when_to_visit_doctor",
        "red_flags",
        "medical_disclaimer",
      ],
    };

    const parts = [...mediaParts, { text: promptText }];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text || "{}";
    const reportData = JSON.parse(responseText);

    return res.json({ success: true, report: reportData });
  } catch (error: any) {
    console.error("AI Skin Doctor Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to analyze skin image. Please try again.",
    });
  }
});

// 2. Interactive AI Chat Assistant Endpoint (matches /api/chat and /chat)
app.post(["/api/chat", "/chat"], async (req, res) => {
  try {
    const { message, previousAssessment, chatHistory = [], language = "English" } = req.body;

    const ai = getAiClient();

    const systemInstruction = `
You are AI Skin Doctor, a compassionate, articulate, and knowledgeable AI dermatologist assistant.
You are helping a user with follow-up questions regarding their preliminary skin assessment.

Current Assessment Context:
- Condition: ${previousAssessment?.possible_condition || "Skin concern"}
- Severity: ${previousAssessment?.severity || "Unknown"}
- Summary: ${previousAssessment?.summary || "No summary"}
- Recommendations: ${(previousAssessment?.recommended_home_care || []).join("; ")}

Guidelines:
1. Provide accurate, helpful, and accessible educational answers.
2. Answer questions about ingredients, spreading, pediatric concerns, contagious risks, sunscreen usage, and lifestyle tips clearly.
3. Always maintain a warm, reassuring tone.
4. Always remind the user to consult a board-certified doctor for prescriptions or confirmed diagnoses.
5. Respond in "${language}".
    `.trim();

    // Prepare history messages
    const formattedHistory = chatHistory.map((item: { role: string; content: string }) => ({
      role: item.role === "user" ? "user" : "model",
      parts: [{ text: item.content }],
    }));

    const contents = [
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process question.",
    });
  }
});

// 3. AI Skin Progress Comparison Endpoint (matches /api/compare-progress and /compare-progress)
app.post(["/api/compare-progress", "/compare-progress"], async (req, res) => {
  try {
    const { beforeImage, afterImage, conditionName = "skin issue", language = "English" } = req.body;

    const ai = getAiClient();

    const parts: any[] = [];
    if (beforeImage && beforeImage.startsWith("data:")) {
      parts.push(parseDataUrl(beforeImage));
    }
    if (afterImage && afterImage.startsWith("data:")) {
      parts.push(parseDataUrl(afterImage));
    }

    const promptText = `
Compare the two skin lesion images provided:
Image 1 is the BEFORE photo.
Image 2 is the AFTER photo (subsequent photo during treatment or monitoring of ${conditionName}).

Analyze visual changes between Before and After:
- Improvement percentage (0 to 100)
- Color/Erythema difference (e.g. "Redness reduced significantly")
- Texture/Surface change (e.g. "Lesion flattened, less scaling")
- Swelling reduction
- Pigmentation change
- Summary evaluation and next steps advice.

Respond in JSON language: "${language}".
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        improvement_percentage: { type: Type.INTEGER, description: "Estimated percentage improvement" },
        overall_status: { type: Type.STRING, description: "e.g. Significantly Improved, Mildly Improved, Unchanged, or Worsened" },
        color_difference: { type: Type.STRING },
        texture_difference: { type: Type.STRING },
        swelling_reduction: { type: Type.STRING },
        pigmentation_change: { type: Type.STRING },
        detailed_comparison: { type: Type.STRING },
        encouragement_or_advice: { type: Type.STRING },
      },
      required: [
        "improvement_percentage",
        "overall_status",
        "color_difference",
        "texture_difference",
        "detailed_comparison",
        "encouragement_or_advice",
      ],
    };

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const comparisonData = JSON.parse(response.text || "{}");
    return res.json({ success: true, comparison: comparisonData });
  } catch (error: any) {
    console.error("Progress Compare Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate comparison.",
    });
  }
});

// 4. Gemini TTS Endpoint for Doctor Spoken Summary (matches /api/tts and /tts)
app.post(["/api/tts", "/tts"], async (req, res) => {
  try {
    const { report, text, language = "English", voiceName = "Kore" } = req.body;
    const ai = getAiClient();

    let scriptText = text;

    // Generate concise spoken summary script if not provided
    if (!scriptText && report) {
      const summaryPrompt = `
You are a warm, calm, professional dermatologist explaining a preliminary assessment to a patient.
Write a short, conversational, reassuring spoken summary (strictly 50 to 100 words) in "${language}".

Patient Assessment Details:
Condition: ${report.possible_condition}
Severity: ${report.severity}
Visual signs: ${(report.visual_observations || []).slice(0, 2).join(", ")}
Home Care: ${(report.recommended_home_care || []).slice(0, 2).join(", ")}
When to see doctor: ${report.when_to_visit_doctor || "If symptoms worsen or cause severe pain"}

Rules:
1. Speak as a reassuring, friendly, professional dermatologist.
2. Do NOT use bullet points, headings, or markdown. Output plain spoken text only.
3. Keep length strictly between 50 and 100 words.
4. Provide the summary in "${language}".
      `.trim();

      const summaryResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: summaryPrompt,
        config: {
          temperature: 0.3,
        },
      });

      scriptText = summaryResponse.text?.trim();
    }

    if (!scriptText) {
      scriptText = `Based on your skin scan and symptoms, this assessment is consistent with ${
        report?.possible_condition || "a skin concern"
      }. Please follow recommended home care and consult a dermatologist if symptoms worsen.`;
    }

    // TTS prompt with voice delivery instructions
    const ttsPrompt = `
Speak naturally as a warm, calm, professional dermatologist.
Use conversational pacing and natural pauses between sentences.
Sound reassuring, empathetic, human-like, and articulate.
Clearly pronounce medical terms.
Do not sound robotic or dramatic.
Speak in ${language}:

${scriptText}
    `.trim();

    // Call Gemini 3.1 Flash TTS model
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Kore" },
          },
        },
      },
    });

    const candidatePart = ttsResponse.candidates?.[0]?.content?.parts?.[0];
    const inlineData = candidatePart?.inlineData;

    if (!inlineData || !inlineData.data) {
      throw new Error("No audio payload returned from Gemini TTS");
    }

    return res.json({
      success: true,
      audioBase64: inlineData.data,
      mimeType: inlineData.mimeType || "audio/pcm;rate=24000",
      spokenText: scriptText,
    });
  } catch (error: any) {
    console.error("Gemini TTS Endpoint Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate Gemini TTS audio.",
    });
  }
});

// Helper functions for Overpass OSM doctor locator
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

async function queryOverpassServer(lat: number, lon: number, radiusMeters: number): Promise<any[]> {
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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data && Array.isArray(data.elements)) {
          return data.elements;
        }
      }
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

function processOsmElements(elements: any[], userLat: number, userLon: number) {
  const normalized = elements
    .map((el: any) => {
      const tags = el.tags || {};
      let lat = el.lat;
      let lon = el.lon;
      if (el.center) {
        lat = el.center.lat;
        lon = el.center.lon;
      }
      if (typeof lat !== "number" || typeof lon !== "number") return null;

      const dist = calculateHaversineKm(userLat, userLon, lat, lon);
      const rawName = (tags.name || tags["name:en"] || tags.official_name || tags.alt_name || tags.brand || "").trim();
      const doctorNameTag =
        tags["doctor:name"] ||
        tags["person:name"] ||
        tags["contact:person"] ||
        tags["operator"] ||
        tags["physician:name"] ||
        tags["doctor"] ||
        null;

      let doctorName: string | null = null;
      if (doctorNameTag && typeof doctorNameTag === "string" && doctorNameTag.trim()) {
        const trimmed = doctorNameTag.trim();
        doctorName = /^dr\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
      } else if (/^dr\.?\s/i.test(rawName) || /^doctor\s/i.test(rawName)) {
        doctorName = rawName;
      }

      let facilityName = rawName;
      if (!facilityName) {
        if (tags.healthcare === "dermatology" || tags["healthcare:speciality"] === "dermatology") {
          facilityName = "Dermatology & Skin Clinic";
        } else if (tags.amenity === "clinic" || tags.healthcare === "clinic") {
          facilityName = "Skin & Medical Care Clinic";
        } else if (tags.amenity === "doctors" || tags.healthcare === "doctor") {
          facilityName = "Doctor's Clinic";
        } else if (tags.amenity === "hospital") {
          facilityName = "Medical Hospital & Health Center";
        } else {
          facilityName = "Healthcare Provider";
        }
      }

      const isDermatology =
        tags.healthcare === "dermatology" ||
        tags["healthcare:speciality"] === "dermatology" ||
        tags.specialty === "dermatology" ||
        /dermatol|skin|derma|cutaneous|cosmetol|aesthetic|laser/i.test(facilityName) ||
        (doctorName && /dermatol|skin|derma/i.test(doctorName));

      let type = "clinic";
      if (isDermatology) type = "dermatologist";
      else if (tags.amenity === "hospital") type = "hospital";
      else if (tags.amenity === "doctors" || tags.healthcare === "doctor") type = "doctor";

      const addressParts = [
        tags["addr:housenumber"] || tags["addr:housename"] || tags["addr:door"],
        tags["addr:street"] || tags["addr:road"] || tags["addr:place"],
        tags["addr:suburb"] || tags["addr:neighbourhood"] || tags["addr:district"] || tags["addr:quarter"] || tags["addr:locality"],
        tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || tags["addr:state"],
        tags["addr:postcode"] || tags["addr:postal_code"] || tags["postal_code"],
      ]
        .filter(Boolean)
        .map((s: string) => s.trim());

      let address: string | null = null;
      if (addressParts.length >= 2) {
        address = addressParts.join(", ");
      } else if (tags["addr:full"]) {
        address = tags["addr:full"].trim();
      } else if (addressParts.length === 1) {
        const part = addressParts[0];
        address = tags["addr:city"] ? `${part}, ${tags["addr:city"]}` : `${part} (Near ${lat.toFixed(3)}, ${lon.toFixed(3)})`;
      }

      if (!address || address === "Address not listed") {
        address = `Near Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
      }

      const phone =
        tags.phone ||
        tags["contact:phone"] ||
        tags["phone:mobile"] ||
        tags["contact:mobile"] ||
        tags.mobile ||
        tags["telephone"] ||
        tags["contact:telephone"] ||
        tags["contact:whatsapp"] ||
        tags["contact:phone:mobile"] ||
        tags["operator:phone"] ||
        null;
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

      return {
        id: `osm-${el.type}-${el.id}`,
        doctorName,
        facilityName,
        type,
        address,
        phone: phone ? phone.trim() : null,
        latitude: lat,
        longitude: lon,
        distanceKm: dist,
        directionsUrl,
        isDermatologySpecialist: Boolean(isDermatology),
      };
    })
    .filter(Boolean);

  // Deduplicate
  const seen = new Set<string>();
  const uniqueDocs: any[] = [];
  for (const doc of normalized) {
    const key = `${doc.facilityName.toLowerCase()}-${doc.latitude.toFixed(4)}-${doc.longitude.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDocs.push(doc);
    }
  }

  // Sort
  uniqueDocs.sort((a, b) => {
    if (a.isDermatologySpecialist && !b.isDermatologySpecialist) return -1;
    if (!a.isDermatologySpecialist && b.isDermatologySpecialist) return 1;
    const typeRank: Record<string, number> = { dermatologist: 0, clinic: 1, doctor: 2, hospital: 3 };
    const rankA = typeRank[a.type] ?? 2;
    const rankB = typeRank[b.type] ?? 2;
    if (rankA !== rankB) return rankA - rankB;
    return a.distanceKm - b.distanceKm;
  });

  return uniqueDocs;
}

// 5. API Endpoint: Nearby Doctors via Overpass OSM (matches /api/nearby-doctors and /nearby-doctors)
app.get(["/api/nearby-doctors", "/nearby-doctors"], async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ success: false, error: "Invalid or missing lat/lon query parameters." });
    }

    let rawElements = await queryOverpassServer(lat, lon, 5000);
    let docs = processOsmElements(rawElements, lat, lon);

    if (docs.length < 5) {
      const rawElements10k = await queryOverpassServer(lat, lon, 10000);
      docs = processOsmElements(rawElements10k, lat, lon);
    }

    return res.json({ success: true, count: docs.length, doctors: docs });
  } catch (err: any) {
    console.error("Nearby Doctors API Error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch nearby doctors." });
  }
});

// 6. API Endpoint: Search Doctors by City / Area (matches /api/search-doctors-city and /search-doctors-city)
app.get(["/api/search-doctors-city", "/search-doctors-city"], async (req, res) => {
  try {
    const city = req.query.city as string;
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, error: "Missing city parameter." });
    }

    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city.trim()
    )}&limit=1`;

    const nomRes = await fetch(nomUrl, { headers: { "User-Agent": "AISkinDoctor/1.0" } });
    if (!nomRes.ok) {
      return res.status(500).json({ success: false, error: "Geocoding service error." });
    }

    const nomData: any = await nomRes.json();
    if (!nomData || nomData.length === 0) {
      return res.json({ success: true, count: 0, cityFormatted: city, doctors: [] });
    }

    const lat = parseFloat(nomData[0].lat);
    const lon = parseFloat(nomData[0].lon);
    const cityFormatted = nomData[0].display_name || city;

    let rawElements = await queryOverpassServer(lat, lon, 5000);
    let docs = processOsmElements(rawElements, lat, lon);

    if (docs.length < 5) {
      const rawElements10k = await queryOverpassServer(lat, lon, 10000);
      docs = processOsmElements(rawElements10k, lat, lon);
    }

    return res.json({
      success: true,
      cityFormatted,
      coords: { latitude: lat, longitude: lon },
      count: docs.length,
      doctors: docs,
    });
  } catch (err: any) {
    console.error("City Search Doctors API Error:", err);
    return res.status(500).json({ success: false, error: "Failed to search doctors by city." });
  }
});

// Global API Error Handler Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Express Global Handler:", err);
  res.status(500).json({
    success: false,
    error: err?.message || "Internal server error",
  });
});

// Vite Middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: "Not found" });
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Skin Doctor server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
