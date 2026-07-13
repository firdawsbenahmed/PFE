"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Workflow, Check, AlertCircle, CreditCard, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGuestBookingDetails, payGuestBooking, type Booking } from "@/lib/api"

function PaymentContent() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const bookingId = Number(params.id)
  const emailFromLink = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailFromLink)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")
  const [paid, setPaid] = useState(false)

  // If the link already carries the email, fetch the booking right away.
  useEffect(() => {
    if (emailFromLink && Number.isFinite(bookingId)) {
      void loadBooking(emailFromLink)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadBooking(passengerEmail: string) {
    setLoadingDetails(true)
    setError("")
    try {
      const data = await getGuestBookingDetails(bookingId, passengerEmail.trim())
      setBooking(data)
      if (data.payment_status === "paid") setPaid(true)
    } catch {
      setError("We couldn't find a booking for that email. Please double-check and try again.")
      setBooking(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handlePay = async () => {
    if (!email.trim()) {
      setError("Please enter the email used for this booking.")
      return
    }
    setPaying(true)
    setError("")
    try {
      const updated = await payGuestBooking(bookingId, email.trim())
      setBooking(updated)
      setPaid(true)
    } catch (err) {
      const raw = err instanceof Error ? err.message : ""
      let friendly = "Payment could not be completed. Please try again."
      if (/already paid/i.test(raw)) {
        friendly = "This booking has already been paid."
        setPaid(true)
      } else if (/cancelled/i.test(raw)) {
        friendly = "This booking was cancelled and can no longer be paid."
      } else if (/does not exist|not found/i.test(raw)) {
        friendly = "We couldn't find a booking for that email."
      }
      setError(friendly)
    } finally {
      setPaying(false)
    }
  }

  if (!Number.isFinite(bookingId)) {
    return (
      <Shell>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Invalid payment link</h1>
          <p className="text-sm text-muted-foreground">This payment link is missing a valid booking reference.</p>
        </div>
      </Shell>
    )
  }

  if (paid) {
    return (
      <Shell>
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-accent/10">
              <Check className="size-8 text-accent" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Payment confirmed</h1>
            <p className="text-sm text-muted-foreground">
              Thank you{booking?.passenger_name ? `, ${booking.passenger_name}` : ""}! Your booking
              {" "}#{bookingId} is now marked as paid.
            </p>
          </div>
          {booking && <BookingSummary booking={booking} />}
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CreditCard className="size-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Complete your payment</h1>
          <p className="text-sm text-muted-foreground">Booking reference #{bookingId}</p>
        </div>

        {!booking && (
          <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4">
            <label className="text-sm font-medium">Confirm the email used for this booking</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
            <Button
              onClick={() => loadBooking(email)}
              disabled={loadingDetails || !email.trim()}
              variant="outline"
              className="w-full"
            >
              {loadingDetails ? "Looking up booking…" : "Find my booking"}
            </Button>
          </div>
        )}

        {booking && <BookingSummary booking={booking} />}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {booking && (
          <Button onClick={handlePay} disabled={paying} size="lg" className="w-full">
            {paying
              ? "Processing payment…"
              : booking.price != null
                ? `Pay $${booking.price.toLocaleString()}`
                : "Pay now"}
          </Button>
        )}
      </div>
    </Shell>
  )
}

function BookingSummary({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/40 p-4 text-sm">
      <div className="flex items-center gap-2 font-medium">
        <Plane className="size-4 text-primary" />
        Booking details
      </div>
      <Row label="Passenger" value={booking.passenger_name} />
      <Row label="Email" value={booking.passenger_email} />
      <Row label="Status" value={booking.status} />
      <Row
        label="Payment"
        value={booking.payment_status === "paid" ? "Paid" : "Unpaid"}
      />
      {booking.price != null && <Row label="Amount" value={`$${booking.price.toLocaleString()}`} />}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Workflow className="size-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">UniFlow</span>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={null}>
      <PaymentContent />
    </Suspense>
  )
}
