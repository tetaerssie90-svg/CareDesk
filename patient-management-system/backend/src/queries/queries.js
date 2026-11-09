import { query } from '../db/index.js';

export const findUserByEmail = (email) =>
  query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

export const getDashboardStats = async () => {
  const [patients, doctors, appointments, upcoming, recent] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM patients'),
    query('SELECT COUNT(*)::int AS count FROM doctors'),
    query("SELECT COUNT(*)::int AS count FROM appointments WHERE scheduled_at::date = CURRENT_DATE"),
    query("SELECT COUNT(*)::int AS count FROM appointments WHERE scheduled_at >= NOW() AND status IN ('scheduled','confirmed')"),
    query(`SELECT id, patient_number, first_name, last_name, status, created_at
           FROM patients ORDER BY created_at DESC LIMIT 6`)
  ]);
  return {
    totalPatients: patients.rows[0].count,
    totalDoctors: doctors.rows[0].count,
    appointmentsToday: appointments.rows[0].count,
    upcomingAppointments: upcoming.rows[0].count,
    recentPatients: recent.rows
  };
};

const configs = {
  patients: {
    table: 'patients',
    columns: ['patient_number','first_name','last_name','date_of_birth','sex','phone','email','address','emergency_contact_name','emergency_contact_phone','blood_group','allergies','status'],
    searchable: ['first_name','last_name','patient_number','email','phone'],
    select: '*'
  },
  doctors: {
    table: 'doctors',
    columns: ['full_name','email','phone','specialization','license_number','availability_notes'],
    searchable: ['full_name','email','specialization','license_number'],
    select: '*'
  },
  appointments: {
    table: 'appointments',
    columns: ['patient_id','doctor_id','scheduled_at','reason','status','notes'],
    searchable: ['reason','status'],
    select: `appointments.*, patients.first_name || ' ' || patients.last_name AS patient_name,
             doctors.full_name AS doctor_name`,
    joins: ' JOIN patients ON patients.id = appointments.patient_id JOIN doctors ON doctors.id = appointments.doctor_id'
  },
  'medical-records': {
    table: 'medical_records',
    columns: ['patient_id','doctor_id','appointment_id','visit_date','symptoms','diagnosis','treatment','clinical_notes'],
    searchable: ['diagnosis','symptoms'],
    select: `medical_records.*, patients.first_name || ' ' || patients.last_name AS patient_name,
             doctors.full_name AS doctor_name`,
    joins: ' JOIN patients ON patients.id = medical_records.patient_id JOIN doctors ON doctors.id = medical_records.doctor_id'
  },
  prescriptions: {
    table: 'prescriptions',
    columns: ['patient_id','doctor_id','medical_record_id','medication_name','dosage','frequency','duration','instructions'],
    searchable: ['medication_name','dosage','frequency'],
    select: `prescriptions.*, patients.first_name || ' ' || patients.last_name AS patient_name,
             doctors.full_name AS doctor_name`,
    joins: ' JOIN patients ON patients.id = prescriptions.patient_id JOIN doctors ON doctors.id = prescriptions.doctor_id'
  }
};

export async function listResource(resource, { page = 1, limit = 10, search = '' } = {}) {
  const config = configs[resource];
  const offset = (page - 1) * limit;
  const params = [];
  let where = '';
  if (search && config.searchable.length) {
    params.push(`%${search}%`);
    where = ` WHERE (${config.searchable.map((column) => `${resource === 'appointments' || resource === 'medical-records' || resource === 'prescriptions' ? resource.replaceAll('-', '_') : config.table}.${column} ILIKE $1`).join(' OR ')})`;
  }
  const tableAlias = resource.replaceAll('-', '_');
  const from = `${config.table}${config.joins || ''}`;
  const count = await query(`SELECT COUNT(*)::int AS total FROM ${from}${where}`, params);
  const rows = await query(
    `SELECT ${config.select} FROM ${from}${where} ORDER BY ${tableAlias}.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );
  return { data: rows.rows, pagination: { page, limit, total: count.rows[0].total, pages: Math.ceil(count.rows[0].total / limit) } };
}

export async function getResource(resource, id) {
  const config = configs[resource];
  const alias = resource.replaceAll('-', '_');
  const result = await query(`SELECT ${config.select} FROM ${config.table}${config.joins || ''} WHERE ${alias}.id = $1`, [id]);
  return result.rows[0];
}

export async function createResource(resource, data) {
  const config = configs[resource];
  const entries = Object.entries(data).filter(([key, value]) => config.columns.includes(key) && value !== undefined);
  const columns = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await query(
    `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function updateResource(resource, id, data) {
  const config = configs[resource];
  const entries = Object.entries(data).filter(([key, value]) => config.columns.includes(key) && value !== undefined);
  if (!entries.length) return getResource(resource, id);
  const sets = entries.map(([key], index) => `${key} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);
  const result = await query(
    `UPDATE ${config.table} SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function deleteResource(resource, id) {
  const result = await query(`DELETE FROM ${configs[resource].table} WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
}
