const { ApifyClient } = require("apify-client")
const axios = require('axios')

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

// Rate limiting and usage tracking
let dailyUsage = 0
const DAILY_LIMIT = 100 // Increased for Serper API
const MAX_LEADS_PER_REQUEST = 10 // Fetch more to filter down to quality leads
const MAX_COMPETITORS_PER_REQUEST = 0 // No competitors needed - we only show partners
const MIN_QUALITY_SCORE = 60 // Minimum score to include a lead

async function scrapeBusinessData({ businessName, websiteUrl, industry, location, customGoal, targetLeads }) {
  try {
    // Check daily usage limit
    if (dailyUsage >= DAILY_LIMIT) {
      console.warn(`⚠️ Daily API limit reached (${DAILY_LIMIT}). Returning basic data structure.`)
      return generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal })
    }

    console.log(`🎯 Generating hyper-personalized leads for: ${businessName}`)
    console.log(`🌐 Website: ${websiteUrl}`)
    console.log(`🏢 Industry: ${industry}`)
    console.log(`📍 Location: ${location}`)
    console.log(`🎯 Custom Goal: ${customGoal || 'Not specified'}`)
    console.log(`🤝 Target Partners: ${targetLeads || 'Not specified'}`)
    console.log(`📊 Daily API usage: ${dailyUsage}/${DAILY_LIMIT}`)

    // Parse location for better targeting
    const locationData = parseLocation(location)

    // Generate personalized search strategies based on all user inputs
    const searchStrategies = generatePersonalizedSearchStrategies({
      businessName,
      websiteUrl,
      industry,
      location: locationData,
      customGoal,
      targetLeads  // Pass user-specified partner types
    })

    console.log(`🔍 Generated ${searchStrategies.length} personalized search strategies`)

    const allResults = []
    
    // Execute multiple targeted searches using Google Serper Maps API
    for (const strategy of searchStrategies) {
      try {
        console.log(`🔍 Executing ${strategy.type} search:`, strategy.searchTerms)

        // For user_specified_partners, search ALL partner types to ensure diversity
        // For other strategies, limit to 2 terms to save quota
        const maxTerms = strategy.type === 'user_specified_partners' ? strategy.searchTerms.length : 2

        // Execute each search term in the strategy
        for (const searchTerm of strategy.searchTerms.slice(0, maxTerms)) {
          const places = await searchGoogleMaps(searchTerm, locationData.city || location)

          // Tag results with search strategy AND the specific search term for tracking
          const taggedPlaces = places.map(place => ({
            ...place,
            searchStrategy: strategy.type,
            relevanceScore: strategy.relevanceWeight,
            searchTerm,
            partnerCategory: searchTerm.replace(locationData.city || location, '').trim() // Track which partner type this came from
          }))

          allResults.push(...taggedPlaces)
          dailyUsage++

          console.log(`✅ ${strategy.type} search for "${searchTerm}" found ${places.length} places`)

          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 500))
        }

      } catch (error) {
        console.error(`❌ Error in ${strategy.type} search:`, error.message)
      }
    }

    console.log(`📊 Total results collected: ${allResults.length}`)

    // Process and create hyper-personalized leads
    const processedData = processPersonalizedData(allResults, {
      businessName,
      websiteUrl,
      industry,
      location: locationData,
      customGoal
    })

    console.log(`🎯 Generated ${processedData.leads.length} hyper-personalized leads`)
    console.log(`🏢 Analyzed ${processedData.competitors.length} key competitors`)
    
    return processedData

  } catch (error) {
    console.error("❌ Scraping Error:", error)
    dailyUsage++
    return generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal })
  }
}

