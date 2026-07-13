"""
Demo data seeder — populates the database for BOTH industries.

  • Retail  : "UrbanWear" — a clothing brand with 3 stores (each with a manager),
              products carrying colour/size variants, and per-store inventory
              (a few items intentionally low-stock to show the alerts).
  • Aviation: "Air Algerie" — an airline with flights, cabin classes, staff,
              and some guest bookings.

All users are pre-verified so you can log in immediately.
Password for EVERY seeded account:  Passw0rd!

Run from the backend/ directory (with the venv active):
    python seed.py

It is idempotent: it wipes the two demo companies (by email) and recreates them,
so you can run it as many times as you like.
"""
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.company import Company
from app.models.user import User
from app.models.Store import Store
from app.models.product import Product
from app.models.inventory import Inventory
from app.models.flights import Flight
from app.models.flight_classes import Flight_class
from app.models.booking import Booking
from app.models.email_verification import EmailVerificationToken

PASSWORD = "Passw0rd!"
RETAIL_EMAIL = "owner@urbanwear.com"
AVIATION_EMAIL = "owner@airalgerie.dz"


# ── helpers ──────────────────────────────────────────────────────────────────
def wipe_company(db, email):
    """Delete a company and every row that hangs off it, FK-safe order."""
    company = db.query(Company).filter(Company.email == email).first()
    if not company:
        return
    cid = company.id
    user_ids = [u.id for u in db.query(User).filter(User.company_id == cid).all()]
    flight_ids = [f.id for f in db.query(Flight).filter(Flight.company_id == cid).all()]

    db.query(Booking).filter(Booking.company_id == cid).delete(synchronize_session=False)
    if flight_ids:
        db.query(Flight_class).filter(Flight_class.flight_id.in_(flight_ids)).delete(synchronize_session=False)
    db.query(Flight).filter(Flight.company_id == cid).delete(synchronize_session=False)
    db.query(Inventory).filter(Inventory.company_id == cid).delete(synchronize_session=False)
    db.query(Store).filter(Store.company_id == cid).delete(synchronize_session=False)
    db.query(Product).filter(Product.company_id == cid).delete(synchronize_session=False)
    if user_ids:
        db.query(EmailVerificationToken).filter(
            EmailVerificationToken.user_id.in_(user_ids)
        ).delete(synchronize_session=False)
    db.query(User).filter(User.company_id == cid).delete(synchronize_session=False)
    db.query(Company).filter(Company.id == cid).delete(synchronize_session=False)
    db.commit()


def make_user(db, company_id, name, email, role):
    u = User(
        company_id=company_id, name=name, email=email,
        password_hash=hash_password(PASSWORD),
        role=role, is_active=True, is_verified=True,
    )
    db.add(u)
    db.flush()
    return u


# ── RETAIL ───────────────────────────────────────────────────────────────────
def seed_retail(db):
    company = Company(name="UrbanWear", email=RETAIL_EMAIL, industry="retail", status="active")
    db.add(company)
    db.flush()

    make_user(db, company.id, "UrbanWear Owner", RETAIL_EMAIL, "admin")
    sara = make_user(db, company.id, "Sara Ahmed", "sara@urbanwear.com", "employee")
    karim = make_user(db, company.id, "Karim Benali", "karim@urbanwear.com", "employee")
    lina = make_user(db, company.id, "Lina Haddad", "lina@urbanwear.com", "employee")

    stores = []
    for name, loc, mgr in [
        ("UrbanWear Algiers", "Rue Didouche Mourad, Algiers", sara.id),
        ("UrbanWear Oran", "Boulevard de la Soummam, Oran", karim.id),
        ("UrbanWear Constantine", "Rue Larbi Ben M'hidi, Constantine", lina.id),
    ]:
        s = Store(company_id=company.id, name=name, location=loc, manager_id=mgr)
        db.add(s)
        stores.append(s)
    db.flush()

    products = []
    for name, sku, price, desc, attrs in [
        ("Air Force 1", "AF1-100", 120.0, "Classic low-top sneakers",
         [{"name": "Color", "values": ["White", "Black", "Red"]},
          {"name": "Size", "values": ["40", "41", "42", "43", "44"]}]),
        ("Cotton T-Shirt", "TS-200", 25.0, "Everyday crew-neck tee",
         [{"name": "Color", "values": ["White", "Black", "Navy"]},
          {"name": "Size", "values": ["S", "M", "L", "XL"]}]),
        ("Denim Jacket", "DJ-300", 80.0, "Classic denim jacket",
         [{"name": "Color", "values": ["Blue", "Black"]},
          {"name": "Size", "values": ["S", "M", "L"]}]),
        ("Running Shorts", "RS-400", 35.0, "Lightweight training shorts",
         [{"name": "Color", "values": ["Grey", "Black"]},
          {"name": "Size", "values": ["S", "M", "L", "XL"]}]),
        ("Wool Beanie", "WB-500", 18.0, "Warm knit beanie",
         [{"name": "Color", "values": ["Grey", "Black", "Red"]}]),
        ("Leather Belt", "LB-600", 45.0, "Genuine leather belt", None),
    ]:
        p = Product(company_id=company.id, name=name, sku=sku, price=price,
                    description=desc, attributes=attrs)
        db.add(p)
        products.append(p)
    db.flush()

    # (store_index, product_index, quantity) — some quantities < 10 = low stock
    for si, pi, qty in [
        (0, 0, 45), (0, 1, 120), (0, 2, 15), (0, 3, 60), (0, 4, 8), (0, 5, 30),
        (1, 0, 20), (1, 1, 80), (1, 2, 5), (1, 3, 40), (1, 4, 25),
        (2, 0, 12), (2, 1, 50), (2, 3, 7), (2, 5, 18),
    ]:
        db.add(Inventory(company_id=company.id, store_id=stores[si].id,
                         product_id=products[pi].id, quantity=qty))
    db.commit()
    return {"stores": len(stores), "products": len(products)}


