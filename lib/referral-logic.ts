import { specialties } from "./seo-data"
import type { Specialty } from "./seo-data"

// Why a specialty refers to another specialty -- grounded in clinical reality.
// Outer keys mirror the .plural values in lib/seo-data.ts. Inner keys mirror that
// specialty's refersTo array. Kept in lockstep with seo-data.ts so dynamic lookups
// in buildOutboundReferrals / buildReverseReferralMap surface specific clinical
// triggers instead of falling back to generic copy.
//
// This map is the site's most defensible SEO asset: no competitor answers
// "who refers patients to [specialty] and why" with this depth. It is rendered
// server-side on the specialty hub pages and the referral-lookup tool so it is
// fully visible to crawlers.
export const referralReasons: Record<string, Record<string, string>> = {
  "Primary Care Physicians": {
    Cardiologists: "Patients with HTN, CHF, AFib, abnormal stress tests, chest pain workup, or strong CV family history",
    Endocrinologists: "Type 2 diabetes uncontrolled on two oral agents, thyroid nodules, suspected PCOS, or hormonal disorders",
    Psychiatrists: "Failed SSRI trials, treatment-resistant depression, adult ADHD evaluation, or complex med management",
    Dermatologists: "Suspicious skin lesions, persistent rashes, and chronic conditions beyond primary care scope",
  },
  Cardiologists: {
    "Primary Care Physicians": "Stable patients returning for ongoing CV risk management after cardiology workup is complete",
    Endocrinologists: "Diabetic patients with significant CV risk who need glycemic optimization",
    Pulmonologists: "Patients with cardiopulmonary overlap, sleep apnea cardiac risk, or pulmonary hypertension",
    "Sports Medicine Doctors": "Athletes with cardiac concerns or exercise tolerance issues",
  },
  Pulmonologists: {
    "Primary Care Physicians": "Stable patients with chronic conditions returning to PCP for ongoing management",
    Allergists: "Patients with difficult-to-control asthma where allergic component drives airway disease",
    Cardiologists: "Patients with CHF vs COPD differentiation, pulmonary hypertension, or cardiopulmonary overlap",
    "ENT Doctors": "Patients with upper airway involvement or chronic sinusitis affecting lower airway disease",
  },
  Endocrinologists: {
    "Primary Care Physicians": "Well-controlled diabetic and thyroid patients sent back for ongoing primary care management",
    Cardiologists: "Diabetic patients with cardiovascular complications needing co-management",
    Pediatricians: "Pediatric Type 1 diabetes, pediatric thyroid disorders, and growth concerns",
    "OB-GYNs": "PCOS, gestational diabetes, thyroid in pregnancy, or hormonal infertility evaluation",
  },
  Gastroenterologists: {
    "Primary Care Physicians": "Stable IBD, GERD, or celiac patients returning to PCP for ongoing chronic disease care",
    Pediatricians: "Pediatric chronic abdominal pain, failure to thrive, or pediatric IBD evaluation",
    Rheumatologists: "IBD patients with extraintestinal manifestations or rheumatologic comorbidities",
    Allergists: "Eosinophilic esophagitis, food allergy workup, or IgE-mediated GI symptoms",
  },
  Rheumatologists: {
    "Primary Care Physicians": "Patients with stable autoimmune conditions returning for ongoing chronic care",
    Dermatologists: "Psoriatic arthritis, lupus skin findings, or connective tissue disease with dermatologic features",
    "Pain Management Specialists": "Fibromyalgia and inflammatory pain syndromes needing interventional pain care",
    Gastroenterologists: "IBD-associated arthritis where GI workup drives diagnosis",
  },
  Neurologists: {
    "Primary Care Physicians": "Patients with stable migraine or neuropathy returning to PCP for ongoing care",
    Psychiatrists: "Cognitive disorders with significant mood components or functional neurological symptoms",
    Pediatricians: "Pediatric patients with seizures, developmental concerns, or migraine",
    "Pain Management Specialists": "Neuropathic pain patients needing interventional procedures",
  },
  Psychiatrists: {
    "Primary Care Physicians": "Patients needing medical workup for physical symptoms or medication interactions",
    Pediatricians: "Pediatric patients needing ongoing pediatric care alongside psychiatric treatment",
    Neurologists: "Patients with cognitive decline, post-stroke depression, or functional neurologic concerns",
    "Pain Management Specialists": "Chronic pain patients with mood disorder comorbidity needing interventional care",
  },
  Dermatologists: {
    "Primary Care Physicians": "Patients with stable skin conditions returning for ongoing primary care management",
    "Plastic Surgeons": "Post-Mohs reconstruction cases or patients seeking aesthetic procedures",
    Allergists: "Chronic eczema, contact dermatitis, or atopic dermatitis with allergic features",
    Pediatricians: "Pediatric skin conditions, severe acne, or eczema in young patients",
  },
  Ophthalmologists: {
    "Primary Care Physicians": "Stable patients with chronic eye conditions returning for ongoing primary care",
    Endocrinologists: "Diabetic retinopathy screening and follow-up for diabetic patients",
    Pediatricians: "Pediatric vision concerns, amblyopia, or strabismus",
    Neurologists: "Optic neuritis, visual field defects, papilledema workups, or migraine with aura",
  },
  "Orthopedic Surgeons": {
    "Pain Management Specialists": "Non-surgical chronic MSK pain or post-op pain needing interventional procedures",
    "Primary Care Physicians": "Stable post-op patients returning to PCP for ongoing medical management",
    "Sports Medicine Doctors": "Non-operative MSK injuries better managed conservatively",
  },
  "Pain Management Specialists": {
    "Primary Care Physicians": "Stable chronic pain patients on established regimens returning to PCP for ongoing care",
    "Orthopedic Surgeons": "Patients failing conservative pain management who may benefit from surgery",
    Rheumatologists: "Patients with inflammatory or autoimmune pain syndromes needing systemic treatment",
    Psychiatrists: "Chronic pain patients with significant mood disorder comorbidity",
  },
  Pediatricians: {
    Allergists: "Pediatric patients with food allergies, eczema, asthma, or chronic allergic rhinitis",
    "ENT Doctors": "Chronic otitis, tonsillitis, recurrent ear infections, or hearing concerns",
    Psychiatrists: "Adolescent depression, anxiety, or ADHD requiring medication management",
    Endocrinologists: "Pediatric Type 1 diabetes, pediatric thyroid disorders, or growth concerns",
  },
  "ENT Doctors": {
    "Primary Care Physicians": "Patients with stable conditions returning for ongoing primary care",
    Allergists: "Patients with chronic sinusitis driven by underlying allergic disease",
    Pulmonologists: "Patients with upper airway involvement in lower respiratory disease",
    Pediatricians: "Pediatric patients needing well-child care alongside ENT follow-up",
  },
  Allergists: {
    "Primary Care Physicians": "Stable allergy patients on established regimens returning for ongoing primary care",
    "ENT Doctors": "Patients with structural sinus issues contributing to allergic symptoms",
    Pediatricians: "Pediatric allergy patients needing developmental and vaccination management",
    Pulmonologists: "Difficult-to-control asthma needing pulmonary workup beyond allergy management",
  },
  Urologists: {
    "Primary Care Physicians": "Stable patients post-procedure returning for ongoing primary care",
    "OB-GYNs": "Female patients with pelvic floor disorders, recurrent UTIs, or urinary incontinence overlap",
    Endocrinologists: "Testosterone deficiency, diabetic erectile dysfunction, or metabolic stone disease workup",
  },
  "OB-GYNs": {
    "Primary Care Physicians": "Women needing comprehensive primary care beyond gynecologic scope",
    Endocrinologists: "PCOS, thyroid in pregnancy, gestational diabetes, or hormonal disorders",
    Urologists: "Pelvic floor disorders, recurrent UTIs, or urinary incontinence",
    Psychiatrists: "Postpartum depression, PMDD, or perimenopausal mood disorders",
  },
  "Sports Medicine Doctors": {
    "Orthopedic Surgeons": "Athletes with injuries requiring surgical intervention beyond conservative care",
    "Primary Care Physicians": "Athletes with medical conditions requiring primary care management",
    Endocrinologists: "Athletes with metabolic or hormonal concerns affecting performance",
  },
  "Plastic Surgeons": {
    Dermatologists: "Patients needing dermatologic follow-up after reconstructive or cosmetic surgery",
    "Primary Care Physicians": "Patients needing pre-surgical clearance or chronic condition management",
    "OB-GYNs": "Post-mastectomy reconstruction patients needing ongoing gynecologic care",
  },
}

