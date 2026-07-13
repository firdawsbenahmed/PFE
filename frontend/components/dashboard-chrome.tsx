"use client"

import { useState } from "react"
import { Workflow, LogOut, Menu, X, ChevronDown } from "lucide-react"

import { COMMON_NAV, type IndustryConfig } from "@/lib/industries"

type SidebarProps = {
  config: IndustryConfig
  active: string
  onSelect: (key: string) => void
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({
  config,
  active,
  onSelect,
  open,
  onClose,
}: SidebarProps) {
  const Industry = config.icon
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Workflow className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">UniFlow</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Industry badge */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-3 py-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-accent">
              <Industry className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{config.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                Industry mode
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {config.nav.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}

          <div className="my-3 border-t border-sidebar-border" />
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          {COMMON_NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelect(item.key)
                  onClose()
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent/20 text-sm font-medium text-accent">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Admin</div>
              <div className="truncate text-xs text-muted-foreground">
                Owner
              </div>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  )
}

export function DashboardHeader({
  company,
  onMenu,
  onLogout,
  title,
}: {
  company: string
  onMenu: () => void
  onLogout: () => void
  title: string
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <div className="text-sm">
          <span className="font-semibold tracking-tight">UniFlow</span>
          <span className="text-muted-foreground"> {" // "} </span>
          <span className="text-foreground/90">{company}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {title}
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:text-foreground"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
