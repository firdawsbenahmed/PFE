"use client"

import { useEffect, useState } from "react"

const STATUS_STEPS = [
  "Authenticating credentials…",
  "Provisioning workspace…",
  "Loading industry modules…",
  "Syncing live operations…",
  "Finalizing console…",
]

export function TransitionLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STATUS_STEPS.length - 1))
    }, 520)
    const done = setTimeout(onDone, 2800)
    return () => {
      clearInterval(stepTimer)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(45% 45% at 50% 45%, oklch(0.4 0.18 295 / 35%), transparent 70%)",
        }}
      />

      <svg viewBox="0 0 200 100" className="relative z-10 h-28 w-56" aria-hidden="true">
        <defs>
          <linearGradient id="infGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.68 0.22 295)" />
            <stop offset="100%" stopColor="oklch(0.72 0.13 195)" />
          </linearGradient>
        </defs>
        <path
          d="M50,50 C50,20 90,20 100,50 C110,80 150,80 150,50 C150,20 110,20 100,50 C90,80 50,80 50,50 Z"
          fill="none"
          stroke="oklch(1 0 0 / 8%)"
          strokeWidth="6"
        />
        <path
          d="M50,50 C50,20 90,20 100,50 C110,80 150,80 150,50 C150,20 110,20 100,50 C90,80 50,80 50,50 Z"
          fill="none"
          stroke="url(#infGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="80 320"
          style={{ filter: "drop-shadow(0 0 8px oklch(0.68 0.22 295 / 70%))" }}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-400"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      <div className="relative z-10 mt-8 flex flex-col items-center gap-5">
        <span className="text-lg font-semibold tracking-tight">UniFlow</span>

        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-card">
          <div
            className="h-full w-1/3 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.68 0.22 295), oklch(0.72 0.13 195), transparent)",
              animation: "uniflow-track 1.4s ease-in-out infinite",
            }}
          />
        </div>

        <p className="h-5 text-sm text-muted-foreground transition-all">
          {STATUS_STEPS[step]}
        </p>
      </div>
    </div>
  )
}
