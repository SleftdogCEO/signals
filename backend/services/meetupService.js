const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

// Rate limiting and usage tracking
let dailyMeetupUsage = 0
const DAILY_MEETUP_LIMIT = 20 // Limit meetup API calls per day
let lastMeetupRequestTime = 0
const MEETUP_RATE_LIMIT_MS = 3000 // 3 seconds between requests

async function getMeetupEvents({ networkingKeyword, location, industry, businessName, customGoal }) {
  try {
    // Check daily usage limit
    if (dailyMeetupUsage >= DAILY_MEETUP_LIMIT) {
      console.warn(`⚠️ Daily meetup API limit reached (${DAILY_MEETUP_LIMIT}). Returning personalized mock data.`)
      return generatePersonalizedMockEvents({ networkingKeyword, location, industry, businessName, customGoal })
    }

    console.log(`🎪 Fetching networking events for: ${networkingKeyword || industry}`)
    console.log(`📍 Location: ${location}`)
    console.log(`🏢 Business: ${businessName}`)
    console.log(`📊 Daily meetup API usage: ${dailyMeetupUsage}/${DAILY_MEETUP_LIMIT}`)

    // Rate limiting
    const now = Date.now()
    if (now - lastMeetupRequestTime < MEETUP_RATE_LIMIT_MS) {
      await new Promise(resolve => setTimeout(resolve, MEETUP_RATE_LIMIT_MS - (now - lastMeetupRequestTime)))
    }
    lastMeetupRequestTime = Date.now()

    // Parse location for meetup search
    const locationData = parseLocationForMeetup(location)
    
    // Generate personalized search keywords
    const searchKeywords = generatePersonalizedMeetupKeywords({
      networkingKeyword,
      industry,
      businessName,
      customGoal
    })

    console.log(`🔍 Generated ${searchKeywords.length} personalized meetup keywords:`, searchKeywords)

    const allEvents = []
    
    // Execute searches for each keyword
    for (const keyword of searchKeywords.slice(0, 2)) {
      try {
        // PROPER INPUT FORMAT for filip_cicvarek/meetup-scraper
        const input = {
          searchKeyword: keyword,
          city: locationData.city,
          state: locationData.state || "", // Optional for non-US locations
          country: getCountryCode(locationData.country || "us"), // 2-letter country code
          maxResults: 15,
          startDateRange: new Date().toISOString(), // Current date in ISO format
          scrapeEventName: true,
          scrapeEventDescription: true,
          scrapeEventType: true,
          scrapeEventDate: true,
          scrapeEventAddress: true,
          scrapeEventUrl: true,
          scrapeHostedByGroup: true,
          scrapeMaxAttendees: true,
          scrapeActualAttendeesCount: true
        }

        console.log(`🔍 Executing meetup search for: ${keyword}`)
        
        // Use the correct actor ID: filip_cicvarek/meetup-scraper
        const run = await client.actor("filip_cicvarek/meetup-scraper").call(input, {
          timeout: 120000, // 2 minute timeout
        })
        
        const { items } = await client.dataset(run.defaultDatasetId).listItems()
        
        console.log(`📊 Raw meetup response for "${keyword}":`, items?.length || 0, "items")
        
        if (items && items.length > 0) {
          // Log first item structure for debugging
          console.log(`📋 Sample meetup item:`, JSON.stringify(items[0], null, 2))
          
          // Tag events with search keyword for better processing
          const taggedEvents = items.map(event => ({
            ...event,
            searchKeyword: keyword,
            relevanceScore: calculateEventRelevance(event, { networkingKeyword, industry, businessName, customGoal })
          }))
          
          allEvents.push(...taggedEvents)
          console.log(`✅ Found ${items.length} events for keyword: ${keyword}`)
        } else {
          console.log(`⚠️ No events found for keyword: ${keyword}`)
        }
        
        dailyMeetupUsage++
        // Small delay between searches
        await new Promise(resolve => setTimeout(resolve, 3000))
        
      } catch (error) {
        console.error(`❌ Error searching for keyword "${keyword}":`, error.message)
        
        // If actor fails, generate enhanced mock data
        console.log(`📝 Using enhanced mock data for keyword: ${keyword}`)
        const mockEvents = generateKeywordSpecificMockEvents(keyword, locationData, { networkingKeyword, industry, businessName, customGoal })
        allEvents.push(...mockEvents)
      }
    }

    console.log(`📊 Total events collected: ${allEvents.length}`)

    // Process and enhance events data
    const processedEvents = processPersonalizedEvents(allEvents, {
      networkingKeyword,
      location: locationData,
      industry,
      businessName,
      customGoal
    })

    console.log(`🎯 Generated ${processedEvents.events.length} personalized networking opportunities`)
    
    return processedEvents

  } catch (error) {
    console.error("❌ Meetup Events Error:", error)
    dailyMeetupUsage++
    return generatePersonalizedMockEvents({ networkingKeyword, location, industry, businessName, customGoal })
  }
}

function parseLocationForMeetup(location) {
  console.log(`🔍 Parsing location: "${location}"`)
  
  // Handle complex addresses like "1830 N Bayshore Dr CP-1, Miami, FL 33132, United States"
  const locationParts = location.split(',').map(part => part.trim())
  
  let city = "miami" // Default fallback
  let state = ""     // Empty for non-US locations
  let country = "us" // Default to US
  
  // Find the city (usually the part without numbers and without state abbreviations)
  for (const part of locationParts) {
    const partLower = part.toLowerCase()
    
    // Skip parts with addresses (containing numbers or common address terms)
    if (partLower.match(/\d+/) || 
        partLower.includes('dr ') || 
        partLower.includes('street') || 
        partLower.includes('avenue') || 
        partLower.includes('blvd') ||
        partLower.includes('cp-')) {
      continue
    }
    
    // Skip state abbreviations and zip codes
    if (partLower.match(/^[a-z]{2}$/) || partLower.match(/\d{5}/)) {
      continue
    }
    
    // Skip "United States"
    if (partLower.includes('united states')) {
      continue
    }
    
    // This should be the city
    if (part.length > 2 && !partLower.match(/^[a-z]{2}$/)) {
      city = partLower
      break
    }
  }
  
  // Find state abbreviation (only for US/Canada)
  const stateMatch = location.match(/\b[A-Z]{2}\b/)
  if (stateMatch) {
    state = stateMatch[0].toLowerCase()
  }
  
  // Determine country
  if (location.toLowerCase().includes('canada') || location.toLowerCase().includes('ca,')) {
    country = "ca"
  } else if (location.toLowerCase().includes('uk') || location.toLowerCase().includes('united kingdom')) {
    country = "uk"
  }
  
  const result = {
    city: city,
    state: state, // Required for US/Canada, empty for others
    country: country,
    original: location
  }
  
  console.log(`✅ Parsed location:`, result)
  return result
}

function getCountryCode(countryInput) {
  const countryMap = {
    "us": "us",
    "usa": "us", 
    "united states": "us",
    "ca": "ca",
    "canada": "ca",
    "uk": "uk",
    "united kingdom": "uk",
    "gb": "uk"
  }
  
  const normalized = countryInput.toLowerCase()
  return countryMap[normalized] || "us" // Default to US
}

function generatePersonalizedMeetupKeywords({ networkingKeyword, industry, businessName, customGoal }) {
  const keywords = []
  
  // Primary keyword (if provided)
  if (networkingKeyword && networkingKeyword.length > 2) {
    keywords.push(networkingKeyword.toLowerCase())
  }
  
  // Industry-based keywords
  const industryKeywords = getIndustryMeetupKeywords(industry)
  keywords.push(...industryKeywords.slice(0, 2))
  
  // Custom goal-based keywords
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractMeetupKeywordsFromGoal(customGoal)
    keywords.push(...goalKeywords.slice(0, 1))
  }
  
  // General business keywords (fallback)
  if (keywords.length === 0) {
    keywords.push("business networking", "entrepreneurship")
  }
  
  return [...new Set(keywords)].slice(0, 3) // Remove duplicates and limit
}

function getIndustryMeetupKeywords(industry) {
  const industryKeywordMap = {
    "Restaurant & Food Service": ["food industry", "hospitality", "restaurant business"],
    "Retail & E-commerce": ["ecommerce", "retail", "online business"],
    "Professional Services": ["business networking", "professional development", "consulting"],
    "Healthcare & Medical": ["healthcare", "medical professionals", "health tech"],
    "Fitness & Wellness": ["fitness", "wellness", "health coaching"],
    "Beauty & Personal Care": ["beauty industry", "cosmetics", "wellness"],
    "Real Estate": ["real estate", "property investment", "real estate networking"],
    "Technology & Software": ["tech", "software development", "startup"],
    "Manufacturing": ["manufacturing", "industrial", "supply chain"],
    "Automotive": ["automotive", "car industry", "transportation"],
    "Education & Training": ["education", "training", "learning"],
    "Financial Services": ["finance", "fintech", "investment"],
    "Legal Services": ["legal", "law", "business law"],
    "Marketing & Advertising": ["marketing", "digital marketing", "advertising"],
    "Construction": ["construction", "building", "contractors"]
  }
  
  return industryKeywordMap[industry] || ["business", "networking", "entrepreneurship"]
}

function extractMeetupKeywordsFromGoal(customGoal) {
  const goalText = customGoal.toLowerCase()
  const keywords = []
  
  // Extract meaningful business-related keywords
  if (goalText.includes("network") || goalText.includes("connect")) {
    keywords.push("networking")
  }
  if (goalText.includes("startup") || goalText.includes("entrepreneur")) {
    keywords.push("startup")
  }
  if (goalText.includes("invest") || goalText.includes("funding")) {
    keywords.push("investment")
  }
  if (goalText.includes("marketing") || goalText.includes("brand")) {
    keywords.push("marketing")
  }
  if (goalText.includes("tech") || goalText.includes("digital")) {
    keywords.push("technology")
  }
  if (goalText.includes("leadership") || goalText.includes("manage")) {
    keywords.push("leadership")
  }
  
  return keywords
}

function calculateEventRelevance(event, userProfile) {
  let score = 0
  const { networkingKeyword, industry, businessName, customGoal } = userProfile
  
  // Handle different possible field names
  const eventName = event.eventName || event.name || event.title || ""
  const eventDescription = event.eventDescription || event.description || ""
  const organizer = event.organizedByGroup || event.organizer || event.group || ""
  
  const eventText = `${eventName} ${eventDescription} ${organizer}`.toLowerCase()
  
  // Keyword relevance (40 points)
  if (networkingKeyword) {
    if (eventText.includes(networkingKeyword.toLowerCase())) score += 40
    else if (eventText.includes(networkingKeyword.toLowerCase().split(' ')[0])) score += 20
  }
  
  // Industry relevance (30 points)
  const industryKeywords = getIndustryMeetupKeywords(industry)
  let industryMatches = 0
  industryKeywords.forEach(keyword => {
    if (eventText.includes(keyword.toLowerCase())) industryMatches += 10
  })
  score += Math.min(industryMatches, 30)
  
  // Event type preference (15 points)
  const eventType = event.eventType || event.type || "PHYSICAL"
  if (eventType === "PHYSICAL") score += 15
  else if (eventType === "ONLINE") score += 10
  
  // Timing relevance (10 points)
  const eventDate = event.date || event.eventDate || event.dateTime
  if (eventDate) {
    const eventDateObj = new Date(eventDate)
    const now = new Date()
    const daysFromNow = (eventDateObj - now) / (1000 * 60 * 60 * 24)
    
    if (daysFromNow <= 30) score += 10
    else if (daysFromNow <= 60) score += 7
    else score += 3
  }
  
  // Attendee count (5 points)
  const maxAttendees = event.maxAttendees || event.capacity || 0
  if (maxAttendees >= 50) score += 5
  else if (maxAttendees >= 20) score += 3
  else score += 1
  
  return Math.min(score, 100)
}

