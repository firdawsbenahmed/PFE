"use client"

import { useState, useEffect } from "react"
import { Boxes, Plus, AlertCircle, Loader, Package, Store as StoreIcon, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getInventory,
  addInventory,
  setInventoryQuantity,
  deleteInventory,
  getProducts,
  getStores,
  type InventoryItem,
  type Product,
  type Store,
} from "@/lib/api"

const LOW_STOCK_THRESHOLD = 10

export function RetailInventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [qtyDraft, setQtyDraft] = useState("")
  const [detailError, setDetailError] = useState("")
  const [formData, setFormData] = useState({ product_id: "", store_id: "", quantity: "" })

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

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.product_id || !formData.store_id || !formData.quantity) {
      setError("Product, store and quantity are required")
      return
    }
    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0")
      return
    }
    setSaving(true)
    try {
      await addInventory({
        product_id: Number(formData.product_id),
        store_id: Number(formData.store_id),
        quantity: Number(formData.quantity),
      })
      setFormData({ product_id: "", store_id: "", quantity: "" })
      setShowForm(false)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign stock")
    } finally {
      setSaving(false)
    }
  }

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

  const handleDelete = async (inventoryId: number) => {
    if (!confirm("Remove this stock record?")) return
    setError("")
    try {
      await deleteInventory(inventoryId)
      closeDetails()
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record")
    }
  }

  const filtered = inventory.filter((i) => {
    const q = searchTerm.toLowerCase()
    return (
      productName(i.product_id).toLowerCase().includes(q) ||
      storeName(i.store_id).toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium tracking-tight">Inventory</h3>
          <p className="text-sm text-muted-foreground">
            {inventory.length} stock record{inventory.length !== 1 ? "s" : ""} across all stores
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          <Plus className="size-4" />
          Assign stock
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search by product or store..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
      />

      {showForm && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Store</label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                >
                  <option value="">Select store</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity to add</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="50"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Adding stock for a product already in a store increases its quantity.
            </p>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                {saving ? "Assigning..." : "Assign stock"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {error && !showForm && (
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
          {searchTerm ? "No records match your search" : "No inventory yet — assign stock to a store"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Store</th>
                <th className="px-4 py-3 text-left font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
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
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
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
              <label className="text-sm font-medium">Set quantity</label>
              <input
                type="number"
                value={qtyDraft}
                onChange={(e) => setQtyDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
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
              <Button onClick={() => handleDelete(selected.id)} variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
