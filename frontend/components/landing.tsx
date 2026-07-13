"use client"
import { useTheme } from "next-themes"
import {
  Plane,
  ShoppingCart,
  Building2,
  ShieldCheck,
  Workflow,
  BarChart3,
  Layers,
  Zap,
  ArrowRight,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Workflow,
    title: "Adaptive Workflows",
    body: "Pipelines that reshape themselves to your industry the moment you sign in.",
  },
  {
    icon: Plane,
    title: "Aviation Control",
    body: "Track fleets, crews, and live flight operations from a single control tower.",
  },
  {
    icon: ShoppingCart,
    title: "Retail Intelligence",
    body: "Sync stores, stock, and staff across every location in real time.",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    body: "Streaming KPIs and operational health, surfaced before issues escalate.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    body: "Granular access levels, audit trails, and SOC-2 aligned infrastructure.",
  },
  {
    icon: Layers,
    title: "Unified Directory",
    body: "One source of truth for people, assets, and resources org-wide.",
  },
]

export function Landing({
  onLaunch,
}: {
  onLaunch: (mode: "signup" | "login") => void
}) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% -10%, oklch(0.4 0.18 295 / 35%), transparent 70%), radial-gradient(40% 40% at 90% 20%, oklch(0.5 0.13 195 / 18%), transparent 70%)",
        }}
      />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
            <Workflow className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">UniFlow</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Platform
          </a>
          <a href="#industries" className="transition-colors hover:text-foreground">
            Industries
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onLaunch("login")}
          >
            Sign in
          </Button>
          <Button onClick={() => onLaunch("signup")}>Get started</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-16 text-center md:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Zap className="size-3.5 text-accent" />
          Multi-industry infrastructure, one platform
        </div>

        <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          The operating system for{" "}
          <span className="text-gradient">every industry you run</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          UniFlow reshapes your entire dashboard around your sector — Aviation,
          Retail, or General — so your teams see exactly what matters, the moment
          they log in.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="group w-full sm:w-auto" onClick={() => onLaunch("signup")}>
            Launch your workspace
            <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full border-border bg-card/40 sm:w-auto"
            onClick={() => onLaunch("login")}
          >
            Sign in to console
          </Button>
        </div>

        {/* Industry pills */}
        <div
          id="industries"
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Plane, label: "Aviation" },
            { icon: ShoppingCart, label: "Retail" },
            { icon: Building2, label: "General" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm backdrop-blur transition-colors hover:border-primary/40"
            >
              <Icon className="size-4 text-accent" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-28">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card/40 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div
                className="mb-5 flex size-12 items-center justify-center rounded-xl text-primary-foreground transition-transform group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.24 295), oklch(0.55 0.14 230))",
                }}
              >
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-medium tracking-tight">{title}</h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© 2026 UniFlow Systems. All rights reserved.</span>
          <span>Aviation · Retail · General</span>
        </div>
      </footer>
    </div>
  )
}