"use client"

import { useState, useEffect } from "react"
import { INDUSTRIES, COMMON_NAV, type IndustryKey } from "@/lib/industries"
import { DashboardSidebar, DashboardHeader } from "@/components/dashboard-chrome"
import {
  StatCards,
  DirectoryTable,
  OpsTable,
  AviationFlightsView,
} from "@/components/dashboard-content"
import { SettingsView, BillingView } from "@/components/dashboard-account"
import { getFlights, type Flight } from "@/lib/api"

export function Dashboard({
  company,
  industry,
  onUpdateCompany,
  onLogout,
}: {
  company: string
  industry: IndustryKey
  onUpdateCompany: (next: { company: string; industry: IndustryKey }) => void
  onLogout: () => void
}) {
  const config = INDUSTRIES[industry]
  const [active, setActive] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [loadingFlights, setLoadingFlights] = useState(false)

  useEffect(() => {
    if (industry === "aviation" && active === "ops") {
      setLoadingFlights(true)
      getFlights()
        .then(setFlights)
        .catch((err) => {
          console.error("[v0] Failed to fetch flights:", err)
        })
        .finally(() => setLoadingFlights(false))
    }
  }, [industry, active])

  const activeLabel =
    config.nav.find((n) => n.key === active)?.label ??
    COMMON_NAV.find((n) => n.key === active)?.label ??
    "Dashboard"

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        config={config}
        active={active}
        onSelect={setActive}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          company={company}
          title={activeLabel}
          onMenu={() => setSidebarOpen(true)}
          onLogout={onLogout}
        />

        <main className="flex-1 space-y-6 p-4 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {active === "dashboard" ? "Operations Overview" : activeLabel}
            </h1>
            <p className="mt-1 text-pretty text-sm text-muted-foreground">
              {active === "settings"
                ? "Manage your company profile, industry mode, and security."
                : active === "billing"
                  ? "Manage your subscription, payment method, and invoices."
                  : config.tagline}
            </p>
          </div>

          {(active === "dashboard" || active === "ops") && (
            <StatCards config={config} />
          )}

          {active === "dashboard" && (
            <div className="grid gap-6 xl:grid-cols-5">
              <div className="xl:col-span-3">
                <DirectoryTable config={config} />
              </div>
              <div className="xl:col-span-2">
                <OpsTable config={config} />
              </div>
            </div>
          )}

          {active === "employees" && <DirectoryTable config={config} />}

          {active === "ops" && industry === "aviation" && (
            <AviationFlightsView
              flights={flights}
              loading={loadingFlights}
              onRefresh={() => {
                setLoadingFlights(true)
                getFlights()
                  .then(setFlights)
                  .catch(console.error)
                  .finally(() => setLoadingFlights(false))
              }}
            />
          )}

          {(active === "inventory" || (active === "ops" && industry !== "aviation")) && (
            <OpsTable config={config} />
          )}

          {active === "settings" && (
            <SettingsView
              company={company}
              industry={industry}
              onSave={onUpdateCompany}
            />
          )}

          {active === "billing" && <BillingView config={config} />}
        </main>
      </div>
    </div>
  )
}
