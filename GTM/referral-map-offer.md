# The Referral Map: Sleft Signals Value-First Offer

The single concrete thing Grant hands a Tampa provider that proves value before he asks for a dollar.

GTM is already decided: concierge-first in Tampa, niche TBD, broker a few real relationships by hand. This document defines the asset that opens every one of those conversations.

---

## 1. The Offer

**Name: Your Referral Map**

Subtitle on the document itself: "Who could be sending you patients right now, and who you should be sending yours to."

It is a free, personalized one-page (front and back) PDF built for one specific named practice in Tampa. It is not a generic "here is how referrals work" explainer. It is their map, their address at the center, their actual neighbors named on it.

### What is inside

**Front page: The Inbound Map (who could send YOU patients)**

1. A short header: practice name, specialty, Tampa neighborhood, and one line that states the referral lanes that feed this specialty. Example for a dietitian: "Patients reach dietitians from six places: endocrinology, primary care, obesity medicine, GI, cardiology, and OB-GYN."
2. A count and a map pin view: "There are 38 independent practices within 7 miles of you whose patients commonly need what you do." The independent qualifier matters because system-employed docs refer inside their own system. Sleft Signals only counts the ones who can actually choose you.
3. A named shortlist of the 8 to 12 strongest inbound partners. For each: practice name, specialty, distance in miles, a one-line "why they would refer to you" reason, and a fit score (0 to 100) from the adjacency engine. These are real practices pulled from the federal NPI registry, geocoded, and filtered to exclude hospital-system employees and corporate chains.

**Back page: The Outbound Map + the gap (where YOU should send patients, and what is missing)**

4. The outbound side: the specialties this practice refers TO, and the nearest independent practices in each lane. A provider almost always knows they "send people somewhere for X" but does not have a warm name. This gives them named options.
5. The Gap Callout: the one or two referral lanes where there is a real partner nearby that they almost certainly are not connected to yet. This is the hook. It is the line that makes them say "wait, who is that, I have been looking for someone like that."
6. A single soft footer: "Built by Dr. Grant Denmark. Sleft Signals maps referral relationships for independent Tampa practices. If you want a warm introduction to any practice on this map, reply and I will make it."

### Why a provider cares

Independent practices in Tampa live and die on referrals, and almost none of them have a system to manage them. They get patients through whoever happens to remember their name. A dietitian waits for an endocrinologist to mention her. A pain doc waits for an orthopedist to think of him. The Referral Map does three things they cannot easily do themselves:

- It names the practices that should know them but probably do not.
- It quantifies the opportunity sitting within driving distance ("38 practices, you are connected to maybe 3").
- It filters out the noise: it excludes the AdventHealth and BayCare employed docs who can never refer out, so every name on the list is a person who can actually choose them.

### Why it creates reciprocity and obligation to engage

This is the mechanism that makes the whole GTM work.

- It is specific to them and clearly took effort. A named, geocoded, scored map of their own neighborhood is not a mass email. It reads as "a doctor in town did homework on my practice." Specificity is what triggers the obligation to respond.
- It ends with an offer of free value, not a sale. The footer offers to make a real warm introduction at no cost. Saying yes to a free intro is a tiny commitment, and once Grant brokers one real intro, he is the person who got them a referral source. That is the relationship that converts.
- The credibility is real and load-bearing. It comes from Dr. Grant Denmark, an ER physician who built the referral logic. A dietitian or a PCP takes a map from a fellow clinician far more seriously than one from a software salesperson. Lead with the DO, not the SaaS.

---

## 2. How It Is Produced

The Referral Map is roughly 85 percent auto-generated from engine code that already exists, plus about 15 minutes of manual finishing per map from Grant. This is deliberately not automated end to end yet. In the concierge phase the manual pass is the product, because Grant's judgment and his name are what convert.

### The production path

**Step 1: Pull the data (existing engine, no new code required)**

Two existing paths both work. For concierge volume, the discovery endpoint is the cleaner one.

