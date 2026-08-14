export type SeverityLevel = "low" | "moderate" | "high" | "urgent";

export type SkinTone =
  | "Type I (Very Fair)"
  | "Type II (Fair)"
  | "Type III (Medium)"
  | "Type IV (Olive)"
  | "Type V (Brown)"
  | "Type VI (Dark Brown/Black)";

export type SkinType = "Normal" | "Oily" | "Dry" | "Combination" | "Sensitive";

export type LanguageCode =
  | "English"
  | "Hindi"
  | "Kannada"
  | "Tamil"
  | "Telugu"
  | "Malayalam"
  | "Marathi";

export interface AnnotatedRegion {
  id: string;
  label: string;
  description?: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-100 percentage
  color?: string;
}

export interface AssessmentReport {
  id: string;
  createdAt: string;
  possible_condition: string;
  confidence_score: number;
  severity: SeverityLevel;
  summary: string;
  visual_observations: string[];
  possible_causes: string[];
  supporting_reasoning: string;
  recommended_home_care: string[];
  recommended_otc_products: string[];
  ingredients_to_look_for: string[];
  ingredients_to_avoid: string[];
  lifestyle_changes: string[];
  diet_recommendations: string[];
  when_to_visit_doctor: string;
  red_flags: string[];
  follow_up_questions?: string[];
  prevention_tips: string[];
  medical_disclaimer: string;
  annotated_regions?: AnnotatedRegion[];
  primaryImage?: string; // Data URL
  allImages?: string[];
  patientInfo?: PatientInfo;
  language?: LanguageCode;
}

export interface PatientInfo {
  age?: string;
  gender?: string;
  skinTone?: SkinTone;
  skinType?: SkinType;
  duration?: string;
  symptoms: string[];
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  spokenTranscript?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ProgressLog {
  id: string;
  reportId?: string;
  date: string;
  conditionName: string;
  beforeImage: string;
  afterImage: string;
  improvement_percentage: number;
  overall_status: string;
  color_difference: string;
  texture_difference: string;
  swelling_reduction: string;
  pigmentation_change: string;
  detailed_comparison: string;
  encouragement_or_advice: string;
}

export interface DermatologistLocation {
  id: string;
  name: string;
  clinic: string;
  city: string;
  address: string;
  phone: string;
  timings: string;
  rating: number;
  mapsQuery: string;
  distanceKm?: number;
}
