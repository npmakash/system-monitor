import React from 'react';
import { Activity, Layers, Database } from 'lucide-react';
import type { MemoryInfo } from '../types/system';

interface MemoryMonitorProps {
  memory: MemoryInfo | null;
}

export const MemoryMonitor: React.FC<MemoryMonitorProps> = ({ memory }) => {
  if (!memory) return <div style={{ color: '#9ca3af' }}>Loading Memory metrics...</div>;

  const { memory: ram, swap } = memory;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Memory & Swap</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          System RAM allocation and paging file metrics
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* RAM Card */}
        <div className="card">
          <div className="card-title">
            <span>Physical RAM</span>
            <Activity color="#00f2fe" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#00f2fe', marginBottom: '12px' }}>
            {ram.usagePercent}%
          </div>
          <div className="progress-container" style={{ height: '12px', marginBottom: '16px' }}>
            <div className="progress-bar" style={{ width: `${ram.usagePercent}%`, backgroundColor: '#00f2fe' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: '#9ca3af' }}>Total RAM</span>
              <strong style={{ color: '#f3f4f6' }}>{ram.totalGB} GB</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: '#9ca3af' }}>Used Memory</span>
              <strong style={{ color: '#00f2fe' }}>{ram.usedGB} GB</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: '#9ca3af' }}>Available Memory</span>
              <strong style={{ color: '#10b981' }}>{ram.availableGB} GB</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Free Unallocated</span>
              <strong style={{ color: '#9ca3af' }}>{(ram.freeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
            </div>
          </div>
        </div>

        {/* Swap Card */}
        <div className="card">
          <div className="card-title">
            <span>Swap Memory</span>
            <Database color="#a855f7" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#a855f7', marginBottom: '12px' }}>
            {swap.usagePercent}%
          </div>
          <div className="progress-container" style={{ height: '12px', marginBottom: '16px' }}>
            <div className="progress-bar" style={{ width: `${swap.usagePercent}%`, backgroundColor: '#a855f7' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: '#9ca3af' }}>Total Swap</span>
              <strong style={{ color: '#f3f4f6' }}>{swap.totalGB} GB</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: '#9ca3af' }}>Used Swap</span>
              <strong style={{ color: '#a855f7' }}>{swap.usedGB} GB</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Free Swap</span>
              <strong style={{ color: '#10b981' }}>{(swap.freeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Buffers and Cache card */}
      <div className="card">
        <div className="card-title">
          <span>Linux Kernel Page Cache & Buffers</span>
          <Layers color="#10b981" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>File System Buffers</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6' }}>
              {(ram.buffersBytes / (1024 * 1024)).toFixed(1)} MB
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>Cached Page Data</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f3f4f6' }}>
              {(ram.cachedBytes / (1024 * 1024)).toFixed(1)} MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