- `POST /api/network/discover` (`app/api/network/discover/route.ts`) is the core engine. Feed it the target practice's specialty and Tampa location. It does the full job already:
  - Sweeps the free NPPES NPI registry by Tampa Bay ZIP prefixes (336*, 337*).
  - Maps specialties to canonical lanes via the adjacency map (`lib/adjacency-map.ts`). For a dietitian it already returns Endocrinology, Primary Care, Weight Loss / Obesity Medicine, Gastroenterology, Cardiology, and OB-GYN, in priority order.
  - Geocodes via the free US Census geocoder with a Nominatim fallback, then scores Haversine distance in miles.
  - Filters out hospital-system employees through `classifyAffiliation()` and the shared patterns in `lib/affiliation.ts` (AdventHealth, BayCare, HCA, Tampa General, USF Health, Moffitt, St. Joseph's, VA), so only independent practices survive.
  - Returns `MatchResult` rows with practice_name, specialty, location, match_score, why_match, coordinates, and is_independent.
- The adjacency fit score per pair comes from `calculateFitScore()` in `lib/adjacency-map.ts` (first lane = 95, descending). That is the 0 to 100 number on each named partner.
- The headline count and the "build it for one practice" framing is the same logic the public Snapshot tool already runs (`/app/snapshot`, `/app/api/snapshot/route.ts`). The Referral Map is essentially the Snapshot output, made specific to a real named practice, given two sides (inbound and outbound), and finished by hand.

**Step 2: Generate the working draft**

Run the discover engine for the target practice and capture the JSON. Inbound list = practices in the lanes that refer INTO the target's specialty. Outbound list = practices in the lanes the target refers TO. Both come from the same adjacency map read in two directions. Keep only `is_independent === true` rows. Sort by match_score, then by distance. Take the top 8 to 12 for the named inbound shortlist.

**Step 3: Grant's manual finishing (about 15 minutes per map)**

This is where the map becomes worth a clinician's attention rather than a data dump.

- Sanity-check the top names against the outreach CRM (`/dashboard/outreach`, `outreach_leads` table). If a practice already has `quality` set to dup, chain, system, out_of_metro, or telehealth_shell, drop it. The discover engine catches most, but the CRM has Grant's manual quality tags and they are more accurate.
- Write the Gap Callout in plain language. Pick the one lane with a strong nearby partner the target almost certainly is not connected to. This single sentence is what earns the reply, so it is worth the most effort.
- Rewrite each "why_match" line so it reads like a clinician wrote it, not a database. "Endocrinologists send weight and diabetes patients to dietitians constantly" beats "Adjacency score 95, lane: Endocrinology."
- Drop it into the one-page PDF template. Front = inbound, back = outbound plus the gap. Clean, white, Dr. Grant Denmark in the footer.

**What is missing and worth building (small, optional)**

There is no `referral-map` PDF template or route yet. Two ways to make this repeatable:
- Fastest: a thin script that takes a practice name + specialty + Tampa address, calls the discover logic, and emits a styled HTML file. Render to PDF with Chrome headless (`--no-margins --print-to-pdf-no-header --no-pdf-header-footer`), the same flow the fee-comparison tool uses.
- Cleaner long term: a `/referral-map` print route that renders the same React data the network page already uses, then print to PDF.

Neither is required to start. Grant can produce the first three maps by hand from the discover JSON this week. Build the template only after the manual version has closed at least one provider, so the layout is shaped by what actually landed.

---

## 3. The Pitch and the Upsell

Grant's voice: plain, direct, clinician to clinician. No em dashes, no marketing gloss, no "let me know if."

### The outreach email (cold-but-warm, CAN-SPAM clean)

Send from grant@sleftpayments.com, one at a time or in tiny manual batches, never a bulk blast. These are licensed providers and the domain deliverability matters. Personalize every send. Real physical address and a real opt-out line keep it CAN-SPAM compliant.

Subject: A referral map I built for [Practice Name]

> Dr. [Last Name],
>
> I am Grant Denmark, an ER physician here in Tampa. I built a map of the independent practices around you whose patients commonly need a [specialty] like yours, and the ones you most likely send patients to.
>
> There are [N] independent practices within [X] miles of you in those referral lanes. Most are not employed by a hospital system, which means they can actually choose where their patients go. I pulled the strongest [8 to 12] and put them on a one-page map for you. It is attached.
>
> One thing stood out. [The Gap Callout, in one sentence. Example: "There is an endocrinology group 2 miles from you that sends weight and diabetes patients out constantly, and you two are almost certainly not connected yet."]
>
> No cost and nothing to sign up for. If you want a warm introduction to any practice on the map, reply and I will make it for you.
>
> Grant Denmark, DO
> Sleft Signals, Tampa FL
> [business mailing address]
> Reply "stop" and I will not contact you again.

### The follow-up that delivers the intro

When they reply yes to an intro, Grant brokers a real three-way email connecting them to the partner practice. This is the moment value becomes undeniable. He is now the person who got them a referral source. Log it in the outreach CRM and move status toward "joined."

### The upsell (what Grant asks for once value is proven)

The ask comes only after at least one brokered intro lands, ideally after a real patient has moved between the two practices. Never lead with it.

> The map and that first introduction are on me. What I am building is the ongoing version of this. Sleft Signals keeps your referral map live, shows you new independent practices near you as they open, and makes the warm introductions for you so you are not chasing them down. As a founding member you get in free while I build it, and you lock in the founding rate as it grows. Want me to turn yours on?

- Price (updated 2026-05-29, pricing analysis): the old $120/month was killed as underpriced (3-5x low) and was framing the product as a directory. The product is now positioned as **founding-member, free to join** while the Tampa network is built; the self-serve CTA reads "Become a Founding Member." Do NOT quote a monthly number in early pitches. Instead, make each practice name their own value ("what do you pay to acquire a patient now? what would a reliable patient be worth?") and ask for a small felt commitment (a refundable ~$500 founding deposit or a card on file) to lock a founding rate. Value supports $300-600/month or $150-250 per delivered referral once proven; ratchet the price up behind real proof (a delivered patient, a testimonial), grandfathering founders for 12 months. See the pricing memory note for the full ladder.
- The ask is small and concrete: keep the thing that already worked, running. He is not selling software, he is selling more of the introduction that just produced value.
- Founder framing for the first handful: "You would be one of the first practices in Tampa on this. I am working directly with each one right now." Early-adopter scarcity from a real solo founder is true and it converts.

---

## 4. Worked Example: The RD Friend (First Proof Case)

Grant's friend, a Registered Dietitian in Tampa, is the ideal first case. She is warm, she already signed up, and her specialty sits at the center of the metabolic referral economy. She is also a force multiplier: dietitians get fed by half a dozen specialties, so winning her opens a path to her referral sources too.

### What her Referral Map shows

Run `/api/network/discover` for specialty "Registered Dietitian", location Tampa. The adjacency map returns her six inbound lanes in priority order: Endocrinology, Primary Care, Weight Loss / Obesity Medicine, Gastroenterology, Cardiology, OB-GYN.

**Front page, her Inbound Map:**

- Header line: "Patients reach dietitians from six places: endocrinology, primary care, obesity and GLP-1 clinics, GI, cardiology, and OB-GYN. Here is who is sending, or could be sending, near you."
- Headline count: something like "31 independent practices within 7 miles of you commonly refer to dietitians. None of them are hospital-system employed, so every one can choose you."
- Named shortlist of 8 to 12, for example:
  - An independent endocrinology group, 2.1 miles, fit 95, "Endos send a steady stream of diabetes, thyroid, and PCOS patients to dietitians."
  - A GLP-1 / obesity medicine clinic, 3.4 miles, fit 88, "Weight-loss clinics need a dietitian partner for every patient they start on a GLP-1."
  - Two independent primary care practices, fit 90, "PCPs refer prediabetes, fatty liver, and weight patients out constantly."
  - An independent GI practice, fit 84, "Celiac, IBD, and fatty liver patients all need medical nutrition therapy."
  - An OB-GYN practice, fit 78, "PCOS and gestational diabetes patients need a dietitian."

**Back page, her Outbound Map plus the gap:**

- The handful of practices she should send patients to when something is outside her scope, named and nearby.
- The Gap Callout, the line that lands her: "The GLP-1 clinic 3 miles from you almost certainly does not have a dietitian partner yet, and they are starting patients who need one this week. That is the introduction I would make first."

### How Grant uses it to land her, and her network

1. He does not pitch her. He sends or hands her the map and says, in his voice: "I built this for you. These are the practices near you that should be sending you patients. Tell me which one you want me to introduce you to first."
2. She picks the GLP-1 clinic or the endo group. Grant brokers a real three-way intro. She now has a referral source she did not have, from a friend who is a physician. Value proven, no money mentioned.
3. Because she is the proof case, Grant also asks the discovery questions from the concierge playbook on that same call: who actually sends her patients today, where does she wish more came from, what lane is most painful. Her answers help discover the niche the whole Tampa GTM is still missing. An RD's pain map points straight at endocrinology and obesity medicine, which is a credible niche candidate ("where Tampa metabolic patients get their nutrition care").
4. The force multiplier: each practice on her map is also a future Referral Map. When Grant brokers her intro to the endo group, he can turn around and build the endo group their own map, with her on it as an inbound partner. One RD becomes the seed of a connected local cluster, brokered by hand, exactly what the concierge phase is supposed to produce.
5. Only after a real referral moves between her and a partner does Grant make the founding-member ask (see pricing note above), framed as keeping the thing that just worked running. She is a friend, so she is also the safest first conversation to practice the upsell on and the most honest source of feedback on the price.

### Why she is the right first domino

She converts on warmth and proof, not on a sales pitch. She validates that the engine produces a genuinely useful map. Her referral sources become Grant's next maps. And her discovery answers help lock the niche. One dietitian, used correctly, is the entire concierge playbook compressed into a single relationship.

---

## Production checklist for the first three maps

1. Run `/api/network/discover` for each target practice (specialty + Tampa location), capture JSON.
2. Keep only `is_independent === true`, sort by match_score then distance, take top 8 to 12 inbound and the nearest in each outbound lane.
3. Cross-check top names against `outreach_leads` quality tags in `/dashboard/outreach`, drop anything tagged dup/chain/system/out_of_metro/telehealth_shell.
4. Write the Gap Callout and rewrite each why-match line in clinician voice.
5. Drop into a clean one-page PDF, Dr. Grant Denmark in the footer.
6. Send personalized, one at a time, from grant@sleftpayments.com with real address and opt-out.
7. Broker the first requested intro by hand. Log it in the CRM.
8. Only after an intro produces value, make the founding-member ask (see pricing note above).
