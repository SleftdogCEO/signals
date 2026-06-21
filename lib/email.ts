import { Resend } from "resend"

/**
 * Send the snapshot results email TO the user who submitted the form.
 * Uses Resend (via RESEND_API_KEY env var) so we don't depend on SMTP.
 */
export async function sendSnapshotEmail(
  to: string,
  firstName: string,
  specialty: string,
  location: string,
  sourcesCount: number,
  topSpecialty: string
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("RESEND_API_KEY not set, skipping snapshot email to user")
    return
  }

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: "Grant Denmark - Sleft Signals <grant@sleftpayments.com>",
      to,
      subject: `Your referral snapshot: ${sourcesCount} providers near your ${location} practice`,
      html: buildSnapshotEmail(firstName, specialty, location, sourcesCount, topSpecialty),
    })
    console.log(`Snapshot email sent to ${to}`)
  } catch (err) {
    console.error(`Failed to send snapshot email to ${to}:`, err)
  }
}

/**
 * Notify Grant about a new snapshot lead via the sleftpayments lead-capture API.
 * This replaces the old nodemailer-based notification that required SMTP env vars.
 */
export async function sendLeadNotification(
  email: string,
  practiceName: string,
  specialty: string,
  location: string,
  sourcesCount: number
) {
  try {
    const res = await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: practiceName || "",
        businessName: practiceName || "Sleft Signals Snapshot",
        source: "sleftsignals.com",
        conversationSummary: [
          `Snapshot Lead`,
          `Specialty: ${specialty}`,
          `Location: ${location}`,
          `Sources Found: ${sourcesCount}`,
          `Time: ${new Date().toLocaleString()}`,
        ].join("\n"),
      }),
    })

    if (!res.ok) {
      console.error("Lead notification failed:", res.status, await res.text())
    } else {
      console.log("Lead notification sent via sleftpayments lead-capture API")
    }
  } catch (err) {
    console.error("Failed to send lead notification:", err)
  }
}

/**
 * Notify Grant that one provider requested an introduction to another.
 * Reuses the sleftpayments lead-capture API so no SMTP/Resend setup is needed.
 */
export async function sendIntroRequestNotification(params: {
  requesterName: string
  requesterEmail: string
  requesterSpecialty: string
  requesterLocation: string
  targetName: string
  targetSpecialty: string
  targetLocation: string
}) {
  try {
    const res = await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.requesterEmail,
        name: params.requesterName || "",
        businessName: params.requesterName || "Sleft Signals Intro Request",
        source: "sleftsignals.com",
        conversationSummary: [
          `Referral Introduction Request`,
          `Requester: ${params.requesterName} (${params.requesterSpecialty}, ${params.requesterLocation})`,
          `Requester email: ${params.requesterEmail}`,
          `Wants intro to: ${params.targetName} (${params.targetSpecialty}, ${params.targetLocation})`,
          `Time: ${new Date().toLocaleString()}`,
        ].join("\n"),
      }),
    })

    if (!res.ok) {
      console.error("Intro notification failed:", res.status, await res.text())
    } else {
      console.log("Intro request notification sent via lead-capture API")
    }
  } catch (err) {
    console.error("Failed to send intro request notification:", err)
  }
}

/**
 * Notify Grant of EVERY new signup (email or Google) the moment the account is
 * created. Fires from /api/auth/register, the single chokepoint both signup
 * paths funnel through. Uses the sleftpayments lead-capture API so it works
 * with no SMTP/Resend env on the sleftsignals side.
 */
export async function sendSignupNotification(params: {
  email: string
  fullName?: string
  authProvider?: string
}) {
  try {
    const res = await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        name: params.fullName || "",
        businessName: params.fullName || "Sleft Signals Signup",
        source: "sleftsignals.com",
        conversationSummary: [
          `New Sleft Signals Signup`,
          `Name: ${params.fullName || "(not provided)"}`,
          `Email: ${params.email}`,
          `Auth: ${params.authProvider || "email"}`,
          `Time: ${new Date().toLocaleString()}`,
        ].join("\n"),
      }),
    })

    if (!res.ok) {
      console.error("Signup notification failed:", res.status, await res.text())
    } else {
      console.log("Signup notification sent via lead-capture API")
    }
  } catch (err) {
    console.error("Failed to send signup notification:", err)
  }
}

/**
 * Notify Grant when a provider COMPLETES their onboarding profile. This is the
 * qualified-lead signal: it carries specialty, location, what they want, and
 * what they refer out: everything needed to score the lead and reach out.
 * Fired server-side from /api/notify/onboarded to avoid a browser CORS call.
 */
