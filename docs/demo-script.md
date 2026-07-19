# UniFlow — v0 Demo Script (Company Meeting)

**Goal of the demo:** show that UniFlow is a working, multi-tenant SaaS that **reshapes itself per industry** and is **AI-native** (the ChatGPT App Store / MCP vision, actually running). ~8–10 minutes.

---

## Before the meeting (do this first — don't do it live)

1. Start the **backend** (leave running):
   ```bash
   cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000
   ```
2. Re-seed so the data is fresh and known:
   ```bash
   python seed.py
   ```
3. Start the **frontend**: `cd frontend && npm run dev` → open `http://localhost:3000`
4. Start the **MCP server** scoped to UrbanWear (get the key from the admin dashboard or seed):
   ```bash
   COMPANY_API_KEY=<UrbanWear key> python app/mcp/server.py
   ```
5. **Rehearse the MCP step once.** If it's flaky, keep a **60-sec screen recording** as backup.

**Login cheatsheet (password for all: `Passw0rd!`)**
- Retail admin: `owner@urbanwear.com` · Retail employee: `sara@urbanwear.com`
- Aviation admin: `owner@airalgerie.dz`

---

## Opening line (30 seconds)

> "UniFlow is one platform that adapts to a company's industry. A retail brand manages stores, products and stock; an airline manages flights and bookings — same system, different face. And on top of it, every company gets an **AI-native presence**: their catalog is callable directly by ChatGPT or Claude through an MCP server. That's the ChatGPT App Store vision — and it's running today. Let me show you."

---

## Step 1 — Retail admin (2 min) · *"One brand, fully managed"*

| Click | Say |
|---|---|
| Log in as `owner@urbanwear.com` | "This is UrbanWear, a clothing brand. Notice the dashboard is retail-shaped — Stores, Products, Inventory, Analytics." |
| **Stores** tab | "Three stores, each with a **responsible employee** assigned." |
| **Products** tab → open the New-product form | "Products carry **variants** — colors, sizes, any option. This is the catalog the AI will read." |
| **Inventory** tab | "Per-store stock. Low-stock items are flagged automatically." |
| **Analytics** tab | "Brand-wide: units, inventory value, low-stock, per-store performance." |

## Step 2 — Retail employee (1 min) · *"Role-based multi-tenancy"*

| Click | Say |
|---|---|
| Sign out → log in as `sara@urbanwear.com` | "Sara manages the Algiers store." |
| **Analytics** tab | "She sees **only her store** — not the other two. The admin sees everything; staff see their scope. That's enforced multi-tenancy." |

## Step 3 — The AI moment (2–3 min) · **the differentiator**

| Do | Say |
|---|---|
| Switch to your AI client connected to the MCP server | "Now the part that matters. This MCP server is bound to **one brand** by an API key." |
| Ask: *"Do you have running shoes in stock in Oran?"* | "The AI calls our `check_product_availability` tool — and it can **only** see UrbanWear's data. Another brand's catalog is invisible to it." |
| Ask: *"Which stores carry the leather jacket?"* | "Real inventory, real stores, answered conversationally — no app to install." |

> If live MCP is risky, play the recording here and narrate the same points.

## Step 4 — Aviation (1 min) · *"Same platform, different industry"*

| Click | Say |
|---|---|
| Sign out → log in as `owner@airalgerie.dz` | "Same product, now an airline. Flights, cabin classes, bookings — the platform reshaped itself." |
| **Flights** / **Bookings** tabs | "And the same MCP layer lets a customer search and book a flight in chat." |

---

## Closing (1 min)

> "So this is **v0**: multi-tenant, role-based, multi-industry, and AI-native — the core flows work end-to-end. What's next toward production: hardening the AI access layer (key hashing, rate limiting, audit), real payments, and cloud hosting — plus the bigger AI play, a specialized on-brand assistant we've already designed.
>
> The strategic point: this is a working proof of the exact MCP / ChatGPT App Store architecture — a 'ChatGPT App in a box' that any company you onboard gets automatically."

**Then ask them:** which industry/use-case they'd want to see next, and whether the priority is the AI depth or the production hardening.

---

## If something breaks (stay calm)
- **Login fails / wrong dashboard:** sign out fully (clears the session), log back in.
- **Backend error:** you pre-started it; don't restart live — switch to screenshots and keep talking.
- **MCP won't answer:** play the recording. Never debug live in front of them.
- **Golden rule:** never run migrations, `pip install`, or `git` commands during the demo.
