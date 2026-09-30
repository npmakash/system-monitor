import { Router } from 'express';
import { ActivityController } from '../controllers/ActivityController';

export function createActivityRoutes(activityController: ActivityController): Router {
  const router = Router();

  router.get('/', activityController.getLogs);
  router.delete('/', activityController.clearLogs);

  return router;
}
