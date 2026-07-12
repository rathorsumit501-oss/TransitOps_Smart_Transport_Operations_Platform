from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50))


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plate_number: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    vehicle_type: Mapped[str] = mapped_column(String(50))
    region: Mapped[str] = mapped_column(String(80), default="Central")
    status: Mapped[str] = mapped_column(String(30), default="Available")
    capacity_kg: Mapped[float] = mapped_column(Float)
    odometer_km: Mapped[float] = mapped_column(Float, default=0)
    acquisition_cost: Mapped[float] = mapped_column(Float)


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    license_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    license_category: Mapped[str] = mapped_column(String(30))
    license_expiry_date: Mapped[date] = mapped_column(Date)
    contact_number: Mapped[str] = mapped_column(String(30))
    safety_score: Mapped[float] = mapped_column(Float, default=100)
    status: Mapped[str] = mapped_column(String(30), default="Available")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source: Mapped[str] = mapped_column(String(120))
    destination: Mapped[str] = mapped_column(String(120))
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"))
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"))
    cargo_weight_kg: Mapped[float] = mapped_column(Float)
    planned_distance_km: Mapped[float] = mapped_column(Float)
    actual_distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    revenue: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(30), default="Draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"))
    description: Mapped[str] = mapped_column(Text)
    cost: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class FuelExpense(Base):
    __tablename__ = "fuel_expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"))
    expense_type: Mapped[str] = mapped_column(String(30), default="Fuel")
    liters: Mapped[float | None] = mapped_column(Float, nullable=True)
    cost: Mapped[float] = mapped_column(Float)
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
