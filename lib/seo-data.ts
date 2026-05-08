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
    slug: "primary-care",
    name: "Primary Care Physician",
    plural: "Primary Care Physicians",
    refersTo: ["Cardiologists", "Endocrinologists", "Psychiatrists", "Dermatologists"],
    description: "Primary care physicians are the hub of the physician referral network. PCPs send patients to cardiology, endocrinology, psychiatry, dermatology, and every other specialty — and the best specialists return stable patients for ongoing management. PCPs grow most by partnering with specialists who close the loop.",
  },
  {
    slug: "cardiologists",
    name: "Cardiologist",
    plural: "Cardiologists",
    refersTo: ["Primary Care Physicians", "Endocrinologists", "Pulmonologists", "Sports Medicine Doctors"],
    description: "Cardiologists receive the majority of inbound referrals from primary care physicians who detect HTN, CHF, AFib, and abnormal stress tests. Endocrinology is a key bidirectional partner for diabetic cardiovascular risk. Building relationships with high-volume PCP practices is the fastest path to growth.",
  },
  {
    slug: "endocrinologists",
    name: "Endocrinologist",
    plural: "Endocrinologists",
    refersTo: ["Primary Care Physicians", "Cardiologists", "Pediatricians", "Sports Medicine Doctors"],
    description: "Endocrinologists receive the vast majority of referrals from primary care for diabetes not at goal, thyroid nodules, and hormone imbalances. Cardiology creates a bidirectional referral loop for diabetic patients with cardiovascular risk. Most endo practices are referral-saturated, so picking the PCPs who fit your panel matters more than volume.",
  },
  {
    slug: "psychiatrists",
    name: "Psychiatrist",
    plural: "Psychiatrists",
    refersTo: ["Primary Care Physicians", "Pediatricians", "Pain Management Specialists"],
    description: "Psychiatrists receive referrals from primary care physicians who need medication management for patients with depression, anxiety, ADHD, and bipolar disorder. Pediatricians are an important referral source for adolescent mood and ADHD cases. Pain management is a frequent partner for chronic pain comorbid with mood disorders.",
  },
  {
    slug: "dermatologists",
    name: "Dermatologist",
    plural: "Dermatologists",
    refersTo: ["Primary Care Physicians", "Plastic Surgeons", "Allergists", "Pediatricians"],
    description: "Dermatologists receive referrals from primary care physicians for medical dermatology — rashes, suspicious lesions, chronic skin conditions — and from plastic surgeons for cosmetic and post-excision reconstruction. Allergy is a bidirectional partner for chronic eczema and contact dermatitis.",
  },
  {
    slug: "orthopedic-surgeons",
    name: "Orthopedic Surgeon",
    plural: "Orthopedic Surgeons",
    refersTo: ["Pain Management Specialists", "Primary Care Physicians", "Sports Medicine Doctors"],
    description: "Orthopedic surgeons need a reliable network of pain management specialists for non-surgical cases and primary care physicians who send musculoskeletal complaints. Sports medicine is a natural cross-referral partner — sports med handles the conservative cases, ortho handles the surgical ones.",
  },
  {
    slug: "pain-management",
    name: "Pain Management Specialist",
    plural: "Pain Management Specialists",
    refersTo: ["Primary Care Physicians", "Orthopedic Surgeons", "Psychiatrists"],
    description: "Pain management specialists sit at the intersection of surgical and non-surgical care. Referrals from primary care and orthopedic surgery drive most volume. Psychiatry is a key partner for chronic pain comorbid with mood and anxiety disorders.",
  },
  {
    slug: "pediatricians",
    name: "Pediatrician",
    plural: "Pediatricians",
    refersTo: ["Allergists", "ENT Doctors", "Psychiatrists", "Endocrinologists"],
    description: "Pediatricians refer to pediatric specialists constantly — allergy and immunology for chronic eczema, food allergies, and asthma; ENT for chronic otitis and tonsils; psychiatry for ADHD and adolescent mood. Parents trust their pediatrician's recommendation above all else.",
  },
  {
    slug: "ent-doctors",
    name: "ENT Doctor",
    plural: "ENT Doctors",
    refersTo: ["Primary Care Physicians", "Allergists", "Pediatricians"],
    description: "ENT doctors (otolaryngologists) receive most referrals from primary care physicians and pediatricians for chronic ear infections, sinus issues, hearing loss, and tonsils. Allergists are a key bidirectional referral partner for patients with overlapping sinus and allergy conditions.",
  },
  {
    slug: "allergists",
    name: "Allergist",
    plural: "Allergists",
    refersTo: ["Primary Care Physicians", "ENT Doctors", "Pediatricians", "Dermatologists"],
    description: "Allergists receive heavy referral volume from primary care and pediatrics for patients with chronic allergies, asthma, and immune disorders. ENT doctors are a natural cross-referral partner for sinus and upper respiratory cases. Dermatology refers for eczema and contact dermatitis.",
  },
  {
    slug: "urologists",
    name: "Urologist",
    plural: "Urologists",
    refersTo: ["Primary Care Physicians"],
    description: "Urologists depend on primary care referrals for prostate screening, kidney stones, BPH, and urinary issues. Building strong PCP relationships across your service area covers the majority of urology patient acquisition.",
  },
  {
    slug: "sports-medicine",
    name: "Sports Medicine Doctor",
    plural: "Sports Medicine Doctors",
    refersTo: ["Orthopedic Surgeons", "Primary Care Physicians", "Endocrinologists"],
    description: "Sports medicine doctors sit between primary care and orthopedic surgery. They receive referrals from PCPs for musculoskeletal injuries and from orthopedic surgeons for non-surgical management. Endocrinology is a useful partner for athletes with metabolic concerns.",
  },
  {
    slug: "plastic-surgeons",
    name: "Plastic Surgeon",
    plural: "Plastic Surgeons",
    refersTo: ["Dermatologists", "Primary Care Physicians"],
    description: "Plastic surgeons receive cosmetic referrals from dermatologists and reconstructive referrals from primary care. Dermatology is a key bidirectional partner — surgical reconstruction after Mohs excision flows back as cosmetic work, and aesthetic Mohs candidates flow forward.",
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
  { slug: "west-palm-beach-fl", name: "West Palm Beach", state: "Florida", stateAbbr: "FL" },
  { slug: "palm-beach-gardens-fl", name: "Palm Beach Gardens", state: "Florida", stateAbbr: "FL" },
  { slug: "jupiter-fl", name: "Jupiter", state: "Florida", stateAbbr: "FL" },
  { slug: "boca-raton-fl", name: "Boca Raton", state: "Florida", stateAbbr: "FL" },
  { slug: "fort-lauderdale-fl", name: "Fort Lauderdale", state: "Florida", stateAbbr: "FL" },
  { slug: "st-petersburg-fl", name: "St. Petersburg", state: "Florida", stateAbbr: "FL" },
  { slug: "naples-fl", name: "Naples", state: "Florida", stateAbbr: "FL" },
  { slug: "san-francisco-ca", name: "San Francisco", state: "California", stateAbbr: "CA" },
  { slug: "portland-or", name: "Portland", state: "Oregon", stateAbbr: "OR" },
  { slug: "minneapolis-mn", name: "Minneapolis", state: "Minnesota", stateAbbr: "MN" },
  { slug: "detroit-mi", name: "Detroit", state: "Michigan", stateAbbr: "MI" },
  { slug: "las-vegas-nv", name: "Las Vegas", state: "Nevada", stateAbbr: "NV" },
  { slug: "raleigh-nc", name: "Raleigh", state: "North Carolina", stateAbbr: "NC" },
  { slug: "indianapolis-in", name: "Indianapolis", state: "Indiana", stateAbbr: "IN" },
  { slug: "columbus-oh", name: "Columbus", state: "Ohio", stateAbbr: "OH" },
]

export function getSpecialty(slug: string): Specialty | undefined {
  return specialties.find((s) => s.slug === slug)
}

export function getCity(slug: string): City | undefined {
  return cities.find((c) => c.slug === slug)
}
