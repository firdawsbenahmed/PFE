"use client"

import { useState, useEffect } from "react"
import { Lock, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resetPassword } from "@/lib/api"
import { useSearchParams } from "next/navigation"

export function ResetPasswordScreen({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: () => void
}) {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Please enter a new password")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(onSuccess, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password"
      setError(message)
      console.error("[v0] Reset password error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent/10">
              <Check className="size-8 text-accent" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Password reset successful</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been changed. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Invalid link</h2>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
          </div>

          <Button onClick={onBack} className="w-full">
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
          <h2 className="text-3xl font-bold">Create new password</h2>
          <p className="text-sm text-muted-foreground">
            Enter a strong password to secure your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-accent hover:underline"
          >
            {showPassword ? "Hide" : "Show"} password
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <span className="mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  )
}
