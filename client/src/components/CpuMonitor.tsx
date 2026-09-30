import React from 'react';
import { Cpu, CpuIcon } from 'lucide-react';
import type { CpuInfo } from '../types/system';

interface CpuMonitorProps {
  cpu: CpuInfo | null;
}

export const CpuMonitor: React.FC<CpuMonitorProps> = ({ cpu }) => {
  if (!cpu) return <div style={{ color: '#9ca3af' }}>Loading CPU details...</div>;

  const getCoreColor = (percent: number) => {
    if (percent > 85) return '#ef4444';
    if (percent > 65) return '#f59e0b';
    return '#e95420';
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>CPU Performance</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          {cpu.modelName} ({cpu.cores} Physical / Logical Cores)
        </p>
      </div>

      {/* Main CPU Gauge Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span>Overall CPU Load</span>
          <Cpu color="#e95420" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '48px', fontWeight: 800, color: '#f3f4f6', minWidth: '130px' }}>
            {cpu.usagePercent}%
          </div>
          <div style={{ flex: 1 }}>
            <div className="progress-container" style={{ height: '14px' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${cpu.usagePercent}%`,
                  backgroundColor: getCoreColor(cpu.usagePercent),
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
              <span>0% Idle</span>
              <span>50% Load</span>
              <span>100% Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core breakdown */}
      <div className="card">
        <div className="card-title">
          <span>Individual Core Utilization</span>
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 400 }}>{cpu.coreUsages.length} Active Cores</span>
        </div>
        <div className="cores-grid">
          {cpu.coreUsages.map((core) => (
            <div key={core.coreId} className="core-card">
              <div className="core-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CpuIcon size={14} color="#e95420" /> Core #{core.coreId}
                </span>
                <span style={{ fontWeight: 600, color: '#f3f4f6' }}>{core.usagePercent}%</span>
              </div>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${core.usagePercent}%`,
                    backgroundColor: getCoreColor(core.usagePercent),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
