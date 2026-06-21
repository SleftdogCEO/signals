import { Resend } from "resend"

interface FoundProvider {
  name: string
  specialty: string
  address: string
  website: string | null
  phone: string | null
}

// When Provider A signs up and we find Provider B nearby,
// email Provider B: "A [specialty] near you wants to refer patients to you"
export async function sendViralOutreach(
  foundProvider: FoundProvider,
  referringSpecialty: string,
  referringLocation: string
) {
  // DISABLED by default: never auto-email guessed info@{domain} addresses of
  // third-party practices. Unsolicited cold mail to unverified/guessed
  // addresses from grant@sleftpayments.com is a deliverability, reputation,
  // and consent risk. Hard-gated behind an explicit opt-in flag so adding
  // RESEND_API_KEY (for legitimate prospect emails) does NOT silently re-arm it.
  if (process.env.VIRAL_OUTREACH_ENABLED !== "true") {
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("RESEND_API_KEY not set, skipping viral outreach")
    return
  }
  if (!foundProvider.website) return

  // Extract likely email from website domain
  const email = extractPracticeEmail(foundProvider.website)
  if (!email) return

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: "Sleft Signals <grant@sleftpayments.com>",
      to: email,
      subject: `A ${referringSpecialty.toLowerCase()} near ${referringLocation} wants to send you referral patients`,
      html: buildViralEmail(foundProvider, referringSpecialty, referringLocation),
    })
    console.log(`Viral outreach sent to ${email} (${foundProvider.name})`)
  } catch (err) {
    console.error(`Failed viral outreach to ${email}:`, err)
  }
}

function extractPracticeEmail(website: string): string | null {
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`)
    const domain = url.hostname.replace("www.", "")

    // Skip generic domains
    const skipDomains = ["facebook.com", "instagram.com", "yelp.com", "google.com", "healthgrades.com", "zocdoc.com", "vitals.com", "webmd.com"]
    if (skipDomains.some(d => domain.includes(d))) return null

    return `info@${domain}`
  } catch {
    return null
  }
}

function buildViralEmail(
  provider: FoundProvider,
  referringSpecialty: string,
  location: string
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0f172a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1e293b;border-radius:12px;overflow:hidden;">

  <tr><td style="padding:32px 40px 0; border-top:4px solid #10b981;">
    <p style="margin:0 0 8px;font-size:13px;color:#10b981;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Sleft Signals</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#f1f5f9;line-height:1.3;">
      A ${referringSpecialty.toLowerCase()} near ${location} wants to send you patients
    </h1>
  </td></tr>

  <tr><td style="padding:0 40px 32px;">
    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.7;">
      Hi ${provider.name} team,
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.7;">
      A <strong style="color:#f1f5f9;">${referringSpecialty}</strong> provider near your ${location} practice just joined Sleft Signals and identified <strong style="color:#f1f5f9;">${provider.name}</strong> as a potential referral partner.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.7;">
      They see patients who need ${provider.specialty} services and want to start sending them your way.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#0f172a;border-radius:8px;">
      <tr>
        <td style="padding:20px;text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#3b82f6;">5-15</p>
          <p style="margin:0;font-size:12px;color:#64748b;">patients/month from one referral partner</p>
        </td>
        <td style="width:1px;background:#334155;"></td>
        <td style="padding:20px;text-align:center;width:50%;">
          <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:#10b981;">$0</p>
          <p style="margin:0;font-size:12px;color:#64748b;">cost — referrals are free</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.7;">
      Claim your free profile on Sleft Signals to connect with this provider and see other referral opportunities near your practice.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://sleftsignals.com/snapshot" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;">
          See Your Referral Opportunities
        </a>
      </td></tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:#475569;text-align:center;">
      Free to join. No credit card. Takes 30 seconds.
    </p>
  </td></tr>

  <tr><td style="padding:20px 40px;background:#0f172a;border-top:1px solid #334155;">
    <p style="margin:0 0 4px;font-size:14px;color:#f1f5f9;font-weight:600;">Sleft Signals</p>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Local referral intelligence for healthcare practices</p>
    <p style="margin:0;font-size:12px;color:#475569;">
      <a href="https://sleftsignals.com" style="color:#3b82f6;text-decoration:none;">sleftsignals.com</a>
    </p>
    <p style="margin:12px 0 0;font-size:11px;color:#334155;">
      You're receiving this because a provider near you identified your practice as a potential referral partner.
      <a href="https://sleftsignals.com" style="color:#475569;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
