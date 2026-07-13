"use client"


import { useState, useEffect } from "react"
import { Plane, Plus, Trash2, AlertCircle, Loader, X, MapPin, Clock, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getFlights, createFlight, updateFlight, deleteFlight, type Flight } from "@/lib/api"

const FLIGHT_STATUSES = ["scheduled", "delayed", "cancelled", "completed"] as const

// Vibrant, status-specific badge colors (uses themed tokens so it works in dark mode).
const STATUS_BADGE: Record<string, string> = {
  scheduled: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  delayed: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  cancelled: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}
  
export function AdminFlightsView() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [statusDraft, setStatusDraft] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [formData, setFormData] = useState({
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    classes: [{ class_type: "economy", price: 0, total_seats: 0 }],
  })

  useEffect(() => {
    loadFlights()
  }, [])

 const loadFlights = async () => {
  setLoading(true)
  setError("")
  try {
    const data = await getFlights()
    setFlights(data.map(f => ({ ...f, status: (f.status ?? "scheduled").toLowerCase() })))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load flights"
    setError(message)
    console.error("[v0] Load flights error:", err)
  } finally {
    setLoading(false)
  }
}
  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.flight_number || !formData.origin || !formData.destination) {
      setError("Please fill in required fields")
      return
    }

    try {
      await createFlight({
        flight_number: formData.flight_number,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        classes: formData.classes,
      })
      setFormData({
        flight_number: "",
        origin: "",
        destination: "",
        departure_time: "",
        arrival_time: "",
        classes: [{ class_type: "economy", price: 0, total_seats: 0 }],
      })
      setShowForm(false)
      await loadFlights()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create flight"
      setError(message)
      console.error("[v0] Create flight error:", err)
    }
  }

  const handleDeleteFlight = async (flightId: number) => {
    if (!confirm("Are you sure you want to delete this flight?")) return

    setError("")
    try {
      await deleteFlight(flightId)
      await loadFlights()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete flight"
      setError(message)
      console.error("[v0] Delete flight error:", err)
    }
  }

  const openDetails = (flight: Flight) => {
    setSelectedFlight(flight)
    setStatusDraft(flight.status)
    setDetailError("")
  }

  const closeDetails = () => {
    setSelectedFlight(null)
    setStatusDraft("")
    setDetailError("")
  }

  const handleSaveStatus = async () => {
    if (!selectedFlight || statusDraft === selectedFlight.status) {
      closeDetails()
      return
    }
    setSavingStatus(true)
    setDetailError("")
    try {
      await updateFlight(selectedFlight.id, { status: statusDraft })
      // Update the row in place so the table reflects the new status immediately.
      setFlights((prev) =>
        prev.map((f) => (f.id === selectedFlight.id ? { ...f, status: statusDraft } : f)),
      )
      closeDetails()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status"
      setDetailError(message)
      console.error("[v0] Update flight status error:", err)
    } finally {
      setSavingStatus(false)
    }
  }

  const filteredFlights = flights.filter(f =>
    f.flight_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.destination.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium tracking-tight">Flight Management</h3>
          <p className="text-sm text-muted-foreground">
            {flights.length} flight{flights.length !== 1 ? "s" : ""} in system
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="gap-2"
        >
          <Plus className="size-4" />
          New flight
        </Button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by flight number, origin, or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        />
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <form onSubmit={handleCreateFlight} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Flight Number</label>
                <input
                  type="text"
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  placeholder="AA101"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Origin</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="JFK"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="LAX"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Departure Time</label>
                <input
                  type="datetime-local"
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Arrival Time</label>
                <input
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <div className="col-span-2">
  <div className="flex items-center justify-between mb-2">
    <label className="text-sm font-medium">Cabin Classes</label>
    <button
      type="button"
      onClick={() =>
        setFormData((f) => ({
          ...f,
          classes: [...f.classes, { class_type: "economy", price: 0, total_seats: 0 }],
        }))
      }
      className="text-xs text-accent hover:underline"
    >
      + Add class
    </button>
  </div>
  <div className="space-y-2">
    {formData.classes.map((cls, i) => (
      <div key={i} className="grid grid-cols-3 gap-2 items-center">
        <select
          value={cls.class_type}
          onChange={(e) => {
            const classes = [...formData.classes]
            classes[i] = { ...classes[i], class_type: e.target.value }
            setFormData({ ...formData, classes })
          }}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
        >
          <option value="economy">Economy</option>
          <option value="business">Business</option>
          <option value="first">First</option>
        </select>
        <input
          type="number"
          placeholder="Price"
          value={cls.price || ""}
          onChange={(e) => {
            const classes = [...formData.classes]
            classes[i] = { ...classes[i], price: Number(e.target.value) }
            setFormData({ ...formData, classes })
          }}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Seats"
            value={cls.total_seats || ""}
            onChange={(e) => {
              const classes = [...formData.classes]
              classes[i] = { ...classes[i], total_seats: Number(e.target.value) }
              setFormData({ ...formData, classes })
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none"
          />
          {formData.classes.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setFormData((f) => ({ ...f, classes: f.classes.filter((_, idx) => idx !== i) }))
              }
            >
              <X className="size-4 text-muted-foreground hover:text-destructive" />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
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
                Create flight
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-accent" />
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No flights match your search" : "No flights yet"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Flight</th>
                <th className="px-4 py-3 text-left font-medium">Route</th>
                <th className="px-4 py-3 text-left font-medium">Departure</th>
                <th className="px-4 py-3 text-left font-medium">Arrival</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((flight) => (
                <tr
                  key={flight.id}
                  onClick={() => openDetails(flight)}
                  className="cursor-pointer border-b border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Plane className="size-4 shrink-0 text-accent" />
                      <span>{flight.flight_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {flight.origin} → {flight.destination}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(flight.departure_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(flight.arrival_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_BADGE[flight.status] ?? STATUS_BADGE.scheduled}`}>
                      <span className="size-1.5 rounded-full bg-current opacity-70" />
                      {flight.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFlight(flight.id)
                      }}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedFlight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={closeDetails}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Plane className="size-5 text-accent" />
                <div>
                  <h3 className="font-semibold tracking-tight">Flight {selectedFlight.flight_number}</h3>
                  <p className="text-xs text-muted-foreground">Flight #{selectedFlight.id}</p>
                </div>
              </div>
              <button
                onClick={closeDetails}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <span className="font-medium">{selectedFlight.origin}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">{selectedFlight.destination}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground">Departs: </span>
                    {new Date(selectedFlight.departure_time).toLocaleString()}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Arrives: </span>
                    {new Date(selectedFlight.arrival_time).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedFlight.classes && selectedFlight.classes.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Classes
                  </p>
                  <div className="space-y-1">
                    {selectedFlight.classes.map((c) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span>{c.class_type}</span>
                        <span className="text-muted-foreground">
                          ${c.price} · {c.available_seats}/{c.total_seats} seats
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm capitalize focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
              >
                {FLIGHT_STATUSES.map((s) => (
                  <option key={s} value={s} >
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {detailError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{detailError}</span>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Button onClick={handleSaveStatus} size="sm" className="flex-1 gap-2" disabled={savingStatus}>
                {savingStatus ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
                {savingStatus ? "Saving..." : "Save status"}
              </Button>
              <Button onClick={closeDetails} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
