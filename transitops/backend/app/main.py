from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Driver, FuelExpense, MaintenanceLog, Trip, User, Vehicle
from .schemas import DriverCreate, FuelExpenseCreate, LoginRequest, MaintenanceCreate, TokenResponse, TripComplete, TripCreate, VehicleCreate
from .security import create_access_token, get_current_user, hash_password, require_roles, verify_password


def not_found(resource: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} was not found.")


def vehicle_data(vehicle: Vehicle) -> dict:
    return {
        "id": vehicle.id,
        "plate_number": vehicle.plate_number,
        "name": vehicle.name,
        "vehicle_type": vehicle.vehicle_type,
        "region": vehicle.region,
        "status": vehicle.status,
        "capacity_kg": vehicle.capacity_kg,
        "odometer_km": vehicle.odometer_km,
        "acquisition_cost": vehicle.acquisition_cost,
    }


def driver_data(driver: Driver) -> dict:
    return {
        "id": driver.id,
        "name": driver.name,
        "license_number": driver.license_number,
        "license_category": driver.license_category,
        "license_expiry_date": driver.license_expiry_date,
        "contact_number": driver.contact_number,
        "safety_score": driver.safety_score,
        "status": driver.status,
    }


def trip_data(trip: Trip, vehicle: Vehicle, driver: Driver) -> dict:
    return {
        "id": trip.id,
        "source": trip.source,
        "destination": trip.destination,
        "vehicle_id": trip.vehicle_id,
        "vehicle": vehicle.plate_number,
        "driver_id": trip.driver_id,
        "driver": driver.name,
        "cargo_weight_kg": trip.cargo_weight_kg,
        "planned_distance_km": trip.planned_distance_km,
        "actual_distance_km": trip.actual_distance_km,
        "revenue": trip.revenue,
        "status": trip.status,
        "created_at": trip.created_at,
        "completed_at": trip.completed_at,
    }


def seed_data() -> None:
    db = SessionLocal()
    try:
        if db.query(User).count():
            return
        users = [
            User(email="fleet@transitops.com", password_hash=hash_password("Transit@123"), role="Fleet Manager"),
            User(email="driver@transitops.com", password_hash=hash_password("Transit@123"), role="Driver"),
            User(email="safety@transitops.com", password_hash=hash_password("Transit@123"), role="Safety Officer"),
            User(email="finance@transitops.com", password_hash=hash_password("Transit@123"), role="Financial Analyst"),
        ]
        vehicles = [
            Vehicle(plate_number="VAN-05", name="Van-05", vehicle_type="Van", region="Central", status="Available", capacity_kg=500, odometer_km=18420, acquisition_cost=1850000),
            Vehicle(plate_number="TRK-24", name="Atlas Hauler", vehicle_type="Truck", region="North", status="On Trip", capacity_kg=4500, odometer_km=63120, acquisition_cost=4200000),
            Vehicle(plate_number="VAN-12", name="City Runner", vehicle_type="Van", region="West", status="In Shop", capacity_kg=800, odometer_km=28500, acquisition_cost=2200000),
            Vehicle(plate_number="TRK-31", name="Metro Freight", vehicle_type="Truck", region="Central", status="Available", capacity_kg=6000, odometer_km=41200, acquisition_cost=5100000),
        ]
        drivers = [
            Driver(name="Alex Morgan", license_number="DL-AX-4521", license_category="LMV", license_expiry_date=date.today() + timedelta(days=320), contact_number="+91 98765 43210", safety_score=96, status="Available"),
            Driver(name="Priya Shah", license_number="DL-PS-8160", license_category="HMV", license_expiry_date=date.today() + timedelta(days=84), contact_number="+91 98765 43211", safety_score=93, status="On Trip"),
            Driver(name="Rohan Mehta", license_number="DL-RM-2749", license_category="HMV", license_expiry_date=date.today() + timedelta(days=14), contact_number="+91 98765 43212", safety_score=88, status="Available"),
            Driver(name="Sana Iyer", license_number="DL-SI-9912", license_category="LMV", license_expiry_date=date.today() + timedelta(days=250), contact_number="+91 98765 43213", safety_score=98, status="Off Duty"),
        ]
        db.add_all(users + vehicles + drivers)
        db.flush()
        active_trip = Trip(source="Bengaluru Hub", destination="Mysuru Distribution Center", vehicle_id=vehicles[1].id, driver_id=drivers[1].id, cargo_weight_kg=2800, planned_distance_km=150, revenue=42000, status="Dispatched")
        completed_trip = Trip(source="Bengaluru Hub", destination="Hosur Warehouse", vehicle_id=vehicles[0].id, driver_id=drivers[0].id, cargo_weight_kg=350, planned_distance_km=80, actual_distance_km=82, revenue=16000, status="Completed", completed_at=datetime.utcnow() - timedelta(days=2))
        maintenance = MaintenanceLog(vehicle_id=vehicles[2].id, description="Brake inspection and pad replacement", cost=12500, status="Open")
        expenses = [
            FuelExpense(vehicle_id=vehicles[0].id, expense_type="Fuel", liters=18, cost=1900, notes="Hosur delivery"),
            FuelExpense(vehicle_id=vehicles[1].id, expense_type="Fuel", liters=95, cost=9700, notes="Intercity dispatch"),
            FuelExpense(vehicle_id=vehicles[3].id, expense_type="Toll", liters=None, cost=1450, notes="North corridor toll"),
        ]
        db.add_all([active_trip, completed_trip, maintenance, *expenses])
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_data()
    yield


