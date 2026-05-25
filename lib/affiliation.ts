// Distinguish independent practices from health-system-employed providers.
//
// Why this exists: providers employed by a large integrated system (AdventHealth,
// BayCare, HCA, etc.) are steered to refer INSIDE their own system, so they are
// not viable mutual-referral partners and are not the buyer for an independent-
// practice referral network. We filter them out of the partner map and flag them
// on the outreach board so concierge calls aren't wasted on them.
//
// Matching the practice/organization NAME is a strong proxy for SYSTEM EMPLOYMENT
// (the practice IS the system). It intentionally does NOT flag an independent
// practice that merely holds admitting privileges at a hospital — only ones whose
// own name carries the system/hospital identity.
//
// The list is metro-tunable; start with Tampa Bay systems + generic institutional
// terms and widen as we expand to new markets.

export const HEALTH_SYSTEM_PATTERNS: { re: RegExp; system: string }[] = [
  // Named Tampa Bay health systems
  { re: /adventhealth|advent health/i, system: "AdventHealth" },
  { re: /baycare/i, system: "BayCare" },
  { re: /\bhca\b|hca florida|hca healthcare/i, system: "HCA Florida" },
  { re: /tampa general|\btgh\b|tgmg/i, system: "Tampa General" },
  { re: /usf health|university of south florida/i, system: "USF Health" },
  { re: /moffitt/i, system: "Moffitt" },
  { re: /morton plant|mease\b/i, system: "BayCare" },
  { re: /st\.?\s*joseph'?s?\s*(hospital|health|care)/i, system: "St. Joseph's (BayCare)" },
  { re: /(james a\.? haley|veterans affairs|\bv\.?a\.?\s*(medical|clinic|hospital))/i, system: "VA" },
  // Generic institutional indicators (not used by independents)
  { re: /health system|healthcare system|health network/i, system: "Health system" },
  { re: /\bhospital\b/i, system: "Hospital" },
  { re: /department of health|county health/i, system: "Public health dept" },
]

export interface Affiliation {
  isIndependent: boolean
  // The matched system name when not independent; null when independent.
  system: string | null
}

// Classify a practice/organization name. Pure name match — see file header for
// why this is the right proxy and its intentional limits.
export function classifyAffiliation(name: string | null | undefined): Affiliation {
  const n = (name || "").trim()
  if (!n) return { isIndependent: true, system: null }
  for (const { re, system } of HEALTH_SYSTEM_PATTERNS) {
    if (re.test(n)) return { isIndependent: false, system }
  }
  return { isIndependent: true, system: null }
}
