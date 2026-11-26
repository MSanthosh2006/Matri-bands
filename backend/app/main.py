
from datetime import datetime, timezone, timedelta
from pathlib import Path
import secrets

from dotenv import load_dotenv

# Load backend/.env before importing database.py or security.py.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .database import Base, engine, get_db
from .models import Hospital, User, Patient, Consent, Reading, AuditLog
from .schemas import (
    HospitalRegister,
    Login,
    StaffCreate,
    PatientRegister,
    ReadingCreate,
)
from .security import (
    hash_password,
    verify_password,
    pin_digest,
    create_token,
    get_current_user,
    get_admin,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Karuvil API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def audit(db: Session, user, action: str, patient_id=None):
    entry = AuditLog(
        user_id=user.id,
        hospital_id=user.hospital_id,
        patient_id=patient_id,
        action=action,
    )
    db.add(entry)
    db.commit()


def patient_access(db: Session, patient_id: int, hospital_id: int):
    return db.query(Consent).filter_by(
        patient_id=patient_id,
        hospital_id=hospital_id,
        granted=True,
    ).first()


@app.get("/api/health")
def health():
    return {"status": "ok"}


# --------------------------------------------------
# HOSPITAL REGISTRATION
# --------------------------------------------------

@app.post("/api/hospitals/register")
def register_hospital(
    data: HospitalRegister,
    db: Session = Depends(get_db),
):
    requested_code = (data.hospital_code or "").strip().upper()
    code = requested_code or f"HSP-{secrets.token_hex(4).upper()}"
    email = str(data.email).strip().lower()

    if db.query(Hospital).filter_by(code=code).first():
        if requested_code:
            raise HTTPException(
                409,
                "Hospital code already exists. Leave it blank to generate one automatically.",
            )
        for _ in range(5):
            code = f"HSP-{secrets.token_hex(4).upper()}"
            if not db.query(Hospital).filter_by(code=code).first():
                break
        else:
            raise HTTPException(500, "Could not generate a unique hospital code.")

    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")

    hospital = Hospital(
        name=data.hospital_name.strip(),
        code=code,
    )

    db.add(hospital)
    db.flush()

    admin = User(
        hospital_id=hospital.id,
        name=data.admin_name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role="admin",
        active=True,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return {
        "access_token": create_token(admin),
        "token_type": "bearer",
        "user": {
            "name": admin.name,
            "email": admin.email,
            "role": admin.role,
        },
        "hospital": {
            "name": hospital.name,
            "code": hospital.code,
        },
    }


# --------------------------------------------------
# LOGIN - ADMIN, DOCTOR, NURSE
# --------------------------------------------------

@app.post("/api/auth/login")
def login(
    data: Login,
    db: Session = Depends(get_db),
):
    email = str(data.email).strip().lower()

    user = db.query(User).filter_by(email=email).first()

    if not user or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not user.active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive. Contact your hospital administrator.",
        )

    if user.role not in ("admin", "doctor", "nurse"):
        raise HTTPException(
            status_code=403,
            detail="This account does not have hospital access",
        )

    return {
        "access_token": create_token(user),
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@app.get("/api/me")
def me(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    hospital = db.get(Hospital, user.hospital_id)

    if not hospital:
        raise HTTPException(404, "Hospital not found")

    return {
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "hospital": hospital.name,
        "hospital_id": user.hospital_id,
    }


# --------------------------------------------------
# STAFF MANAGEMENT
# Admin creates doctor and nurse accounts
# --------------------------------------------------

@app.post("/api/staff")
def create_staff(
    data: StaffCreate,
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    if data.role not in ("doctor", "nurse"):
        raise HTTPException(
            400,
            "Staff role must be doctor or nurse",
        )

    email = str(data.email).strip().lower()

    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "Email already registered")

    staff = User(
        hospital_id=admin.hospital_id,
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(data.password),
        role=data.role,
        active=True,
    )

    db.add(staff)
    db.commit()
    db.refresh(staff)

    return {
        "message": "Staff account created successfully",
        "staff": {
            "id": staff.id,
            "name": staff.name,
            "email": staff.email,
            "role": staff.role,
        },
    }


@app.get("/api/staff")
def get_staff(
    admin=Depends(get_admin),
    db: Session = Depends(get_db),
):
    staff = db.query(User).filter(
        User.hospital_id == admin.hospital_id,
        User.role.in_(["doctor", "nurse"]),
    ).order_by(User.name).all()

    return [
        {
            "id": person.id,
            "name": person.name,
            "email": person.email,
            "role": person.role,
            "active": person.active,
        }
        for person in staff
    ]


# --------------------------------------------------
# PATIENT REGISTRATION
# Development endpoint - patient authentication
# must be implemented before production.
# --------------------------------------------------

@app.post("/api/patient-app/register")
def register_patient(
    data: PatientRegister,
    db: Session = Depends(get_db),
):
    digest = pin_digest(data.pin)

    if db.query(Patient).filter_by(
        pin_digest=digest
    ).first():
        raise HTTPException(409, "PIN already exists")

    patient = Patient(
        full_name=data.full_name,
        phone=data.phone,
        pregnancy_week=data.pregnancy_week,
        due_date=data.due_date,
        pin_digest=digest,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {"patient_id": patient.id}


# DEVELOPMENT TEST ONLY
# Replace with authenticated patient consent before production.

@app.post("/api/patient-app/demo-consent")
def demo_consent(
    patient_id: int,
    hospital_code: str,
    granted: bool,
    db: Session = Depends(get_db),
):
    patient = db.get(Patient, patient_id)

    hospital = db.query(Hospital).filter_by(
        code=hospital_code.strip().upper()
    ).first()

    if not patient or not hospital:
        raise HTTPException(
            404,
            "Patient or hospital not found",
        )

    consent = db.query(Consent).filter_by(
        patient_id=patient_id,
        hospital_id=hospital.id,
    ).first()

    if consent:
        consent.granted = granted
    else:
        consent = Consent(
            patient_id=patient_id,
            hospital_id=hospital.id,
            granted=granted,
        )
        db.add(consent)

    db.commit()

    return {"consent": consent.granted}


# DEVELOPMENT ONLY
# Production requires authenticated patient/device requests.

@app.post("/api/patient-app/readings")
def add_reading(
    patient_id: int,
    data: ReadingCreate,
    db: Session = Depends(get_db),
):
    if not db.get(Patient, patient_id):
        raise HTTPException(404, "Patient not found")

    reading = Reading(
        patient_id=patient_id,
        metric=data.metric,
        value=data.value,
        unit=data.unit,
        source=data.source.upper(),
    )

    db.add(reading)
    db.commit()

    return {"message": "Reading saved"}


# --------------------------------------------------
# DASHBOARD
# --------------------------------------------------

@app.get("/api/dashboard")
def dashboard(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consents = db.query(Consent).filter_by(
        hospital_id=user.hospital_id,
        granted=True,
    ).all()

    patient_ids = [c.patient_id for c in consents]

    staff_count = db.query(User).filter(
        User.hospital_id == user.hospital_id,
        User.active == True,
        User.role.in_(["doctor", "nurse"]),
    ).count()

    if patient_ids:
        readings_today = db.query(Reading).filter(
            Reading.patient_id.in_(patient_ids),
            Reading.measured_at >= (
                datetime.now(timezone.utc) - timedelta(hours=24)
            ),
        ).count()
    else:
        readings_today = 0

    return {
        "authorized_patients": len(patient_ids),
        "staff_count": staff_count,
        "readings_today": readings_today,
    }


# --------------------------------------------------
# PATIENT LOOKUP
# --------------------------------------------------

@app.post("/api/patients/lookup")
def find_patient(
    pin: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if len(pin) != 6 or not pin.isdigit():
        raise HTTPException(400, "Enter a six-digit PIN")

    patient = db.query(Patient).filter_by(
        pin_digest=pin_digest(pin)
    ).first()

    if not patient:
        raise HTTPException(404, "Patient not found")

    if not patient_access(
        db,
        patient.id,
        user.hospital_id,
    ):
        raise HTTPException(
            403,
            "Patient has not granted access to this hospital",
        )

    audit(db, user, "PATIENT_VIEWED", patient.id)

    return {
        "id": patient.id,
        "full_name": patient.full_name,
        "phone": patient.phone,
        "pregnancy_week": patient.pregnancy_week,
        "due_date": patient.due_date,
    }


# --------------------------------------------------
# AUTHORIZED PATIENT LIST
# --------------------------------------------------

@app.get("/api/patients")
def get_patients(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    consents = db.query(Consent).filter_by(
        hospital_id=user.hospital_id,
        granted=True,
    ).all()

    ids = [c.patient_id for c in consents]

    if not ids:
        return []

    patients = db.query(Patient).filter(
        Patient.id.in_(ids)
    ).all()

    return [
        {
            "id": p.id,
            "full_name": p.full_name,
            "pregnancy_week": p.pregnancy_week,
            "due_date": p.due_date,
            "phone": p.phone,
        }
        for p in patients
    ]


# --------------------------------------------------
# PATIENT READINGS
# --------------------------------------------------

@app.get("/api/patients/{patient_id}/readings")
def get_readings(
    patient_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    patient = db.get(Patient, patient_id)

    if not patient:
        raise HTTPException(404, "Patient not found")

    if not patient_access(
        db,
        patient_id,
        user.hospital_id,
    ):
        raise HTTPException(403, "Patient access denied")

    rows = db.query(Reading).filter_by(
        patient_id=patient_id
    ).order_by(
        desc(Reading.measured_at)
    ).limit(100).all()

    now = datetime.now(timezone.utc)
    result = []

    for reading in rows:
        measured = reading.measured_at

        if measured.tzinfo is None:
            measured = measured.replace(tzinfo=timezone.utc)

        age = (now - measured).total_seconds()

        if age <= 120:
            status = "ONLINE"
        elif age <= 900:
            status = "STALE"
        else:
            status = "OFFLINE"

        result.append({
            "metric": reading.metric,
            "value": reading.value,
            "unit": reading.unit,
            "source": reading.source,
            "measured_at": measured.isoformat(),
            "status": status,
        })

    audit(db, user, "READINGS_VIEWED", patient_id)

    return {"readings": result}


# --------------------------------------------------
# AUDIT LOG
# --------------------------------------------------

@app.get("/api/audit")
def get_audit(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(AuditLog).filter_by(
        hospital_id=user.hospital_id
    ).order_by(
        desc(AuditLog.created_at)
    ).limit(100).all()

    return [
        {
            "action": row.action,
            "patient_id": row.patient_id,
            "user_id": row.user_id,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]
