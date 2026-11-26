from pydantic import BaseModel, EmailStr, Field


class HospitalRegister(BaseModel):
    hospital_name: str = Field(min_length=2, max_length=160)
    hospital_code: str | None = Field(default=None, max_length=32)
    admin_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=12, max_length=72)


class Login(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class StaffCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=12, max_length=72)
    role: str


class PatientRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    pin: str = Field(pattern=r"^\d{6}$")
    phone: str | None = None
    pregnancy_week: int | None = Field(default=None, ge=1, le=45)
    due_date: str | None = None


class ReadingCreate(BaseModel):
    metric: str = Field(min_length=1, max_length=64)
    value: float
    unit: str = Field(min_length=1, max_length=20)
    source: str = "DEMO"
