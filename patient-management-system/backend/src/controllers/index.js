import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, getDashboardStats, listResource, getResource, createResource, updateResource, deleteResource } from '../queries/queries.js';

export async function login(req, res, next) {
  try {
    const result = await findUserByEmail(req.body.email);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name } } });
  } catch (error) { next(error); }
}

export async function me(req, res) {
  res.json({ success: true, data: req.user });
}

export async function dashboard(req, res, next) {
  try { res.json({ success: true, data: await getDashboardStats() }); }
  catch (error) { next(error); }
}

export function resourceController(resource) {
  return {
    list: async (req, res, next) => {
      try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const result = await listResource(resource, { page, limit, search: String(req.query.search || '').slice(0, 100) });
        res.json({ success: true, ...result });
      } catch (error) { next(error); }
    },
    get: async (req, res, next) => {
      try {
        const item = await getResource(resource, req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
        res.json({ success: true, data: item });
      } catch (error) { next(error); }
    },
    create: async (req, res, next) => {
      try {
        const item = await createResource(resource, req.body);
        res.status(201).json({ success: true, message: 'Record created successfully.', data: item });
      } catch (error) { next(error); }
    },
    update: async (req, res, next) => {
      try {
        const item = await updateResource(resource, req.params.id, req.body);
        if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
        res.json({ success: true, message: 'Record updated successfully.', data: item });
      } catch (error) { next(error); }
    },
    remove: async (req, res, next) => {
      try {
        const item = await deleteResource(resource, req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
        res.json({ success: true, message: 'Record deleted successfully.' });
      } catch (error) { next(error); }
    }
  };
}
