from datetime import datetime, timezone
from sqlalchemy import (
    String, Integer, Boolean, DateTime,
    ForeignKey, Float, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    code: Mapped[str] = mapped_column(
        String(32), unique=True, index=True
    )

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    hospital_id: Mapped[int] = mapped_column(
        ForeignKey("hospitals.id")
    )
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(
        String(255), unique=True
    )
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="doctor")
    active: Mapped[bool] = mapped_column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(
        String(30), nullable=True
    )
    pregnancy_week: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    due_date: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    pin_digest: Mapped[str] = mapped_column(
        String(128), unique=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

class Consent(Base):
    __tablename__ = "consents"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id")
    )
    hospital_id: Mapped[int] = mapped_column(
        ForeignKey("hospitals.id")
    )
    granted: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("patient_id", "hospital_id"),
    )

class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id")
    )
    metric: Mapped[str] = mapped_column(String(64))
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(20))
    source: Mapped[str] = mapped_column(
        String(20), default="DEMO"
    )
    measured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    hospital_id: Mapped[int] = mapped_column(
        ForeignKey("hospitals.id")
    )
    patient_id: Mapped[int | None] = mapped_column(
        ForeignKey("patients.id"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )