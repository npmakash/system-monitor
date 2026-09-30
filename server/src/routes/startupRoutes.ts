import { Router } from 'express';
import { StartupController } from '../controllers/StartupController';

export function createStartupRoutes(startupController: StartupController): Router {
  const router = Router();

  router.get('/', startupController.getStartupApps);

  return router;
}
