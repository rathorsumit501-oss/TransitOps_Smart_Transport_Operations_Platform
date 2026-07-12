from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class VehicleCreate(BaseModel):
    plate_number: str = Field(min_length=3, max_length=32)
    name: str = Field(min_length=2, max_length=100)
    vehicle_type: str = Field(min_length=2, max_length=50)
    region: str = Field(min_length=2, max_length=80)
    capacity_kg: float = Field(gt=0, le=100000)
    odometer_km: float = Field(ge=0)
    acquisition_cost: float = Field(gt=0)

    @field_validator("plate_number")
    @classmethod
    def normalize_plate(cls, value: str) -> str:
        return value.strip().upper()


class DriverCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    license_number: str = Field(min_length=4, max_length=60)
    license_category: str = Field(min_length=1, max_length=30)
    license_expiry_date: date
    contact_number: str = Field(min_length=7, max_length=30)
    safety_score: float = Field(ge=0, le=100)

    @field_validator("license_expiry_date")
    @classmethod
    def license_must_be_current(cls, value: date) -> date:
        if value <= date.today():
            raise ValueError("License expiry date must be in the future.")
        return value


class TripCreate(BaseModel):
    source: str = Field(min_length=2, max_length=120)
    destination: str = Field(min_length=2, max_length=120)
    vehicle_id: int = Field(gt=0)
    driver_id: int = Field(gt=0)
    cargo_weight_kg: float = Field(gt=0)
    planned_distance_km: float = Field(gt=0)
    revenue: float = Field(ge=0)


class TripComplete(BaseModel):
    final_odometer_km: float = Field(ge=0)
    actual_distance_km: float = Field(gt=0)
    fuel_liters: float = Field(ge=0)
    fuel_cost: float = Field(ge=0)


class MaintenanceCreate(BaseModel):
    vehicle_id: int = Field(gt=0)
    description: str = Field(min_length=3, max_length=500)
    cost: float = Field(gt=0)


class FuelExpenseCreate(BaseModel):
    vehicle_id: int = Field(gt=0)
    expense_type: str = Field(default="Fuel", min_length=2, max_length=30)
    liters: float | None = Field(default=None, ge=0)
    cost: float = Field(gt=0)
    notes: str | None = Field(default=None, max_length=500)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)


class TimestampResponse(BaseModel):
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
