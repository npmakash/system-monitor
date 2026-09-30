import React from 'react';
import { Folder } from 'lucide-react';
import type { DiskInfo } from '../types/system';

interface DiskMonitorProps {
  disks: DiskInfo[] | null;
}

export const DiskMonitor: React.FC<DiskMonitorProps> = ({ disks }) => {
  if (!disks) return <div style={{ color: '#9ca3af' }}>Loading Disk partition metrics...</div>;

  const getDiskColor = (percent: number) => {
    if (percent > 90) return '#ef4444';
    if (percent > 75) return '#f59e0b';
    return '#a855f7';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Storage & Disks</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Mounted filesystems and partition usage breakdown
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {disks.map((disk, idx) => (
          <div key={idx} className="card">
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Folder size={18} color="#a855f7" />
                {disk.mountPoint}
              </span>
              <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', fontFamily: 'var(--font-mono)' }}>
                {disk.type}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#f3f4f6' }}>
                {disk.usagePercent}%
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                {disk.usedGB} GB of {disk.totalGB} GB
              </div>
            </div>

            <div className="progress-container" style={{ height: '10px', marginBottom: '16px' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${disk.usagePercent}%`,
                  backgroundColor: getDiskColor(disk.usagePercent),
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Filesystem Source</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#f3f4f6' }}>{disk.filesystem}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Available Space</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{disk.availableGB} GB</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
