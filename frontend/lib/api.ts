/**
 * API Service Layer for UniFlow
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    let message = `Request failed (${response.status})`
    if (error) {
      if (typeof error.detail === 'string') {
        message = error.detail
      } else if (Array.isArray(error.detail) && error.detail.length > 0) {
        message = error.detail[0]?.msg || message
      } else if (typeof error.message === 'string') {
        message = error.message
      }
    }
    const err = new Error(message) as Error & { status?: number }
    err.status = response.status
    throw err
  }

  return response.json()
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export async function signupUser(data: {
  email: string
  password: string
  company_name: string
  admin_name: string
  industry: string
}): Promise<TokenResponse> {
  return apiCall<TokenResponse>('/auth/register-company', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface TokenResponse {
  access_token: string
  token_type: string
  company_id: number
  company_name: string
  role: 'admin' | 'employee'
  name: string
}

export async function loginUser(data: {
  email: string
  password: string
}): Promise<TokenResponse & { company_name: string; industry: string }> {
  const response = await apiCall<TokenResponse>('/auth/Login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  let company_name = ''
  let industry = ''

  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', response.access_token)
    if (response.role) localStorage.setItem('userRole', response.role)
    if (response.company_id != null) localStorage.setItem('companyId', String(response.company_id))
    if (response.name) localStorage.setItem('userName', response.name)

    // The login response doesn't carry the company name/industry, so fetch the
    // full profile and persist it. This is the source of truth on re-login.
    try {
      const me = await getCurrentUser()
      company_name = me.company_name
      industry = me.industry
      setCompanyName(company_name)
      localStorage.setItem('industry', industry)
      localStorage.setItem('userId', String(me.id))
      if (me.email) localStorage.setItem('userEmail', me.email)
    } catch {
      /* ignore — fall back to whatever is already stored */
    }
  }

  return { ...response, company_name, industry }
}

export async function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

export async function requestPasswordReset(email: string) {
  return apiCall('/auth/forget-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token: string, newPassword: string) {
  return apiCall('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword }),
  })
}

export async function verifyEmail(token: string) {
  return apiCall<{ message: string }>(
    `/auth/verify-email?token=${encodeURIComponent(token)}`,
    { method: 'GET' },
  )
}

