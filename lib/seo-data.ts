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
    slug: "pulmonologists",
    name: "Pulmonologist",
    plural: "Pulmonologists",
    refersTo: ["Primary Care Physicians", "Allergists", "Cardiologists", "ENT Doctors"],
    description: "Pulmonologists receive most referrals from primary care for chronic cough, dyspnea, abnormal CXR, sleep apnea, and COPD/asthma escalation. Allergy and ENT are key bidirectional partners for difficult-to-control asthma and chronic sinusitis. Cardiology is essential for cardiopulmonary overlap — CHF vs COPD, pulmonary hypertension, sleep apnea cardiac risk.",
  },
  {
    slug: "endocrinologists",
    name: "Endocrinologist",
    plural: "Endocrinologists",
    refersTo: ["Primary Care Physicians", "Cardiologists", "Pediatricians", "OB-GYNs"],
    description: "Endocrinologists receive the vast majority of referrals from primary care for diabetes not at goal, thyroid nodules, and hormone imbalances. OB-GYNs refer for PCOS and gestational diabetes; cardiology creates a bidirectional loop for diabetic cardiovascular risk. Most endo practices are referral-saturated, so picking the PCPs who fit your panel matters more than volume.",
  },
  {
    slug: "gastroenterologists",
    name: "Gastroenterologist",
    plural: "Gastroenterologists",
    refersTo: ["Primary Care Physicians", "Pediatricians", "Rheumatologists", "Allergists"],
    description: "Gastroenterologists receive heavy referral volume from primary care for screening colonoscopy, GERD, IBD evaluation, and abnormal LFTs. Pediatrics refers for chronic abdominal pain, failure to thrive, and pediatric IBD. Rheumatology is a key bidirectional partner for IBD-associated arthritis; allergy refers for eosinophilic esophagitis and food allergy workups.",
  },
  {
    slug: "rheumatologists",
    name: "Rheumatologist",
    plural: "Rheumatologists",
    refersTo: ["Primary Care Physicians", "Dermatologists", "Pain Management Specialists", "Gastroenterologists"],
    description: "Rheumatologists receive the majority of referrals from primary care for autoimmune workup — rheumatoid arthritis, lupus, vasculitis, polymyalgia rheumatica. Dermatology is a key bidirectional partner for psoriatic arthritis and connective tissue disease with skin findings. Gastroenterology refers for IBD-associated arthritis. Pain management is a frequent partner for fibromyalgia and inflammatory pain.",
  },
  {
    slug: "neurologists",
    name: "Neurologist",
    plural: "Neurologists",
    refersTo: ["Primary Care Physicians", "Psychiatrists", "Pediatricians", "Pain Management Specialists"],
    description: "Neurologists receive most referrals from primary care for headache, neuropathy, seizure workup, and dementia evaluation. Psychiatry is a critical bidirectional partner for cognitive disorders with mood components and for differentiating functional from neurologic disease. Pediatrics refers for developmental delay and seizures. Pain management partners on neuropathic pain.",
  },
  {
    slug: "psychiatrists",
    name: "Psychiatrist",
    plural: "Psychiatrists",
    refersTo: ["Primary Care Physicians", "Pediatricians", "Neurologists", "Pain Management Specialists"],
    description: "Psychiatrists receive referrals from primary care physicians who need medication management for patients with depression, anxiety, ADHD, and bipolar disorder. Pediatricians are an important referral source for adolescent mood and ADHD cases. Neurology is a bidirectional partner for cognitive and functional disorders. Pain management is a frequent partner for chronic pain comorbid with mood disorders.",
  },
  {
    slug: "dermatologists",
    name: "Dermatologist",
    plural: "Dermatologists",
    refersTo: ["Primary Care Physicians", "Plastic Surgeons", "Allergists", "Pediatricians"],
    description: "Dermatologists receive referrals from primary care physicians for medical dermatology — rashes, suspicious lesions, chronic skin conditions — and from plastic surgeons for cosmetic and post-excision reconstruction. Allergy is a bidirectional partner for chronic eczema and contact dermatitis.",
  },
  {
    slug: "ophthalmologists",
    name: "Ophthalmologist",
    plural: "Ophthalmologists",
    refersTo: ["Primary Care Physicians", "Endocrinologists", "Pediatricians", "Neurologists"],
    description: "Ophthalmologists receive heavy referral volume from primary care for vision changes and from endocrinology for diabetic retinopathy screening. Pediatrics is a major source for childhood vision concerns and amblyopia. Neurology is a bidirectional partner for optic neuritis, visual field defects, and papilledema workups.",
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
    refersTo: ["Primary Care Physicians", "Orthopedic Surgeons", "Rheumatologists", "Psychiatrists"],
    description: "Pain management specialists sit at the intersection of surgical and non-surgical care. Referrals from primary care and orthopedic surgery drive most volume. Rheumatology is a partner for inflammatory pain and fibromyalgia; psychiatry is a key partner for chronic pain comorbid with mood and anxiety disorders.",
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
    refersTo: ["Primary Care Physicians", "Allergists", "Pulmonologists", "Pediatricians"],
    description: "ENT doctors (otolaryngologists) receive most referrals from primary care physicians and pediatricians for chronic ear infections, sinus issues, hearing loss, and tonsils. Allergists and pulmonologists are key bidirectional referral partners for patients with overlapping sinus, allergy, and lower-airway disease.",
  },
  {
    slug: "allergists",
    name: "Allergist",
    plural: "Allergists",
    refersTo: ["Primary Care Physicians", "ENT Doctors", "Pediatricians", "Pulmonologists"],
    description: "Allergists receive heavy referral volume from primary care and pediatrics for patients with chronic allergies, asthma, and immune disorders. ENT and pulmonology are natural cross-referral partners — ENT for sinus and upper respiratory cases, pulm for difficult-to-control asthma. Dermatology refers for eczema and contact dermatitis.",
  },
  {
    slug: "urologists",
    name: "Urologist",
    plural: "Urologists",
    refersTo: ["Primary Care Physicians", "OB-GYNs", "Endocrinologists"],
    description: "Urologists depend on primary care referrals for prostate screening, kidney stones, BPH, and urinary issues. OB-GYNs are a critical bidirectional partner for pelvic floor disorders, incontinence, and recurrent UTIs in women. Endocrinology is a natural partner for testosterone deficiency, diabetic erectile dysfunction, and metabolic stone disease. Building strong PCP and OB-GYN relationships across your service area covers the majority of urology patient acquisition.",
  },
  {
    slug: "ob-gyns",
    name: "OB-GYN",
    plural: "OB-GYNs",
    refersTo: ["Primary Care Physicians", "Endocrinologists", "Urologists", "Psychiatrists"],
    description: "OB-GYNs share patients with primary care for routine women's health, with endocrinology for PCOS and thyroid in pregnancy, with urology for pelvic floor and incontinence, and with psychiatry for postpartum mood disorders. OB-GYNs often function as a de facto PCP for women under 40, making the bidirectional relationships especially valuable.",
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
    refersTo: ["Dermatologists", "Primary Care Physicians", "OB-GYNs"],
    description: "Plastic surgeons receive cosmetic referrals from dermatologists and reconstructive referrals from primary care and OB-GYN (post-mastectomy reconstruction, abdominoplasty after pregnancy). Dermatology is a key bidirectional partner — surgical reconstruction after Mohs excision flows back as cosmetic work, and aesthetic Mohs candidates flow forward.",
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
