"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ResetPasswordScreen } from "@/components/reset-password"

function VerifyPasswordContent() {
  const router = useRouter()
  return (
    <ResetPasswordScreen
      onBack={() => router.push("/")}
      onSuccess={() => router.push("/")}
    />
  )
}

// The backend password-reset email links to /verify-password?token=...
// This route renders the same reset-password screen used by /reset-password.
export default function VerifyPasswordPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPasswordContent />
    </Suspense>
  )
}