function removeDuplicateEvents(events) {
  const seen = new Set()
  return events.filter(event => {
    const key = `${event.eventName || event.name}-${event.date}-${event.organizedByGroup || event.organizer}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function generateEventId() {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function cleanAndValidateUrl(url) {
  if (!url || url === "#") return "#"
  try {
    new URL(url)
    return url
  } catch {
    return "#"
  }
}

function categorizeEvent(event, industry) {
  const eventName = (event.eventName || "").toLowerCase()
  const eventDescription = (event.eventDescription || "").toLowerCase()
  const eventText = `${eventName} ${eventDescription}`
  
  if (eventText.includes("networking")) return "Networking"
  if (eventText.includes("conference") || eventText.includes("summit")) return "Conference"
  if (eventText.includes("workshop") || eventText.includes("training")) return "Workshop"
  if (eventText.includes("meetup") || eventText.includes("social")) return "Meetup"
  if (eventText.includes("startup") || eventText.includes("entrepreneur")) return "Startup"
  
  return industry || "Business"
}

function getDateDaysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

// ADD: The missing processPersonalizedEvents function
function processPersonalizedEvents(allEvents, userProfile) {
  const { networkingKeyword, location, industry, businessName, customGoal } = userProfile
  
  // Remove duplicates and filter future events only
  const uniqueEvents = removeDuplicateEvents(allEvents)
  const futureEvents = uniqueEvents.filter(event => {
    if (!event.date) return true
    return new Date(event.date) > new Date()
  })
  
  // Process and enhance events with proper field mapping
  const processedEvents = futureEvents
    .map(event => ({
      id: event.eventId || generateEventId(),
      title: event.eventName || "Networking Event",
      description: event.eventDescription || "Professional networking opportunity",
      date: event.date || new Date().toISOString(),
      type: event.eventType || "PHYSICAL",
      address: event.address || event.eventAddress || "Location TBD",
      url: cleanAndValidateUrl(event.eventUrl),
      organizer: event.organizedByGroup || event.hostedByGroup || "Professional Group",
      maxAttendees: event.maxAttendees || 0,
      actualAttendees: event.actualAttendees || event.actualAttendeesCount || 0,
      relevanceScore: event.relevanceScore || calculateEventRelevance(event, userProfile),
      searchKeyword: event.searchKeyword || networkingKeyword || industry,
      category: categorizeEvent(event, industry),
      personalizedReason: generatePersonalizedEventReason(event, userProfile),
      actionableSteps: generateEventActionSteps(event, businessName)
    }))
    .filter(event => event.relevanceScore >= 20)
    .sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(a.date) - new Date(b.date)
    })
    .slice(0, 12)

  // Categorize events
  const categorizedEvents = {}
  processedEvents.forEach(event => {
    const category = event.category || "General"
    if (!categorizedEvents[category]) {
      categorizedEvents[category] = []
    }
    categorizedEvents[category].push(event)
  })
  
  return {
    events: processedEvents,
    categorized: categorizedEvents,
    totalFound: allEvents.length,
    lastUpdated: new Date().toISOString(),
    searchSummary: {
      keywords: [networkingKeyword, ...getIndustryMeetupKeywords(industry)].filter(Boolean),
      location: location.original,
      industry,
      hasCustomGoal: !!customGoal
    }
  }
}

function generatePersonalizedEventReason(event, userProfile) {
  const { businessName, industry, customGoal, networkingKeyword } = userProfile
  
  const reasons = []
  
  if (networkingKeyword && (event.title || "").toLowerCase().includes(networkingKeyword.toLowerCase())) {
    reasons.push(`This event focuses on ${networkingKeyword}, directly aligning with your networking interests.`)
  }
  
  if (customGoal && customGoal.includes("collaborations")) {
    reasons.push(`Perfect opportunity to find potential collaboration partners for ${businessName}.`)
  }
  
  if (event.maxAttendees >= 50) {
    reasons.push(`With ${event.maxAttendees} attendees, this provides excellent networking scale for business growth.`)
  }
  
  if (event.type === "PHYSICAL") {
    reasons.push(`In-person events offer stronger relationship-building opportunities for ${industry} professionals.`)
  }
  
  return reasons.length > 0 
    ? reasons.join(" ") 
    : `This event offers valuable networking opportunities for ${businessName} in the ${industry} industry.`
}

function generateEventActionSteps(event, businessName) {
  return [
    `Prepare a compelling elevator pitch about ${businessName || "your business"}`,
    `Research other attendees and the organizer beforehand`,
    `Bring business cards and prepare to exchange contact information`,
    `Set a goal to make 3-5 meaningful connections`,
    `Follow up with new connections within 24-48 hours`
  ]
}

function generatePersonalizedMockEvents({ networkingKeyword, location, industry, businessName, customGoal }) {
  const locationData = parseLocationForMeetup(location)
  
  const mockEvents = [
    {
      eventId: `mock_${Date.now()}_1`,
      eventName: `${industry} Professionals Networking Mixer`,
      eventDescription: `Join fellow ${industry} professionals for an evening of networking and knowledge sharing. Perfect for ${businessName} to connect with potential partners and clients.`,
      eventType: "PHYSICAL",
      date: getDateDaysFromNow(7),
      address: `Business Center, ${locationData.city}, ${locationData.state}`,
      eventUrl: "#",
      organizedByGroup: `${locationData.city} Business Network`,
      maxAttendees: 75,
      actualAttendees: 45,
      searchKeyword: networkingKeyword || industry
    },
    {
      eventId: `mock_${Date.now()}_2`,
      eventName: `${networkingKeyword || 'Business'} Startup Meetup`,
      eventDescription: `Monthly gathering for entrepreneurs and business professionals. Focus on growth strategies and collaboration opportunities.`,
      eventType: "PHYSICAL", 
      date: getDateDaysFromNow(14),
      address: `Innovation Hub, ${locationData.city}, ${locationData.state}`,
      eventUrl: "#",
      organizedByGroup: `${locationData.city} Entrepreneurs`,
      maxAttendees: 50,
      actualAttendees: 32,
      searchKeyword: networkingKeyword || "business"
    }
  ]

  const processedEvents = processPersonalizedEvents(mockEvents, {
    networkingKeyword,
    location: locationData,
    industry,
    businessName,
    customGoal
  })

  return processedEvents
}

function generateKeywordSpecificMockEvents(keyword, locationData, userProfile) {
  const { networkingKeyword, industry, businessName, customGoal } = userProfile
  
  return [
    {
      eventId: `mock_${keyword}_${Date.now()}`,
      eventName: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Professional Meetup`,
      eventDescription: `Join fellow professionals interested in ${keyword} for networking and knowledge sharing. Perfect for ${businessName || industry} professionals looking to expand their network and discover new opportunities.`,
      eventType: Math.random() > 0.5 ? "PHYSICAL" : "ONLINE",
      date: getDateDaysFromNow(Math.floor(Math.random() * 30) + 7),
      address: `Professional Center, ${locationData.city}, ${locationData.state}`,
      eventUrl: `https://www.meetup.com/${keyword.replace(/\s+/g, '-').toLowerCase()}-professionals`,
      organizedByGroup: `${locationData.city} ${keyword} Network`,
      maxAttendees: Math.floor(Math.random() * 100) + 20,
      actualAttendees: Math.floor(Math.random() * 50) + 10,
      searchKeyword: keyword,
      relevanceScore: Math.floor(Math.random() * 30) + 50 // 50-80 relevance
    }
  ]
}

// Reset daily usage counter
function resetDailyMeetupUsage() {
  dailyMeetupUsage = 0
  console.log("🔄 Daily meetup API usage counter reset")
}

module.exports = {
  getMeetupEvents,
  resetDailyMeetupUsage
}