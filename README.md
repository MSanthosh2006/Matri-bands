# Karuvil — Hospital Web App (corrected development build)

## Requirements
- Python 3.11+
- Node.js 20+
- macOS / Linux / Windows

## 1. Start the backend

Open Terminal:

```bash
cd fetus_tracker_/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Generate two different secrets and place them in `backend/.env`:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

Run the command twice; use the first output for `JWT_SECRET` and the second for `PIN_PEPPER`.

Start FastAPI:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check:
- API health: http://127.0.0.1:8000/api/health
- API docs: http://127.0.0.1:8000/docs

Keep this terminal open.

## 2. Start the frontend

Open a second Terminal:

```bash
cd fetus_tracker_/frontend
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).

If you change `frontend/.env`, stop and restart Vite.

## 3. Register and sign in
- Select **Register here**.
- Enter hospital name, administrator name and email.
- Hospital code is optional. Leave it blank to generate one automatically.
- Administrator password must be at least 12 characters.
- Registration creates the admin account and signs in.

## Notes
- The SQLite database is created in the backend working directory on first startup.
- Existing database files are intentionally not included in this corrected ZIP, so this clean package starts with an empty database. Keep a backup of any existing `fetus_tracker.db` before replacing your local project.
- Patient registration, demo consent and demo reading endpoints in this source are development-only. They are not production patient/device authentication.
- DEMO readings are simulated. This project is not a medical device and must not be used for diagnosis or clinical decisions.
- Before real patient use, implement authenticated patient consent, authenticated device ingestion, rate limiting and lockouts for six-digit PINs, encryption, HTTPS, audit controls, backups, retention policies and clinical validation.
