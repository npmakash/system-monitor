import React, { useState } from 'react';
import { Search, AlertTriangle, RefreshCw, Eye, ShieldCheck, X } from 'lucide-react';
import type { ProcessSummary, ProcessInfo } from '../types/system';
import { stopProcess, restartProcess } from '../services/api';

interface ProcessManagerProps {
  summary: ProcessSummary | null;
  onRefresh: () => void;
}

export const ProcessManager: React.FC<ProcessManagerProps> = ({ summary, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'mem' | 'pid'>('cpu');
  const [selectedProcess, setSelectedProcess] = useState<ProcessInfo | null>(null);
  const [detailProcess, setDetailProcess] = useState<ProcessInfo | null>(null);
  const [actionType, setActionType] = useState<'stop' | 'restart'>('stop');
  const [killSignal, setKillSignal] = useState('SIGTERM');
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!summary) return <div style={{ color: '#9ca3af' }}>Loading active processes...</div>;

  const filteredProcesses = summary.processes
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.command.toLowerCase().includes(term) ||
        p.user.toLowerCase().includes(term) ||
        p.pid.toString().includes(term) ||
        (p.fullArgs && p.fullArgs.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'cpu') return b.cpuPercent - a.cpuPercent;
      if (sortBy === 'mem') return b.memPercent - a.memPercent;
      return a.pid - b.pid;
    });

  const handleAction = async () => {
    if (!selectedProcess) return;
    setIsExecuting(true);
    try {
      let res;
      if (actionType === 'stop') {
        res = await stopProcess(selectedProcess.pid, killSignal, true);
      } else {
        res = await restartProcess(selectedProcess.pid, true);
      }
      setActionMessage({ text: res.message, isError: !res.success });
      setSelectedProcess(null);
      setTimeout(() => {
        setActionMessage(null);
        onRefresh();
      }, 2000);
    } catch (err: any) {
      setActionMessage({ text: err.message, isError: true });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Process Manager</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Inspect running processes, resource consumption, parent PIDs, and safely manage tasks
        </p>
      </div>

      {actionMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: actionMessage.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${actionMessage.isError ? '#ef4444' : '#10b981'}`,
          color: actionMessage.isError ? '#ef4444' : '#10b981',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {actionMessage.text}
        </div>
      )}

      {/* Controls Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#9ca3af' }}>Total Tasks: </span>
              <strong style={{ color: '#f3f4f6' }}>{summary.totalProcesses}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Running: </span>
              <strong style={{ color: '#10b981' }}>{summary.runningProcesses}</strong>
            </div>
            <div>
              <span style={{ color: '#9ca3af' }}>Sleeping: </span>
              <strong style={{ color: '#00f2fe' }}>{summary.sleepingProcesses}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search PID, name, user, args..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <select
              className="refresh-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ padding: '8px 12px' }}
            >
              <option value="cpu">Sort by CPU Usage</option>
              <option value="mem">Sort by Memory Usage</option>
              <option value="pid">Sort by PID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>PID</th>
                <th>Process Name</th>
                <th>User</th>
                <th>CPU %</th>
                <th>RAM %</th>
                <th>RAM MB</th>
                <th>State</th>
                <th>Protection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.slice(0, 100).map((proc) => (
                <tr key={proc.pid}>
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{proc.pid}</td>
                  <td style={{ fontWeight: 600, color: '#00f2fe', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {proc.command}
                  </td>
                  <td style={{ color: '#9ca3af' }}>{proc.user}</td>
                  <td style={{ color: proc.cpuPercent > 50 ? '#ef4444' : proc.cpuPercent > 20 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                    {proc.cpuPercent}%
                  </td>
                  <td style={{ color: proc.memPercent > 20 ? '#a855f7' : '#9ca3af' }}>
                    {proc.memPercent}%
                  </td>
                  <td style={{ color: '#9ca3af' }}>
                    {proc.ramMB} MB
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      background: proc.stat.startsWith('R') ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: proc.stat.startsWith('R') ? '#10b981' : '#9ca3af',
                    }}>
                      {proc.stat}
                    </span>
                  </td>
                  <td>
                    {proc.isProtected ? (
                      <span style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> System
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>User</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-icon"
                        onClick={() => setDetailProcess(proc)}
                        title="View Details"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => { setSelectedProcess(proc); setActionType('restart'); }}
                        disabled={proc.isProtected}
                        title="Restart Process"
                        style={{ width: '28px', height: '28px', opacity: proc.isProtected ? 0.3 : 1 }}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => { setSelectedProcess(proc); setActionType('stop'); }}
                        disabled={proc.isProtected}
                        style={{ opacity: proc.isProtected ? 0.3 : 1, cursor: proc.isProtected ? 'not-allowed' : 'pointer' }}
                      >
                        Stop
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Details Modal */}
      {detailProcess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card" style={{ width: '520px', background: '#171424' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#00f2fe' }}>Process Information</h3>
              <button className="btn-icon" onClick={() => setDetailProcess(null)} style={{ width: '28px', height: '28px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Command Name</span>
                <strong style={{ color: '#f3f4f6' }}>{detailProcess.command}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Process ID (PID)</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{detailProcess.pid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Parent PID (PPID)</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>{detailProcess.ppid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Owner User</span>
                <span>{detailProcess.user}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>CPU & RAM Usage</span>
                <span>{detailProcess.cpuPercent}% CPU • {detailProcess.ramMB} MB RAM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Start Time</span>
                <span>{detailProcess.startTime} (CPU Time: {detailProcess.cpuTime})</span>
              </div>
              <div>
                <span style={{ color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Full Command Line Arguments</span>
                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#e2e8f0', wordBreak: 'break-all' }}>
                  {detailProcess.fullArgs || detailProcess.command}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedProcess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card" style={{ width: '440px', background: '#171424' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: actionType === 'stop' ? '#ef4444' : '#00f2fe', marginBottom: '16px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {actionType === 'stop' ? 'Confirm Stop Process' : 'Confirm Restart Process'}
              </h3>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px' }}>
              Are you sure you want to {actionType === 'stop' ? 'terminate' : 'restart'} <strong style={{ color: '#f3f4f6' }}>{selectedProcess.command}</strong> (PID: {selectedProcess.pid})?
            </p>

            {actionType === 'stop' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Signal Type:</label>
                <select
                  className="refresh-select"
                  value={killSignal}
                  onChange={(e) => setKillSignal(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="SIGTERM">SIGTERM (Graceful Terminate)</option>
                  <option value="SIGKILL">SIGKILL (Force Kill)</option>
                  <option value="SIGINT">SIGINT (Interrupt)</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: '#9ca3af', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => setSelectedProcess(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAction}
                disabled={isExecuting}
                style={{ background: actionType === 'stop' ? '#ef4444' : '#e95420' }}
              >
                {isExecuting ? 'Executing...' : actionType === 'stop' ? 'Confirm Stop' : 'Confirm Restart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