// Google Serper Maps API function
async function searchGoogleMaps(query, location) {
  try {
    if (!process.env.SERPER_API_KEY) {
      console.warn('⚠️ SERPER_API_KEY not found. Returning mock data.')
      return generateMockGoogleMapsData(query)
    }

    const data = JSON.stringify({
      "q": query,
      "ll": location,
      "num": 20 // Get more results to filter from
    })

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://google.serper.dev/maps',
      headers: { 
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      data: data
    }

    const response = await axios.request(config)
    
    if (response.data && response.data.places) {
      return response.data.places.map(place => ({
        // Map Serper response to our internal format
        title: place.title,
        address: place.address,
        rating: place.rating || 0,
        reviewsCount: place.ratingCount || 0,
        category: place.type || place.types?.[0] || 'Business',
        website: place.website || null,
        phone: place.phoneNumber || null,
        location: {
          lat: place.latitude,
          lng: place.longitude
        },
        imageUrl: place.thumbnailUrl || null,
        placeId: place.placeId,
        googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.placeId}`,
        openingHours: place.openingHours || null,
        types: place.types || [],
        cid: place.cid,
        fid: place.fid,
        bookingLinks: place.bookingLinks || [],
        // Additional data for processing
        originalData: place
      }))
    }

    return []
  } catch (error) {
    console.error(`❌ Google Serper Maps API error for query "${query}":`, error.message)
    return generateMockGoogleMapsData(query)
  }
}

// Generate mock data when API is not available
function generateMockGoogleMapsData(query) {
  const mockPlaces = [
    {
      title: `${query} Business 1`,
      address: "123 Main St, Business District",
      rating: 4.2,
      reviewsCount: 45,
      category: "Professional Services",
      website: "https://business1.com",
      phone: "(555) 123-4567",
      location: { lat: 25.7617, lng: -80.1918 },
      imageUrl: null,
      placeId: "mock_place_1",
      googleMapsUrl: "https://maps.google.com/mock1",
      types: ["Business", "Professional Services"]
    },
    {
      title: `${query} Company 2`,
      address: "456 Business Ave, Downtown",
      rating: 4.5,
      reviewsCount: 78,
      category: "Business Services",
      website: "https://company2.com",
      phone: "(555) 234-5678",
      location: { lat: 25.7617, lng: -80.1918 },
      imageUrl: null,
      placeId: "mock_place_2",
      googleMapsUrl: "https://maps.google.com/mock2",
      types: ["Business", "Services"]
    }
  ]
  
  return mockPlaces.slice(0, Math.floor(Math.random() * 3) + 1) // Return 1-3 mock results
}

// Common city abbreviations mapping
const CITY_ABBREVIATIONS = {
  "wpb": "West Palm Beach",
  "ftl": "Fort Lauderdale",
  "mia": "Miami",
  "orl": "Orlando",
  "tpa": "Tampa",
  "jax": "Jacksonville",
  "atl": "Atlanta",
  "nyc": "New York",
  "la": "Los Angeles",
  "sf": "San Francisco",
  "chi": "Chicago",
  "hou": "Houston",
  "dal": "Dallas",
  "phx": "Phoenix",
  "den": "Denver",
  "sea": "Seattle",
  "bos": "Boston",
  "dc": "Washington",
  "philly": "Philadelphia",
  "lv": "Las Vegas"
}

function parseLocation(location) {
  // Enhanced location parsing to extract city, state, and ZIP
  const locationParts = location.split(',').map(part => part.trim())

  let city, state, zipCode, fullLocation

  // Check for city abbreviations first
  const firstPart = locationParts[0]?.toLowerCase()
  if (CITY_ABBREVIATIONS[firstPart]) {
    city = CITY_ABBREVIATIONS[firstPart]
    console.log(`📍 Expanded city abbreviation: "${firstPart}" -> "${city}"`)
  }

  // Check if it's a ZIP code pattern
  const zipMatch = location.match(/\b\d{5}(?:-\d{4})?\b/)
  if (zipMatch) {
    zipCode = zipMatch[0]
  }

  // Check for state abbreviations or full state names
  const stateMatch = location.match(/\b[A-Z]{2}\b|\b(?:Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i)
  if (stateMatch) {
    state = stateMatch[0]
  }
  
  // Extract city (only if not already set from abbreviation)
  if (!city && locationParts.length > 0) {
    // If first part has address numbers, try second part
    if (locationParts[0].match(/^\d+/)) {
      city = locationParts[1] || locationParts[0]
    } else {
      city = locationParts[0]
    }
    // Clean city name
    city = city.replace(/\d{5}(?:-\d{4})?/, '').trim()
  }
  
  return {
    original: location,
    city: city || location,
    state: state,
    zipCode: zipCode,
    fullLocation: location,
    isUrban: isUrbanArea(city || location),
    marketSize: estimateMarketSize(location)
  }
}

function generatePersonalizedSearchStrategies({ businessName, websiteUrl, industry, location, customGoal, targetLeads }) {
  const strategies = []

  // Strategy 1: USER-SPECIFIED PARTNER TYPES (highest priority)
  // If user specified partners like "accountants, banks, business consultants", search for those directly
  if (targetLeads && targetLeads.length > 0) {
    const partnerTypes = targetLeads.split(',').map(p => p.trim()).filter(p => p.length > 0)
    console.log(`🎯 Using user-specified partner types:`, partnerTypes)

    strategies.push({
      type: "user_specified_partners",
      searchTerms: partnerTypes.slice(0, 5).map(partnerType =>
        `${partnerType} ${location.city}`
      ),
      maxResults: MAX_LEADS_PER_REQUEST,
      relevanceWeight: 1.0, // Highest weight for user-specified
      description: "Find user-specified referral partner types"
    })
  }

  // Strategy 2: Industry-based partners (fallback if no user-specified)
  if (!targetLeads || targetLeads.length === 0) {
    const partnerIndustries = getStrategicPartnerIndustries(industry)
    strategies.push({
      type: "potential_partners",
      searchTerms: partnerIndustries.map(partnerType =>
        `${partnerType} ${location.city}`
      ),
      maxResults: MAX_LEADS_PER_REQUEST,
      relevanceWeight: 0.8,
      description: "Find potential partners and strategic connections"
    })
  }

  // Strategy 3: Custom Goal-Based Search (if customGoal is provided)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractKeywordsFromGoal(customGoal)
    if (goalKeywords.length > 0) {
      strategies.push({
        type: "custom_goal_based",
        searchTerms: goalKeywords.map(keyword =>
          `${keyword} ${location.city}`
        ),
        maxResults: 10,
        relevanceWeight: 0.9,
        description: "Find businesses aligned with custom goals"
      })
    }
  }

  return strategies
}

function getStrategicPartnerIndustries(industry) {
  const partnerMap = {
    "Restaurant & Food Service": ["food distributor", "catering equipment", "pos systems", "commercial cleaning", "food delivery"],
    "Retail & E-commerce": ["ecommerce platform", "logistics", "marketing agency", "inventory software", "payment processing"],
    "Professional Services": ["business coaching", "marketing services", "office supplies", "communication tools", "co-working spaces"],
    "Healthcare & Medical": ["medical billing", "healthcare IT", "medical marketing", "compliance consulting", "medical equipment"],
    "Fitness & Wellness": ["fitness equipment", "nutrition consulting", "wellness coaching", "sports medicine", "health supplements"],
    "Beauty & Personal Care": ["beauty distributor", "salon software", "marketing agency", "business consulting", "beauty supplies"],
    "Real Estate": ["mortgage broker", "home inspector", "staging company", "real estate photography", "property management"],
    "Technology & Software": ["cloud services", "cybersecurity", "IT consulting", "software integration", "tech support"],
    "Manufacturing": ["supply chain", "quality assurance", "industrial automation", "logistics", "equipment rental"],
    "Automotive": ["automotive distributor", "mechanic tools", "auto insurance", "fleet services", "car dealership"],
    "Education & Training": ["educational software", "learning platforms", "curriculum development", "student services"],
    "Financial Services": ["fintech", "regulatory compliance", "financial software", "business consulting", "accounting"],
    "Legal Services": ["legal software", "document management", "court services", "legal marketing", "compliance"],
    "Marketing & Advertising": ["creative services", "media buying", "analytics tools", "content platforms", "graphic design"],
    "Construction": ["equipment rental", "safety services", "project management software", "building supplies", "architecture"]
  }
  
  return partnerMap[industry] || ["business consulting", "professional services", "software solutions", "marketing services", "business development"]
}

function extractKeywordsFromGoal(customGoal) {
  const goalText = customGoal.toLowerCase()
  const keywords = []
  
  // Business growth keywords
  if (goalText.includes("expand") || goalText.includes("growth") || goalText.includes("scale")) {
    keywords.push("business expansion services", "growth consulting")
  }
  
  // Partnership keywords
  if (goalText.includes("partner") || goalText.includes("collaborate") || goalText.includes("alliance")) {
    keywords.push("business partnership", "strategic alliance consulting")
  }
  
  // Customer acquisition keywords
  if (goalText.includes("customer") || goalText.includes("client") || goalText.includes("sales") || goalText.includes("members")) {
    keywords.push("customer acquisition services", "sales consulting", "marketing agency")
  }
  
  // Technology/Digital keywords
  if (goalText.includes("digital") || goalText.includes("online") || goalText.includes("technology")) {
    keywords.push("digital marketing", "technology solutions", "online services")
  }
  
  // Marketing keywords
  if (goalText.includes("marketing") || goalText.includes("brand") || goalText.includes("visibility")) {
    keywords.push("marketing services", "brand development", "advertising agency")
  }
  
  // Efficiency/Optimization keywords
  if (goalText.includes("efficient") || goalText.includes("optimize") || goalText.includes("streamline")) {
    keywords.push("business optimization", "efficiency consulting", "process improvement")
  }
  
  // Gym/Fitness specific keywords (from your example)
  if (goalText.includes("gym") || goalText.includes("fitness") || goalText.includes("wellness")) {
    keywords.push("fitness equipment", "nutrition services", "wellness coaching", "sports medicine")
  }
  
  // Branches/Expansion keywords (from your example)
  if (goalText.includes("branch") || goalText.includes("location") || goalText.includes("expand")) {
    keywords.push("real estate", "business expansion consulting", "franchise consulting")
  }
  
  return keywords.slice(0, 3) // Limit to top 3 keywords
}

function processPersonalizedData(allResults, userProfile) {
  const { businessName, websiteUrl, industry, location, customGoal } = userProfile
  
  // Remove duplicates and filter out the user's own business
  const uniqueResults = removeDuplicates(allResults, businessName)
  
  console.log(`🔍 Processing ${uniqueResults.length} unique results`)
  
  const processedData = {
    totalPlaces: uniqueResults.length,
    competitors: [], // Empty array - we don't need competitors
    leads: [],
    marketAnalysis: {
      averageRating: 0,
      totalReviews: 0,
      saturation: "Unknown",
      priceRange: "Unknown",
      topCategories: [],
      personalizedInsights: generatePersonalizedInsights(uniqueResults, userProfile)
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: uniqueResults.length,
      processingMethod: "google_serper_maps_api",
      userProfile: {
        industry,
        location: location.fullLocation || location,
        hasCustomGoal: !!customGoal
      }
    }
  }

  // Skip competitors processing - we only need potential partners
  processedData.competitors = []

  // Generate leads (Potential Partners) - Focus only on quality leads
  const potentialLeads = uniqueResults
    .filter(item => {
      // Must have title and not be own business
      if (!item.title || isOwnBusiness(item.title, businessName)) return false

      // Must be from partner/goal search strategies (including user_specified_partners!)
      const validStrategies = ['potential_partners', 'custom_goal_based', 'user_specified_partners']
      if (!validStrategies.includes(item.searchStrategy)) return false

      // QUALITY FILTER: Must have at least phone OR website
      const hasContactInfo = (item.phone && item.phone.length >= 10) ||
                            (item.website && item.website.startsWith('http'))
      if (!hasContactInfo) return false

      return true
    })
    .map(item => {
      const leadScore = calculateLeadScore(item, userProfile)
      const leadType = determineLeadType(item, userProfile)
      const personalizationScore = calculatePersonalizationScore(item, userProfile)
      const outreachChannel = determineOutreachChannel(item)
      const personalizedOpener = generatePersonalizedOpener(item, userProfile)

      return {
        businessName: item.title,
        contactPerson: generateContactPerson(item, leadType),
        email: generateBusinessEmail(item),
        phone: item.phone || null,
        website: item.website || null,
        address: item.address || "Address not available",
        rating: item.rating || 0,
        reviewsCount: item.reviewsCount || 0,
        category: item.category || 'Business',
        leadScore,
        leadType,
        contactReason: generateContactReason(item, userProfile),
        personalizationScore,
        matchReason: generateMatchReason(item, userProfile),
        actionableSteps: generateActionableSteps(item, userProfile),
        // NEW: Outreach intelligence
        outreachChannel, // { primary: 'email'|'call'|'visit'|'linkedin', reason: string, available: string[] }
        personalizedOpener, // Ready-to-use conversation starter
        imageUrl: item.imageUrl || null,
        location: item.location || null,
        priority: Math.min(Math.round(leadScore / 10), 10),
        searchStrategy: item.searchStrategy || "general",
        lastUpdated: new Date().toISOString(),
        placeId: item.placeId || null,
        googleMapsUrl: item.googleMapsUrl || `https://www.google.com/maps/search/${encodeURIComponent(item.title)}`,
        priceLevel: determinePriceLevel(item),
        openingHours: item.openingHours || null,
        additionalInfo: null,
        neighborhood: extractNeighborhood(item.address),
        city: location.city,
        state: location.state,
        postalCode: location.zipCode,
        types: item.types || [],
        partnerCategory: item.partnerCategory || null // Track which partner type this came from
      }
    })
    .filter(lead => lead.leadScore >= MIN_QUALITY_SCORE) // Only include quality leads

  // ENSURE DIVERSITY: Group by partner category and pick top from each, then fill remaining slots
  const leadsByCategory = {}
  potentialLeads.forEach(lead => {
    const category = lead.partnerCategory || 'Other'
    if (!leadsByCategory[category]) leadsByCategory[category] = []
    leadsByCategory[category].push(lead)
  })

  // Sort each category by score
  Object.values(leadsByCategory).forEach(leads => leads.sort((a, b) => b.leadScore - a.leadScore))

  // Round-robin pick from each category to ensure diversity
  const diverseLeads = []
  const categories = Object.keys(leadsByCategory)
  let round = 0

  while (diverseLeads.length < MAX_LEADS_PER_REQUEST) {
    let addedThisRound = 0
    for (const category of categories) {
      if (leadsByCategory[category][round]) {
        diverseLeads.push(leadsByCategory[category][round])
        addedThisRound++
        if (diverseLeads.length >= MAX_LEADS_PER_REQUEST) break
      }
    }
    if (addedThisRound === 0) break // No more leads in any category
    round++
  }

  console.log(`🎯 Diversity check: ${categories.length} partner categories represented`)
  categories.forEach(cat => console.log(`   - ${cat}: ${leadsByCategory[cat].length} leads`))

  processedData.leads = diverseLeads
  console.log(`📊 Quality filter: ${potentialLeads.length} leads passed (min score: ${MIN_QUALITY_SCORE})`)

  console.log(`✅ Generated ${processedData.leads.length} potential partners (no competitors needed)`)

  // Enhanced market analysis
  const validRatings = uniqueResults.filter(item => (item.rating) > 0)
  if (validRatings.length > 0) {
    processedData.marketAnalysis.averageRating = (
      validRatings.reduce((sum, item) => sum + (item.rating), 0) / validRatings.length
    ).toFixed(1)
  }

  processedData.marketAnalysis.totalReviews = uniqueResults.reduce((sum, item) => sum + (item.reviewsCount || 0), 0)
  processedData.marketAnalysis.saturation = calculateMarketSaturation(uniqueResults, userProfile)
  processedData.marketAnalysis.topCategories = analyzeTopCategories(uniqueResults)

  return processedData
}

// Helper functions
function removeDuplicates(results, businessName) {
  const seen = new Set()
  const businessNameLower = businessName.toLowerCase()
  
  return results.filter(item => {
    if (!item.title) return false
    
    const titleLower = item.title.toLowerCase()
    
    // Filter out user's own business
    if (titleLower.includes(businessNameLower) || businessNameLower.includes(titleLower)) {
      return false
    }
    
    const key = `${titleLower}_${item.address || ''}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function isOwnBusiness(title, businessName) {
  if (!title || !businessName) return false
  const titleLower = title.toLowerCase()
  const businessLower = businessName.toLowerCase()
  return titleLower.includes(businessLower) || businessLower.includes(titleLower)
}

function calculateLeadScore(item, userProfile) {
  let score = 0 // Start from 0, earn points based on quality

  // REQUIRED: Must have a business name
  if (!item.title || item.title.length < 3) return 0

  // Contact info is critical (0-40 points)
  if (item.website && item.website.startsWith('http')) score += 20
  if (item.phone && item.phone.length >= 10) score += 20

  // Rating signals legitimacy (0-25 points)
  if (item.rating && item.rating >= 4.0) score += 25
  else if (item.rating && item.rating >= 3.5) score += 15
  else if (item.rating && item.rating >= 3.0) score += 10

  // Reviews indicate real business (0-20 points)
  if (item.reviewsCount && item.reviewsCount >= 50) score += 20
  else if (item.reviewsCount && item.reviewsCount >= 20) score += 15
  else if (item.reviewsCount && item.reviewsCount >= 5) score += 10

  // Address completeness (0-10 points)
  if (item.address && item.address.length > 10) score += 10

  // Location match (0-15 points)
  if (item.address && userProfile.location) {
    const cityMatch = item.address.toLowerCase().includes(userProfile.location.city?.toLowerCase() || '')
    if (cityMatch) score += 15
  }

  // Search strategy bonus (0-20 points) - USER SPECIFIED gets highest priority!
  if (item.searchStrategy === 'user_specified_partners') score += 20  // Highest priority - user chose these!
  else if (item.searchStrategy === 'custom_goal_based') score += 10
  else if (item.searchStrategy === 'potential_partners') score += 8

  return Math.round(Math.min(score, 100))
}

function determineLeadType(item, userProfile) {
  if (item.searchStrategy === 'user_specified_partners') {
    return 'Referral Partner'  // User specified these - highest value
  } else if (item.searchStrategy === 'custom_goal_based') {
    return 'Strategic Partner'
  } else if (item.searchStrategy === 'potential_partners') {
    return 'Potential Partner'
  } else {
    return 'Business Contact'
  }
}

function calculatePersonalizationScore(item, userProfile) {
  let score = 50 // Base score
  
  // Location match (0-25 points)
  if (item.address && userProfile.location) {
    const cityMatch = item.address.toLowerCase().includes(userProfile.location.city?.toLowerCase() || '')
    if (cityMatch) score += 25
  }
  
  // Category relevance (0-25 points)
  if (item.category && userProfile.industry) {
    const industryMatch = item.category.toLowerCase().includes(userProfile.industry.toLowerCase().split(' ')[0])
    if (industryMatch) score += 25
  }
  
  return Math.round(Math.min(score, 100))
}

function generateContactPerson(item, leadType) {
  const titles = {
    'Strategic Partner': ['Business Development Manager', 'Partnership Director', 'CEO', 'Founder'],
    'Potential Customer': ['Sales Manager', 'Customer Success Manager', 'Account Manager', 'Business Manager'],
    'Business Contact': ['Manager', 'Owner', 'Director', 'Coordinator']
  }
  
  const titleList = titles[leadType] || titles['Business Contact']
  const randomTitle = titleList[Math.floor(Math.random() * titleList.length)]
  
  return randomTitle
}

function generateBusinessEmail(item) {
  if (!item.title) return null
  
  const domain = item.website ? 
    item.website.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 
    null
  
  if (domain) {
    const prefixes = ['info', 'contact', 'hello', 'business', 'partnerships']
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    return `${prefix}@${domain}`
  }
  
  return null
}

function generateContactReason(item, userProfile) {
  const { industry, customGoal } = userProfile
  
  if (customGoal && customGoal.includes('customer')) {
    return `Strategic partnership opportunity to help grow your customer base in ${industry}. Our complementary services could create mutual referral opportunities and expand market reach for both businesses.`
  }
  
  if (customGoal && customGoal.includes('branch')) {
    return `Expansion collaboration opportunity. As you grow your business locations, we could explore strategic partnerships for cross-promotion and shared customer acquisition in the ${industry} market.`
  }
  
  return `Partnership opportunity in the ${industry} sector. Our services complement each other well, and we could explore mutual referral programs and collaborative marketing efforts to benefit both businesses.`
}

function generateMatchReason(item, userProfile) {
  const reasons = [
    `Highly rated business (${item.rating}/5) with strong local presence`,
    `Complementary services that align with your business goals`,
    `Strategic location for potential collaboration`,
    `Established business with proven track record`
  ]
  
  return reasons[Math.floor(Math.random() * reasons.length)]
}

function generateActionableSteps(item, userProfile) {
  const steps = [
    `Research their services and identify collaboration opportunities`,
    `Prepare a partnership proposal highlighting mutual benefits`,
    `Schedule an introductory meeting to discuss synergies`,
    `Follow up with concrete partnership ideas within 48 hours`
  ]

  return steps.slice(0, 2) // Return 2 actionable steps
}

// Determine best outreach channel based on available contact info and business type
function determineOutreachChannel(item) {
  const channels = []

  // Check what contact methods are available
  const hasPhone = item.phone && item.phone.length >= 10
  const hasWebsite = item.website && item.website.startsWith('http')
  const hasEmail = hasWebsite // If they have a website, we can derive email

  // Business type indicators from category/types
  const category = (item.category || '').toLowerCase()
  const types = (item.types || []).map(t => t.toLowerCase()).join(' ')
  const allText = `${category} ${types}`

  // Professional services (accountants, lawyers, consultants) - prefer email/call
  const isProfessionalService = /accountant|lawyer|attorney|consultant|financial|insurance|real estate|mortgage/.test(allText)

  // Health/wellness (chiropractors, therapists, fitness) - prefer call/in-person
  const isHealthWellness = /chiropract|therapist|doctor|dentist|fitness|gym|wellness|spa|massage/.test(allText)

  // Retail/local service - prefer call or walk-in
  const isLocalRetail = /restaurant|salon|barber|shop|store|cafe|bakery/.test(allText)

  // Determine primary channel
  let primary = 'email'
  let reason = ''

  if (isProfessionalService) {
    if (hasEmail) {
      primary = 'email'
      reason = 'Professional services respond well to thoughtful emails'
    } else if (hasPhone) {
      primary = 'call'
      reason = 'Direct call works for professional service providers'
    }
  } else if (isHealthWellness) {
    if (hasPhone) {
      primary = 'call'
      reason = 'Health/wellness businesses prefer personal phone contact'
    } else if (hasEmail) {
      primary = 'email'
      reason = 'Email introduction before in-person visit'
    }
  } else if (isLocalRetail) {
    primary = 'visit'
    reason = 'Local businesses appreciate face-to-face introductions'
    if (hasPhone) {
      primary = 'call'
      reason = 'Call ahead to schedule a quick intro meeting'
    }
  } else {
    // Default logic based on available channels
    if (hasPhone && hasEmail) {
      primary = 'email'
      reason = 'Email first, then follow up with a call'
    } else if (hasPhone) {
      primary = 'call'
      reason = 'Phone is their primary contact method'
    } else if (hasEmail) {
      primary = 'email'
      reason = 'Reach out via their website contact'
    } else {
      primary = 'visit'
      reason = 'Drop by to introduce yourself in person'
    }
  }

  // Build available channels list
  if (hasEmail) channels.push('email')
  if (hasPhone) channels.push('call')
  channels.push('visit') // Always an option for local businesses
  if (hasWebsite) channels.push('linkedin') // Can often find owners on LinkedIn

  return {
    primary,
    reason,
    available: channels
  }
}

// Generate personalized opener based on business context
function generatePersonalizedOpener(item, userProfile) {
  const { businessName, industry } = userProfile
  const leadName = item.title
  const leadCategory = item.category || 'business'
  const rating = item.rating
  const reviewCount = item.reviewsCount

  // Build context-aware openers
  const openers = []

  // High rating opener
  if (rating && rating >= 4.5 && reviewCount > 20) {
    openers.push(`I noticed ${leadName} has excellent reviews (${rating}/5) - clearly you're doing something right. I run ${businessName} and think there could be a natural fit for referring clients to each other.`)
  }

  // Same area opener
  openers.push(`Hi! I'm reaching out because we're both serving the ${userProfile.location?.city || 'local'} community. I run ${businessName} in ${industry}, and I think our clients could benefit from knowing about each other's services.`)

  // Referral-focused opener
  openers.push(`I own ${businessName} and I'm building relationships with ${leadCategory} professionals in the area. I often have clients who need your services and wanted to explore if a referral relationship makes sense.`)

  // Direct value opener
  openers.push(`Quick intro - I'm with ${businessName}. We serve similar clients and I'd love to chat about sending referrals your way. Do you have 10 minutes this week?`)

  // Pick the best one based on available data
  if (rating && rating >= 4.5 && reviewCount > 20) {
    return openers[0]
  }
  return openers[Math.floor(Math.random() * (openers.length - 1)) + 1]
}

function determinePriceLevel(item) {
  // Try to determine price level from available data
  if (item.types && item.types.some(type => type.includes('luxury') || type.includes('premium'))) {
    return '$$$$'
  }
  
  // Default to mid-range
  return '$$'
}

function extractNeighborhood(address) {
  if (!address) return null
  
  // Extract neighborhood from address (simple implementation)
  const parts = address.split(',')
  if (parts.length > 2) {
    return parts[1].trim()
  }
  
  return null
}

function calculateMarketSaturation(results, userProfile) {
  const competitorCount = results.filter(r => r.searchStrategy === 'direct_competitors').length
  
  if (competitorCount > 15) return 'High'
  if (competitorCount > 8) return 'Medium'
  return 'Low'
}

function analyzeTopCategories(results) {
  const categories = {}
  
  results.forEach(item => {
    if (item.category) {
      categories[item.category] = (categories[item.category] || 0) + 1
    }
  })
  
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }))
}

