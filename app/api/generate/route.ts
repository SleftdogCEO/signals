import { NextRequest, NextResponse } from "next/server"

const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sleft-signals-backend.herokuapp.com'
  }
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
}

const BACKEND_URL = getBackendUrl()

export async function POST(request: NextRequest) {
  try {
    console.log(`🚀 Brief generation request received...`)
    
    const formData = await request.json()
    console.log(`📊 Form Data:`, JSON.stringify(formData, null, 2))

    // CRITICAL: Validate we have actual business data (not general conversation)
    const hasBusinessName = formData.businessName && 
                           formData.businessName !== 'Professional Business' &&
                           formData.businessName.length > 2

    const hasIndustry = formData.industry && 
                       formData.industry !== 'Professional Services' &&
                       formData.industry.length > 2

    const hasLocation = formData.location && 
                       formData.location !== 'Local Market' &&
                       formData.location.length > 2

    // Check if we have ACTUAL business information
    if (!hasBusinessName && !hasIndustry && !hasLocation) {
      console.log(`⚠️ No actual business data provided - conversation data:`, formData.conversationData)
      
      return NextResponse.json({
        error: "I need to know more about your business before generating a brief. Please tell me your business name, industry, and location first.",
        requiresMoreInfo: true,
        missingData: "business_basics"
      }, { status: 400 })
    }

    // ONLY call backend services when we have real business data
    console.log(`✅ Sufficient business data found - proceeding with backend services...`)

    // Enhanced form data with validation
    const enhancedFormData = {
      businessName: hasBusinessName ? formData.businessName : 
                   (hasIndustry ? `${formData.industry} Business` : 'Professional Business'),
      
      industry: hasIndustry ? formData.industry : 'Professional Services',
      
      location: hasLocation ? formData.location : 'Local Market',
      
      websiteUrl: formData.websiteUrl === 'none' ? '' : 
                  (formData.websiteUrl || ''),
      
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
      
      conversationData: formData.conversationData || {},
      userId: formData.userId,
      hasRealBusinessData: hasBusinessName || hasIndustry || hasLocation
    }

    console.log(`🧠 Enhanced Form Data (validated):`, JSON.stringify(enhancedFormData, null, 2))

    // Add processing latency indicator
    const startTime = Date.now()
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes timeout
    
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enhancedFormData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const processingTime = Date.now() - startTime
    console.log(`⏱️ Backend processing time: ${processingTime}ms`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Backend error (${response.status}):`, errorText)
      
      return NextResponse.json({
        error: `Brief generation is processing your business data. This may take 2-3 minutes for comprehensive market analysis. Processing time: ${Math.round(processingTime/1000)}s`,
        processingTime,
        stillProcessing: true
      }, { status: response.status })
    }

    const result = await response.json()
    
    console.log(`✅ Brief generated successfully for ${enhancedFormData.businessName}`)
    console.log(`📊 Total processing time: ${processingTime}ms`)
    
    return NextResponse.json({
      ...result,
      processingTime,
      enhancedWithAI: true,
      dataCompleteness: calculateDataCompleteness(enhancedFormData),
      usedRealBusinessData: enhancedFormData.hasRealBusinessData
    })

  } catch (error) {
    console.error("❌ Generate API Error:", error)
    
    return NextResponse.json({
      error: `Brief generation requires more specific business information. Please provide your business name, industry, and location first.`,
      requiresMoreInfo: true,
      processingStatus: "needs_business_data"
    }, { status: 500 })
  }
}

function calculateDataCompleteness(formData: any): string {
  const hasRealData = formData.hasRealBusinessData
  
  if (!hasRealData) return "Insufficient"
  
  const requiredFields = ['businessName', 'industry', 'location']
  const optionalFields = ['websiteUrl', 'customGoal', 'networkingKeyword', 'partnershipGoals']
  
  const requiredComplete = requiredFields.filter(field => 
    formData[field] && 
    formData[field] !== 'Professional Business' && 
    formData[field] !== 'Local Market' &&
    formData[field] !== 'Professional Services'
  ).length
  
  const optionalComplete = optionalFields.filter(field => 
    formData[field] && formData[field] !== ''
  ).length
  
  const totalScore = (requiredComplete / requiredFields.length) * 70 + (optionalComplete / optionalFields.length) * 30
  
  if (totalScore >= 90) return "Comprehensive"
  if (totalScore >= 70) return "Good"  
  if (totalScore >= 50) return "Adequate"
  return "Basic"
}
