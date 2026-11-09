import { Router } from 'express';
import { login, me, dashboard, resourceController } from '../controllers/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { loginSchema, schemas, partialSchemas } from '../validators/index.js';

const router = Router();
router.post('/auth/login', validateBody(loginSchema), login);
router.use(authenticate);
router.get('/auth/me', me);
router.get('/dashboard', dashboard);

const resources = ['patients','doctors','appointments','medical-records','prescriptions'];
for (const resource of resources) {
  const controller = resourceController(resource);
  const base = `/${resource}`;
  router.get(base, controller.list);
  router.get(`${base}/:id`, controller.get);
  router.post(base, authorize('admin','doctor'), validateBody(schemas[resource]), controller.create);
  router.patch(`${base}/:id`, authorize('admin','doctor'), validateBody(partialSchemas[resource]), controller.update);
  router.delete(`${base}/:id`, authorize('admin'), controller.remove);
}

export default router;
