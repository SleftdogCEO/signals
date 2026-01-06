require('dotenv').config();

const { scrapeBusinessData } = require('./services/scraperService');

async function quickTest() {
  console.log('🔍 Quick test - searching for dental referral partners in Miami...');
  console.log('SERPER API Key present:', process.env.SERPER_API_KEY ? 'Yes' : 'No');
  console.log('');

  const result = await scrapeBusinessData({
    businessName: 'Prana Dental Miami',
    websiteUrl: '',
    industry: 'Healthcare & Medical',
    location: 'Miami',
    customGoal: 'Find referral partners',
    targetLeads: 'orthodontist, oral surgeon, pediatrician'
  });

  console.log('');
  console.log('Partners found:', result.leads?.length || 0);
  console.log('');

  if (result.leads && result.leads.length > 0) {
    console.log('TOP 5 PARTNERS:');
    result.leads.slice(0, 5).forEach((p, i) => {
      console.log('');
      console.log((i+1) + '. ' + p.businessName);
      console.log('   Category:', p.partnerCategory || p.category);
      console.log('   Phone:', p.phone || 'N/A');
      console.log('   Rating:', p.rating || 'N/A');
      console.log('   Score:', p.leadScore);
      if (p.personalizedOpener) {
        console.log('   Opener:', p.personalizedOpener.substring(0, 100) + '...');
      }
    });

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 OUTREACH MESSAGE FOR PRANA DENTAL:');
    console.log('───────────────────────────────────────────────────');

    const categories = [...new Set(result.leads.map(p => p.partnerCategory).filter(Boolean))];
    console.log('');
    console.log(`Hey! I put together a free referral partner list for Prana Dental Miami - found ${result.leads.length} potential partners (${categories.slice(0,3).join(', ')}) in Miami who could send you patients.`);
    console.log('');
    console.log('Want me to send it over? No strings attached, just trying to help local practices grow their referral network.');
  } else {
    console.log('No partners found - raw result:', JSON.stringify(result, null, 2));
  }
}

quickTest().catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
});