export async function resendVerification(email: string) {
  return apiCall<{ message: string }>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export interface CurrentUser {
  id: number
  email: string
  role: 'admin' | 'employee'
  company_id: number
  company_name: string
  industry: string
}

export async function getCurrentUser(): Promise<CurrentUser> {
  return apiCall<CurrentUser>('/auth/me', { method: 'GET' })
}

// ============================================================================
// AVIATION / FLIGHTS
// ============================================================================

export interface Flight {
  id: number
  flight_number: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  status: string
  company_id: number
  classes?: {
    id: number
    class_type: string
    price: number
    total_seats: number
    available_seats: number
  }[]
}

export interface Booking {
  id: number
  company_id: number
  flight_id: number
  flight_class_id: number
  passenger_name: string
  passenger_email: string
  status: 'reserved' | 'cancelled'
  payment_status: 'unpaid' | 'paid'
  payment_link?: string
  email_status?: string
  price?: number
}

export async function createFlight(data: {
  flight_number: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  classes: { class_type: string; price: number; total_seats: number }[]
}) {
  return apiCall<Flight>('/flights/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getFlights(params?: { origin?: string; destination?: string }) {
  const query = new URLSearchParams()
  if (params?.origin) query.append('origin', params.origin)
  if (params?.destination) query.append('destination', params.destination)
  const qs = query.toString() ? `?${query}` : ''
  return apiCall<Flight[]>(`/flights/${qs}`, { method: 'GET' })
}

export async function getAvailableSeats(flightId: number) {
  return apiCall<{ flight_id: number; classes: any[] }>(
    `/flights/${flightId}/available`,
    { method: 'GET' },
  )
}

export async function searchFlights(query: {
  origin?: string
  destination?: string
  company_name?: string
}) {
  const params = new URLSearchParams()
  if (query.origin) params.append('origin', query.origin)
  if (query.destination) params.append('destination', query.destination)
  if (query.company_name) params.append('company_name', query.company_name)

  const response = await fetch(`${API_URL}/flights/public/search?${params}`)
  if (!response.ok) throw new Error('Search failed')
  return response.json() as Promise<Flight[]>
}

export async function getFlightById(flightId: number) {
  return apiCall<Flight>(`/flights/${flightId}`, { method: 'GET' })
}

export async function bookFlight(data: {
  flight_id: number
  flight_class_id: number
  passenger_name: string
  passenger_email: string
}) {
  const response = await fetch(`${API_URL}/bookings/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Booking failed')
  return response.json()
}

export async function getGuestBookingDetails(bookingId: number, passengerEmail: string) {
  const params = new URLSearchParams({ passenger_email: passengerEmail })
  const response = await fetch(`${API_URL}/bookings/guest/${bookingId}?${params}`)
  if (!response.ok) throw new Error('Booking not found')
  return response.json() as Promise<Booking>
}

export async function payGuestBooking(bookingId: number, passengerEmail: string) {
  const params = new URLSearchParams({ passenger_email: passengerEmail })
  const response = await fetch(`${API_URL}/bookings/guest/${bookingId}/pay?${params}`, {
    method: 'PUT',
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    const message =
      (error && (typeof error.detail === 'string' ? error.detail : error.message)) ||
      `Payment failed (${response.status})`
    throw new Error(message)
  }
  return response.json() as Promise<Booking>
}

// ============================================================================
// EMPLOYEES
// ============================================================================

export interface Employee {
  id: number
  email: string
  name: string
  role: 'admin' | 'employee'
  is_active: boolean
  created_at: string
}

export async function getEmployees() {
  return apiCall<Employee[]>('/admin/employees', { method: 'GET' })
}

export async function createEmployee(data: {
  email: string
  name: string
  password: string
  role: 'admin' | 'employee'
}) {
  return apiCall<Employee>('/auth/register-employee', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEmployee(
  employeeId: number,
  data: { name?: string; role?: 'admin' | 'employee'; is_active?: boolean },
) {
  return apiCall<Employee>(`/admin/employees/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function disableEmployee(employeeId: number) {
  return apiCall(`/admin/employees/${employeeId}/disable`, { method: 'POST' })
}

export async function enableEmployee(employeeId: number) {
  return updateEmployee(employeeId, { is_active: true })
}

export async function changeEmployeePassword(employeeId: number, newPassword: string) {
  return apiCall(`/admin/employees/${employeeId}/password`, {
    method: 'POST',
    body: JSON.stringify({ new_password: newPassword }),
  })
}

// ============================================================================
// ADMIN FLIGHT/BOOKING MANAGEMENT
// ============================================================================

export interface FlightDetail extends Flight {
  total_capacity: number
  booked_seats: number
  remaining_seats: number
}

export async function getFlightDetails(flightId: number) {
  return apiCall<FlightDetail>(`/flights/${flightId}`, { method: 'GET' })
}

export async function updateFlight(
  flightId: number,
  data: {
    flight_number?: string
    origin?: string
    destination?: string
    departure_time?: string
    arrival_time?: string
    status?: string
  },
) {
  return apiCall<Flight>(`/admin/flights/${flightId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteFlight(flightId: number) {
  return apiCall(`/admin/flights/${flightId}`, { method: 'DELETE' })
}

export async function getBookings(flightId?: number): Promise<Booking[]> {
  const result = await apiCall<Booking | Booking[] | null>('/bookings/', { method: 'GET' })
  let bookings = Array.isArray(result) ? result : result ? [result] : []
  if (flightId != null) {
    bookings = bookings.filter((b) => b.flight_id === flightId)
  }
  return bookings
}

export async function getBookingDetails(bookingId: number) {
  return apiCall<Booking>(`/admin/bookings/${bookingId}`, { method: 'GET' })
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiCall('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

export async function deactivateAccount() {
  return apiCall('/account/deactivate', { method: 'POST' })
}

export async function deleteAccount() {
  return apiCall('/account/delete', { method: 'DELETE' })
}

// ============================================================================
// RETAIL — STORES / PRODUCTS / INVENTORY
// ============================================================================

export interface Store {
  id: number
  name: string
  location: string
  company_id: number
  manager_id: number | null
  manager_name: string | null
}

export interface Product {
  id: number
  name: string
  sku: string
  price: number
  description: string | null
  company_id: number
}

export interface InventoryItem {
  id: number
  company_id: number
  product_id: number
  store_id: number
  quantity: number
}

// ── Stores ──────────────────────────────────────────────────────────────────
export async function getStores() {
  return apiCall<Store[]>('/stores/', { method: 'GET' })
}

export async function createStore(data: {
  name: string
  location: string
  manager_id?: number | null
}) {
  return apiCall<Store>('/stores/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateStore(
  storeId: number,
  data: { name?: string; location?: string; manager_id?: number | null },
) {
  return apiCall<Store>(`/stores/${storeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteStore(storeId: number) {
  return apiCall(`/stores/${storeId}`, { method: 'DELETE' })
}

// ── Products ────────────────────────────────────────────────────────────────
export async function getProducts() {
  return apiCall<Product[]>('/products/', { method: 'GET' })
}

export async function createProduct(data: {
  name: string
  sku: string
  price: number
  description?: string | null
}) {
  return apiCall<Product>('/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Inventory ───────────────────────────────────────────────────────────────
export async function getInventory() {
  return apiCall<InventoryItem[]>('/inventory/', { method: 'GET' })
}

// Adds `quantity` to the (product, store) pair — creates the record if missing.
export async function addInventory(data: {
  product_id: number
  store_id: number
  quantity: number
}) {
  return apiCall<InventoryItem>('/inventory/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Overwrites the quantity of an existing inventory record.
export async function setInventoryQuantity(inventoryId: number, quantity: number) {
  return apiCall<InventoryItem>(`/inventory/${inventoryId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

export async function deleteInventory(inventoryId: number) {
  return apiCall(`/inventory/${inventoryId}`, { method: 'DELETE' })
}

// ============================================================================
// HELPERS
// ============================================================================

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('authToken')
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

export function clearAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('companyId')
    localStorage.removeItem('userName')
    localStorage.removeItem('companyName')
    localStorage.removeItem('industry')
    localStorage.removeItem('userId')
    localStorage.removeItem('userEmail')
  }
}

export function getUserId(): number | null {
  if (typeof window === 'undefined') return null
  const id = localStorage.getItem('userId')
  return id ? Number(id) : null
}

export function getUserRole(): 'admin' | 'employee' | null {
  if (typeof window === 'undefined') return null
  const role = localStorage.getItem('userRole')
  return (role as 'admin' | 'employee') || null
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userName')
}
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userEmail')
}

export function setCompanyName(name: string): void {
  if (typeof window !== 'undefined') localStorage.setItem('companyName', name)
}

export function getCompanyName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('companyName')
}

export function getIndustry(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('industry')
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin'
}

export function isEmployee(): boolean {
  return getUserRole() === 'employee'
}
