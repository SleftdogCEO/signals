const axios = require('axios');

class AirtableService {
  constructor() {
    this.baseId = process.env.AIRTABLE_BASE_ID;
    this.apiKey = process.env.AIRTABLE_API_KEY;
    this.tableId = process.env.AIRTABLE_TABLE_ID || 'tblUsers'; // Your users table ID
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`;
  }

  async createUserRecord(userData) {
    try {
      console.log('📝 Creating Airtable record for user:', userData.email);
      
      const record = {
        fields: {
          'Email': userData.email,
          'Full Name': userData.fullName || '',
          'User ID': userData.userId,
          'Signup Date': new Date().toISOString(),
          'Auth Provider': userData.authProvider || 'email',
          'Status': 'Active',
          'Plan Type': 'Free', // Default plan
          'Signup Source': 'Web App',
          'Last Login': new Date().toISOString()
        }
      };

      const response = await axios.post(this.baseUrl, {
        records: [record]
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Airtable record created:', response.data.records[0].id);
      return {
        success: true,
        recordId: response.data.records[0].id,
        data: response.data.records[0]
      };

    } catch (error) {
      console.error('❌ Airtable error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  async updateUserRecord(userId, updateData) {
    try {
      // First, find the record by User ID
      const searchResponse = await axios.get(`${this.baseUrl}?filterByFormula={User ID}='${userId}'`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (searchResponse.data.records.length === 0) {
        console.log('⚠️ User record not found in Airtable:', userId);
        return { success: false, error: 'Record not found' };
      }

      const recordId = searchResponse.data.records[0].id;
      
      const response = await axios.patch(`${this.baseUrl}/${recordId}`, {
        fields: {
          'Last Login': new Date().toISOString(),
          ...updateData
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Airtable record updated:', recordId);
      return {
        success: true,
        recordId: recordId,
        data: response.data
      };

    } catch (error) {
      console.error('❌ Airtable update error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

module.exports = new AirtableService();