export async function sendProviderOnboardedNotification(params: {
  email: string
  practiceName?: string
  specialty?: string
  location?: string
  patientsIWant?: string[]
  patientsIRefer?: string[]
  serviceTags?: string[]
}) {
  try {
    const res = await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: params.email,
        name: params.practiceName || "",
        businessName: params.practiceName || "Sleft Signals Provider",
        source: "sleftsignals.com",
        conversationSummary: [
          `Provider Completed Profile (qualified lead)`,
          `Practice: ${params.practiceName || "(none)"}`,
          `Specialty: ${params.specialty || "(none)"}`,
          `Location: ${params.location || "(none)"}`,
          `Services: ${(params.serviceTags || []).join(", ") || "(none)"}`,
          `Wants patients from: ${(params.patientsIWant || []).join(", ") || "(none)"}`,
          `Refers patients to: ${(params.patientsIRefer || []).join(", ") || "(none)"}`,
          `Time: ${new Date().toLocaleString()}`,
        ].join("\n"),
      }),
    })

    if (!res.ok) {
      console.error("Onboarded notification failed:", res.status, await res.text())
    } else {
      console.log("Provider onboarded notification sent via lead-capture API")
    }
  } catch (err) {
    console.error("Failed to send onboarded notification:", err)
  }
}

/**
 * Notify Grant of every brief-feedback submission (including churn/negative
 * signals). Uses the sleftpayments lead-capture API so it needs no SMTP/Resend
 * env on the sleftsignals side, matching the other notifiers.
 */
export async function sendFeedbackNotification(params: {
  briefId?: string
  userId?: string
  businessName?: string
  likes: string
  dislikes: string
}) {
  try {
    const res = await fetch("https://www.sleftpayments.com/api/lead-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "grant@sleftpayments.com",
        name: params.businessName || "",
        businessName: params.businessName || "Sleft Signals Feedback",
        source: "sleftsignals.com",
        conversationSummary: [
          `Brief Feedback Submitted`,
          `Practice: ${params.businessName || "(none)"}`,
          `Brief ID: ${params.briefId || "(none)"}`,
          `User ID: ${params.userId || "(none)"}`,
          `Liked: ${params.likes}`,
          `Could be better (churn/negative signal): ${params.dislikes}`,
          `Time: ${new Date().toLocaleString()}`,
        ].join("\n"),
      }),
    })

    if (!res.ok) {
      console.error("Feedback notification failed:", res.status, await res.text())
    } else {
      console.log("Feedback notification sent via lead-capture API")
    }
  } catch (err) {
    console.error("Failed to send feedback notification:", err)
  }
}

function buildSnapshotEmail(
  firstName: string,
  specialty: string,
  location: string,
  sourcesCount: number,
  topSpecialty: string
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background:#0f172a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1e293b;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">

  <tr><td style="padding:32px 40px 0; border-top:4px solid #3b82f6;">
    <p style="margin:0 0 8px;font-size:13px;color:#60a5fa;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Sleft Signals</p>
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#f1f5f9;line-height:1.3;">
      ${firstName}, we found ${sourcesCount} potential referral partners near you
    </h1>
  </td></tr>

  <tr><td style="padding:0 40px 32px;">
    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.7;">
      Your snapshot for <strong style="color:#f1f5f9;">${specialty}</strong> in <strong style="color:#f1f5f9;">${location}</strong> is ready. Here's what we found:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:20px;text-align:center;width:33%;background:#0f172a;border-radius:8px 0 0 8px;">
          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#3b82f6;">${sourcesCount}</p>
          <p style="margin:0;font-size:12px;color:#64748b;">Referral Sources</p>
        </td>
        <td style="width:1px;background:#334155;"></td>
        <td style="padding:20px;text-align:center;width:33%;background:#0f172a;">
          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#10b981;">5-15</p>
          <p style="margin:0;font-size:12px;color:#64748b;">Patients/mo per partner</p>
        </td>
        <td style="width:1px;background:#334155;"></td>
        <td style="padding:20px;text-align:center;width:33%;background:#0f172a;border-radius:0 8px 8px 0;">
          <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#f59e0b;">$0</p>
          <p style="margin:0;font-size:12px;color:#64748b;">Ad spend required</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:#94a3b8;line-height:1.7;">
      Your top referral specialty is <strong style="color:#f1f5f9;">${topSpecialty}</strong>. These providers see patients who need your services and are most likely to refer.
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:#94a3b8;line-height:1.7;">
      Want the full breakdown? Sign up free and we'll show you names, addresses, ratings, and match scores for every provider near your practice.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://sleftsignals.com/auth?signup=true" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;">
          See Your Full Referral Map
        </a>
      </td></tr>
    </table>

    <p style="margin:20px 0 0;font-size:13px;color:#475569;text-align:center;">
      Free to join. No credit card required.
    </p>
  </td></tr>

  <tr><td style="padding:20px 40px;background:#0f172a;border-top:1px solid #334155;">
    <p style="margin:0 0 4px;font-size:14px;color:#f1f5f9;font-weight:600;">Grant Denmark</p>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Founder, Sleft Signals</p>
    <p style="margin:0;font-size:12px;color:#475569;">
      grant@sleftpayments.com · <a href="https://sleftsignals.com" style="color:#3b82f6;text-decoration:none;">sleftsignals.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
