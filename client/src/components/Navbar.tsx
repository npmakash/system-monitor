import React from 'react';
import { RefreshCw, Server, ShieldCheck, Activity } from 'lucide-react';
import type { SystemInformation } from '../types/system';

interface NavbarProps {
  info: SystemInformation | null;
  isConnected: boolean;
  refreshInterval: number;
  onRefreshIntervalChange: (interval: number) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  info,
  isConnected,
  refreshInterval,
  onRefreshIntervalChange,
  onManualRefresh,
  isRefreshing,
}) => {
  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="nav-status-badge" style={{
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
          color: isConnected ? '#10b981' : '#ef4444',
        }}>
          <span className="status-dot" style={{ background: isConnected ? '#10b981' : '#ef4444' }} />
          {isConnected ? 'Agent Connected' : 'Agent Offline'}
        </div>

        {info && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} color="#e95420" />
              <strong style={{ color: '#f3f4f6' }}>{info.hostname}</strong> ({info.distro})
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#00f2fe" />
              Kernel {info.kernel} ({info.arch})
            </span>
          </div>
        )}
      </div>

      <div className="navbar-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
          <Activity size={14} />
          <span>Polling:</span>
          <select
            className="refresh-select"
            value={refreshInterval}
            onChange={(e) => onRefreshIntervalChange(Number(e.target.value))}
          >
            <option value={1000}>Realtime (1s)</option>
            <option value={2000}>Normal (2s)</option>
            <option value={5000}>Relaxed (5s)</option>
            <option value={0}>Paused</option>
          </select>
        </div>

        <button
          className="btn-icon"
          onClick={onManualRefresh}
          title="Refresh Now"
          style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
