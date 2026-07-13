"use client"

import { useState } from "react"
import { TrendingUp, Loader } from "lucide-react"
import {
  ACCESS_LEVELS,
  type DirectoryRow,
  type IndustryConfig,
} from "@/lib/industries" 
import type { Flight } from "@/lib/api"


export function StatCards({ config }: { config: IndustryConfig }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {config.stats.map((stat, i) => {
        const Icon = stat.icon
        const featured = i < 3
        return (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-border p-5"
            style={
              featured
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.32 0.12 295), oklch(0.24 0.05 270))",
                  }
                : { background: "oklch(0.21 0.025 270 / 60%)" }
            }
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex size-10 items-center justify-center rounded-xl ${
                  featured
                    ? "bg-background/20 text-foreground"
                    : "bg-primary/15 text-accent"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <span className="flex items-center gap-1 text-xs text-accent">
                <TrendingUp className="size-3" />
                {stat.delta}
              </span>
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-tight">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-background/30">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DirectoryTable({ config }: { config: IndustryConfig }) {
  const [rows, setRows] = useState<DirectoryRow[]>(config.directory)

  const toggleActive = (id: string) =>
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, active: !row.active } : row)),
    )

  const setAccess = (id: string, access: DirectoryRow["access"]) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, access } : row)))

  return (
    <div className="rounded-2xl border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-medium tracking-tight">Team Directory</h3>
          <p className="text-sm text-muted-foreground">
            {rows.filter((r) => r.active).length} active · {rows.length} total
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Unit</th>
              <th className="px-5 py-3 font-medium">Access</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
                      {row.name
                        .split(" ")
                        .slice(-2)
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{row.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {row.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{row.role}</td>
                <td className="hidden px-5 py-3.5 text-muted-foreground md:table-cell">
                  {row.unit}
                </td>
                <td className="px-5 py-3.5">
                  <div className="relative inline-flex">
                    <select
                      value={row.access}
                      onChange={(e) =>
                        setAccess(row.id, e.target.value as DirectoryRow["access"])
                      }
                      className="appearance-none rounded-lg border border-border bg-card/60 py-1.5 pl-3 pr-8 text-xs outline-none transition-colors hover:border-primary/40 focus:border-primary/60"
                    >
                      {ACCESS_LEVELS.map((lvl) => (
                        <option
                          key={lvl}
                          value={lvl}
                          className="bg-popover text-popover-foreground"
                        >
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => toggleActive(row.id)}
                      role="switch"
                      aria-checked={row.active}
                      aria-label={`Toggle ${row.name} status`}
                      className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                        row.active
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          row.active ? "bg-accent" : "bg-muted-foreground"
                        }`}
                      />
                      {row.active ? "Active" : "Disabled"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  ok: "border-accent/40 bg-accent/10 text-accent",
  warn: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  down: "border-destructive/40 bg-destructive/10 text-destructive",
}

// ============================================================================
// AVIATION FLIGHTS VIEW - Real data from backend
// ============================================================================

export function AviationFlightsView({ 
  flights, 
  loading,
  onRefresh,
}: { 
  flights: Flight[]
  loading: boolean
  onRefresh: () => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card/40 p-12">
        <Loader className="size-6 animate-spin text-accent" />
      </div>
    )
  }

const getStatusStyle = (status: string) => {
  if (status === 'scheduled') return 'ok'
  if (status === 'delayed') return 'warn'
  if (status === 'cancelled') return 'down'
  if (status === 'completed') return 'ok'  // or add a new 'done' style
  return 'ok'
}
  const totalAvailable = (flight: Flight) =>
    flight.classes?.reduce((sum, c) => sum + c.available_seats, 0) ?? 0

  const totalSeats = (flight: Flight) =>
    flight.classes?.reduce((sum, c) => sum + c.total_seats, 0) ?? 0

  return (
    <div className="rounded-2xl border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-medium tracking-tight">Flight Operations</h3>
          <p className="text-sm text-muted-foreground">
            {flights.length} flights in system
          </p>
        </div>
        <CreateFlightForm onCreated={onRefresh} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 font-medium">Flight</th>
              <th className="px-5 py-3 font-medium">Route</th>
              <th className="px-5 py-3 font-medium">Departure</th>
              <th className="px-5 py-3 font-medium">Arrival</th>
              <th className="px-5 py-3 font-medium">Seats Available</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {flights.length > 0 ? (
              flights.map((flight) => (
                <tr
                  key={flight.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5"
                >
                  <td className="px-5 py-3.5 font-medium">{flight.flight_number}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {flight.origin} → {flight.destination}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(flight.departure_time).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">
                    {new Date(flight.arrival_time).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium">
                      {totalAvailable(flight)} / {totalSeats(flight)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${
                        STATUS_STYLES[getStatusStyle(flight.status)]
                      }`}
                    >
                      {flight.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No flights found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function OpsTable({ config }: { config: IndustryConfig }) {
  const { opsTable } = config
  return (
    <div className="rounded-2xl border border-border bg-card/40">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-medium tracking-tight">{opsTable.title}</h3>
        <p className="text-sm text-muted-foreground">
          Live {config.opsLabel.toLowerCase()} feed
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              {opsTable.columns.map((c) => (
                <th key={c} className="px-5 py-3 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opsTable.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-primary/5"
              >
                {row.cells.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-5 py-3.5 ${
                      j === 0 ? "font-medium" : "text-muted-foreground"
                    }`}
                  >
                    {j === row.cells.length - 1 ? (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${STATUS_STYLES[row.status]}`}
                      >
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { Plus, X } from "lucide-react"
import { createFlight } from "@/lib/api"

export function CreateFlightForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    classes: [{ class_type: "economy", price: 0, total_seats: 0 }],
  })

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const setClass = (i: number, field: string, value: string | number) =>
    setForm((f) => {
      const classes = [...f.classes]
      classes[i] = { ...classes[i], [field]: value }
      return { ...f, classes }
    })

  const addClass = () =>
    setForm((f) => ({
      ...f,
      classes: [...f.classes, { class_type: "business", price: 0, total_seats: 0 }],
    }))

  const removeClass = (i: number) =>
    setForm((f) => ({ ...f, classes: f.classes.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await createFlight(form)
      setOpen(false)
      setForm({
        flight_number: "",
        origin: "",
        destination: "",
        departure_time: "",
        arrival_time: "",
        classes: [{ class_type: "economy", price: 0, total_seats: 0 }],
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flight")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        <Plus className="size-4" />
        New Flight
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Flight</h3>
              <button onClick={() => setOpen(false)}>
                <X className="size-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Flight Number</label>
                  <input
                    value={form.flight_number}
                    onChange={(e) => set("flight_number", e.target.value)}
                    placeholder="AF1234"
                    required
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Origin</label>
                  <input
                    value={form.origin}
                    onChange={(e) => set("origin", e.target.value)}
                    placeholder="CDG"
                    required
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Destination</label>
                  <input
                    value={form.destination}
                    onChange={(e) => set("destination", e.target.value)}
                    placeholder="JFK"
                    required
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Departure</label>
                  <input
                    type="datetime-local"
                    value={form.departure_time}
                    onChange={(e) => set("departure_time", e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Arrival</label>
                  <input
                    type="datetime-local"
                    value={form.arrival_time}
                    onChange={(e) => set("arrival_time", e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

            
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Cabin Classes</label>
                  <button type="button" onClick={addClass} className="text-xs text-accent hover:underline">
                    + Add class
                  </button>
                </div>
                <div className="space-y-2">
                  {form.classes.map((cls, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-center">
                      <select
                        value={cls.class_type}
                        onChange={(e) => setClass(i, "class_type", e.target.value)}
                        className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
                      >
                        <option value="economy">Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Price"
                        value={cls.price || ""}
                        onChange={(e) => setClass(i, "price", Number(e.target.value))}
                        className="rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Seats"
                          value={cls.total_seats || ""}
                          onChange={(e) => setClass(i, "total_seats", Number(e.target.value))}
                          className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm outline-none"
                        />
                        {form.classes.length > 1 && (
                          <button type="button" onClick={() => removeClass(i)}>
                            <X className="size-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Flight"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
