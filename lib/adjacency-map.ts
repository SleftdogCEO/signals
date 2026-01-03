// Referral Adjacency Map
// Maps each specialty to adjacent specialties whose patients naturally flow to/from them

export const ADJACENCY_MAP: Record<string, string[]> = {
  // Surgical Specialties
  "Orthopedic Surgery": ["Physical Therapy", "Chiropractic", "Primary Care", "Imaging Center", "Pain Management", "Sports Medicine"],
  "Oral Surgery": ["Dentist", "Orthodontist", "Periodontist", "Primary Care"],
  "Plastic Surgery": ["Dermatology", "Primary Care", "Med Spa"],
  "General Surgery": ["Primary Care", "Gastroenterology", "Imaging Center"],
  "Cardiac Surgery": ["Cardiology", "Primary Care", "Pulmonology"],
  "Neurosurgery": ["Neurology", "Primary Care", "Pain Management", "Physical Therapy"],

  // Rehab & Therapy
  "Physical Therapy": ["Orthopedic Surgery", "Primary Care", "Chiropractic", "Sports Medicine", "Pain Management", "Neurology"],
  "Occupational Therapy": ["Orthopedic Surgery", "Neurology", "Primary Care", "Pediatrics"],
  "Chiropractic": ["Physical Therapy", "Orthopedic Surgery", "Imaging Center", "Primary Care", "Massage Therapy"],
  "Sports Medicine": ["Orthopedic Surgery", "Physical Therapy", "Primary Care", "Imaging Center"],

  // Mental Health
  "Psychiatry": ["Primary Care", "Psychology", "Counseling", "Neurology"],
  "Psychology": ["Primary Care", "Psychiatry", "Counseling"],
  "Counseling": ["Primary Care", "Psychiatry", "Psychology"],
  "Mental Health": ["Primary Care", "Psychiatry", "Psychology", "Counseling"],

  // Dental
  "Dentist": ["Oral Surgery", "Orthodontist", "Periodontist", "Endodontist", "Primary Care"],
  "Orthodontist": ["Dentist", "Oral Surgery", "Pediatric Dentist"],
  "Periodontist": ["Dentist", "Oral Surgery"],
  "Endodontist": ["Dentist"],
  "Pediatric Dentist": ["Pediatrics", "Orthodontist"],

  // Primary & Internal
  "Primary Care": ["Cardiology", "Gastroenterology", "Orthopedic Surgery", "Mental Health", "Dermatology", "Endocrinology", "Pulmonology", "Neurology"],
  "Family Medicine": ["Cardiology", "Gastroenterology", "Orthopedic Surgery", "Mental Health", "Dermatology", "Pediatrics"],
  "Internal Medicine": ["Cardiology", "Gastroenterology", "Pulmonology", "Endocrinology", "Rheumatology"],
  "Pediatrics": ["Family Medicine", "Pediatric Dentist", "Occupational Therapy", "Psychology"],

  // Medical Specialties
  "Cardiology": ["Primary Care", "Cardiac Surgery", "Pulmonology", "Endocrinology"],
  "Gastroenterology": ["Primary Care", "General Surgery", "Imaging Center"],
  "Dermatology": ["Primary Care", "Plastic Surgery", "Allergy/Immunology"],
  "Endocrinology": ["Primary Care", "Cardiology", "Nutrition"],
  "Neurology": ["Primary Care", "Neurosurgery", "Physical Therapy", "Psychiatry", "Pain Management"],
  "Pulmonology": ["Primary Care", "Cardiology", "Allergy/Immunology"],
  "Rheumatology": ["Primary Care", "Orthopedic Surgery", "Physical Therapy"],
  "Oncology": ["Primary Care", "General Surgery", "Imaging Center", "Pain Management"],

  // Pain & Wellness
  "Pain Management": ["Primary Care", "Orthopedic Surgery", "Neurology", "Physical Therapy", "Chiropractic"],
  "Acupuncture": ["Chiropractic", "Physical Therapy", "Pain Management"],
  "Massage Therapy": ["Chiropractic", "Physical Therapy", "Acupuncture"],

  // Eye Care
  "Optometry": ["Ophthalmology", "Primary Care"],
  "Ophthalmology": ["Optometry", "Primary Care"],

  // Women's Health
  "OB/GYN": ["Primary Care", "Urology", "Endocrinology"],

  // Other
  "Urology": ["Primary Care", "OB/GYN", "Oncology"],
  "ENT": ["Primary Care", "Allergy/Immunology", "Audiology"],
  "Allergy/Immunology": ["Primary Care", "ENT", "Pulmonology", "Dermatology"],
  "Podiatry": ["Primary Care", "Orthopedic Surgery", "Vascular Surgery"],
  "Imaging Center": ["Primary Care", "Orthopedic Surgery", "Chiropractic", "Gastroenterology"],
  "Urgent Care": ["Primary Care", "Orthopedic Surgery", "Imaging Center"],
  "Med Spa": ["Dermatology", "Plastic Surgery"],
  "Nutrition": ["Primary Care", "Endocrinology", "Gastroenterology"],
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
