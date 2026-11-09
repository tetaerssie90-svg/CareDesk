import { z } from 'zod';

const optionalText = (max = 500) => z.string().max(max).optional().nullable();
const id = z.coerce.number().int().positive();

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200)
});

export const schemas = {
  patients: z.object({
    patient_number: z.string().trim().min(2).max(40),
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    date_of_birth: z.string().date(),
    sex: z.enum(['female','male','other','prefer_not_to_say']).optional().nullable(),
    phone: optionalText(40), email: z.union([z.string().email().max(254), z.literal(''), z.null()]).optional(),
    address: optionalText(1000), emergency_contact_name: optionalText(160),
    emergency_contact_phone: optionalText(40), blood_group: optionalText(5),
    allergies: optionalText(2000), status: z.enum(['active','inactive']).optional()
  }),
  doctors: z.object({
    full_name: z.string().trim().min(1).max(160),
    email: z.string().email().max(254), phone: optionalText(40),
    specialization: z.string().trim().min(1).max(120),
    license_number: optionalText(100), availability_notes: optionalText(2000)
  }),
  appointments: z.object({
    patient_id: id, doctor_id: id, scheduled_at: z.string().datetime(),
    reason: z.string().trim().min(2).max(2000),
    status: z.enum(['scheduled','confirmed','completed','cancelled','no_show']).optional(),
    notes: optionalText(2000)
  }),
  'medical-records': z.object({
    patient_id: id, doctor_id: id, appointment_id: id.optional().nullable(),
    visit_date: z.string().datetime().nullable().optional(), symptoms: optionalText(4000),
    diagnosis: z.string().trim().min(2).max(4000), treatment: optionalText(4000),
    clinical_notes: optionalText(6000)
  }),
  prescriptions: z.object({
    patient_id: id, doctor_id: id, medical_record_id: id.optional().nullable(),
    medication_name: z.string().trim().min(1).max(180),
    dosage: z.string().trim().min(1).max(120),
    frequency: z.string().trim().min(1).max(120),
    duration: optionalText(120), instructions: optionalText(3000)
  })
};

export const partialSchemas = Object.fromEntries(
  Object.entries(schemas).map(([key, schema]) => [key, schema.partial()])
);
