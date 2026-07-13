"use client"

import { useState } from "react"
import {
  Workflow,
  Mail,
  Lock,
  Building,
  ChevronDown,
  ArrowLeft,
  Plane,
  ShoppingCart,
  Building2,
  AlertCircle,
  MailCheck,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signupUser, loginUser, resendVerification } from "@/lib/api"
import type { IndustryKey } from "@/lib/industries"

type AuthProps = {
  initialMode: "signup" | "login"
  onBack: () => void
  onForgotPassword: () => void
  onAuthenticated: (payload: { company_name: string; industry: IndustryKey }) => void
}

const INDUSTRY_OPTIONS: { value: IndustryKey; label: string }[] = [
  { value: "aviation", label: "Aviation" },
  { value: "retail", label: "Retail" },
  // "General" is intentionally omitted: the backend industry enum only allows
  // 'aviation' | 'retail', and there is no dedicated General dashboard yet.
]

export function AuthScreen({ initialMode, onBack, onForgotPassword, onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode)
  const [company, setCompany] = useState("Global Enterprises")
  const [industry, setIndustry] = useState<IndustryKey>("aviation")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (mode === "signup") {
        await signupUser({
          email: email.trim(),
          password,
          company_name: company.trim() || "Your Company",
          admin_name: email.trim().split("@")[0],
          industry,
        })
        setPendingEmail(email.trim())
        setLoading(false)
        return
      }

      const result = await loginUser({
        email: email.trim(),
        password,
      })

      // Use the real company/industry returned by the backend, NOT the login
      // form defaults (the login form has no company field).
      onAuthenticated({
        company_name: result.company_name || company.trim() || "Your Company",
        industry: (result.industry as IndustryKey) || industry,
      })
    } catch (err) {
      const raw = err instanceof Error ? err.message : ""
      const status = (err as { status?: number })?.status
      let friendly = mode === "signup" ? "We couldn't create your account. Please try again." : "Something went wrong. Please try again."

      if (/invalid credentials/i.test(raw) || status === 401) {
        friendly = "Incorrect email or password. Please try again."
      } else if (/verify your email/i.test(raw) || status === 403) {
        friendly = "Please verify your email before signing in. Check your inbox for the verification link."
      } else if (/already used|already registered/i.test(raw)) {
        friendly = "An account with this email already exists. Try signing in instead."
      } else if (/network|failed to fetch/i.test(raw)) {
        friendly = "Can't reach the server. Check your connection and try again."
      }

      setError(friendly)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setResendState("sending")
    try {
      await resendVerification(pendingEmail)
    } catch (err) {
      console.error("[v0] Resend verification error:", err)
    } finally {
      setResendState("sent")
      setTimeout(() => setResendState("idle"), 4000)
    }
  }

  if (pendingEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <MailCheck className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            Verify your email to continue
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{pendingEmail}</span>. Click the link in
            that email to activate your workspace, then come back to sign in.
          </p>

          <div className="mt-8 space-y-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                setPendingEmail(null)
                setMode("login")
                setPassword("")
                setError("")
              }}
            >
              Back to sign in
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleResend}
              disabled={resendState !== "idle"}
            >
              {resendState === "sending"
                ? "Sending..."
                : resendState === "sent"
                ? "Verification email sent"
                : "Resend verification email"}
            </Button>
          </div>

          {resendState === "sent" && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              If an unverified account exists for that email, a new link is on its way.
            </p>
          )}

          <button
            onClick={onBack}
            className="mt-8 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Return to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(130deg, oklch(0.16 0.02 270), oklch(0.28 0.16 295) 45%, oklch(0.2 0.08 230))",
            backgroundSize: "200% 200%",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(40% 40% at 20% 20%, oklch(0.7 0.13 195 / 40%), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-background/20 backdrop-blur">
              <Workflow className="size-5 text-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">UniFlow</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-background/20 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground/80">Live Operations</span>
                <span className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <span className="size-2 rounded-full bg-accent" />
                  Streaming
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Plane, v: "42" },
                  { icon: ShoppingCart, v: "1.8k" },
                  { icon: Building2, v: "38" },
                ].map(({ icon: Icon, v }, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-background/30 p-3">
                    <Icon className="mb-2 size-4 text-foreground/70" />
                    <div className="text-lg font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[68, 84, 52].map((w, i) => (
                  <div key={i} className="h-2 w-full rounded-full bg-background/30">
                    <div className="h-2 rounded-full bg-foreground/60" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="max-w-sm text-pretty text-sm leading-relaxed text-foreground/70">
            One console that reshapes itself for Aviation, Retail, and beyond.
            Configure once, operate everywhere.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <button
          onClick={onBack}
          className="absolute left-6 top-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Set up your enterprise" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signup"
                ? "Configure your workspace and we'll tailor the dashboard to your industry."
                : "Sign in to your UniFlow operations console."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <Field label="Company Name">
                  <Building className="size-4 text-muted-foreground" />
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Global Enterprises"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    required
                  />
                </Field>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Industry Sector</label>
                  <div className="relative flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3.5 focus-within:border-primary/50">
                    <Building className="size-4 text-muted-foreground" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value as IndustryKey)}
                      className="w-full appearance-none bg-transparent py-3 text-sm outline-none"
                    >
                      {INDUSTRY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value} className="bg-popover text-popover-foreground">
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none size-4 text-muted-foreground" />
                  </div>
                </div>
              </>
            )}

            <Field label="Admin Email">
              <Mail className="size-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                required
              />
            </Field>

            <div className="space-y-1.5">
              <Field label="Password">
                <Lock className="size-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                  required
                />
              </Field>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-accent hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === "signup" ? "Create workspace" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to UniFlow?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3.5 py-3 focus-within:border-primary/50">
        {children}
      </div>
    </div>
  )
}
