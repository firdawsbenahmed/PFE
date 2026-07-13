"use client"

import { useState, useEffect } from "react"
import { Store as StoreIcon, Plus, AlertCircle, Loader, MapPin, UserCircle, Trash2, Save, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
  getEmployees,
  getInventory,
  getProducts,
  type Store,
  type Employee,
  type Product,
  type InventoryItem,
} from "@/lib/api"

export function RetailStoresView() {
  const [stores, setStores] = useState<Store[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selected, setSelected] = useState<Store | null>(null)
  const [editDraft, setEditDraft] = useState({ name: "", location: "", manager_id: "" })
  const [detailError, setDetailError] = useState("")
  const [formData, setFormData] = useState({ name: "", location: "", manager_id: "" })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    setError("")
    try {
      const [s, e, p, inv] = await Promise.all([
        getStores(),
        getEmployees().catch(() => [] as Employee[]),
        getProducts().catch(() => [] as Product[]),
        getInventory().catch(() => [] as InventoryItem[]),
      ])
      setStores(s)
      setEmployees(e)
      setProducts(p)
      setInventory(inv)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stores")
    } finally {
      setLoading(false)
    }
  }

  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`
  const storeItems = (storeId: number) => inventory.filter((i) => i.store_id === storeId)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.name || !formData.location) {
      setError("Name and location are required")
      return
    }
    setSaving(true)
    try {
      await createStore({
        name: formData.name,
        location: formData.location,
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
      })
      setFormData({ name: "", location: "", manager_id: "" })
      setShowForm(false)
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store")
    } finally {
      setSaving(false)
    }
  }

  const openDetails = (store: Store) => {
    setSelected(store)
    setEditDraft({
      name: store.name,
      location: store.location,
      manager_id: store.manager_id ? String(store.manager_id) : "",
    })
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
      await updateStore(selected.id, {
        name: editDraft.name,
        location: editDraft.location,
        manager_id: editDraft.manager_id ? Number(editDraft.manager_id) : null,
      })
      closeDetails()
      await loadAll()
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Failed to update store")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (storeId: number) => {
    if (!confirm("Delete this store? Its inventory records will also be removed.")) return
    setError("")
    try {
      await deleteStore(storeId)
      closeDetails()
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete store")
    }
  }

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-medium tracking-tight">Store Network</h3>
          <p className="text-sm text-muted-foreground">
            {stores.length} store{stores.length !== 1 ? "s" : ""} in the brand
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
          <Plus className="size-4" />
          New store
        </Button>
      </div>

      <input
        type="text"
        placeholder="Search by name or location..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
      />

      {showForm && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Store Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Flagship Downtown"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="123 Main St, Algiers"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Responsible Employee</label>
                <select
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1" disabled={saving}>
                {saving ? "Creating..." : "Create store"}
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
          {searchTerm ? "No stores match your search" : "No stores yet"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Store</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Manager</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((store) => (
                <tr
                  key={store.id}
                  onClick={() => openDetails(store)}
                  className="cursor-pointer border-b border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="size-4 shrink-0 text-accent" />
                      <span>{store.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {store.location}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {store.manager_name ? (
                      <span className="inline-flex items-center gap-1">
                        <UserCircle className="size-3" /> {store.manager_name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{storeItems(store.id).length}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(store.id)
                      }}
                      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={closeDetails}>
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <StoreIcon className="size-5 text-accent" />
                <div>
                  <h3 className="font-semibold tracking-tight">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">Store #{selected.id}</p>
                </div>
              </div>
              <button onClick={closeDetails} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <input
                  type="text"
                  value={editDraft.location}
                  onChange={(e) => setEditDraft({ ...editDraft, location: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Responsible Employee</label>
                <select
                  value={editDraft.manager_id}
                  onChange={(e) => setEditDraft({ ...editDraft, manager_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Stock in this store
                </p>
                {storeItems(selected.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products stocked yet.</p>
                ) : (
                  <div className="space-y-1">
                    {storeItems(selected.id).map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Package className="size-3 text-muted-foreground" />
                          {productName(it.product_id)}
                        </span>
                        <span className="text-muted-foreground">{it.quantity} units</span>
                      </div>
                    ))}
                  </div>
                )}
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
                {saving ? "Saving..." : "Save changes"}
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
