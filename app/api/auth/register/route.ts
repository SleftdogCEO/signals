import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || 'Users'

async function createAirtableRecord(userData: any) {
  try {
    console.log('📝 Creating Airtable record for user:', userData.email)
    
    // SIMPLIFIED RECORD - Only essential fields
    const record = {
      fields: {
        'Email': userData.email,
        'Full Name': userData.fullName || '',
        'User ID': userData.userId,
        'Auth Provider': userData.authProvider || 'email',
        'Status': 'Active'
      }
    }

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: [record] })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Airtable API Error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log('✅ Airtable record created:', data.records[0].id)
    
    return {
      success: true,
      recordId: data.records[0].id
    }

  } catch (error) {
    console.error('❌ Airtable error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📧 New user registration:', body.email)

    // Create Airtable record
    const airtableResult = await createAirtableRecord(body)

    if (airtableResult.success) {
      return NextResponse.json({
        success: true,
        message: 'User registered and recorded in Airtable',
        airtableRecordId: airtableResult.recordId
      })
    } else {
      // Don't fail the registration if Airtable fails
      console.error('⚠️ Airtable recording failed, but user registration continues')
      return NextResponse.json({
        success: true,
        message: 'User registered (Airtable recording failed)',
        warning: airtableResult.error
      })
    }

  } catch (error) {
    console.error('❌ Registration API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}