export const meta = {
  name: 'sleftsignals-sdr-enrich',
  description: 'Enrich outreach_leads with website, email, contact form, verified phone, and LinkedIn via parallel web research',
  phases: [
    { title: 'Enrich', detail: 'web-research each lead for real contact channels' },
  ],
}

// Leads embedded directly so the run does not depend on args plumbing.
const EMBEDDED = [
  {"npi":"1245160860","practice_name":"3 MG PARTNERS LLC","specialty":"Primary Care","address":"6000 49TH ST N","city":"ST PETERSBURG","state":"FL","phone":"727-521-4411"},
  {"npi":"1164351102","practice_name":"CARE HEALTH MEDICAL LLC","specialty":"Psychiatry","address":"2810 W SAINT ISABEL ST STE 100A","city":"TAMPA","state":"FL","phone":"813-452-7954"},
  {"npi":"1083551410","practice_name":"SHINING MINDS PSYCHIATRY AND WELLNESS LIMITED LIABILITY COMPANY","specialty":"Psychiatry","address":"14475 UNIVERSITY COVE PL","city":"TAMPA","state":"FL","phone":"813-776-1144"},
  {"npi":"1235075862","practice_name":"CUREPOINT WOUND CARE, LLC","specialty":"Primary Care","address":"3920 NORTHDALE BLVD","city":"TAMPA","state":"FL","phone":"352-266-1241"},
  {"npi":"1447195755","practice_name":"DYNAMIC HEALTH & WELLNESS LLC","specialty":"Primary Care","address":"7015 N ARMENIA AVE","city":"TAMPA","state":"FL","phone":"813-252-6114"},
  {"npi":"1104760289","practice_name":"LUXX MEDICAL SPA INC, MULTIESPECIALITY GROUP","specialty":"Primary Care","address":"8004 N ARMENIA AVE STE A","city":"TAMPA","state":"FL","phone":"786-630-7917"},
  {"npi":"1881538403","practice_name":"ANDERSON PRIMARY CARE PLLC","specialty":"Primary Care","address":"7800 66TH ST N STE 206","city":"PINELLAS PARK","state":"FL","phone":"727-300-0063"},
  {"npi":"1891637344","practice_name":"MAI ENDOCRINOLOGY PLLC","specialty":"Endocrinology","address":"6938 W LINEBAUGH AVE STE 101","city":"TAMPA","state":"FL","phone":"832-209-0000"},
  {"npi":"1245170125","practice_name":"SANA VITA LLC","specialty":"Primary Care","address":"4820 PARK BLVD N STE 2","city":"PINELLAS PARK","state":"FL","phone":"813-358-6511"},
  {"npi":"1346189446","practice_name":"SATORI HEALTH COLLECTIVE LLC","specialty":"Primary Care","address":"2483 LYNN LAKE CIR S","city":"SAINT PETERSBURG","state":"FL","phone":"727-488-2155"},
  {"npi":"1912845207","practice_name":"PAVA MEDICAL PROFESSIONAL SERVICES, PLLC","specialty":"Primary Care","address":"3001 W DR MARTIN LUTHER KING JR BLVD","city":"TAMPA","state":"FL","phone":"813-870-4000"},
  {"npi":"1316895865","practice_name":"OLIVE BRANCH HEALTH AND WELLNESS LLC","specialty":"Gastroenterology","address":"3018 N US HIGHWAY 301 STE 200","city":"TAMPA","state":"FL","phone":"813-679-5413"},
  {"npi":"1396692554","practice_name":"PANGEA WELLNESS COLLECTIVE LLC","specialty":"Primary Care","address":"8900 PARK BLVD","city":"SEMINOLE","state":"FL","phone":"727-767-0965"},
  {"npi":"1801741236","practice_name":"RAFAEL A RONDON MD PA","specialty":"Endocrinology","address":"5331 PRIMROSE LAKE CIR STE 112","city":"TAMPA","state":"FL","phone":"813-517-4629"},
  {"npi":"1740135458","practice_name":"AKSHAR 2025 LLC","specialty":"Psychiatry","address":"1211 TECH BLVD","city":"TAMPA","state":"FL","phone":"727-251-9704"},
  {"npi":"1386598258","practice_name":"POM META INC","specialty":"Endocrinology","address":"2201 W SWANN AVE STE 280","city":"TAMPA","state":"FL","phone":"813-316-6500"},
  {"npi":"1184575300","practice_name":"ALL AGES ENDOCRINOLOGY AND HORMONE CLINIC","specialty":"Endocrinology","address":"2111 W SWANN AVE STE 204","city":"TAMPA","state":"FL","phone":"813-428-8606"},
  {"npi":"1952251258","practice_name":"MCNULTY COUNSELING AND WELLNESS","specialty":"Psychiatry","address":"111 2ND AVE NE STE 1101","city":"ST PETERSBURG","state":"FL","phone":"727-344-9867"},
  {"npi":"1679423958","practice_name":"OVADIA MEDICAL CONSULTING GROUP LLC","specialty":"Cardiology","address":"3210 BAYOU PLACIDO BLVD","city":"ST PETERSBURG","state":"FL","phone":"727-472-9995"},
  {"npi":"1821956830","practice_name":"ONE MD, LLC","specialty":"Primary Care","address":"5901 SUN BLVD STE 204","city":"SAINT PETERSBURG","state":"FL","phone":"727-900-7622"},
  {"npi":"1457218596","practice_name":"PROMED IPA LLC","specialty":"Primary Care","address":"3301 66TH ST N STE A","city":"ST PETERSBURG","state":"FL","phone":"727-344-6200"},
  {"npi":"1477419190","practice_name":"CENTRAL FLORIDA WELLNESS","specialty":"Primary Care","address":"3202 W KENNEDY BLVD STE 2","city":"TAMPA","state":"FL","phone":"407-226-2993"},
  {"npi":"1427912112","practice_name":"TALATI PSYCHIATRY LLC","specialty":"Psychiatry","address":"10910 SHELDON RD","city":"TAMPA","state":"FL","phone":"813-330-0237"},
  {"npi":"1295698751","practice_name":"ASCEND MIND AND BODY OF WESLEY CHAPEL LLC","specialty":"Primary Care","address":"3971 MORAN RD STE 101","city":"TAMPA","state":"FL","phone":"813-670-3005"}
]

