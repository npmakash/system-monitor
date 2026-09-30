import React, { useState, useEffect } from 'react';
import { PlayCircle, RefreshCw, Folder } from 'lucide-react';
import type { StartupAppInfo } from '../types/system';
import { fetchStartupApps } from '../services/api';

export const StartupAppsView: React.FC = () => {
  const [apps, setApps] = useState<StartupAppInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadApps = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStartupApps();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Startup Applications</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Inspect applications configured to launch automatically upon Ubuntu user login
        </p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlayCircle color="#00f2fe" />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{apps.length} Autostart Entries Found</span>
          </div>
          <button className="btn-primary" onClick={loadApps} disabled={isLoading}>
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Application Name</th>
                <th>Launch Command</th>
                <th>Status</th>
                <th>Desktop Entry File</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
                    No desktop startup applications found in ~/.config/autostart or /etc/xdg/autostart.
                  </td>
                </tr>
              ) : (
                apps.map((app, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{app.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00f2fe', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.command}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        background: app.enabled ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        color: app.enabled ? '#10b981' : '#9ca3af',
                      }}>
                        {app.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#9ca3af' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Folder size={12} /> {app.filePath}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
