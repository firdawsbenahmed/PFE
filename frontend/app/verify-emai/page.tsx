"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Workflow, Check, AlertCircle, MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyEmail, resendVerification } from "@/lib/api"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [resendEmail, setResendEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("This verification link is invalid or incomplete.")
    }
  }, [token])

  const handleVerify = async () => {
    if (!token) return
    setStatus("verifying")
    setMessage("")
    try {
      const res = await verifyEmail(token)
      setStatus("success")
      setMessage(res?.message || "Your email has been verified.")
      // Send the user to the login page shortly after success.
      setTimeout(() => router.push("/"), 2200)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ""
      let friendly = "We couldn't verify your email. The link may have expired."
      if (/already used/i.test(raw)) {
        friendly = "This email is already verified. You can sign in now."
      } else if (/expired/i.test(raw)) {
        friendly = "This verification link has expired. Request a new one below."
      } else if (/invalid/i.test(raw)) {
        friendly = "This verification link is invalid. Request a new one below."
      }
      setStatus("error")
      setMessage(friendly)
    }
  }

  const handleResend = async () => {
    if (!resendEmail.trim()) return
    setResending(true)
    try {
      await resendVerification(resendEmail.trim())
      setResent(true)
    } catch {
      setResent(true) // backend intentionally returns a generic message
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Workflow className="size-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">UniFlow</span>
        </div>

        {status === "success" ? (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-accent/10">
                <Check className="size-8 text-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Email verified</h1>
              <p className="text-sm text-muted-foreground">{message} Redirecting you to sign in…</p>
            </div>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to sign in
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="size-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Verification failed</h1>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {resent ? (
              <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-center text-sm text-foreground">
                If that email needs verification, a new link is on its way.
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
                <label className="text-sm font-medium">Resend verification email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
                <Button
                  onClick={handleResend}
                  disabled={resending || !resendEmail.trim()}
                  variant="outline"
                  className="w-full"
                >
                  {resending ? "Sending…" : "Resend link"}
                </Button>
              </div>
            )}

            <Button onClick={() => router.push("/")} variant="ghost" className="w-full">
              Back to sign in
            </Button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="size-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Verify your email</h1>
              <p className="text-sm text-muted-foreground">
                Click the button below to confirm your email address and activate your UniFlow account.
              </p>
            </div>
            <Button
              onClick={handleVerify}
              disabled={status === "verifying" || !token}
              size="lg"
              className="w-full"
            >
              {status === "verifying" ? "Verifying…" : "Verify my email"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
