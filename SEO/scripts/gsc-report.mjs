#!/usr/bin/env node
/**
 * GSC Report - Pull Search Console data for sleftsignals.com
 * Usage: node gsc-report.mjs [days]
 * Default: 28 days
 */

import { google } from 'googleapis';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const credentialsPath = '/Users/grantdenmark1/claude/sleftpayments/credentials/gsc-service-account.json';
const siteUrl = 'sc-domain:sleftsignals.com';

async function main() {
  const days = parseInt(process.argv[2]) || 28;

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (d) => d.toISOString().split('T')[0];

  console.log(`\n--- SleftSignals.com GSC Report: ${formatDate(startDate)} to ${formatDate(endDate)} ---\n`);

  // Top queries
  const queryResponse = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['query'],
      rowLimit: 25,
    },
  });

  console.log('Top Queries:');
  console.log('-'.repeat(85));
  console.log('Query'.padEnd(45) + 'Clicks'.padStart(8) + 'Impr'.padStart(8) + 'CTR'.padStart(8) + 'Pos'.padStart(8));
  console.log('-'.repeat(85));

  for (const row of queryResponse.data.rows || []) {
    const query = row.keys[0].substring(0, 43).padEnd(45);
    const clicks = String(row.clicks).padStart(8);
    const impressions = String(row.impressions).padStart(8);
    const ctr = (row.ctr * 100).toFixed(1).padStart(7) + '%';
    const position = row.position.toFixed(1).padStart(8);
    console.log(query + clicks + impressions + ctr + position);
  }

  // Top pages
  const pageResponse = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ['page'],
      rowLimit: 20,
    },
  });

  console.log('\nTop Pages:');
  console.log('-'.repeat(85));
  console.log('Page'.padEnd(55) + 'Clicks'.padStart(8) + 'Impr'.padStart(8) + 'CTR'.padStart(8));
  console.log('-'.repeat(85));

  for (const row of pageResponse.data.rows || []) {
    const page = row.keys[0].replace('https://sleftsignals.com', '').substring(0, 53).padEnd(55) || '/';
    const clicks = String(row.clicks).padStart(8);
    const impressions = String(row.impressions).padStart(8);
    const ctr = (row.ctr * 100).toFixed(1).padStart(7) + '%';
    console.log(page + clicks + impressions + ctr);
  }

  // Summary
  const totals = queryResponse.data.rows?.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      impressions: acc.impressions + row.impressions,
    }),
    { clicks: 0, impressions: 0 }
  ) || { clicks: 0, impressions: 0 };

  console.log('\nSummary:');
  console.log(`   Total Clicks: ${totals.clicks}`);
  console.log(`   Total Impressions: ${totals.impressions}`);
  console.log(`   Average CTR: ${((totals.clicks / totals.impressions) * 100 || 0).toFixed(2)}%`);
  console.log('');
}

main().catch(console.error);
