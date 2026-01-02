export interface TargetLead {
  type: string        // "Realtors", "Property Managers", etc.
  reason: string      // "For referral partnerships"
}

export interface TargetEvent {
  type: string        // "Real estate networking", "Business mixers"
  reason: string
}

export interface TargetIntel {
  topic: string       // "Phoenix real estate market"
  reason: string
}

export interface OutreachStrategy {
  // Who the user is
  business: {
    name: string
    industry: string
    location: string
  }

  // What they want
  goal: string  // "referrals", "customers", "partnerships", "networking"

  // Who we'll find
  targetLeads: TargetLead[]

  // What events to surface
  targetEvents: TargetEvent[]

  // What intel to gather
  targetIntel: TargetIntel[]
}

export interface DiscoveryState {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  extractedData: Partial<OutreachStrategy>
  isReadyForStrategy: boolean
  proposedStrategy: OutreachStrategy | null
  phase: "discovery" | "confirmation" | "generating"
}

export interface DiscoveryResponse {
  success: boolean
  message: string
  extractedData: Partial<OutreachStrategy>
  isReadyForStrategy: boolean
  proposedStrategy: OutreachStrategy | null
}
