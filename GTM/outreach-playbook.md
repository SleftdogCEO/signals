# Sleft Signals Outreach System (Lean Solo-Founder Edition)

The core split: **warm signups are the priority and get human touch within 24 hours. Cold leads get the phone, not the inbox.** Email blasts to 149 scraped NPPES contacts from a payments domain is the single fastest way to torch deliverability and get nothing back. Concierge-first means the phone and a handful of hand-written emails do the work this month.

---

## 1. WARM vs COLD: Two Different Worlds

| | WARM (signups: RD friend + self-serve trials) | COLD (149 scraped NPPES leads) |
|---|---|---|
| **Who** | People who already raised their hand. Have email, specialty, location, referral prefs. | Scraped org records. Phone is the only reliable contact, email is sparse/guessed. |
| **Goal** | Activate them: book a 15-min call, broker their FIRST real intro. | Book ONE discovery call. Learn the niche. |
| **Primary channel** | Personal email (1:1, from Grant) + phone | **Phone first.** Email only as a warm follow-up after a call. |
| **Cadence** | Touch within 24h of signup, then 2 more over 10 days | 1 call attempt + 1 voicemail, 1 follow-up call 4 days later. Stop at 2 dials. |
| **Risk** | Near zero. They opted in. CAN-SPAM trivially satisfied. | High deliverability risk if emailed cold at volume. Low risk on phone (B2B provider lines, no TCPA issue for manual non-marketing dials to business numbers). |
| **Volume this month** | However many sign up (handful) | 20-30 dials/week, hand-picked from the "Callable" view |

The mental model: **warm = inbox, cold = phone.** Do not cold-email the 149. If you ever do email a cold lead, it is AFTER a call where they said "sure, send me something," which converts them to warm.

---

## 2. WARM OUTREACH (Signups)

**Channel:** 1:1 personal email from grant@sleftpayments.com, plain text, no HTML template, no images. Looks like a human wrote it because one did. Phone as backup if they gave a number.

**Cadence (per signup):**
- **T+0 (within 24h):** Personal welcome + one specific observation about their local network. Ask for a 15-min call.
- **T+4 days (no reply):** Short bump with a concrete partner you already spotted near them.
- **T+10 days (no reply):** One-line "should I close this out?" breakup. Then stop.

Once they reply or book, you are in concierge mode: run the discovery questions, hand-broker the intro. No more "sequence."

### Template W1: Welcome (T+0)

> **Subject:** the endocrinology group 2 miles from you
>
> Hi Sarah,
>
> Grant here, I run Sleft Signals. Saw you signed up as a registered dietitian in Tampa, thanks for that.
>
> I already pulled your area. There are 3 endocrinology practices and 2 primary care groups within about 2 miles of you that send patients out for nutrition counseling and have no one local they trust. That is exactly the kind of warm referral lane I set up by hand for the first providers in the network.
>
> Can I grab 15 minutes this week to walk you through who they are and how I'd make the intro? I am not selling you anything on the call, I just want to broker your first real referral relationship and see if it sticks.
>
> What does Thursday or Friday look like?
>
> Grant Denmark, DO
> Sleft Signals

### Template W2: Bump with a name (T+4)

> **Subject:** re: the endocrinology group 2 miles from you
>
> Hi Sarah,
>
> Quick follow-up. The practice I had in mind first is [Practice Name] on [Street], an endocrinology group that handles a lot of GLP-1 and diabetes patients. Those patients almost always need a dietitian and most of these offices are just handing out a printout.
>
> If you're open to it, I'll reach out to them on your behalf and set up a simple intro. Want me to?
>
> Grant

### Template W3: Breakup (T+10)

> **Subject:** re: the endocrinology group 2 miles from you
>
> Hi Sarah,
>
> I don't want to clutter your inbox. If now isn't the time I'll leave it here, and you've still got full access to the network whenever you want to poke around.
>
> If you do want me to broker that first intro, just reply "yes" and I'll take it from there.
>
> Grant

---

## 3. COLD OUTREACH (the 149)

**Channel: PHONE.** These are independent Tampa practices you already filtered to "Callable" (quality='good', system/chain/telehealth stripped out). Dial the front desk, ask for the office manager or the doc. The goal is a discovery call, not a sale. You are a local ER doc who built a tool, not a vendor.

**Why not email them:** guessed `info@domain` addresses bounce, bounces tank your sender reputation, and a payments-domain cold blast to medical offices is a spam-complaint magnet. The phone costs you time, not your domain.

**Cadence (per lead):** Dial, then if no answer leave a voicemail and mark `contacted`. One follow-up dial 4 days later. After 2 attempts with no pickup, mark `dead` or park it. Move on. 20-30 dials/week is plenty while you're discovering the niche.

### Phone opener (script, not a template)

> "Hi, this is Dr. Grant Denmark, I'm an ER physician here in Tampa. I'm not selling anything, I built a small referral network for independent practices and I'm trying to learn one thing: when you have a patient who needs [specialty-adjacent service], where do you send them right now? ... Got 10 minutes this week so I can show you who's nearby and looking for exactly your patients?"

