import NetworkBackground from "@/components/NetworkBackground"

// Shared site background: solid slate base, depth glows, the interactive
// referral-network constellation, and a faint grid overlay. Rendered once in
// the root layout and pinned behind all page content via negative z-index.
// Dark pages keep a transparent root so this shows through; the white tool
// pages keep their opaque bg-white wrappers and naturally cover it.
export default function SiteBackground() {
  return (
    <>
      {/* Solid base color */}
      <div className="fixed inset-0 -z-[30] bg-slate-950" aria-hidden="true" />

      {/* Depth glows behind the network */}
      <div
        className="fixed inset-0 -z-[20] pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[-200px] left-[10%] w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[160px]" />
        <div className="absolute bottom-[8%] right-[12%] w-[560px] h-[560px] bg-cyan-500/[0.06] rounded-full blur-[150px]" />
      </div>

      {/* Interactive referral-network constellation */}
      <div className="fixed inset-0 -z-[20] pointer-events-none" aria-hidden="true">
        <NetworkBackground />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 -z-[10] pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    </>
  )
}