app = FastAPI(title="TransitOps API", version="1.0.0", description="Safe dispatch and fleet economics platform.", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=TokenResponse, tags=["authentication"])
def login(credentials: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password.")
    return TokenResponse(access_token=create_access_token(user), role=user.role, name=user.email.split("@")[0].title())


@app.get("/auth/me", tags=["authentication"])
def current_user(current_user: User = Depends(get_current_user)) -> dict:
    return {"id": current_user.id, "email": current_user.email, "role": current_user.role}


@app.get("/dashboard", tags=["dashboard"])
def dashboard(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    vehicles = db.query(Vehicle).all()
    drivers = db.query(Driver).all()
    total_vehicles = len(vehicles)
    vehicle_counts = {status: sum(vehicle.status == status for vehicle in vehicles) for status in ["Available", "On Trip", "In Shop", "Retired"]}
    driver_counts = {status: sum(driver.status == status for driver in drivers) for status in ["Available", "On Trip", "Off Duty", "Suspended"]}
    total_fuel = db.query(func.coalesce(func.sum(FuelExpense.cost), 0)).filter(FuelExpense.expense_type == "Fuel").scalar() or 0
    total_maintenance = db.query(func.coalesce(func.sum(MaintenanceLog.cost), 0)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Trip.revenue), 0)).filter(Trip.status == "Completed").scalar() or 0
    acquisition_cost = sum(vehicle.acquisition_cost for vehicle in vehicles)
    completed_distance = db.query(func.coalesce(func.sum(Trip.actual_distance_km), 0)).filter(Trip.status == "Completed").scalar() or 0
    fuel_liters = db.query(func.coalesce(func.sum(FuelExpense.liters), 0)).filter(FuelExpense.expense_type == "Fuel").scalar() or 0
    expiring_drivers = [driver_data(driver) for driver in drivers if driver.license_expiry_date <= date.today() + timedelta(days=30)]
    recent_rows = db.query(Trip, Vehicle, Driver).join(Vehicle, Trip.vehicle_id == Vehicle.id).join(Driver, Trip.driver_id == Driver.id).order_by(Trip.created_at.desc()).limit(6).all()
    return {
        "kpis": {
            "active_vehicles": vehicle_counts["On Trip"],
            "available_vehicles": vehicle_counts["Available"],
            "in_maintenance": vehicle_counts["In Shop"],
            "active_trips": db.query(Trip).filter(Trip.status == "Dispatched").count(),
            "pending_trips": db.query(Trip).filter(Trip.status == "Draft").count(),
            "drivers_on_duty": driver_counts["On Trip"],
            "fleet_utilization": round((vehicle_counts["On Trip"] / total_vehicles * 100) if total_vehicles else 0, 1),
            "operational_cost": round(total_fuel + total_maintenance, 2),
            "vehicle_roi": round(((total_revenue - total_fuel - total_maintenance) / acquisition_cost * 100) if acquisition_cost else 0, 2),
            "fuel_efficiency": round((completed_distance / fuel_liters) if fuel_liters else 0, 2),
        },
        "alerts": [{"type": "license", "message": f"{driver['name']} has a license expiring on {driver['license_expiry_date']}."} for driver in expiring_drivers],
        "fleet_status": [{"name": status, "value": count} for status, count in vehicle_counts.items() if count],
        "recent_trips": [trip_data(trip, vehicle, driver) for trip, vehicle, driver in recent_rows],
    }


