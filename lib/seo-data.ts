export interface Specialty {
  slug: string
  name: string
  plural: string
  refersTo: string[]
  description: string
}

export interface City {
  slug: string
  name: string
  state: string
  stateAbbr: string
}

export const specialties: Specialty[] = [
  {
    slug: "chiropractors",
    name: "Chiropractor",
    plural: "Chiropractors",
    refersTo: ["Physical Therapists", "Orthopedic Surgeons", "Pain Management Specialists", "Primary Care Physicians"],
    description: "Chiropractors thrive on cross-referrals with physical therapists, orthopedic surgeons, and pain management specialists. Patients who need spinal adjustments often also need PT, imaging referrals, or surgical consultations.",
  },
  {
    slug: "physical-therapists",
    name: "Physical Therapist",
    plural: "Physical Therapists",
    refersTo: ["Orthopedic Surgeons", "Chiropractors", "Pain Management Specialists", "Sports Medicine Doctors"],
    description: "Physical therapists receive referrals from orthopedic surgeons, primary care physicians, and chiropractors. Building relationships with these specialties creates a steady stream of post-surgical and injury rehab patients.",
  },
  {
    slug: "dentists",
    name: "Dentist",
    plural: "Dentists",
    refersTo: ["Orthodontists", "Oral Surgeons", "Periodontists", "Pediatric Dentists"],
    description: "General dentists refer to orthodontists, oral surgeons, and periodontists daily. Establishing trusted referral partnerships means your patients stay in a network you trust -- and referrals flow back.",
  },
  {
    slug: "orthodontists",
    name: "Orthodontist",
    plural: "Orthodontists",
    refersTo: ["General Dentists", "Oral Surgeons", "Pediatric Dentists", "TMJ Specialists"],
    description: "Orthodontists depend on general dentists for the majority of their referrals. The practices that build relationships with 10-15 nearby general dentists dominate their local market.",
  },
  {
    slug: "dermatologists",
    name: "Dermatologist",
    plural: "Dermatologists",
    refersTo: ["Primary Care Physicians", "Med Spas", "Plastic Surgeons", "Allergists"],
    description: "Dermatologists receive referrals from primary care physicians for medical dermatology and from med spas and plastic surgeons for cosmetic consultations. Both channels are worth building.",
  },
  {
    slug: "primary-care",
    name: "Primary Care Physician",
    plural: "Primary Care Physicians",
    refersTo: ["Specialists (All)", "Mental Health Providers", "Physical Therapists", "Dermatologists"],
    description: "Primary care physicians are the hub of the referral network. Every specialist wants referrals from PCPs, but smart PCPs also build relationships to get patients referred back for ongoing care.",
  },
  {
    slug: "orthopedic-surgeons",
    name: "Orthopedic Surgeon",
    plural: "Orthopedic Surgeons",
    refersTo: ["Physical Therapists", "Pain Management Specialists", "Primary Care Physicians", "Sports Medicine Doctors"],
    description: "Orthopedic surgeons need a reliable network of physical therapists for post-op rehab and pain management specialists for non-surgical cases. These bidirectional referral relationships are the backbone of a musculoskeletal practice.",
  },
  {
    slug: "pain-management",
    name: "Pain Management Specialist",
    plural: "Pain Management Specialists",
    refersTo: ["Primary Care Physicians", "Orthopedic Surgeons", "Chiropractors", "Physical Therapists"],
    description: "Pain management specialists sit at the intersection of surgical and non-surgical care. Referrals from primary care, orthopedics, and chiropractic create a diverse patient pipeline.",
  },
  {
    slug: "mental-health",
    name: "Mental Health Provider",
    plural: "Mental Health Providers",
    refersTo: ["Primary Care Physicians", "Psychiatrists", "Pediatricians", "School Counselors"],
    description: "Therapists, psychologists, and counselors depend heavily on referrals from primary care physicians who identify patients with anxiety, depression, and behavioral health needs during routine visits.",
  },
  {
    slug: "med-spas",
    name: "Med Spa",
    plural: "Med Spas",
    refersTo: ["Dermatologists", "Plastic Surgeons", "OB-GYNs", "Primary Care Physicians"],
    description: "Med spas grow fastest through referral partnerships with dermatologists, plastic surgeons, and OB-GYNs. Patients who trust their doctor's recommendation convert at 3-5x the rate of ad-driven leads.",
  },
  {
    slug: "pediatricians",
    name: "Pediatrician",
    plural: "Pediatricians",
    refersTo: ["Pediatric Dentists", "Child Psychologists", "Allergists", "Pediatric Orthopedists"],
    description: "Pediatricians refer to pediatric specialists constantly -- dentists, psychologists, allergists, and orthopedists. Parents trust their pediatrician's recommendation above all else.",
  },
  {
    slug: "optometrists",
    name: "Optometrist",
    plural: "Optometrists",
    refersTo: ["Ophthalmologists", "Primary Care Physicians", "Pediatricians", "Neurologists"],
    description: "Optometrists refer to ophthalmologists for surgical cases and receive referrals from primary care for routine vision needs. Building both directions of this relationship is critical.",
  },
  {
    slug: "podiatrists",
    name: "Podiatrist",
    plural: "Podiatrists",
    refersTo: ["Primary Care Physicians", "Orthopedic Surgeons", "Endocrinologists", "Physical Therapists"],
    description: "Podiatrists receive heavy referral volume from primary care physicians managing diabetic patients and from orthopedic surgeons for foot and ankle specialization.",
  },
  {
    slug: "oral-surgeons",
    name: "Oral Surgeon",
    plural: "Oral Surgeons",
    refersTo: ["General Dentists", "Orthodontists", "ENTs", "Oncologists"],
    description: "Oral surgeons depend almost entirely on referrals from general dentists and orthodontists. The practices with the deepest dentist relationships get the most wisdom tooth extractions, implants, and jaw surgery referrals.",
  },
  {
    slug: "cardiologists",
    name: "Cardiologist",
    plural: "Cardiologists",
    refersTo: ["Primary Care Physicians", "Endocrinologists", "Pulmonologists", "Cardiac Surgeons"],
    description: "Cardiologists receive the majority of referrals from primary care physicians who detect heart-related symptoms. Building relationships with high-volume PCP practices is the fastest path to growth.",
  },
]