# ── AVIATION ─────────────────────────────────────────────────────────────────
def seed_aviation(db):
    company = Company(name="Air Algerie", email=AVIATION_EMAIL, industry="aviation", status="active")
    db.add(company)
    db.flush()

    make_user(db, company.id, "Air Algerie Owner", AVIATION_EMAIL, "admin")
    make_user(db, company.id, "Amine Kaci", "amine@airalgerie.dz", "employee")
    make_user(db, company.id, "Nora Meziane", "nora@airalgerie.dz", "employee")

    now = datetime.now()
    flights, classes_by_flight = [], {}
    for fn, org, dst, dep_days, dur_h, classes in [
        ("AH1001", "Algiers", "Paris", 2, 3, [("economy", 120, 150), ("business", 300, 20)]),
        ("AH1002", "Algiers", "Dubai", 3, 9, [("economy", 200, 180), ("business", 450, 24), ("first", 800, 8)]),
        ("AH1003", "Oran", "Marseille", 1, 3, [("economy", 140, 160)]),
        ("AH2050", "Algiers", "Istanbul", 4, 8, [("economy", 160, 170), ("business", 380, 20)]),
    ]:
        dep = now + timedelta(days=dep_days)
        f = Flight(company_id=company.id, flight_number=fn, origin=org, destination=dst,
                   departure_time=dep, arrival_time=dep + timedelta(hours=dur_h), status="scheduled")
        db.add(f)
        db.flush()
        flights.append(f)
        for ctype, price, seats in classes:
            c = Flight_class(flight_id=f.id, flight_class=ctype, price=price,
                             total_seats=seats, available_seats=seats)
            db.add(c)
            db.flush()
            classes_by_flight.setdefault(f.id, []).append(c)

    n_bookings = 0
    for fi, ci, pname, pemail, pay in [
        (0, 0, "John Doe", "john@example.com", "paid"),
        (0, 1, "Sofia Reyes", "sofia@example.com", "unpaid"),
        (1, 0, "Yacine Kaci", "yacine@example.com", "paid"),
        (1, 2, "Owen Whitfield", "owen@example.com", "unpaid"),
        (3, 0, "Priya Nandakumar", "priya@example.com", "paid"),
    ]:
        f = flights[fi]
        cls = classes_by_flight[f.id][ci]
        db.add(Booking(company_id=company.id, flight_id=f.id, flight_class_id=cls.id,
                       passenger_name=pname, passenger_email=pemail,
                       status="reserved", payment_status=pay, email_status="not_sent"))
        cls.available_seats -= 1
        n_bookings += 1
    db.commit()
    return {"flights": len(flights), "bookings": n_bookings}


def main():
    db = SessionLocal()
    try:
        print("Wiping any existing demo data…")
        wipe_company(db, RETAIL_EMAIL)
        wipe_company(db, AVIATION_EMAIL)

        print("Seeding retail (UrbanWear)…")
        r = seed_retail(db)
        print(f"   → {r['stores']} stores, {r['products']} products, inventory created")

        print("Seeding aviation (Air Algerie)…")
        a = seed_aviation(db)
        print(f"   → {a['flights']} flights with classes, {a['bookings']} bookings created")

        print("\n✅ Done. All accounts use the password:  " + PASSWORD)
        print("┌─ RETAIL — UrbanWear ─────────────────────────────────────────")
        print("│  admin    : " + RETAIL_EMAIL)
        print("│  employee : sara@urbanwear.com   (manages UrbanWear Algiers)")
        print("│  employee : karim@urbanwear.com  (manages UrbanWear Oran)")
        print("│  employee : lina@urbanwear.com   (manages UrbanWear Constantine)")
        print("├─ AVIATION — Air Algerie ─────────────────────────────────────")
        print("│  admin    : " + AVIATION_EMAIL)
        print("│  employee : amine@airalgerie.dz")
        print("│  employee : nora@airalgerie.dz")
        print("└──────────────────────────────────────────────────────────────")
    finally:
        db.close()


if __name__ == "__main__":
    main()
