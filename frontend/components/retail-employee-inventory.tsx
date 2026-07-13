"use client"

import { useState, useEffect, useMemo } from "react"
import { Boxes, AlertCircle, Loader, Package, Store as StoreIcon, Save, X, Lightbulb, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getInventory,
  setInventoryQuantity,
  getProducts,
  getStores,
  getUserId,
  type InventoryItem,
  type Product,
  type Store,
} from "@/lib/api"

const LOW_STOCK_THRESHOLD = 10

export function RetailEmployeeInventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [qtyDraft, setQtyDraft] = useState("")
  const [detailError, setDetailError] = useState("")
  const [saving, setSaving] = useState(false)

  const userId = getUserId()

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [inv, p, s] = await Promise.all([getInventory(), getProducts(), getStores()])
      setInventory(inv)
      setProducts(p)
      setStores(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`
  const productSku = (id: number) => products.find((p) => p.id === id)?.sku ?? ""
  const storeName = (id: number) => stores.find((s) => s.id === id)?.name ?? `#${id}`

  // Stores this employee is responsible for.
  const myStoreIds = useMemo(
    () => stores.filter((s) => s.manager_id === userId).map((s) => s.id),
    [stores, userId],
  )
  const hasOwnStores = myStoreIds.length > 0

  // Show only the employee's stores if they manage any; otherwise all (fallback).
  const visibleInventory = useMemo(
    () => (hasOwnStores ? inventory.filter((i) => myStoreIds.includes(i.store_id)) : inventory),
    [inventory, myStoreIds, hasOwnStores],
  )

  // Suggested actions — simple client-side heuristics over the visible stock.
  const suggestions = useMemo(() => {
    return visibleInventory
      .filter((i) => i.quantity < LOW_STOCK_THRESHOLD)
      .sort((a, b) => a.quantity - b.quantity)
      .map((i) => ({
        item: i,
        urgent: i.quantity === 0,
        text:
          i.quantity === 0
            ? `Out of stock: restock ${productName(i.product_id)} at ${storeName(i.store_id)}`
            : `Low stock: reorder ${productName(i.product_id)} at ${storeName(i.store_id)} (${i.quantity} left)`,
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleInventory, products, stores])

  const openDetails = (item: InventoryItem) => {
    setSelected(item)
    setQtyDraft(String(item.quantity))
    setDetailError("")
  }
  const closeDetails = () => {
    setSelected(null)
    setDetailError("")
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setDetailError("")
    try {
      await setInventoryQuantity(selected.id, Number(qtyDraft))
      closeDetails()
      await loadAll()
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to update quantity")
    } finally {
      setSaving(false)
    }
  }

  const filtered = visibleInventory.filter((i) => {
    const q = searchTerm.toLowerCase()
    return productName(i.product_id).toLowerCase().includes(q) || storeName(i.store_id).toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium tracking-tight">
          {hasOwnStores ? "Your Store Inventory" : "Inventory"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {visibleInventory.length} stock record{visibleInventory.length !== 1 ? "s" : ""}
          {hasOwnStores ? " in your store(s)" : " across the brand"}
        </p>
      </div>

      {!hasOwnStores && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>You aren&apos;t assigned to a store yet — showing all brand inventory. Ask your admin to assign you as a store manager.</span>
        </div>
      )}

      {/* Suggested actions */}
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="size-4 text-amber-500" />
          <h4 className="font-medium">Suggested Actions</h4>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No action needed — stock levels look healthy. 🎉</p>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s) => (
              <button
                key={s.item.id}
                onClick={() => openDetails(s.item)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  s.urgent
                    ? "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/15"
                    : "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className={`size-4 shrink-0 ${s.urgent ? "text-rose-500" : "text-amber-500"}`} />
                  {s.text}
                </span>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">Update →</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by product or store..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
      />

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
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? "No records match your search" : "No inventory to manage yet"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Store</th>
                <th className="px-4 py-3 text-left font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const low = item.quantity < LOW_STOCK_THRESHOLD
                return (
                  <tr
                    key={item.id}
                    onClick={() => openDetails(item)}
                    className="cursor-pointer border-b border-border/60 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="size-4 shrink-0 text-accent" />
                        <span>{productName(item.product_id)}</span>
                        <span className="text-xs text-muted-foreground">{productSku(item.product_id)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <StoreIcon className="size-3" /> {storeName(item.store_id)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                          low
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {item.quantity} units{low ? " · low" : ""}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={closeDetails}>
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="size-5 text-accent" />
                <div>
                  <h3 className="font-semibold tracking-tight">{productName(selected.product_id)}</h3>
                  <p className="text-xs text-muted-foreground">{storeName(selected.store_id)}</p>
                </div>
              </div>
              <button onClick={closeDetails} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium">Update quantity</label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQtyDraft((q) => String(Math.max(0, (Number(q) || 0) - 1)))}
                  className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-muted"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  value={qtyDraft}
                  onChange={(e) => setQtyDraft(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-center text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
                <button
                  type="button"
                  onClick={() => setQtyDraft((q) => String((Number(q) || 0) + 1))}
                  className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-muted"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {detailError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{detailError}</span>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex-1 gap-2" disabled={saving}>
                {saving ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Saving..." : "Save quantity"}
              </Button>
              <Button onClick={closeDetails} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
