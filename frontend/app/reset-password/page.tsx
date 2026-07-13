"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ResetPasswordScreen } from "@/components/reset-password"

function ResetPasswordContent() {
  const router = useRouter()
  return (
    <ResetPasswordScreen
      onBack={() => router.push("/")}
      onSuccess={() => router.push("/")}
    />
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
