// Shared types and helpers for the public provider directory.

// Partner-category ids stored in providers.patients_i_want / patients_i_refer.
// Must stay in sync with PARTNER_CATEGORIES in app/onboarding/page.tsx.
export const CATEGORY_LABELS: Record<string, string> = {
  primary_care: "Primary Care",
  internal_medicine_subspecialties: "Internal Medicine Subspecialties",
  psychiatry_pain: "Psychiatry & Pain",
  surgery_msk: "Surgery & Musculoskeletal",
  womens_childrens: "Women's & Children's Health",
  ent_eye_skin_allergy: "ENT, Eye, Skin & Allergy",
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([id, label]) => ({ id, label })
)

export function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] || id
}

// Canonical specialty values stored in providers.specialty.
// Must stay in sync with SPECIALTIES in app/onboarding/page.tsx and the
// seed script (scripts/seed-providers.mjs).
export const SPECIALTY_OPTIONS = [
  "Primary Care",
  "Weight Loss / Obesity Medicine",
  "Cardiology",
  "Pulmonology",
  "Endocrinology",
  "Gastroenterology",
  "Rheumatology",
  "Neurology",
  "Psychiatry",
  "Dermatology",
  "Ophthalmology",
  "Orthopedic Surgery",
  "Pain Management",
  "Pediatrics",
  "ENT (Otolaryngology)",
  "Allergy & Immunology",
  "Urology",
  "OB-GYN",
  "Sports Medicine",
  "Plastic Surgery",
]

export interface DirectoryProvider {
  id: string
  user_id: string | null
  practice_name: string
  specialty: string
  location: string
  bio: string | null
  value_prop: string | null
  service_tags: string[]
  website: string | null
  patients_i_want: string[]
  patients_i_refer: string[]
  is_seeded: boolean
  is_verified: boolean
  rating: number | null
  review_count: number | null
  created_at: string
}

// A seeded row that nobody has claimed yet.
export function isUnclaimed(p: DirectoryProvider): boolean {
  return p.is_seeded && !p.user_id
}