If they bite, run the 7 discovery questions from the concierge playbook. If they say "email me something," NOW you send the cold-to-warm email below, to the real address they just gave you. That is the only cold email that should ever leave the domain.

### Template C1: Post-call follow-up (only after a real conversation)

> **Subject:** the 2 practices near you I mentioned
>
> Hi Dr. [Name],
>
> Thanks for the few minutes today. Like I said, I'm an ER doc here in Tampa and I built Sleft Signals to fix the thing you described: sending patients out and never knowing if they land somewhere good.
>
> The two practices near you I mentioned were [Name] and [Name]. Both want the kind of patients you refer out, and both are independent like you. If you want, I'll make a warm intro to either one this week, no cost.
>
> Reply and tell me which one and I'll set it up.
>
> Grant Denmark, DO
> Sleft Signals
> [physical address]
> Reply STOP and I won't email again.

### Template C2: Voicemail script (leave verbatim, keep it under 20 sec)

> "Hi, this message is for the office manager. This is Dr. Grant Denmark, I'm an ER physician in Tampa. I'm not a vendor, I built a free referral network for independent practices and I'd love 10 minutes to show you which practices nearby want your patients. My number is 813-534-0522. Again, Dr. Denmark, 813-534-0522. Thanks."

---

## 4. What to Automate vs Keep Manual THIS MONTH

**The honest answer: automate almost nothing on the outreach itself.** You have a handful of warm leads and a niche you haven't found yet. Automation before product-market-fit just lets you do the wrong thing faster.

### Build (smallest worthwhile automation)
1. **Warm signup, instant ping to Grant** so you actually hit the 24h window. (Now live: the signup notification to grant@sleftpayments.com and the richer profile-completed notification.) This is the highest-leverage automation because it protects the only leads that matter.
2. **Auto-draft the W1 welcome as a Gmail draft** (not auto-send) when a provider signs up, pre-filled with their specialty + the nearby-partner count you already compute in `/api/snapshot`. Grant edits and sends. Keeps the human voice, kills the blank-page delay. Reuses the snapshot engine and `sendViralOutreach` plumbing you already have.

### Keep manual
- **Every cold dial.** No power-dialer, no robocaller. You're learning the niche; the call IS the research.
- **Every intro broker.** The 3-way intro is the product right now. Doing it by hand is the moat.
- **Quality tagging / Sunbiz / AO enrichment.** Already manual, keep it. Don't fix `ao-enrich.mjs` this month, it's not on the critical path to first revenue.

### Do NOT automate yet (be honest)
- **No cold email sequences to the 149.** Tempting, wrong, dangerous to the domain.
- **No mass viral-outreach blasts.** The auto `sendViralOutreach` on signup is fine as-is (one email to a real provider when someone signs up). Do not turn it into a campaign.
- **No SEO/content automation.** GTM says SEO is on hold until the niche is validated. Respect it.

---

## 5. Deliverability and Compliance Guardrails

Because email sends from **grant@sleftpayments.com** (a domain with real payments value), protect it hard.

**Volume caps**
- Warm 1:1 emails: keep under ~20/day total from the domain. You won't hit this with a handful of signups.
- Cold emails: effectively zero. Only post-call, address-confirmed follow-ups (C1). A few per week, max.

**Warmup / reputation**
- Never send to guessed/scraped `info@` addresses in bulk. Bounces above ~3-5% wreck reputation.
- Confirm SPF, DKIM, and DMARC are passing on sleftpayments.com before any volume increase. (Resend should be authenticated for the sending domain.)
- All warm sends are plain text, no tracking pixels, no link shorteners, no image-heavy HTML. Reads as personal mail, lands in the inbox.

**CAN-SPAM (applies to every commercial email, warm or cold)**
- **Unsubscribe:** every email needs a working opt-out. For 1:1 plain-text, a "reply STOP and I won't email again" line is honored manually and is sufficient at this volume. Honor it within 10 business days (do it same-day).
- **Physical postal address:** required in the footer of commercial email. Add Grant's business mailing address to W1/C1 footers. (The personal warm replies in a thread don't each need it, but the first commercial touch does.)
- **No deceptive subject lines / from names:** subjects above are accurate. Keep them honest.
- **Accurate identity:** "from" name = Grant Denmark / Sleft Signals, not a fake persona.

**Phone (the cold channel)**
- Manual dials to business front-desk numbers for B2B relationship-building are not TCPA marketing-autodialer violations. Keep it manual, no auto-dialer, no recorded-message broadcasts.
- Respect any "don't call us" the moment you hear it. Mark `dead`.

**One-line rule to remember:** warm goes to the inbox in small, human, opt-out-friendly batches; cold goes to the phone. The domain stays clean because it is never used to blast strangers.

---

**Net:** This month is a phone-and-handshake operation with two tiny automations (signup ping + pre-drafted welcome) riding on infra you already built. The 149 are a call list, not a mailing list. First revenue comes from brokering 3-5 real intros by hand, not from a sequence.
