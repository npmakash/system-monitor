import React, { useState, useEffect } from 'react';
import { History, Trash2, RefreshCw, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import type { ActionLogItem } from '../types/system';
import { fetchActivityLogs, clearActivityLogs } from '../services/api';

export const ActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActionLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchActivityLogs(100);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = async () => {
    if (!window.confirm('Clear all recorded system activity logs?')) return;
    try {
      await clearActivityLogs();
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  const getResultBadge = (result: ActionLogItem['result']) => {
    switch (result) {
      case 'SUCCESS':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
            <CheckCircle size={12} /> Success
          </span>
        );
      case 'BLOCKED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }}>
            <ShieldAlert size={12} /> Blocked
          </span>
        );
      case 'FAILED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }}>
            <XCircle size={12} /> Failed
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Activity & Audit Log</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Historical record of system management actions, safety checks, and user confirmations
        </p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History color="#00f2fe" />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{logs.length} Logged Actions</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'none' }} onClick={loadLogs} disabled={isLoading}>
              <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button className="btn-danger" onClick={handleClear} disabled={logs.length === 0} style={{ opacity: logs.length === 0 ? 0.4 : 1 }}>
              <Trash2 size={14} style={{ marginRight: '4px' }} /> Clear Logs
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No activity logs recorded yet. System management actions will appear here.
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Confirmed</th>
                  <th>Result</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{log.action}</td>
                    <td style={{ fontWeight: 600, color: '#00f2fe' }}>{log.target}</td>
                    <td>
                      <span style={{ fontSize: '11px', color: log.userConfirmation ? '#10b981' : '#9ca3af' }}>
                        {log.userConfirmation ? 'Yes' : 'Auto'}
                      </span>
                    </td>
                    <td>{getResultBadge(log.result)}</td>
                    <td style={{ color: '#9ca3af', fontSize: '12px', maxWidth: '300px' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
