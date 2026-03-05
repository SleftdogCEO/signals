import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: '/Users/grantdenmark1/claude/sleftpayments/credentials/gsc-service-account.json',
  scopes: ['https://www.googleapis.com/auth/indexing']
});

const indexing = google.indexing({ version: 'v3', auth });

const BASE = 'https://sleftsignals.com';

const specialties = [
  'chiropractors','physical-therapists','dentists','orthodontists','dermatologists',
  'primary-care','orthopedic-surgeons','pain-management','mental-health','med-spas',
  'pediatricians','optometrists','podiatrists','oral-surgeons','cardiologists',
];

const topCities = [
  'miami-fl','tampa-fl','orlando-fl','houston-tx','dallas-tx','austin-tx',
  'los-angeles-ca','phoenix-az','atlanta-ga','new-york-ny','chicago-il',
  'denver-co','seattle-wa','nashville-tn','boston-ma',
];

const urls = [
  // Homepage + blog
  BASE,
  `${BASE}/blog`,
  // Blog posts
  `${BASE}/blog/npi-data-underserved-specialties-zip-code`,
  `${BASE}/blog/specialties-refer-each-other-cms-data`,
  `${BASE}/blog/referral-gap-practitioners-five-miles`,
  `${BASE}/blog/cross-referral-playbook-dentists-orthodontists`,
  `${BASE}/blog/pt-practice-found-14-referring-physicians`,
  `${BASE}/welcome`,
  // 15 Specialty pages
  ...specialties.map(s => `${BASE}/find-referral-partners/${s}`),
  // Top specialty+city combos (highest value)
  ...specialties.slice(0, 8).flatMap(s =>
    topCities.slice(0, 6).map(c => `${BASE}/find-referral-partners/${s}/${c}`)
  ),
];

let success = 0, failed = 0;

for (const url of urls) {
  try {
    await indexing.urlNotifications.publish({
      requestBody: { url, type: 'URL_UPDATED' }
    });
    console.log(`OK: ${url}`);
    success++;
    await new Promise(r => setTimeout(r, 200));
  } catch (err) {
    console.error(`FAIL: ${url} - ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
