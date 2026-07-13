"use client"

import { useState } from "react"
import {
  Users,
  Plane,
  BookOpen,
  UserCircle,
  LogOut,
  Menu,
  X,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminEmployeesView } from "@/components/admin-employees"
import { AdminFlightsView } from "@/components/admin-flights"
import { AdminBookingsView } from "@/components/admin-bookings"
import { ProfileView } from "@/components/profile-view"
import { getUserEmail, getUserName,  getUserRole } from "@/lib/api"

type AdminTab = "employees" | "flights" | "bookings" | "profile"

export function AdminDashboard({
  company,
  onLogout,
  onRefresh,
}: {
  company: string
  onLogout: () => void
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState<AdminTab>("flights")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "employees", label: "Employees", icon: Users },
    { id: "bookings", label: "Bookings", icon: BookOpen },
    { id: "profile", label: "Profile", icon: UserCircle },
  ]

  const name = getUserName() ?? "Admin"
  const email = getUserEmail() ?? ""
  const role = getUserRole() ?? "admin"

  const profileUser = {
    name,
    email,
    role: role as "admin" | "employee",
    company,
    is_active: true,
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                <Plane className="size-4 text-white" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">UniFlow</h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground truncate">{company}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border space-y-2 px-3 py-4">
            <Button variant="outline" size="sm" onClick={onRefresh} className="w-full justify-start gap-2">
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

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border bg-card/30">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
            <h2 className="text-lg font-semibold">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="w-6 lg:hidden" />
          </div>
        </div>

        <div className="p-6">
          {activeTab === "flights" && <AdminFlightsView />}
          {activeTab === "employees" && <AdminEmployeesView />}
          {activeTab === "bookings" && <AdminBookingsView />}
          {activeTab === "profile" && <ProfileView user={profileUser} onLogout={onLogout} />}
        </div>
      </main>
    </div>
  )
}
