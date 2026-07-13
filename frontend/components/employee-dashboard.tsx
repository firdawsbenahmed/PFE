"use client"

import { useState } from "react"
import {
  Plane,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccountSettingsView } from "@/components/account-settings"
import { AdminFlightsView } from "@/components/admin-flights"
import { AdminBookingsView } from "@/components/admin-bookings"

type EmployeeTab = "flights" | "bookings" | "settings"

export function EmployeeDashboard({
  company,
  onLogout,
  onRefresh,
}: {
  company: string
  onLogout: () => void
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState<EmployeeTab>("flights")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs: { id: EmployeeTab; label: string; icon: typeof Plane }[] = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "bookings", label: "Bookings", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-lg font-bold text-accent">UniFlow</h1>
            <p className="text-xs text-muted-foreground">{company}</p>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="space-y-2 border-t border-border px-3 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="w-full justify-start gap-2"
            >
              <RotateCcw className="size-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card/40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground hover:text-foreground lg:hidden"
            >
              {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            <h2 className="text-lg font-semibold">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h2>

            <div className="w-6" />
          </div>
        </div>

        <div className="p-6">
          {activeTab === "flights" && <AdminFlightsView />}
          {activeTab === "bookings" && <AdminBookingsView />}
          {activeTab === "settings" && <AccountSettingsView onLogout={onLogout} />}
        </div>
      </main>
    </div>
  )
}
