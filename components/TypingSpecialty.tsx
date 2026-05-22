"use client"

import { useEffect, useState } from "react"

// Physician types the headline cycles through. Mix of real specialties
// plus cash-pay practice types that search for growth.
const SPECIALTIES = [
  "weight loss doctors",
  "cardiologists",
  "dermatologists",
  "orthopedic surgeons",
  "endocrinologists",
  "psychiatrists",
  "gastroenterologists",
  "pain management clinics",
  "sports medicine docs",
  "plastic surgeons",
  "allergists",
  "pulmonologists",
  "primary care practices",
]

const TYPE_SPEED = 65
const DELETE_SPEED = 32
const HOLD_FULL = 1400
const HOLD_EMPTY = 320

export default function TypingSpecialty() {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = SPECIALTIES[index]

    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), HOLD_FULL)
      return () => clearTimeout(t)
    }

    if (deleting && text === "") {
      const t = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => (i + 1) % SPECIALTIES.length)
      }, HOLD_EMPTY)
      return () => clearTimeout(t)
    }

    const t = setTimeout(
      () => {
        setText((curr) =>
          deleting ? curr.slice(0, -1) : word.slice(0, curr.length + 1)
        )
      },
      deleting ? DELETE_SPEED : TYPE_SPEED
    )
    return () => clearTimeout(t)
  }, [text, deleting, index])

  return (
    <span className="inline-flex items-baseline">
      <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
        {text}
      </span>
      <span
        className="ml-1 inline-block w-[3px] self-stretch animate-pulse bg-cyan-400"
        style={{ animationDuration: "1.1s" }}
        aria-hidden="true"
      />
    </span>
  )
}
