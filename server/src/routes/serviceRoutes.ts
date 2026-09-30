import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';

export function createServiceRoutes(serviceController: ServiceController): Router {
  const router = Router();

  router.get('/', serviceController.getServices);
  router.post('/:name/start', serviceController.startService);
  router.post('/:name/stop', serviceController.stopService);
  router.post('/:name/restart', serviceController.restartService);

  return router;
}
