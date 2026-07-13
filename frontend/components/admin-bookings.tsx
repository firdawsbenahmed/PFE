"use client"


import { useState, useEffect } from "react"
import { AlertCircle, Loader, Mail, User, CreditCard } from "lucide-react"
import { getBookings, type Booking } from "@/lib/api"

export function AdminBookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "reserved" | "cancelled">("all")
  const [filterPayment, setFilterPayment] = useState<"all" | "paid" | "unpaid">("all")

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getBookings()
      setBookings(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load bookings"
      setError(message)
      console.error("[v0] Load bookings error:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus !== "all" && booking.status !== filterStatus) return false
    if (filterPayment !== "all" && booking.payment_status !== filterPayment) return false
    return true
  })

  const stats = {
    total: bookings.length,
    reserved: bookings.filter(b => b.status === "reserved").length,
    paid: bookings.filter(b => b.payment_status === "paid").length,
    revenue: bookings
      .filter(b => b.payment_status === "paid")
      .reduce((sum, b) => sum + (b.price || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium tracking-tight">Bookings</h3>
        <p className="text-sm text-muted-foreground">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
          <p className="mt-2 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Reserved</p>
          <p className="mt-2 text-2xl font-semibold text-accent">{stats.reserved}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Paid</p>
          <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">{stats.paid}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <p className="text-xs font-medium text-muted-foreground">Revenue</p>
          <p className="mt-2 text-2xl font-semibold">${stats.revenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        >
          <option value="all">All Status</option>
          <option value="reserved">Reserved</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value as any)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-accent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No bookings found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Booking ID</th>
                <th className="px-4 py-3 text-left font-medium">Passenger</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Flight</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">#{booking.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="size-4 shrink-0" />
                      <span>{booking.passenger_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 shrink-0" />
                      <span>{booking.passenger_email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Flight {booking.flight_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                      booking.status === "reserved"
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${
                        booking.payment_status === "paid"
                          ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                      }`}>
                        {booking.payment_status}
                      </span>
                      {booking.payment_link && (
                        <a
                          href={booking.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline"
                        >
                          <CreditCard className="size-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
