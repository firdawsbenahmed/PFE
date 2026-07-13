"use client"

import { useState } from "react"
import { Lock, AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { changePassword, deactivateAccount, deleteAccount } from "@/lib/api"

export function AccountSettingsView({ onLogout }: { onLogout: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure? This will deactivate your account.")) return
    setLoading(true)
    try {
      await deactivateAccount()
      onLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate account")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE MY ACCOUNT") {
      setError("Please type 'DELETE MY ACCOUNT' to confirm")
      return
    }
    setLoading(true)
    try {
      await deleteAccount()
      onLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="font-medium tracking-tight">Account Settings</h3>
        <p className="text-sm text-muted-foreground">Manage your account and security</p>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-border bg-card/40 p-6">
        <h4 className="mb-4 flex items-center gap-2 font-medium">
          <Lock className="size-4" />
          Change Password
        </h4>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {["Current Password", "New Password", "Confirm New Password"].map((label, i) => {
            const val = [currentPassword, newPassword, confirmPassword][i]
            const setter = [setCurrentPassword, setNewPassword, setConfirmPassword][i]
            return (
              <div key={label}>
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-accent hover:underline"
          >
            {showPasswords ? "Hide" : "Show"} passwords
          </button>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h4 className="font-medium text-destructive">Danger Zone</h4>
        <p className="text-sm text-muted-foreground">Irreversible actions</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDeactivate}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            Deactivate Account
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Account
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h4 className="mb-4 font-medium text-destructive">Permanently Delete Account</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            This action cannot be undone. All your data will be permanently deleted.
          </p>

          <div className="mb-4">
            <label className="text-sm font-medium">
              Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="mt-2 w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm focus:border-destructive focus:outline-none"
            />
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={loading || deleteConfirm !== "DELETE MY ACCOUNT"}
              variant="destructive"
              className="flex-1"
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirm("")
                setError("")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
