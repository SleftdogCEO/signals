#!/usr/bin/env node
/**
 * GSC Indexing Push - Submit all sleftsignals.com URLs to Google Indexing API
 * Usage: node gsc-indexing-push.mjs
 * Quota: 200 URLs/day
 */

import { google } from 'googleapis';
import fs from 'fs';

const CRED_PATH = '/Users/grantdenmark1/claude/sleftpayments/credentials/gsc-service-account.json';
const BASE = 'https://sleftsignals.com';

// Static pages
const STATIC_PAGES = [
  `${BASE}/`,
  `${BASE}/blog`,
  `${BASE}/auth`,
  `${BASE}/welcome`,
];

// Blog posts
const BLOG_POSTS = [
  `${BASE}/blog/npi-data-underserved-specialties-zip-code`,
  `${BASE}/blog/specialties-refer-each-other-cms-data`,
  `${BASE}/blog/how-to-get-more-patient-referrals-2026`,
  `${BASE}/blog/healthcare-referral-networks-explained-2026`,
  `${BASE}/blog/referral-mistakes-costing-patients`,
  `${BASE}/blog/private-practice-marketing-referrals-vs-ads-2026`,
];

// 22 specialty pages
const SPECIALTIES = [
  'chiropractors', 'physical-therapists', 'dentists', 'orthodontists',
  'dermatologists', 'primary-care', 'orthopedic-surgeons', 'pain-management',
  'mental-health', 'med-spas', 'pediatricians', 'optometrists',
  'podiatrists', 'oral-surgeons', 'cardiologists', 'ent-doctors',
  'allergists', 'urologists', 'psychiatrists', 'sports-medicine',
  'plastic-surgeons', 'endocrinologists',
];

const SPECIALTY_PAGES = SPECIALTIES.map(s => `${BASE}/find-referral-partners/${s}`);

// 35 cities
const CITIES = [
  'miami-fl', 'tampa-fl', 'orlando-fl', 'jacksonville-fl',
  'houston-tx', 'dallas-tx', 'austin-tx', 'san-antonio-tx',
  'los-angeles-ca', 'san-diego-ca', 'phoenix-az', 'atlanta-ga',
  'charlotte-nc', 'new-york-ny', 'chicago-il', 'philadelphia-pa',
  'denver-co', 'seattle-wa', 'boston-ma', 'nashville-tn',
  'west-palm-beach-fl', 'palm-beach-gardens-fl', 'jupiter-fl',
  'boca-raton-fl', 'fort-lauderdale-fl', 'st-petersburg-fl', 'naples-fl',
  'san-francisco-ca', 'portland-or', 'minneapolis-mn', 'detroit-mi',
  'las-vegas-nv', 'raleigh-nc', 'indianapolis-in', 'columbus-oh',
];

// 22 x 35 = 770 city combos — need to batch across multiple days (200/day quota)
// Build all combos then split into day batches
const ALL_COMBOS = [];
for (const spec of SPECIALTIES) {
  for (const city of CITIES) {
    ALL_COMBOS.push(`${BASE}/find-referral-partners/${spec}/${city}`);
  }
}

// Day 1: Static + Blog + Specialty pages + first batch of combos (fill to 200)
const PRIORITY_URLS = [...STATIC_PAGES, ...BLOG_POSTS, ...SPECIALTY_PAGES];
const DAY1_COMBO_BUDGET = 200 - PRIORITY_URLS.length;
const DAY1_URLS = [...PRIORITY_URLS, ...ALL_COMBOS.slice(0, DAY1_COMBO_BUDGET)];

// Remaining combos split into day 2, 3, 4, etc.
const REMAINING_COMBOS = ALL_COMBOS.slice(DAY1_COMBO_BUDGET);

const SITE_PROPERTIES = [
  'sc-domain:sleftsignals.com',
  'https://sleftsignals.com/',
];

async function main() {
  // Support --day2, --day3, --day4 etc. for batching remaining combos
  const dayArg = process.argv.find(a => a.startsWith('--day'));
  const dayNum = dayArg ? parseInt(dayArg.replace('--day', '')) : 1;

  let urls;
  if (dayNum === 1) {
    urls = DAY1_URLS;
  } else {
    const offset = (dayNum - 2) * 200;
    urls = REMAINING_COMBOS.slice(offset, offset + 200);
  }

  const totalDays = 1 + Math.ceil(REMAINING_COMBOS.length / 200);
  console.log(`=== sleftsignals.com GSC Indexing Push (Day ${dayNum}/${totalDays}) ===`);
  console.log(`Total pages: ${PRIORITY_URLS.length + ALL_COMBOS.length} (${SPECIALTIES.length} specialties x ${CITIES.length} cities + ${PRIORITY_URLS.length} priority)`);
  console.log(`URLs to submit today: ${urls.length}`);
  if (urls.length > 200) {
    console.log(`WARNING: ${urls.length} URLs exceeds 200/day quota. Only first 200 will be submitted.`);
  }
  console.log('');

  // Indexing API
  const indexingAuth = new google.auth.GoogleAuth({
    keyFile: CRED_PATH,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({ version: 'v3', auth: indexingAuth });

  let success = 0, failed = 0;
  const failures = [];
  const submitUrls = urls.slice(0, 200);

  for (const url of submitUrls) {
    try {
      await indexing.urlNotifications.publish({
        requestBody: { url, type: 'URL_UPDATED' },
      });
      console.log(`OK: ${url}`);
      success++;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      const msg = err.message || String(err);
      console.error(`FAIL: ${url} - ${msg}`);
      failures.push({ url, error: msg });
      failed++;
    }
  }

  console.log(`\nIndexing: ${success}/${submitUrls.length} succeeded, ${failed} failed`);

  // Sitemap submission (only on day 1)
  if (dayNum === 1) {
    console.log('\n--- Sitemap Submission ---\n');

    const creds = JSON.parse(fs.readFileSync(CRED_PATH, 'utf8'));
    const gscAuth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/webmasters', 'https://www.googleapis.com/auth/webmasters.readonly'],
    });
    const gscAuthClient = await gscAuth.getClient();
    const webmasters = google.webmasters({ version: 'v3', auth: gscAuthClient });

    const sitemapUrl = `${BASE}/sitemap.xml`;
    let submitted = false;

    for (const siteUrl of SITE_PROPERTIES) {
      try {
        console.log(`Trying: ${siteUrl}`);
        await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
        console.log(`SUCCESS: Submitted ${sitemapUrl} to ${siteUrl}`);
        submitted = true;
        break;
      } catch (err) {
        console.log(`Failed: ${err.message}\n`);
      }
    }

    if (!submitted) {
      console.log('Could not submit sitemap. Add the service account as owner in GSC for sleftsignals.com:');
      console.log('  Account: sleft-seo-bot@sleft-480918.iam.gserviceaccount.com');
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Indexing API: ${success}/${submitUrls.length} URLs submitted`);
  if (dayNum < totalDays) {
    const remaining = PRIORITY_URLS.length + ALL_COMBOS.length - (dayNum === 1 ? DAY1_URLS.length : DAY1_URLS.length + (dayNum - 1) * 200);
    console.log(`\nRemaining: ~${Math.max(0, remaining)} URLs across ${totalDays - dayNum} more day(s).`);
    console.log(`Run: node gsc-indexing-push.mjs --day${dayNum + 1}`);
  }

  if (failures.length > 0) {
    console.log(`\nFailed (${failures.length}):`);
    failures.forEach(f => console.log(`  ${f.url} - ${f.error.substring(0, 80)}`));
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
