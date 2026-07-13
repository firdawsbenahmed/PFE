"use client"

import { useState } from "react"
import { Mail, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { requestPasswordReset } from "@/lib/api"

export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await requestPasswordReset(email.trim())
      setSubmitted(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send reset email"
      setError(message)
      console.error("[v0] Password reset error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent/10">
              <Check className="size-8 text-accent" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-3 rounded-lg bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">
              The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
            </p>
          </div>

          <Button onClick={onBack} variant="outline" className="w-full">
            Back to login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-sm space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </button>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Reset password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <span className="mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </div>
    </div>
  )
}
