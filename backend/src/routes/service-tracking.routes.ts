import { Router } from 'express';
import {
  getServiceTrackingByEmail,
  getServiceTrackingById
} from '../store/service-tracking.store';

const router = Router();

// get all services for logged-in user
router.get('/service-tracking', (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const services = getServiceTrackingByEmail(email);
  return res.json(services);
});

// get single service
router.get('/service-tracking/:id', (req, res) => {
  const service = getServiceTrackingById(req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  return res.json(service);
});

export default router;