@app.get("/vehicles", tags=["vehicles"])
def list_vehicles(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    return [vehicle_data(vehicle) for vehicle in db.query(Vehicle).order_by(Vehicle.plate_number).all()]


@app.post("/vehicles", status_code=status.HTTP_201_CREATED, tags=["vehicles"])
def create_vehicle(payload: VehicleCreate, _: User = Depends(require_roles("Fleet Manager")), db: Session = Depends(get_db)) -> dict:
    if db.query(Vehicle).filter(Vehicle.plate_number == payload.plate_number).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A vehicle with this registration number already exists.")
    vehicle = Vehicle(**payload.model_dump(), status="Available")
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle_data(vehicle)


@app.get("/drivers", tags=["drivers"])
def list_drivers(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    return [driver_data(driver) for driver in db.query(Driver).order_by(Driver.name).all()]


@app.post("/drivers", status_code=status.HTTP_201_CREATED, tags=["drivers"])
def create_driver(payload: DriverCreate, _: User = Depends(require_roles("Fleet Manager", "Safety Officer")), db: Session = Depends(get_db)) -> dict:
    if db.query(Driver).filter(Driver.license_number == payload.license_number).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A driver with this license number already exists.")
    driver = Driver(**payload.model_dump(), status="Available")
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver_data(driver)


@app.get("/trips", tags=["trips"])
def list_trips(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(Trip, Vehicle, Driver).join(Vehicle, Trip.vehicle_id == Vehicle.id).join(Driver, Trip.driver_id == Driver.id).order_by(Trip.created_at.desc()).all()
    return [trip_data(trip, vehicle, driver) for trip, vehicle, driver in rows]


@app.post("/trips", status_code=status.HTTP_201_CREATED, tags=["trips"])
def create_trip(payload: TripCreate, _: User = Depends(require_roles("Fleet Manager", "Driver")), db: Session = Depends(get_db)) -> dict:
    vehicle = db.get(Vehicle, payload.vehicle_id)
    driver = db.get(Driver, payload.driver_id)
    if not vehicle:
        raise not_found("Vehicle")
    if not driver:
        raise not_found("Driver")
    if payload.cargo_weight_kg > vehicle.capacity_kg:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Cargo weight exceeds {vehicle.plate_number}'s {vehicle.capacity_kg:g} kg capacity.")
    trip = Trip(**payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip_data(trip, vehicle, driver)


@app.post("/trips/{trip_id}/dispatch", tags=["trips"])
def dispatch_trip(trip_id: int, _: User = Depends(require_roles("Fleet Manager", "Driver")), db: Session = Depends(get_db)) -> dict:
    with db.begin():
        trip = db.get(Trip, trip_id)
        if not trip:
            raise not_found("Trip")
        if trip.status != "Draft":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft trips can be dispatched.")
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        if vehicle.status != "Available":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"{vehicle.plate_number} is {vehicle.status} and cannot be dispatched.")
        if driver.status != "Available":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"{driver.name} is {driver.status} and cannot be dispatched.")
        if driver.license_expiry_date <= date.today():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"{driver.name}'s license has expired.")
        if trip.cargo_weight_kg > vehicle.capacity_kg:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Cargo weight exceeds the assigned vehicle's capacity.")
        vehicle.status = "On Trip"
        driver.status = "On Trip"
        trip.status = "Dispatched"
    return trip_data(trip, vehicle, driver)


@app.post("/trips/{trip_id}/complete", tags=["trips"])
def complete_trip(trip_id: int, payload: TripComplete, _: User = Depends(require_roles("Fleet Manager", "Driver")), db: Session = Depends(get_db)) -> dict:
    with db.begin():
        trip = db.get(Trip, trip_id)
        if not trip:
            raise not_found("Trip")
        if trip.status != "Dispatched":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only dispatched trips can be completed.")
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        if payload.final_odometer_km < vehicle.odometer_km:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Final odometer cannot be lower than the current odometer.")
        vehicle.status = "Available"
        vehicle.odometer_km = payload.final_odometer_km
        driver.status = "Available"
        trip.status = "Completed"
        trip.actual_distance_km = payload.actual_distance_km
        trip.completed_at = datetime.utcnow()
        if payload.fuel_cost > 0:
            db.add(FuelExpense(vehicle_id=vehicle.id, expense_type="Fuel", liters=payload.fuel_liters, cost=payload.fuel_cost, notes=f"Trip #{trip.id} completion fuel"))
    return trip_data(trip, vehicle, driver)


@app.post("/trips/{trip_id}/cancel", tags=["trips"])
def cancel_trip(trip_id: int, _: User = Depends(require_roles("Fleet Manager", "Driver")), db: Session = Depends(get_db)) -> dict:
    with db.begin():
        trip = db.get(Trip, trip_id)
        if not trip:
            raise not_found("Trip")
        if trip.status not in {"Draft", "Dispatched"}:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only draft or dispatched trips can be cancelled.")
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        if trip.status == "Dispatched":
            vehicle.status = "Available"
            driver.status = "Available"
        trip.status = "Cancelled"
    return trip_data(trip, vehicle, driver)


@app.get("/maintenance", tags=["maintenance"])
def list_maintenance(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(MaintenanceLog, Vehicle).join(Vehicle, MaintenanceLog.vehicle_id == Vehicle.id).order_by(MaintenanceLog.logged_at.desc()).all()
    return [{"id": log.id, "vehicle_id": log.vehicle_id, "vehicle": vehicle.plate_number, "description": log.description, "cost": log.cost, "status": log.status, "logged_at": log.logged_at, "closed_at": log.closed_at} for log, vehicle in rows]


@app.post("/maintenance", status_code=status.HTTP_201_CREATED, tags=["maintenance"])
def create_maintenance(payload: MaintenanceCreate, _: User = Depends(require_roles("Fleet Manager")), db: Session = Depends(get_db)) -> dict:
    with db.begin():
        vehicle = db.get(Vehicle, payload.vehicle_id)
        if not vehicle:
            raise not_found("Vehicle")
        if vehicle.status == "On Trip":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A vehicle on a trip cannot enter maintenance.")
        if vehicle.status == "Retired":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A retired vehicle cannot enter maintenance.")
        vehicle.status = "In Shop"
        log = MaintenanceLog(**payload.model_dump())
        db.add(log)
    return {"id": log.id, "vehicle": vehicle.plate_number, "description": log.description, "cost": log.cost, "status": log.status}


@app.post("/maintenance/{maintenance_id}/close", tags=["maintenance"])
def close_maintenance(maintenance_id: int, _: User = Depends(require_roles("Fleet Manager")), db: Session = Depends(get_db)) -> dict:
    with db.begin():
        log = db.get(MaintenanceLog, maintenance_id)
        if not log:
            raise not_found("Maintenance log")
        if log.status != "Open":
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This maintenance record is already closed.")
        vehicle = db.get(Vehicle, log.vehicle_id)
        log.status = "Closed"
        log.closed_at = datetime.utcnow()
        if vehicle.status != "Retired":
            vehicle.status = "Available"
    return {"id": log.id, "status": log.status, "vehicle_status": vehicle.status}


@app.get("/expenses", tags=["expenses"])
def list_expenses(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    rows = db.query(FuelExpense, Vehicle).join(Vehicle, FuelExpense.vehicle_id == Vehicle.id).order_by(FuelExpense.logged_at.desc()).all()
    return [{"id": expense.id, "vehicle": vehicle.plate_number, "expense_type": expense.expense_type, "liters": expense.liters, "cost": expense.cost, "logged_at": expense.logged_at, "notes": expense.notes} for expense, vehicle in rows]


@app.post("/expenses", status_code=status.HTTP_201_CREATED, tags=["expenses"])
def create_expense(payload: FuelExpenseCreate, _: User = Depends(require_roles("Fleet Manager", "Financial Analyst")), db: Session = Depends(get_db)) -> dict:
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if not vehicle:
        raise not_found("Vehicle")
    expense = FuelExpense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return {"id": expense.id, "vehicle": vehicle.plate_number, "expense_type": expense.expense_type, "cost": expense.cost}
