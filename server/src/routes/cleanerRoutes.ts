import { Router } from 'express';
import { CleanerController } from '../controllers/CleanerController';

export function createCleanerRoutes(cleanerController: CleanerController): Router {
  const router = Router();

  router.get('/scan', cleanerController.scanJunk);
  router.post('/clean', cleanerController.cleanJunk);

  return router;
}
