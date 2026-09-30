import type {
  SystemSummary,
  CpuInfo,
  MemoryInfo,
  DiskInfo,
  NetworkInfo,
  ProcessInfo,
  ProcessSummary,
  ActionLogItem,
  UpdateSummary,
  UpdatePolicySettings,
  ServiceInfo,
  StartupAppInfo,
  JunkScanResult,
} from '../types/system';

const API_BASE = 'http://127.0.0.1:3001/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `HTTP error ${res.status}`);
  }
  const body = await res.json();
  if (body.success === false) {
    throw new Error(body.error?.message || 'API request failed');
  }
  return body.data !== undefined ? body.data : body;
}

export async function fetchSystemSummary(): Promise<SystemSummary> {
  const res = await fetch(`${API_BASE}/system/summary`);
  return handleResponse<SystemSummary>(res);
}

export async function fetchCpuInfo(): Promise<CpuInfo> {
  const res = await fetch(`${API_BASE}/system/cpu`);
  return handleResponse<CpuInfo>(res);
}

export async function fetchMemoryInfo(): Promise<MemoryInfo> {
  const res = await fetch(`${API_BASE}/system/memory`);
  return handleResponse<MemoryInfo>(res);
}

export async function fetchDiskInfo(): Promise<DiskInfo[]> {
  const res = await fetch(`${API_BASE}/system/disk`);
  return handleResponse<DiskInfo[]>(res);
}

export async function fetchNetworkInfo(): Promise<NetworkInfo> {
  const res = await fetch(`${API_BASE}/system/network`);
  return handleResponse<NetworkInfo>(res);
}

export async function fetchProcesses(): Promise<ProcessSummary> {
  const res = await fetch(`${API_BASE}/processes`);
  return handleResponse<ProcessSummary>(res);
}

export async function fetchProcessByPid(pid: number): Promise<ProcessInfo> {
  const res = await fetch(`${API_BASE}/processes/${pid}`);
  return handleResponse<ProcessInfo>(res);
}

export async function stopProcess(pid: number, signal = 'SIGTERM', userConfirmed = true): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/processes/${pid}/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signal, userConfirmed }),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function restartProcess(pid: number, userConfirmed = true): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/processes/${pid}/restart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userConfirmed }),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function fetchUpdates(): Promise<UpdateSummary> {
  const res = await fetch(`${API_BASE}/updates`);
  return handleResponse<UpdateSummary>(res);
}

export async function approveUpdate(manager: string, pkgName: string, userConfirmed = true): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/updates/${manager}/${encodeURIComponent(pkgName)}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userConfirmed }),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function fetchUpdatePolicy(): Promise<UpdatePolicySettings> {
  const res = await fetch(`${API_BASE}/updates/policy`);
  return handleResponse<UpdatePolicySettings>(res);
}

export async function saveUpdatePolicy(policy: Partial<UpdatePolicySettings>): Promise<UpdatePolicySettings> {
  const res = await fetch(`${API_BASE}/updates/policy`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policy),
  });
  return handleResponse<UpdatePolicySettings>(res);
}

export async function fetchServices(): Promise<ServiceInfo[]> {
  const res = await fetch(`${API_BASE}/services`);
  return handleResponse<ServiceInfo[]>(res);
}

export async function controlService(name: string, action: 'start' | 'stop' | 'restart', userConfirmed = true): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/services/${encodeURIComponent(name)}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userConfirmed }),
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function fetchStartupApps(): Promise<StartupAppInfo[]> {
  const res = await fetch(`${API_BASE}/startup`);
  return handleResponse<StartupAppInfo[]>(res);
}

export async function fetchActivityLogs(limit = 100): Promise<ActionLogItem[]> {
  const res = await fetch(`${API_BASE}/activity?limit=${limit}`);
  return handleResponse<ActionLogItem[]>(res);
}

export async function clearActivityLogs(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/activity`, {
    method: 'DELETE',
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function scanJunk(): Promise<JunkScanResult> {
  const res = await fetch(`${API_BASE}/cleaner/scan`);
  return handleResponse<JunkScanResult>(res);
}

export async function cleanJunk(targetIds: string[]): Promise<{ cleanedBytes: number; cleanedMB: number; results: string[] }> {
  const res = await fetch(`${API_BASE}/cleaner/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetIds }),
  });
  return handleResponse<{ cleanedBytes: number; cleanedMB: number; results: string[] }>(res);
}
