import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

const fromAddress = `"${process.env.EMAIL_FROM_NAME || "Sleft Signals"}" <${process.env.EMAIL_FROM || "grant@sleftpayments.com"}>`

export async function sendSnapshotEmail(
  to: string,
  firstName: string,
  specialty: string,
  location: string,
  sourcesCount: number,
  topSpecialty: string
) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PASSWORD) {
    console.log("Email not configured, skipping snapshot email")
    return
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `Your referral snapshot: ${sourcesCount} providers near your ${location} practice`,
      html: buildSnapshotEmail(firstName, specialty, location, sourcesCount, topSpecialty),
    })
    console.log(`Snapshot email sent to ${to}`)
  } catch (err) {
    console.error(`Failed to send snapshot email to ${to}:`, err)
  }
}

export async function sendLeadNotification(
  email: string,
  practiceName: string,
  specialty: string,
  location: string,
  sourcesCount: number
) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PASSWORD) return

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: "grant@sleftpayments.com",
      subject: `New Sleft Signals lead: ${practiceName || email} (${specialty}, ${location})`,
      html: `
        <h2>New Snapshot Lead</h2>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Practice:</strong> ${practiceName || "Not provided"}</li>
          <li><strong>Specialty:</strong> ${specialty}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Sources Found:</strong> ${sourcesCount}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p><a href="https://sleftsignals.com/auth">Open Dashboard</a></p>
      `,
    })
  } catch (err) {
    console.error("Failed to send lead notification:", err)
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
      Your top referral specialty is <strong style="color:#f1f5f9;">${topSpecialty}</strong> — these providers see patients who need your services and are most likely to refer.
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
