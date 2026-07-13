"use client"

import { useState } from "react"
import { User, Mail, Building2, Shield, Lock, Power, Eye, EyeOff, AlertCircle, Check, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { changePassword, deactivateAccount } from "@/lib/api"

type ProfileUser = {
  name: string
  email: string
  role: "admin" | "employee"
  company: string
  is_active: boolean
}

export function ProfileView({ user, onLogout }: { user: ProfileUser; onLogout: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState("")
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [deactivateError, setDeactivateError] = useState("")

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill in all fields")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters")
      return
    }

    setPwLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPwSuccess("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPwSuccess(""), 4000)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setPwLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setDeactivateError("")
    setDeactivateLoading(true)
    try {
      await deactivateAccount()
      onLogout()
    } catch (err) {
      setDeactivateError(err instanceof Error ? err.message : "Failed to deactivate account")
      setDeactivateLoading(false)
    }
  }

  const infoFields = [
    { icon: User, label: "Full name", value: user.name },
    { icon: Mail, label: "Email address", value: user.email },
    { icon: Building2, label: "Company", value: user.company },
    { icon: Shield, label: "Role", value: user.role === "admin" ? "Administrator" : "Employee" },
  ]

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Avatar + name header */}
      <div className="flex items-center gap-5">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/20 text-xl font-bold text-primary ring-2 ring-primary/30">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{user.name}</h2>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${user.is_active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-rose-500/30 bg-rose-500/10 text-rose-400"}`}>
              <span className="size-1.5 rounded-full bg-current" />
              {user.is_active ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium capitalize text-primary">
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Read-only info */}
      <section className="rounded-2xl border border-border bg-card/40 p-6">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Account Information
        </h3>
        <div className="space-y-4">
          {infoFields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-medium capitalize truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Contact your administrator to update your name, email, or role.
        </p>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-border bg-card/40 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30">
            <Lock className="size-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold tracking-tight">Change Password</h3>
            <p className="text-xs text-muted-foreground">Keep your account secure with a strong password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "Current password", value: currentPassword, setter: setCurrentPassword, placeholder: "••••••••" },
            { label: "New password", value: newPassword, setter: setNewPassword, placeholder: "Min. 6 characters" },
            { label: "Confirm new password", value: confirmPassword, setter: setConfirmPassword, placeholder: "••••••••" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                {label === "Current password" && (
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    {showPasswords ? "Hide" : "Show"}
                  </button>
                )}
              </div>
              <input
                type={showPasswords ? "text" : "password"}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          ))}

          {pwError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{pwError}</span>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <Check className="size-4 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          <Button type="submit" size="sm" disabled={pwLoading} className="gap-2">
            {pwLoading && <Loader className="size-4 animate-spin" />}
            {pwLoading ? "Updating..." : "Update password"}
          </Button>
        </form>
      </section>

      {/* Deactivate account — role-based: employees only */}
      {user.role === "employee" && (
        <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-9 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10">
              <Power className="size-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-rose-300">Deactivate Account</h3>
              <p className="text-xs text-muted-foreground">
                This will lock your account. Contact your admin to reactivate.
              </p>
            </div>
          </div>

          {!showDeactivate ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeactivate(true)}
              className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Power className="size-4 mr-2" />
              Deactivate my account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure? You will be signed out and your account will be locked.
              </p>
              {deactivateError && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{deactivateError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={deactivateLoading}
                  className="bg-rose-600 text-white hover:bg-rose-700 gap-2"
                >
                  {deactivateLoading && <Loader className="size-4 animate-spin" />}
                  Yes, deactivate
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeactivate(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Admins see a note instead */}
      {user.role === "admin" && (
        <section className="rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-3">
            <Shield className="size-5 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">
              Administrator accounts cannot self-deactivate. Contact your system administrator if you need account changes.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
