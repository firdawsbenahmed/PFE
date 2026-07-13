"use client"

import { useState, useEffect, useMemo } from "react"
import { Store as StoreIcon, Package, Boxes, DollarSign, AlertTriangle, Loader, TrendingUp } from "lucide-react"
import { getInventory, getProducts, getStores, type InventoryItem, type Product, type Store } from "@/lib/api"

const LOW_STOCK_THRESHOLD = 10

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })

// managerId: omit for the brand-wide admin view; pass a user id to restrict the
// analytics to the store(s) that user manages (the employee view).
export function RetailAnalyticsView({ managerId }: { managerId?: number }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEmployee = managerId != null

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError("")
      try {
        const [inv, p, s] = await Promise.all([getInventory(), getProducts(), getStores()])
        setInventory(inv)
        setProducts(p)
        setStores(s)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const priceOf = (id: number) => products.find((p) => p.id === id)?.price ?? 0
  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`
  const storeName = (id: number) => stores.find((s) => s.id === id)?.name ?? `#${id}`

  // The stores this view covers: admin = all; employee = only the ones they manage.
  const scopedStores = useMemo(
    () => (isEmployee ? stores.filter((s) => s.manager_id === managerId) : stores),
    [stores, isEmployee, managerId],
  )
  const scopedStoreIds = useMemo(() => new Set(scopedStores.map((s) => s.id)), [scopedStores])

  const scopedInventory = useMemo(
    () => (isEmployee ? inventory.filter((i) => scopedStoreIds.has(i.store_id)) : inventory),
    [inventory, isEmployee, scopedStoreIds],
  )

  const totals = useMemo(() => {
    const units = scopedInventory.reduce((sum, i) => sum + i.quantity, 0)
    const value = scopedInventory.reduce((sum, i) => sum + i.quantity * priceOf(i.product_id), 0)
    const lowStock = scopedInventory.filter((i) => i.quantity < LOW_STOCK_THRESHOLD)
    const activeStores = isEmployee ? scopedStores.length : new Set(scopedInventory.map((i) => i.store_id)).size
    return { units, value, lowStock, activeStores }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedInventory, products, scopedStores, isEmployee])

  // Per-store breakdown over the stores in scope.
  const perStore = useMemo(() => {
    return scopedStores
      .map((s) => {
        const rows = inventory.filter((i) => i.store_id === s.id)
        return {
          id: s.id,
          name: s.name,
          skus: rows.length,
          units: rows.reduce((sum, i) => sum + i.quantity, 0),
          value: rows.reduce((sum, i) => sum + i.quantity * priceOf(i.product_id), 0),
          low: rows.filter((i) => i.quantity < LOW_STOCK_THRESHOLD).length,
        }
      })
      .sort((a, b) => b.value - a.value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedStores, inventory, products])

  const singleStore = isEmployee && scopedStores.length === 1
  const showStoreColumn = scopedStores.length !== 1
  const showPerStoreTable = !isEmployee || scopedStores.length > 1

  const title = isEmployee
    ? singleStore
      ? `${scopedStores[0].name} — Analytics`
      : "Your Stores — Analytics"
    : "Brand Analytics"

  const subtitle = isEmployee
    ? singleStore
      ? "your store"
      : `${scopedStores.length} store${scopedStores.length !== 1 ? "s" : ""} you manage`
    : `${stores.length} store${stores.length !== 1 ? "s" : ""}`

  const cards = [
    {
      label: isEmployee ? (singleStore ? "Your Store" : "Your Stores") : "Active Stores",
      value: singleStore ? scopedStores[0].name : String(totals.activeStores),
      icon: StoreIcon,
    },
    { label: "Units in Stock", value: totals.units.toLocaleString(), icon: Boxes },
    { label: "Inventory Value", value: money(totals.value), icon: DollarSign },
    { label: "Low-Stock Items", value: String(totals.lowStock.length), icon: AlertTriangle },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="size-5 animate-spin text-accent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="size-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{products.length} products · {subtitle}</p>
      </div>

      {isEmployee && scopedStores.length === 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>You aren&apos;t assigned to a store yet — ask your admin to make you a store manager to see its analytics.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-xl border border-border bg-card/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="size-4 text-accent" />
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</p>
            </div>
          )
        })}
      </div>

      {/* Low-stock alerts */}
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-500" />
          <h4 className="font-medium">Low-Stock Alerts</h4>
          <span className="text-xs text-muted-foreground">(under {LOW_STOCK_THRESHOLD} units)</span>
        </div>
        {totals.lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Everything is well stocked.</p>
        ) : (
          <div className="space-y-1.5">
            {totals.lowStock.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Package className="size-3 text-muted-foreground" />
                  {productName(i.product_id)}
                  {showStoreColumn && <span className="text-muted-foreground">· {storeName(i.store_id)}</span>}
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{i.quantity} left</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-store breakdown */}
      {showPerStoreTable && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-4 py-3">
            <TrendingUp className="size-4 text-accent" />
            <h4 className="text-sm font-medium">Store Performance</h4>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Store</th>
                <th className="px-4 py-3 text-left font-medium">SKUs</th>
                <th className="px-4 py-3 text-left font-medium">Units</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">Low</th>
              </tr>
            </thead>
            <tbody>
              {perStore.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No stores yet
                  </td>
                </tr>
              ) : (
                perStore.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <StoreIcon className="size-4 text-accent" />
                        {s.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.skus}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.units.toLocaleString()}</td>
                    <td className="px-4 py-3">{money(s.value)}</td>
                    <td className="px-4 py-3">
                      {s.low > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">{s.low}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
