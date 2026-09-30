import dotenv from 'dotenv';
dotenv.config();

export class AppConfig {
  public static readonly PORT: number = parseInt(process.env.PORT || '3001', 10);
  public static readonly HOST: string = process.env.HOST || '127.0.0.1';
  public static readonly ENVIRONMENT: string = process.env.NODE_ENV || 'development';
  public static readonly MONITORING_INTERVAL_MS: number = parseInt(process.env.MONITORING_INTERVAL_MS || '1000', 10);
  public static readonly APP_NAME: string = 'Linux System Manager API';
}