function generatePersonalizedInsights(results, userProfile) {
  const { industry, location } = userProfile
  const totalResults = results.length
  const avgRating = results.reduce((sum, r) => sum + (r.rating || 0), 0) / totalResults || 0
  
  return {
    marketOpportunity: `Market analysis for ${industry} in ${location.city || 'your area'} shows ${totalResults} potential business connections with an average rating of ${avgRating.toFixed(1)}/5.0`,
    competitiveLandscape: `The local market has ${calculateMarketSaturation(results, userProfile).toLowerCase()} competition density, presenting good opportunities for strategic partnerships`,
    topRecommendation: "Focus on building relationships with highly-rated businesses in complementary industries",
    actionableAdvice: `Connect with the top-rated potential partners to explore collaboration opportunities in the ${industry} sector`
  }
}

function isUrbanArea(location) {
  const urbanAreas = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'boston', 'miami']
  return urbanAreas.some(city => location.toLowerCase().includes(city))
}

function estimateMarketSize(location) {
  if (isUrbanArea(location)) return 'Large'
  if (location.toLowerCase().includes('county')) return 'Medium'
  return 'Small'
}

// BASIC DATA STRUCTURE WHEN QUOTA IS REACHED OR ERROR OCCURS
function generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal }) {
  console.log("📊 Generating basic data structure (no API quota used)")
  
  const locationData = parseLocation(location)
  
  return {
    totalPlaces: 0,
    competitors: [],
    leads: [],
    marketAnalysis: {
      averageRating: "0",
      totalReviews: 0,
      saturation: "Unknown",
      priceRange: "Unknown",
      topCategories: [],
      personalizedInsights: {
        marketOpportunity: `Market analysis for ${industry} business in ${locationData.city} is pending data collection`,
        competitiveLandscape: `The local market analysis for ${industry} requires additional data`,
        topRecommendation: "Focus on building strategic partnerships and networking in your local market",
        actionableAdvice: `Connect with local businesses in ${locationData.city} to explore collaboration opportunities`
      }
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: 0,
      processingMethod: "basic_structure_only",
      userProfile: {
        businessName,
        industry,
        location: locationData.fullLocation,
        hasCustomGoal: !!customGoal,
        note: "Limited data due to quota restrictions"
      }
    }
  }
}

// Reset daily usage counter
function resetDailyUsage() {
  dailyUsage = 0
  console.log("🔄 Daily API usage counter reset")
}

module.exports = {
  scrapeBusinessData,
  resetDailyUsage
}
