import React from 'react';
import { Cpu, Activity, HardDrive, Wifi, Clock, Server, ArrowDown, ArrowUp } from 'lucide-react';
import type { SystemSummary } from '../types/system';

interface DashboardProps {
  summary: SystemSummary | null;
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ summary, onNavigateTab }) => {
  if (!summary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#9ca3af' }}>
        <span>Loading system metrics...</span>
      </div>
    );
  }

  const { cpu, memory, disks, network, info } = summary;
  const primaryDisk = disks && disks.length > 0 ? disks[0] : null;

  const getProgressColor = (percent: number) => {
    if (percent > 85) return '#ef4444';
    if (percent > 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>System Overview</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Real-time diagnostics and performance monitoring
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="stats-grid">
        {/* CPU */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('cpu')}>
          <div className="stat-header">
            <span>CPU Usage</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(233, 84, 32, 0.15)', color: '#e95420' }}>
              <Cpu size={20} />
            </div>
          </div>
          <div className="stat-value">{cpu.usagePercent}%</div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${cpu.usagePercent}%`,
                backgroundColor: getProgressColor(cpu.usagePercent),
              }}
            />
          </div>
          <div className="stat-subtitle">{cpu.cores} Cores • {cpu.modelName.substring(0, 30)}...</div>
        </div>

        {/* Memory */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('memory')}>
          <div className="stat-header">
            <span>RAM Memory</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value">{memory.memory.usagePercent}%</div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${memory.memory.usagePercent}%`,
                backgroundColor: getProgressColor(memory.memory.usagePercent),
              }}
            />
          </div>
          <div className="stat-subtitle">
            {memory.memory.usedGB} GB of {memory.memory.totalGB} GB Used
          </div>
        </div>

        {/* Disk */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('disk')}>
          <div className="stat-header">
            <span>Primary Disk</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(119, 33, 111, 0.2)', color: '#a855f7' }}>
              <HardDrive size={20} />
            </div>
          </div>
          <div className="stat-value">{primaryDisk ? `${primaryDisk.usagePercent}%` : 'N/A'}</div>
          <div className="progress-container">
            <div
              className="progress-bar"
              style={{
                width: `${primaryDisk ? primaryDisk.usagePercent : 0}%`,
                backgroundColor: primaryDisk ? getProgressColor(primaryDisk.usagePercent) : '#10b981',
              }}
            />
          </div>
          <div className="stat-subtitle">
            {primaryDisk ? `${primaryDisk.usedGB} GB / ${primaryDisk.totalGB} GB (${primaryDisk.mountPoint})` : 'No disk detected'}
          </div>
        </div>

        {/* Network */}
        <div className="card stat-card" style={{ cursor: 'pointer' }} onClick={() => onNavigateTab('network')}>
          <div className="stat-header">
            <span>Network Traffic</span>
            <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Wifi size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600, color: '#10b981' }}>
              <ArrowDown size={16} /> {network.downloadSpeedFormatted}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600, color: '#3b82f6' }}>
              <ArrowUp size={16} /> {network.uploadSpeedFormatted}
            </div>
          </div>
          <div className="stat-subtitle">{network.interfaces.length} Active Interface(s)</div>
        </div>
      </div>

      {/* System Banner & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div className="card-title">
            <span>System Details</span>
            <Server size={18} color="#e95420" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Host Name</span>
              <span style={{ fontWeight: 600 }}>{info.hostname}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Distribution</span>
              <span style={{ fontWeight: 600 }}>{info.distro}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Kernel Version</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{info.kernel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ color: '#9ca3af' }}>Architecture</span>
              <span style={{ fontWeight: 600 }}>{info.arch}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> System Uptime
              </span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>{info.uptimeFormatted}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <span>Memory Distribution</span>
            <Activity size={18} color="#00f2fe" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>RAM Usage</span>
                <span>{memory.memory.usedGB} / {memory.memory.totalGB} GB</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${memory.memory.usagePercent}%`, backgroundColor: '#00f2fe' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#9ca3af' }}>Swap Space</span>
                <span>{memory.swap.usedGB} / {memory.swap.totalGB} GB</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${memory.swap.usagePercent}%`, backgroundColor: '#a855f7' }} />
              </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#9ca3af' }}>
              💡 Buffers: { (memory.memory.buffersBytes / (1024*1024)).toFixed(0) } MB • Cached: { (memory.memory.cachedBytes / (1024*1024)).toFixed(0) } MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
