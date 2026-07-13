import {
  Plane,
  ShoppingCart,
  Building2,
  Users,
  Package,
  Boxes,
  Gauge,
  Map,
  Wrench,
  Receipt,
  Truck,
  ClipboardList,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type IndustryKey = "aviation" | "retail" | "general"

export type NavItem = {
  key: string
  label: string
  icon: LucideIcon
}

export type StatCard = {
  label: string
  value: string
  delta: string
  progress: number
  icon: LucideIcon
}

export type DirectoryRow = {
  id: string
  name: string
  email: string
  role: string
  unit: string
  access: "Admin" | "Manager" | "Operator" | "Viewer"
  active: boolean
}

export type IndustryConfig = {
  key: IndustryKey
  name: string
  tagline: string
  icon: LucideIcon
  opsLabel: string
  nav: NavItem[]
  stats: StatCard[]
  directory: DirectoryRow[]
  opsTable: {
    title: string
    columns: string[]
    rows: { cells: string[]; status: "ok" | "warn" | "down" }[]
  }
}

export const INDUSTRIES: Record<IndustryKey, IndustryConfig> = {
  aviation: {
    key: "aviation",
    name: "Aviation",
    tagline: "Fleet, crew, and flight operations in one control tower.",
    icon: Plane,
    opsLabel: "Flights",
    nav: [
      { key: "dashboard", label: "Dashboard", icon: Gauge },
      { key: "employees", label: "Crew & Staff", icon: Users },
      { key: "inventory", label: "Fleet Assets", icon: Boxes },
      { key: "ops", label: "Flights", icon: Plane },
    ],
    stats: [
      { label: "Active Flights", value: "42", delta: "+6 today", progress: 78, icon: Plane },
      { label: "On-Time Rate", value: "94.2%", delta: "+1.8%", progress: 94, icon: Gauge },
      { label: "Crew On Duty", value: "318", delta: "+12", progress: 64, icon: Users },
      { label: "Fleet Available", value: "27 / 31", delta: "4 in maint.", progress: 87, icon: Boxes },
    ],
    directory: [
      { id: "AV-1042", name: "Captain Lena Hayes", email: "l.hayes@uniflow.aero", role: "Senior Pilot", unit: "Long-Haul", access: "Manager", active: true },
      { id: "AV-1088", name: "Marco Bellini", email: "m.bellini@uniflow.aero", role: "Flight Engineer", unit: "Maintenance", access: "Operator", active: true },
      { id: "AV-1101", name: "Priya Nandakumar", email: "p.nanda@uniflow.aero", role: "Cabin Lead", unit: "Cabin Crew", access: "Operator", active: true },
      { id: "AV-1133", name: "Owen Whitfield", email: "o.whitfield@uniflow.aero", role: "Dispatcher", unit: "Operations", access: "Admin", active: false },
      { id: "AV-1150", name: "Sofia Reyes", email: "s.reyes@uniflow.aero", role: "Ground Crew", unit: "Apron", access: "Viewer", active: true },
    ],
    opsTable: {
      title: "Flight Operations",
      columns: ["Flight", "Route", "Aircraft", "Departure", "Status"],
      rows: [
        { cells: ["UF 204", "JFK → LHR", "B787-9", "14:20", "Boarding"], status: "ok" },
        { cells: ["UF 318", "DXB → SIN", "A350-900", "15:05", "Delayed 25m"], status: "warn" },
        { cells: ["UF 442", "LAX → NRT", "B777-300", "16:40", "On Time"], status: "ok" },
        { cells: ["UF 510", "CDG → BOS", "A330-200", "17:15", "Grounded"], status: "down" },
      ],
    },
  },
  retail: {
    key: "retail",
    name: "Retail",
    tagline: "Stores, stock, and staff synced across every location.",
    icon: ShoppingCart,
    opsLabel: "Orders",
    nav: [
      { key: "dashboard", label: "Dashboard", icon: Gauge },
      { key: "employees", label: "Staff", icon: Users },
      { key: "inventory", label: "Inventory", icon: Package },
      { key: "ops", label: "Orders", icon: Receipt },
    ],
    stats: [
      { label: "Revenue (MTD)", value: "$1.24M", delta: "+8.3%", progress: 72, icon: Receipt },
      { label: "Orders Today", value: "1,884", delta: "+214", progress: 81, icon: ShoppingCart },
      { label: "SKUs In Stock", value: "12,340", delta: "98% fill", progress: 98, icon: Package },
      { label: "Staff On Shift", value: "146", delta: "+9", progress: 58, icon: Users },
    ],
    directory: [
      { id: "RT-2201", name: "Daniela Cruz", email: "d.cruz@uniflow.shop", role: "Store Manager", unit: "Flagship NYC", access: "Manager", active: true },
      { id: "RT-2244", name: "Tomas Andersen", email: "t.andersen@uniflow.shop", role: "Inventory Lead", unit: "Warehouse", access: "Operator", active: true },
      { id: "RT-2290", name: "Aisha Bello", email: "a.bello@uniflow.shop", role: "Sales Associate", unit: "Flagship NYC", access: "Viewer", active: true },
      { id: "RT-2312", name: "Greg Mendez", email: "g.mendez@uniflow.shop", role: "Regional Ops", unit: "West Coast", access: "Admin", active: false },
      { id: "RT-2350", name: "Hana Kim", email: "h.kim@uniflow.shop", role: "Merchandiser", unit: "Online", access: "Operator", active: true },
    ],
    opsTable: {
      title: "Recent Orders",
      columns: ["Order", "Customer", "Items", "Total", "Status"],
      rows: [
        { cells: ["#48201", "M. Foster", "3 items", "$214.00", "Fulfilled"], status: "ok" },
        { cells: ["#48202", "K. Osei", "1 item", "$49.99", "Backordered"], status: "warn" },
        { cells: ["#48203", "L. Petrova", "7 items", "$612.40", "Shipped"], status: "ok" },
        { cells: ["#48204", "R. Tan", "2 items", "$130.00", "Cancelled"], status: "down" },
      ],
    },
  },
  general: {
    key: "general",
    name: "General",
    tagline: "Flexible workflow infrastructure for any operation.",
    icon: Building2,
    opsLabel: "Tasks",
    nav: [
      { key: "dashboard", label: "Dashboard", icon: Gauge },
      { key: "employees", label: "Employees", icon: Users },
      { key: "inventory", label: "Resources", icon: Boxes },
      { key: "ops", label: "Projects", icon: ClipboardList },
    ],
    stats: [
      { label: "Active Projects", value: "38", delta: "+4", progress: 70, icon: ClipboardList },
      { label: "Utilization", value: "86%", delta: "+2.1%", progress: 86, icon: Gauge },
      { label: "Team Members", value: "212", delta: "+15", progress: 62, icon: Users },
      { label: "Resources", value: "1,420", delta: "92% avail.", progress: 92, icon: Boxes },
    ],
    directory: [
      { id: "GN-3301", name: "Elena Markov", email: "e.markov@uniflow.io", role: "Operations Lead", unit: "HQ", access: "Manager", active: true },
      { id: "GN-3340", name: "Jamal Carter", email: "j.carter@uniflow.io", role: "Project Manager", unit: "Delivery", access: "Admin", active: true },
      { id: "GN-3372", name: "Yuki Tanaka", email: "y.tanaka@uniflow.io", role: "Analyst", unit: "Strategy", access: "Viewer", active: true },
      { id: "GN-3399", name: "Liam O'Brien", email: "l.obrien@uniflow.io", role: "Coordinator", unit: "Field", access: "Operator", active: false },
      { id: "GN-3410", name: "Noura Haddad", email: "n.haddad@uniflow.io", role: "Resource Planner", unit: "HQ", access: "Operator", active: true },
    ],
    opsTable: {
      title: "Active Projects",
      columns: ["Project", "Owner", "Team", "Due", "Status"],
      rows: [
        { cells: ["Atlas Migration", "J. Carter", "8 people", "Jun 24", "On Track"], status: "ok" },
        { cells: ["Vendor Audit", "E. Markov", "3 people", "Jun 18", "At Risk"], status: "warn" },
        { cells: ["Q3 Rollout", "Y. Tanaka", "12 people", "Jul 02", "On Track"], status: "ok" },
        { cells: ["Legacy Sunset", "N. Haddad", "5 people", "Jun 12", "Blocked"], status: "down" },
      ],
    },
  },
}

export const INDUSTRY_LIST = Object.values(INDUSTRIES)

export const ACCESS_LEVELS: DirectoryRow["access"][] = [
  "Admin",
  "Manager",
  "Operator",
  "Viewer",
]

export const COMMON_NAV: NavItem[] = [
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "settings", label: "Settings", icon: Settings },
]

export const SECONDARY_ICONS = { Map, Wrench, Truck }
