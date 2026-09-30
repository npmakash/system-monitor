import express, { Express } from 'express';
import cors from 'cors';
import { AppConfig } from '../config/AppConfig';
import { ProcFileReader } from '../system/ProcFileReader';
import { CommandExecutor } from '../system/CommandExecutor';
import { ProcessReader } from '../system/ProcessReader';
import { AptManager } from '../system/AptManager';
import { SnapManager } from '../system/SnapManager';
import { FlatpakManager } from '../system/FlatpakManager';
import { SystemdManager } from '../system/SystemdManager';
import { CpuService } from '../services/CpuService';
import { MemoryService } from '../services/MemoryService';
import { DiskService } from '../services/DiskService';
import { NetworkService } from '../services/NetworkService';
import { SystemMonitorService } from '../services/SystemMonitorService';
import { ProcessService } from '../services/ProcessService';
import { ProcessSafetyService } from '../services/ProcessSafetyService';
import { ActionLogService } from '../services/ActionLogService';
import { UpdatePolicyService } from '../services/UpdatePolicyService';
import { UpdateService } from '../services/UpdateService';
import { ServiceManager } from '../services/ServiceManager';
import { StartupAppService } from '../services/StartupAppService';
import { CleanerService } from '../services/CleanerService';

import { SystemController } from '../controllers/SystemController';
import { ProcessController } from '../controllers/ProcessController';
import { ActivityController } from '../controllers/ActivityController';
import { UpdateController } from '../controllers/UpdateController';
import { ServiceController } from '../controllers/ServiceController';
import { StartupController } from '../controllers/StartupController';
import { CleanerController } from '../controllers/CleanerController';

import { createSystemRoutes } from '../routes/systemRoutes';
import { createProcessRoutes } from '../routes/processRoutes';
import { createActivityRoutes } from '../routes/activityRoutes';
import { createUpdateRoutes } from '../routes/updateRoutes';
import { createServiceRoutes } from '../routes/serviceRoutes';
import { createStartupRoutes } from '../routes/startupRoutes';
import { createCleanerRoutes } from '../routes/cleanerRoutes';

import { SecurityMiddleware } from '../middleware/SecurityMiddleware';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { Logger } from '../utils/Logger';

export class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  private configureMiddleware(): void {
    this.app.use(cors({
      origin: '*', // Allowed for local management client
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(SecurityMiddleware.setSecurityHeaders);
    this.app.use(SecurityMiddleware.restrictToLocalhost);
  }

  private configureRoutes(): void {
    const procReader = new ProcFileReader();
    const commandExecutor = new CommandExecutor();
    const safetyService = new ProcessSafetyService();
    const actionLogService = new ActionLogService();

    const processReader = new ProcessReader(commandExecutor, safetyService);
    const systemdManager = new SystemdManager(commandExecutor);

    // Package Managers
    const aptManager = new AptManager(commandExecutor);
    const snapManager = new SnapManager(commandExecutor);
    const flatpakManager = new FlatpakManager(commandExecutor);

    const updatePolicyService = new UpdatePolicyService();
    const updateService = new UpdateService(
      [aptManager, snapManager, flatpakManager],
      updatePolicyService,
      actionLogService
    );

    const serviceManager = new ServiceManager(systemdManager, commandExecutor, actionLogService);
    const startupAppService = new StartupAppService();

    const cpuService = new CpuService(procReader);
    const memoryService = new MemoryService(procReader);
    const diskService = new DiskService(commandExecutor);
    const networkService = new NetworkService(procReader, commandExecutor);

    const processService = new ProcessService(
      processReader,
      safetyService,
      commandExecutor,
      actionLogService
    );

    const cleanerService = new CleanerService(commandExecutor);

    const systemMonitorService = new SystemMonitorService(
      cpuService,
      memoryService,
      diskService,
      networkService,
      procReader
    );

    const systemController = new SystemController(systemMonitorService);
    const processController = new ProcessController(processService);
    const activityController = new ActivityController(actionLogService);
    const updateController = new UpdateController(updateService, updatePolicyService);
    const serviceController = new ServiceController(serviceManager);
    const startupController = new StartupController(startupAppService);
    const cleanerController = new CleanerController(cleanerService);

    const systemRoutes = createSystemRoutes(systemController);
    const processRoutes = createProcessRoutes(processController);
    const activityRoutes = createActivityRoutes(activityController);
    const updateRoutes = createUpdateRoutes(updateController);
    const serviceRoutes = createServiceRoutes(serviceController);
    const startupRoutes = createStartupRoutes(startupController);
    const cleanerRoutes = createCleanerRoutes(cleanerController);

    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'UP',
        app: AppConfig.APP_NAME,
        environment: AppConfig.ENVIRONMENT,
        timestamp: new Date().toISOString(),
      });
    });

    // Mount API endpoints
    this.app.use('/api/system', systemRoutes);
    this.app.use('/api/processes', processRoutes);
    this.app.use('/api/activity', activityRoutes);
    this.app.use('/api/updates', updateRoutes);
    this.app.use('/api/services', serviceRoutes);
    this.app.use('/api/startup', startupRoutes);
    this.app.use('/api/cleaner', cleanerRoutes);
  }

  private configureErrorHandler(): void {
    this.app.use(ErrorHandler.handle);
  }

  public listen(): void {
    this.app.listen(AppConfig.PORT, AppConfig.HOST, () => {
      Logger.info('App', `${AppConfig.APP_NAME} running on http://${AppConfig.HOST}:${AppConfig.PORT}`);
    });
  }
}

// Start server if script executed directly
if (require.main === module) {
  const appInstance = new App();
  appInstance.listen();
}
