"use client"

import { useEffect, useRef } from "react"

// Interactive constellation background. Nodes drift slowly and link up
// when close — a literal referral network. The cursor pulls nearby nodes
// and lights up its own connections.
type Node = { x: number; y: number; vx: number; vy: number }

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    let width = 0
    let height = 0
    let dpr = 1
    let nodes: Node[] = []
    const mouse = { x: -9999, y: -9999, active: false }
    let raf = 0

    const LINK_DIST = 150
    const MOUSE_DIST = 220

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Density scales with viewport, capped so it stays light.
      const count = Math.min(Math.round((width * height) / 22000), 90)
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        // Gentle pull toward the cursor.
        if (mouse.active) {
          const dx = mouse.x - n.x
          const dy = mouse.y - n.y
          const dist = Math.hypot(dx, dy)
          if (dist < MOUSE_DIST && dist > 0) {
            const force = (1 - dist / MOUSE_DIST) * 0.35
            n.x += (dx / dist) * force
            n.y += (dy / dist) * force
          }
        }
      }

      // Node-to-node links.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${
              (1 - dist / LINK_DIST) * 0.22
            })`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Cursor links — brighter, cyan.
      if (mouse.active) {
        for (const n of nodes) {
          const dist = Math.hypot(mouse.x - n.x, mouse.y - n.y)
          if (dist < MOUSE_DIST) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${
              (1 - dist / MOUSE_DIST) * 0.5
            })`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(mouse.x, mouse.y)
            ctx.lineTo(n.x, n.y)
            ctx.stroke()
          }
        }
      }

      // Nodes.
      for (const n of nodes) {
        const near =
          mouse.active && Math.hypot(mouse.x - n.x, mouse.y - n.y) < MOUSE_DIST
        ctx.fillStyle = near
          ? "rgba(34, 211, 238, 0.9)"
          : "rgba(148, 197, 253, 0.55)"
        ctx.beginPath()
        ctx.arc(n.x, n.y, near ? 2.4 : 1.7, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    function onMove(e: MouseEvent) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    function onLeave() {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    build()
    if (prefersReduced) {
      draw()
      cancelAnimationFrame(raf)
    } else {
      draw()
    }

    window.addEventListener("resize", build)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseout", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", build)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseout", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  )
}
