"use client"

import { useState, useEffect } from "react"
import { Landing } from "@/components/landing"
import { AuthScreen } from "@/components/auth-screen"
import { ForgotPasswordScreen } from "@/components/forgot-password"
import { TransitionLoader } from "@/components/transition-loader"
import { Dashboard } from "@/components/dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { RetailAdminDashboard } from "@/components/retail-admin-dashboard"
import { RetailEmployeeDashboard } from "@/components/retail-employee-dashboard"
import {
  logoutUser,
  clearAuth,
  getUserRole,
  isAuthenticated,
  getCompanyName,
  setCompanyName,
  getIndustry,
} from "@/lib/api"
import type { IndustryKey } from "@/lib/industries"

type View = "landing" | "auth" | "forgot-password" | "loading" | "dashboard"
type UserRole = "admin" | "employee" | null

export default function Page() {
  const [view, setView] = useState<View>("landing")
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup")
  const [company, setCompany] = useState("Global Enterprises")
  const [industry, setIndustry] = useState<IndustryKey>("aviation")
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole()
      const savedCompany = getCompanyName()
      if (savedCompany) setCompany(savedCompany)
      const savedIndustry = getIndustry()
      if (savedIndustry) setIndustry(savedIndustry as IndustryKey)
      setUserRole(role)
      setView("dashboard")
    }
    setRestoring(false)
  }, [])

  if (restoring) {
    return <TransitionLoader onDone={() => {}} />
  }

  if (view === "landing") {
    return (
      <Landing
        onLaunch={(mode) => {
          setAuthMode(mode)
          setView("auth")
        }}
      />
    )
  }

  if (view === "auth") {
    return (
      <AuthScreen
        initialMode={authMode}
        onBack={() => setView("landing")}
        onForgotPassword={() => setView("forgot-password")}
        onAuthenticated={({ company_name, industry }) => {
          setCompany(company_name)
          setCompanyName(company_name)
          setIndustry(industry)
          setView("loading")
        }}
      />
    )
  }

  if (view === "forgot-password") {
    return <ForgotPasswordScreen onBack={() => setView("auth")} />
  }

  if (view === "loading") {
    return (
      <TransitionLoader
        onDone={() => {
          const role = getUserRole()
          setUserRole(role)
          setView("dashboard")
        }}
      />
    )
  }

  const handleLogout = () => {
    logoutUser()
    clearAuth()
    setUserRole(null)
    setView("landing")
  }

  const handleRefresh = () => setRefreshKey((prev) => prev + 1)

  if (view === "dashboard") {
    if (userRole === "admin") {
      const AdminView = industry === "retail" ? RetailAdminDashboard : AdminDashboard
      return (
        <AdminView
          key={refreshKey}
          company={company}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
        />
      )
    }

    if (userRole === "employee") {
      const EmployeeView = industry === "retail" ? RetailEmployeeDashboard : EmployeeDashboard
      return (
        <EmployeeView
          key={refreshKey}
          company={company}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
        />
      )
    }

    return (
      <Dashboard
        company={company}
        industry={industry}
        onUpdateCompany={({ company, industry }) => {
          setCompany(company)
          setCompanyName(company)
          setIndustry(industry)
        }}
        onLogout={handleLogout}
      />
    )
  }

  return null
}
