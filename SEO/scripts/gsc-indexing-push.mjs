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

// 15 specialty pages
const SPECIALTIES = [
  'chiropractors', 'physical-therapists', 'dentists', 'orthodontists',
  'dermatologists', 'primary-care', 'orthopedic-surgeons', 'pain-management',
  'mental-health', 'med-spas', 'pediatricians', 'optometrists',
  'podiatrists', 'oral-surgeons', 'cardiologists',
];

const SPECIALTY_PAGES = SPECIALTIES.map(s => `${BASE}/find-referral-partners/${s}`);

// 20 cities
const CITIES = [
  'miami-fl', 'tampa-fl', 'orlando-fl', 'jacksonville-fl',
  'houston-tx', 'dallas-tx', 'austin-tx', 'san-antonio-tx',
  'los-angeles-ca', 'san-diego-ca', 'phoenix-az', 'atlanta-ga',
  'charlotte-nc', 'new-york-ny', 'chicago-il', 'philadelphia-pa',
  'denver-co', 'seattle-wa', 'boston-ma', 'nashville-tn',
];

// Specialty+City combos (15 x 20 = 300 pages) — submit top priority ones first
// We'll submit ALL specialty pages + blog posts + top city combos (stay under 200/day)
const TOP_CITY_COMBOS = [];
for (const spec of SPECIALTIES) {
  // Submit top 5 cities per specialty = 75 URLs
  for (const city of CITIES.slice(0, 5)) {
    TOP_CITY_COMBOS.push(`${BASE}/find-referral-partners/${spec}/${city}`);
  }
}

// Day 1: Static + Blog + Specialty + top city combos
const DAY1_URLS = [...STATIC_PAGES, ...BLOG_POSTS, ...SPECIALTY_PAGES, ...TOP_CITY_COMBOS];

// Remaining city combos for day 2 push
const REMAINING_COMBOS = [];
for (const spec of SPECIALTIES) {
  for (const city of CITIES.slice(5)) {
    REMAINING_COMBOS.push(`${BASE}/find-referral-partners/${spec}/${city}`);
  }
}

const SITE_PROPERTIES = [
  'sc-domain:sleftsignals.com',
  'https://sleftsignals.com/',
];

async function main() {
  const day2 = process.argv.includes('--day2');
  const urls = day2 ? REMAINING_COMBOS : DAY1_URLS;

  console.log(`=== sleftsignals.com GSC Indexing Push ${day2 ? '(Day 2 - Remaining Cities)' : '(Day 1 - Priority URLs)'} ===`);
  console.log(`URLs to submit: ${urls.length}`);
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
  if (!day2) {
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
  if (!day2 && REMAINING_COMBOS.length > 0) {
    console.log(`\nRemaining: ${REMAINING_COMBOS.length} city combo URLs for day 2.`);
    console.log(`Run: node gsc-indexing-push.mjs --day2`);
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
