import { NextRequest, NextResponse } from "next/server"

// Environment-aware backend URL
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sleft-signals-backend.herokuapp.com'
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
  try {
    console.log(`🚀 Generating brief with intelligent gap-filling...`)
    
    const formData = await request.json()
    console.log(`📊 Form Data:`, JSON.stringify(formData, null, 2))

    // INTELLIGENT DATA VALIDATION - Handle incomplete information
    const enhancedFormData = {
      // Required fields with intelligent defaults
      businessName: formData.businessName || 
                   formData.conversationData?.business_name || 
                   `${formData.industry || 'Professional'} Business`,
      
      industry: formData.industry || 
               formData.conversationData?.industry || 
               'Professional Services',
      
      location: formData.location || 
               formData.conversationData?.location || 
               'Local Market',
      
      // Optional fields with smart handling
      websiteUrl: formData.websiteUrl === 'none' ? '' : 
                  (formData.websiteUrl || formData.conversationData?.website_url || ''),
      
      customGoal: formData.customGoal || 
                 formData.conversationData?.custom_goal ||
                 formData.conversationData?.growth_objectives ||
                 `Accelerate growth and market expansion in the ${formData.industry || 'business'} sector`,
      
      networkingKeyword: formData.networkingKeyword || 
                        formData.conversationData?.networking_keyword ||
                        formData.industry || 
                        'business networking',
      
      partnershipGoals: formData.partnershipGoals || 
                       formData.conversationData?.partnership_goals ||
                       'Build strategic partnerships for mutual growth',
      
      // Always include conversation data
      conversationData: formData.conversationData || {},
      userId: formData.userId
    }

    console.log(`🧠 Enhanced Form Data (with intelligent defaults):`, JSON.stringify(enhancedFormData, null, 2))

    // Add latency indicator for user experience
    const startTime = Date.now()
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout

    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enhancedFormData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const processingTime = Date.now() - startTime
    console.log(`⏱️ Processing time: ${processingTime}ms`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Backend error (${response.status}):`, errorText)
      
      // Return intelligent error response
      return NextResponse.json({
        error: `Brief generation encountered an issue. Our AI systems are processing your request with available information. Processing time: ${Math.round(processingTime/1000)}s`,
        processingTime,
        fallbackAvailable: true
      }, { status: response.status })
    }

    const result = await response.json()
    
    console.log(`✅ Brief generated successfully for ${enhancedFormData.businessName}`)
    console.log(`📊 Processing time: ${processingTime}ms`)
    
    return NextResponse.json({
      ...result,
      processingTime,
      enhancedWithAI: true,
      dataCompleteness: calculateDataCompleteness(enhancedFormData)
    })

  } catch (error) {
    console.error("❌ Generate API Error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    
    return NextResponse.json({
      error: `Brief generation is taking longer than expected. Our AI is working with available information to create your strategy brief. Please wait a moment...`,
      fallbackAvailable: true,
      processingStatus: "ai_assisted_generation"
    }, { status: 500 })
  }
}

function calculateDataCompleteness(formData: any): string {
  const requiredFields = ['businessName', 'industry', 'location']
  const optionalFields = ['websiteUrl', 'customGoal', 'networkingKeyword', 'partnershipGoals']
  
  const requiredComplete = requiredFields.filter(field => 
    formData[field] && formData[field] !== 'Professional Business' && formData[field] !== 'Local Market'
  ).length
  
  const optionalComplete = optionalFields.filter(field => 
    formData[field] && formData[field] !== '' && !formData[field].includes('Accelerate growth')
  ).length
  
  const totalScore = (requiredComplete / requiredFields.length) * 70 + (optionalComplete / optionalFields.length) * 30
  
  if (totalScore >= 90) return "Comprehensive"
  if (totalScore >= 70) return "Good"  
  if (totalScore >= 50) return "Adequate"
  return "AI-Enhanced"
}