export interface ReferralPartner {
  specialtyName: string
  referralPotential: "High" | "Medium" | "Low"
  reason: string
  direction: "inbound" | "outbound" | "bidirectional"
}

// Who refers patients TO the target specialty (inbound). Reverse lookup: scan
// every other specialty's refersTo array for the target.
export function buildReverseReferralMap(targetSpecialty: Specialty): ReferralPartner[] {
  const partners: ReferralPartner[] = []
  const targetPlural = targetSpecialty.plural
  const targetName = targetSpecialty.name

  for (const spec of specialties) {
    if (spec.slug === targetSpecialty.slug) continue

    const refersToIndex = spec.refersTo.findIndex(
      (r) => r === targetPlural || r === targetName
    )

    if (refersToIndex !== -1) {
      const reverseIndex = targetSpecialty.refersTo.findIndex(
        (r) => r === spec.plural || r === spec.name
      )

      const potential: "High" | "Medium" | "Low" =
        refersToIndex === 0 ? "High" : refersToIndex === 1 ? "High" : refersToIndex === 2 ? "Medium" : "Low"

      const direction: "inbound" | "bidirectional" =
        reverseIndex !== -1 ? "bidirectional" : "inbound"

      const reasonsForSpec = referralReasons[spec.plural]
      const reason =
        reasonsForSpec?.[targetPlural] ||
        reasonsForSpec?.[targetName] ||
        `${spec.plural} commonly refer patients to ${targetPlural} based on complementary clinical needs`

      partners.push({ specialtyName: spec.plural, referralPotential: potential, reason, direction })
    }
  }

  const potentialOrder = { High: 0, Medium: 1, Low: 2 }
  const directionOrder = { bidirectional: 0, inbound: 1, outbound: 2 }

  partners.sort((a, b) => {
    const dirDiff = directionOrder[a.direction] - directionOrder[b.direction]
    if (dirDiff !== 0) return dirDiff
    return potentialOrder[a.referralPotential] - potentialOrder[b.referralPotential]
  })

  return partners
}

// Who the target specialty refers patients TO (outbound) -- straight from refersTo.
export function buildOutboundReferrals(targetSpecialty: Specialty): ReferralPartner[] {
  return targetSpecialty.refersTo.map((refName, index) => {
    const potential: "High" | "Medium" | "Low" =
      index <= 1 ? "High" : index === 2 ? "Medium" : "Low"

    const reasonsForTarget = referralReasons[targetSpecialty.plural]
    const reason =
      reasonsForTarget?.[refName] ||
      `${targetSpecialty.plural} commonly refer patients to ${refName} for complementary care`

    return { specialtyName: refName, referralPotential: potential, reason, direction: "outbound" as const }
  })
}

export const potentialColors = {
  High: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

export const directionLabels = {
  inbound: "Refers to you",
  outbound: "You refer to them",
  bidirectional: "Two-way referrals",
}

export const directionColors = {
  inbound: "text-blue-400",
  outbound: "text-cyan-400",
  bidirectional: "text-emerald-400",
}
