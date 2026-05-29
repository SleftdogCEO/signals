import { ImageResponse } from "next/og"

// Root-level OG image. Next injects og:image (and Twitter falls back to it) on
// every page that does not define its own, so all shares/SERP cards get a real
// 1200x630 thumbnail instead of the previous blank card.
export const alt = "Sleft Signals - Physician Referral Partner Matching"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #020617 55%, #0b1220 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, #3b82f6, #22d3ee)",
            }}
          />
          <div style={{ fontSize: "46px", fontWeight: 800, color: "#ffffff" }}>
            Sleft Signals
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "70px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            Your best referrals are down the street.
          </div>
          <div
            style={{
              marginTop: "24px",
              fontSize: "36px",
              color: "#94a3b8",
              maxWidth: "920px",
            }}
          >
            Find local physicians in complementary specialties who send you patients. No ads. No agencies.
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display: "flex", fontSize: "30px", fontWeight: 600, color: "#22d3ee" }}>
          sleftsignals.com
        </div>
      </div>
    ),
    { ...size }
  )
}
