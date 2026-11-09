CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE doctors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  phone VARCHAR(40),
  specialization VARCHAR(120) NOT NULL,
  license_number VARCHAR(100) UNIQUE,
  availability_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_number VARCHAR(40) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  sex VARCHAR(20) CHECK (sex IN ('female', 'male', 'other', 'prefer_not_to_say')),
  phone VARCHAR(40),
  email VARCHAR(254),
  address TEXT,
  emergency_contact_name VARCHAR(160),
  emergency_contact_phone VARCHAR(40),
  blood_group VARCHAR(5),
  allergies TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX patients_name_idx ON patients (LOWER(last_name), LOWER(first_name));
CREATE INDEX patients_created_at_idx ON patients (created_at DESC);

CREATE TABLE appointments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX appointments_scheduled_at_idx ON appointments (scheduled_at);
CREATE INDEX appointments_patient_idx ON appointments (patient_id);

CREATE TABLE medical_records (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  appointment_id BIGINT REFERENCES appointments(id) ON DELETE SET NULL,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  symptoms TEXT,
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  clinical_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX medical_records_patient_idx ON medical_records (patient_id, visit_date DESC);

CREATE TABLE prescriptions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  medical_record_id BIGINT REFERENCES medical_records(id) ON DELETE SET NULL,
  medication_name VARCHAR(180) NOT NULL,
  dosage VARCHAR(120) NOT NULL,
  frequency VARCHAR(120) NOT NULL,
  duration VARCHAR(120),
  instructions TEXT,
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX prescriptions_patient_idx ON prescriptions (patient_id, prescribed_at DESC);
