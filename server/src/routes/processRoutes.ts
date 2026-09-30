import { Router } from 'express';
import { ProcessController } from '../controllers/ProcessController';

export function createProcessRoutes(processController: ProcessController): Router {
  const router = Router();

  router.get('/', processController.getProcesses);
  router.get('/:pid', processController.getProcessByPid);
  router.post('/:pid/stop', processController.stopProcess);
  router.post('/:pid/restart', processController.restartProcess);

  return router;
}
