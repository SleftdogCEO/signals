// Referral Adjacency Map - PHYSICIAN ONLY
// Maps each of the 19 physician specialties in lib/seo-data.ts to the
// specialties whose patients naturally flow to/from them, in priority order.
// First entry = highest-volume referral source for that specialty.
// Keep keys aligned to the SPECIALTIES array in app/onboarding/page.tsx so that
// formData.specialty submitted from onboarding produces a valid lookup.

export const ADJACENCY_MAP: Record<string, string[]> = {
  // Primary care: hub of the physician network
  "Primary Care": ["Cardiology", "Endocrinology", "Psychiatry", "Dermatology", "Gastroenterology", "Neurology", "Pulmonology", "Orthopedic Surgery"],

  // Internal medicine subspecialties
  "Cardiology": ["Primary Care", "Endocrinology", "Pulmonology", "Sports Medicine"],
  "Pulmonology": ["Primary Care", "Allergy & Immunology", "Cardiology", "ENT (Otolaryngology)"],
  "Endocrinology": ["Primary Care", "Cardiology", "Pediatrics", "OB-GYN"],
  "Gastroenterology": ["Primary Care", "Pediatrics", "Rheumatology", "Allergy & Immunology"],
  "Rheumatology": ["Primary Care", "Dermatology", "Pain Management", "Gastroenterology"],
  "Neurology": ["Primary Care", "Psychiatry", "Pediatrics", "Pain Management"],

  // Mental health + pain
  "Psychiatry": ["Primary Care", "Pediatrics", "Neurology", "Pain Management"],
  "Pain Management": ["Primary Care", "Orthopedic Surgery", "Rheumatology", "Psychiatry"],

  // Skin / Eye / ENT / Allergy
  "Dermatology": ["Primary Care", "Plastic Surgery", "Allergy & Immunology", "Pediatrics"],
  "Ophthalmology": ["Primary Care", "Endocrinology", "Pediatrics", "Neurology"],
  "ENT (Otolaryngology)": ["Primary Care", "Allergy & Immunology", "Pulmonology", "Pediatrics"],
  "Allergy & Immunology": ["Primary Care", "ENT (Otolaryngology)", "Pediatrics", "Pulmonology"],

  // Surgical specialties
  "Orthopedic Surgery": ["Pain Management", "Primary Care", "Sports Medicine"],
  "Plastic Surgery": ["Dermatology", "Primary Care", "OB-GYN"],
  "Urology": ["Primary Care", "OB-GYN"],
  "Sports Medicine": ["Orthopedic Surgery", "Primary Care", "Endocrinology"],

  // Women's & children's
  "Pediatrics": ["Allergy & Immunology", "ENT (Otolaryngology)", "Psychiatry", "Endocrinology"],
  "OB-GYN": ["Primary Care", "Endocrinology", "Urology", "Psychiatry"],
}

// Get all unique specialties
export const ALL_SPECIALTIES = Object.keys(ADJACENCY_MAP).sort()

// Get adjacent specialties for a given specialty
export function getAdjacentSpecialties(specialty: string): string[] {
  return ADJACENCY_MAP[specialty] || []
}

// Calculate referral fit score based on position in adjacency list
// First items are more commonly referred, so higher score
export function calculateFitScore(specialty: string, adjacentSpecialty: string): number {
  const adjacents = ADJACENCY_MAP[specialty] || []
  const index = adjacents.indexOf(adjacentSpecialty)

  if (index === -1) return 0

  // First in list = 95, decreasing by ~10 per position
  const baseScore = 95 - (index * 10)
  // Add some randomness for realism
  const variance = Math.floor(Math.random() * 10) - 5

  return Math.max(50, Math.min(100, baseScore + variance))
}
