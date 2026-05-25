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
  // Named Tampa Bay / Central FL health systems. NOTE: several only show their
  // true owner in the CMS billing-group name, not the NPPES practice name —
  // e.g. "Florida Hospital Physician Group" = AdventHealth, "OHI ..." = Orlando
  // Health. Keep these BEFORE the generic /hospital/ rule so the label is right.
  { re: /adventhealth|advent health|florida hospital/i, system: "AdventHealth" },
  { re: /orlando health|\bohi\b/i, system: "Orlando Health" },
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

// Classify across all of a provider's billing-group names (from CMS). A provider
// employed by a system under ANY of their groups is treated as system-owned.
// Returns the first matched system for labeling.
export function classifySystemFromOrgs(
  orgNames: (string | null | undefined)[]
): { isSystem: boolean; system: string | null } {
  for (const name of orgNames) {
    const a = classifyAffiliation(name)
    if (!a.isIndependent) return { isSystem: true, system: a.system }
  }
  return { isSystem: false, system: null }
}
