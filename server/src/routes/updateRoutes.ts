import { Router } from 'express';
import { UpdateController } from '../controllers/UpdateController';

export function createUpdateRoutes(updateController: UpdateController): Router {
  const router = Router();

  router.get('/', updateController.getAllUpdates);
  router.get('/apt', updateController.getAptUpdates);
  router.get('/snap', updateController.getSnapUpdates);
  router.get('/flatpak', updateController.getFlatpakUpdates);
  router.post('/:manager/:package/approve', updateController.approveUpdate);
  router.get('/policy', updateController.getPolicySettings);
  router.put('/policy', updateController.updatePolicySettings);

  return router;
}
