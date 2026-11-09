# CareDesk — Patient Management System

A full-stack learning project built with **Node.js, Express, PostgreSQL, React and Vite**. The backend follows the same layered style as the supplied student-management project: **routes → controllers → queries**, with dedicated database, middleware, validators, scripts and SQL migrations.

> **Development and education use only.** This starter is not a certified electronic health record or a clinically validated product. Use synthetic/demo data only. Do not enter real patient information or deploy it for clinical use until qualified security, privacy, legal and clinical reviews have been completed. The current doctor role is a basic role gate; it does not yet implement patient-by-patient or care-team record isolation.

## Included features

- JWT login with Admin and Doctor roles
- Dashboard statistics and recent patient registrations
- Patient registration, search, pagination, update and admin-only deletion
- Doctor directory
- Appointment scheduling and status tracking
- Medical records and prescriptions
- PostgreSQL schema managed through immutable SQL migration files
- Zod request validation and centralized API errors
- Password hashing with bcrypt
- Helmet security headers, CORS configuration and API rate limiting
- Responsive React dashboard with protected pages and API integration

## Technology requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer
- npm

## Project structure

```text
patient-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/index.js
│   │   ├── db/index.js
│   │   ├── middleware/
│   │   ├── migrations/1_initial_schema.sql
│   │   ├── queries/queries.js
│   │   ├── routes/index.js
│   │   ├── scripts/
│   │   ├── validators/index.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── styles.css
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## 1. Create the PostgreSQL database

Open PostgreSQL (for example, pgAdmin or `psql`) and run:

```sql
CREATE DATABASE patient_management;
```

If the database already exists, do not run the create command again.

## 2. Configure and start the backend

Open a terminal in the project folder:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Open `backend/.env` and configure your own local database credentials and a long random JWT secret:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/patient_management
DATABASE_SSL=false
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
```

Do not use the example JWT secret in a real environment. Do not commit `.env` or share its contents.

Run the database migration:

```powershell
npm run db:migrate
```

Create the first administrator account:

```powershell
npm run admin:create
```

Enter an email and a password of at least 12 characters when prompted. The password is hashed before it is stored. There is no default administrator password.

Start the API:

```powershell
npm run dev
```

The API runs at `http://localhost:3000`. Check the database-backed health endpoint at `http://localhost:3000/health`.

### Creating doctor accounts

First, sign in as an administrator and add the doctor's professional profile from the **Doctors** page. Then, from the backend terminal, run:

```powershell
npm run doctor:create
```

Enter the doctor's name, login email and a password of at least 12 characters. The login account has the `doctor` role. The profile and login account are separate records in this starter and should use the same email for easier administration.

## 3. Configure and start the frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the React development server:

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser and sign in with the administrator credentials created above.

## 4. API endpoints

Base URL: `http://localhost:3000/api`

Except for login, all API routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Get the authenticated user |
| GET | `/dashboard` | Dashboard summary |
| GET, POST | `/patients` | List or register patients |
| GET, PATCH, DELETE | `/patients/:id` | Read, update or admin-delete a patient |
| GET, POST | `/doctors` | List or add doctor profiles |
| GET, PATCH, DELETE | `/doctors/:id` | Read, update or admin-delete a doctor profile |
| GET, POST | `/appointments` | List or schedule appointments |
| GET, PATCH, DELETE | `/appointments/:id` | Read, update or admin-delete an appointment |
| GET, POST | `/medical-records` | List or create medical records |
| GET, PATCH, DELETE | `/medical-records/:id` | Read, update or admin-delete a medical record |
| GET, POST | `/prescriptions` | List or create prescriptions |
| GET, PATCH, DELETE | `/prescriptions/:id` | Read, update or admin-delete a prescription |

List endpoints support `page`, `limit` and `search` query parameters. The maximum page size is 100.

Example login request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-admin-password"
}
```

Example patient request (send the token in the Authorization header):

```json
{
  "patient_number": "PT-0001",
  "first_name": "Alex",
  "last_name": "Sample",
  "date_of_birth": "1998-04-12",
  "sex": "prefer_not_to_say",
  "phone": "+250700000000",
  "status": "active"
}
```

Use fictional values only while developing and testing.

## 5. Database tables

- `users` — administrator and doctor login accounts
- `patients` — demographic and contact information
- `doctors` — clinician profiles
- `appointments` — scheduled patient visits
- `medical_records` — consultation and treatment notes
- `prescriptions` — medication instructions

The initial schema is in `backend/src/migrations/1_initial_schema.sql`. **Do not edit a migration after it has been applied.** If the schema needs to change, add a new numbered SQL migration file and apply it with `npm run db:migrate`. This prevents migration hash mismatch errors and keeps teammates' databases consistent.

## 6. Useful commands

Run these from `backend/`:

```powershell
npm run dev          # Start backend with nodemon
npm start            # Start backend normally
npm run db:migrate   # Apply pending migrations
npm run admin:create # Create the first admin login
npm run doctor:create # Create a doctor login
npm run db:check     # Check the API health endpoint (API must be running)
```

Run these from `frontend/`:

```powershell
npm run dev     # Start Vite
npm run build   # Build production frontend files
npm run preview # Preview the production build
```

## 7. Before any real-world deployment

This project is a starting point, not a production-ready health-information system. Before any real patient data is used:

- Implement and independently test patient-level and care-team authorization for every read and write.
- Add immutable audit logs for access to and changes in clinical records.
- Review authentication/session design, password reset, MFA, rate limits, secure cookies/token storage, CSRF and account lockout controls.
- Add encryption and key management appropriate to the deployment, secure backups and tested restoration procedures.
- Define consent, retention, correction, export, deletion, breach response and staff access policies.
- Obtain qualified legal/privacy review for applicable Rwanda data-protection and health-sector requirements.
- Complete clinical safety review, penetration testing, dependency scanning and operational monitoring.
- Use HTTPS and managed PostgreSQL; store credentials in the hosting provider's secret manager.

The frontend stores its bearer token in browser local storage for this learning starter. Review and replace that approach as part of a production security design.
