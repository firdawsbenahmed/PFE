"use client"

import { useState } from "react"
import {
  INDUSTRY_LIST,
  type IndustryConfig,
  type IndustryKey,
} from "@/lib/industries"

import {
  Check,
  CreditCard,
  Building2,
  Mail,
  Globe,
  ShieldCheck,
  Download,
  Sparkles,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Settings — company profile update                                  */
/* ------------------------------------------------------------------ */

export function SettingsView({
  company,
  industry,
  onSave,
}: {
  company: string
  industry: IndustryKey
  onSave: (next: { company: string; industry: IndustryKey }) => void
}) {
  const [name, setName] = useState(company)
  const [sector, setSector] = useState<IndustryKey>(industry)
  const [email, setEmail] = useState("admin@uniflow.io")
  const [website, setWebsite] = useState("uniflow.io")
  const [saved, setSaved] = useState(false)

  const dirty = name !== company || sector !== industry

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    onSave({ company: name.trim() || company, industry: sector })
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Company profile form */}
      <form
        onSubmit={handleSave}
        className="lg:col-span-2 rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-accent">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Company Profile</h2>
            <p className="text-sm text-muted-foreground">
              Update your organization details and industry mode.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Company Name" icon={Building2}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Acme Corp"
            />
          </Field>

          <Field label="Admin Email" icon={Mail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="admin@company.com"
            />
          </Field>

          <Field label="Website" icon={Globe}>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="company.com"
            />
          </Field>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Industry Sector
            </label>
            <div className="grid grid-cols-3 gap-2">
              {INDUSTRY_LIST.map((opt) => {
                const Icon = opt.icon
                const isActive = sector === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSector(opt.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-colors ${
                      isActive
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {opt.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-accent" />
          Changing the industry sector instantly re-themes your dashboard
          modules, navigation, and metrics.
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-accent">
              <Check className="size-4" />
              Changes saved
            </span>
          )}
          <button
            type="submit"
            disabled={!dirty && !saved}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Save changes
          </button>
        </div>
      </form>

      {/* Live preview / security side panel */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Workspace preview
          </h3>
          <div className="mt-3 rounded-xl border border-border bg-secondary/30 p-4">
            <div className="text-sm">
              <span className="font-semibold">UniFlow</span>
              <span className="text-muted-foreground"> {" // "} </span>
              <span>{name || company}</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs text-accent">
              {INDUSTRY_LIST.find((i) => i.key === sector)?.name} mode
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" />
            <h3 className="text-sm font-medium">Security</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Two-factor authentication is enabled for all admin accounts.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-border bg-secondary/40 py-2.5 text-sm transition-colors hover:bg-secondary"
          >
            Manage security
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Building2
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 focus-within:border-primary">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Billing — payment & subscription                                   */
/* ------------------------------------------------------------------ */

type Plan = {
  key: string
  name: string
  price: string
  blurb: string
  features: string[]
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    price: "$0",
    blurb: "For small teams getting started.",
    features: ["Up to 10 users", "1 industry module", "Community support"],
  },
  {
    key: "growth",
    name: "Growth",
    price: "$249",
    blurb: "For scaling multi-site operations.",
    features: [
      "Up to 250 users",
      "All industry modules",
      "Priority support",
      "Advanced analytics",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    blurb: "For global, high-volume enterprises.",
    features: [
      "Unlimited users",
      "Dedicated infrastructure",
      "24/7 SLA support",
      "Custom integrations",
    ],
  },
]

const INVOICES = [
  { id: "INV-2041", date: "Jun 01, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-2018", date: "May 01, 2026", amount: "$249.00", status: "Paid" },
  { id: "INV-1994", date: "Apr 01, 2026", amount: "$249.00", status: "Paid" },
]

export function BillingView({ config }: { config: IndustryConfig }) {
  const [current, setCurrent] = useState("growth")
  const [confirming, setConfirming] = useState<Plan | null>(null)

  return (
    <div className="space-y-6">
      {/* Current plan + payment method */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 glow-violet">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current plan</p>
              <h2 className="mt-1 text-2xl font-semibold">
                {PLANS.find((p) => p.key === current)?.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Billed monthly · Next charge Jul 01, 2026
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-semibold text-gradient">
                {PLANS.find((p) => p.key === current)?.price}
              </div>
              <div className="text-xs text-muted-foreground">per month</div>
            </div>
          </div>

          <div className="mt-6 h-px bg-border" />

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-accent">
                <CreditCard className="size-5" />
              </div>
              <div>
                <div className="text-sm font-medium">Visa ending 4242</div>
                <div className="text-xs text-muted-foreground">
                  Expires 09 / 28
                </div>
              </div>
            </div>
            <button className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm transition-colors hover:bg-secondary">
              Update card
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            This cycle
          </h3>
          <div className="mt-3 space-y-3">
            <Usage label="Active users" value="146 / 250" pct={58} />
            <Usage label="Modules in use" value={config.name} pct={100} />
            <Usage label="API requests" value="412K / 1M" pct={41} />
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.key === current
            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h4 className="text-base font-semibold">{plan.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.blurb}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="size-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  onClick={() => setConfirming(plan)}
                  className={`mt-6 rounded-xl py-2.5 text-sm font-medium transition-opacity ${
                    isCurrent
                      ? "cursor-default border border-border bg-secondary/40 text-muted-foreground"
                      : plan.highlight
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border bg-secondary/40 hover:bg-secondary"
                  }`}
                >
                  {isCurrent ? "Current plan" : "Choose " + plan.name}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <h3 className="text-lg font-semibold">Billing history</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Invoice</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-secondary/40"
                >
                  <td className="px-6 py-4 font-medium">{inv.id}</td>
                  <td className="px-6 py-4 text-muted-foreground">{inv.date}</td>
                  <td className="px-6 py-4">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent">
                      <Check className="size-3" />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                      <Download className="size-4" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm plan-change modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setConfirming(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 glow-violet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-accent">
              <CreditCard className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Switch to {confirming.name}?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {confirming.price === "Custom"
                ? "Our team will reach out to tailor an enterprise agreement for your organization."
                : `Your card ending 4242 will be charged ${confirming.price}/mo starting next cycle.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirming.price !== "Custom") setCurrent(confirming.key)
                  setConfirming(null)
                }}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {confirming.price === "Custom" ? "Contact sales" : "Confirm payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Usage({
  label,
  value,
  pct,
}: {
  label: string
  value: string
  pct: number
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