export const cities: City[] = [
  { slug: "miami-fl", name: "Miami", state: "Florida", stateAbbr: "FL" },
  { slug: "tampa-fl", name: "Tampa", state: "Florida", stateAbbr: "FL" },
  { slug: "orlando-fl", name: "Orlando", state: "Florida", stateAbbr: "FL" },
  { slug: "jacksonville-fl", name: "Jacksonville", state: "Florida", stateAbbr: "FL" },
  { slug: "houston-tx", name: "Houston", state: "Texas", stateAbbr: "TX" },
  { slug: "dallas-tx", name: "Dallas", state: "Texas", stateAbbr: "TX" },
  { slug: "austin-tx", name: "Austin", state: "Texas", stateAbbr: "TX" },
  { slug: "san-antonio-tx", name: "San Antonio", state: "Texas", stateAbbr: "TX" },
  { slug: "los-angeles-ca", name: "Los Angeles", state: "California", stateAbbr: "CA" },
  { slug: "san-diego-ca", name: "San Diego", state: "California", stateAbbr: "CA" },
  { slug: "phoenix-az", name: "Phoenix", state: "Arizona", stateAbbr: "AZ" },
  { slug: "atlanta-ga", name: "Atlanta", state: "Georgia", stateAbbr: "GA" },
  { slug: "charlotte-nc", name: "Charlotte", state: "North Carolina", stateAbbr: "NC" },
  { slug: "new-york-ny", name: "New York", state: "New York", stateAbbr: "NY" },
  { slug: "chicago-il", name: "Chicago", state: "Illinois", stateAbbr: "IL" },
  { slug: "philadelphia-pa", name: "Philadelphia", state: "Pennsylvania", stateAbbr: "PA" },
  { slug: "denver-co", name: "Denver", state: "Colorado", stateAbbr: "CO" },
  { slug: "seattle-wa", name: "Seattle", state: "Washington", stateAbbr: "WA" },
  { slug: "boston-ma", name: "Boston", state: "Massachusetts", stateAbbr: "MA" },
  { slug: "nashville-tn", name: "Nashville", state: "Tennessee", stateAbbr: "TN" },
]

export function getSpecialty(slug: string): Specialty | undefined {
  return specialties.find((s) => s.slug === slug)
}

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug)
}
