export interface ActionLogItem {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  pid?: number;
  result: 'SUCCESS' | 'BLOCKED' | 'FAILED';
  userConfirmation: boolean;
  details: string;
}

export interface IActionLogService {
  logAction(item: Omit<ActionLogItem, 'id' | 'timestamp'>): ActionLogItem;
  getLogs(limit?: number): ActionLogItem[];
  clearLogs(): void;
}
