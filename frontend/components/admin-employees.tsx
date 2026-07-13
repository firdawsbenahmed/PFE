"use client"


import { useState, useEffect } from "react"
import { Plus, Lock, Eye, EyeOff, AlertCircle, Pencil, Power, X, Loader, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  disableEmployee,
  enableEmployee,
  changeEmployeePassword,
  type Employee,
} from "@/lib/api"

type CreateFormState = {
  name: string
  email: string
  password: string
  role: "admin" | "employee"
}

type PasswordFormState = {
  employeeId: number | null
  newPassword: string
  showPassword: boolean
}

type EditState = {
  employee: Employee | null
  name: string
  role: "admin" | "employee"
}

export function AdminEmployeesView() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [passwordChange, setPasswordChange] = useState<PasswordFormState>({
    employeeId: null,
    newPassword: "",
    showPassword: false,
  })
  const [edit, setEdit] = useState<EditState>({ employee: null, name: "", role: "employee" })
  const [savingEdit, setSavingEdit] = useState(false)
  const [formData, setFormData] = useState<CreateFormState>({
    name: "",
    email: "",
    password: "",
    role: "employee",
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(""), 2500)
  }

  const loadEmployees = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
      console.error("[v0] Load employees error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }
    try {
      await createEmployee(formData)
      setFormData({ name: "", email: "", password: "", role: "employee" })
      setShowForm(false)
      flash("Employee created")
      await loadEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee")
      console.error("[v0] Create employee error:", err)
    }
  }

  // Admin can enable/disable any account in their company.
  const handleToggleActive = async (emp: Employee) => {
    const action = emp.is_active ? "disable" : "enable"
    if (!confirm(`Are you sure you want to ${action} ${emp.name}'s account?`)) return
    setError("")
    setBusyId(emp.id)
    try {
      if (emp.is_active) {
        await disableEmployee(emp.id)
      } else {
        await enableEmployee(emp.id)
      }
      flash(`Account ${action}d`)
      await loadEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} account`)
      console.error("[v0] Toggle active error:", err)
    } finally {
      setBusyId(null)
    }
  }

  const openEdit = (emp: Employee) => {
    setError("")
    setEdit({ employee: emp, name: emp.name, role: emp.role })
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!edit.employee) return
    setSavingEdit(true)
    setError("")
    try {
      await updateEmployee(edit.employee.id, { name: edit.name.trim(), role: edit.role })
      setEdit({ employee: null, name: "", role: "employee" })
      flash("Employee updated")
      await loadEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update employee")
      console.error("[v0] Update employee error:", err)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!passwordChange.employeeId || !passwordChange.newPassword) {
      setError("Please enter a new password")
      return
    }
    try {
      await changeEmployeePassword(passwordChange.employeeId, passwordChange.newPassword)
      setPasswordChange({ employeeId: null, newPassword: "", showPassword: false })
      flash("Password updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
      console.error("[v0] Change password error:", err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Manage Employees</h3>
          <p className="text-sm text-muted-foreground">
            {employees.length} member{employees.length !== 1 ? "s" : ""} in your company
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          <Plus className="size-4" />
          Add employee
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <Check className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@company.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "employee" })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Create employee
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ name: "", email: "", password: "", role: "employee" })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && !edit.employee && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader className="size-5 animate-spin text-primary" />
        </div>
      ) : employees.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">No employees yet</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {emp.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <span className="font-medium">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium ${
                        emp.is_active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {emp.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(emp)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Edit employee"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setPasswordChange({ employeeId: emp.id, newPassword: "", showPassword: false })}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Reset password"
                      >
                        <Lock className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(emp)}
                        disabled={busyId === emp.id}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                          emp.is_active
                            ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                            : "text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                        }`}
                        title={emp.is_active ? "Disable account" : "Enable account"}
                      >
                        {busyId === emp.id ? <Loader className="size-3.5 animate-spin" /> : <Power className="size-3.5" />}
                        {emp.is_active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit employee modal */}
      {edit.employee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setEdit({ employee: null, name: "", role: "employee" })}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">Edit {edit.employee.name}</h3>
              <button
                onClick={() => setEdit({ employee: null, name: "", role: "employee" })}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  value={edit.name}
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={edit.role}
                  onChange={(e) => setEdit({ ...edit, role: e.target.value as "admin" | "employee" })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEdit({ employee: null, name: "", role: "employee" })}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change password panel */}
      {passwordChange.employeeId && (
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h4 className="font-medium">
              Reset password for {employees.find((e) => e.id === passwordChange.employeeId)?.name}
            </h4>
            <div>
              <label className="text-sm font-medium">New password</label>
              <div className="relative mt-1">
                <input
                  type={passwordChange.showPassword ? "text" : "password"}
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setPasswordChange({ ...passwordChange, showPassword: !passwordChange.showPassword })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {passwordChange.showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">
                Update password
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPasswordChange({ employeeId: null, newPassword: "", showPassword: false })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