// Allow args override (string or array) but fall back to the embedded list.
let leads = args
if (typeof leads === 'string') { try { leads = JSON.parse(leads) } catch { leads = null } }
if (!Array.isArray(leads) || leads.length === 0) leads = EMBEDDED

const ITEM = {
  type: 'object',
  properties: {
    npi: { type: 'string' },
    website: { type: 'string', description: "Official practice website URL, or '' if none found. Prefer their own domain over directories." },
    email: { type: 'string', description: "A contact/booking email found on their site, or '' if none." },
    contact_form_url: { type: 'string', description: "URL of their contact/appointment form page, or '' if none." },
    contact_form_captcha: { type: 'string', enum: ['yes', 'no', 'unknown'], description: 'Does the contact form appear to use reCAPTCHA/hCaptcha?' },
    phone_verified: { type: 'string', description: "Phone number shown on their own website, or '' if not found." },
    linkedin_url: { type: 'string', description: "LinkedIn URL for the practice or its owner/physician, or '' if none." },
    web_presence: { type: 'string', enum: ['own_site', 'directory_only', 'social_only', 'none'], description: 'What kind of web presence exists.' },
    decision_maker: { type: 'string', description: "Name and/or title of the owner/lead physician if surfaced, else ''." },
    notes: { type: 'string', description: 'One or two short lines characterizing the practice (size, modernity, booking, anything useful for outreach).' },
  },
  required: ['npi', 'website', 'email', 'contact_form_url', 'contact_form_captcha', 'phone_verified', 'linkedin_url', 'web_presence', 'decision_maker', 'notes'],
  additionalProperties: false,
}

const SCHEMA = {
  type: 'object',
  properties: { leads: { type: 'array', items: ITEM } },
  required: ['leads'],
  additionalProperties: false,
}

const SIZE = 3
const batches = []
for (let i = 0; i < leads.length; i += SIZE) batches.push(leads.slice(i, i + SIZE))

log(`Enriching ${leads.length} leads across ${batches.length} agents (batch size ${SIZE}).`)

phase('Enrich')

const results = await parallel(
  batches.map((batch, bi) => () => {
    const list = batch
      .map(
        (l, i) =>
          `${i + 1}. npi=${l.npi} | "${l.practice_name}" | ${l.specialty} | ${l.address}, ${l.city}, ${l.state} | NPPES phone ${l.phone}`
      )
      .join('\n')
    const prompt = `You are an SDR research analyst enriching B2B leads for Sleft Signals, a referral network for
independent healthcare practices in the Tampa FL area. For EACH practice below, find its real contact channels
using web search and by fetching its website. These are small independent practices; some will have a real
website, some only a directory listing (Healthgrades, Vitals, Doximity, Yelp), some only social, some nothing.

For each practice determine:
- website: their OWN official site URL. Do not return a directory/aggregator (healthgrades, vitals, doximity,
  yelp, facebook, npino, sharecare) as the website; if only those exist, leave website '' and set web_presence
  to directory_only or social_only accordingly.
- email: a real contact or booking email visible on their site (check the contact page). '' if none.
- contact_form_url: the URL of their contact/appointment/request form page if they have one. '' if none.
- contact_form_captcha: 'yes' if that form shows reCAPTCHA/hCaptcha, 'no' if it is a plain form, 'unknown' if
  you could not load it or there is no form.
- phone_verified: the phone listed on their own website (may match or correct the NPPES phone). '' if not found.
- linkedin_url: a LinkedIn page for the practice or its owner/lead physician. '' if none found.
- web_presence: own_site | directory_only | social_only | none.
- decision_maker: the owner/lead physician name and/or title if you can find it (e.g. "Dr. Jane Mai, MD, owner"). '' if unknown.
- notes: 1-2 short lines useful for outreach (solo vs group, modern site, online booking, concierge, cash-pay, etc.).

Be accurate. Verify the site actually matches the practice name and Tampa-area address before claiming it.
Do NOT guess emails or invent URLs; only report what you actually find. Use the NPPES phone to disambiguate
same-named practices. Return exactly one entry per practice, echoing the npi.

Practices:
${list}`
    return agent(prompt, { label: `enrich:batch${bi + 1}`, phase: 'Enrich', schema: SCHEMA })
      .then((r) => (r && Array.isArray(r.leads) ? r.leads : []))
  })
)

const enriched = results.filter(Boolean).flat()
log(`Enrichment complete: ${enriched.length}/${leads.length} lead records returned.`)

return { enriched }
