import { Router } from 'express';
import { SystemController } from '../controllers/SystemController';

export function createSystemRoutes(systemController: SystemController): Router {
  const router = Router();

  router.get('/summary', systemController.getSummary);
  router.get('/cpu', systemController.getCpu);
  router.get('/memory', systemController.getMemory);
  router.get('/disk', systemController.getDisk);
  router.get('/network', systemController.getNetwork);
  router.get('/info', systemController.getInfo);

  return router;
}
