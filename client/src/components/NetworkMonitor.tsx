import React, { useState } from 'react';
import { Wifi, ArrowDown, ArrowUp, Network, Search, ShieldCheck } from 'lucide-react';
import type { NetworkInfo } from '../types/system';

interface NetworkMonitorProps {
  network: NetworkInfo | null;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ network }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!network) return <div style={{ color: '#9ca3af' }}>Loading Network traffic metrics...</div>;

  const filteredConnections = (network.connections || []).filter((conn) => {
    const term = searchTerm.toLowerCase();
    return (
      (conn.processName && conn.processName.toLowerCase().includes(term)) ||
      (conn.pid && conn.pid.toString().includes(term)) ||
      conn.localAddress.toLowerCase().includes(term) ||
      conn.remoteAddress.toLowerCase().includes(term) ||
      conn.protocol.toLowerCase().includes(term) ||
      conn.state.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Network Activity</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Real-time interface throughput, active socket connections, and process associations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Total Download */}
        <div className="card">
          <div className="card-title">
            <span>Download Speed (Rx)</span>
            <ArrowDown color="#10b981" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#10b981' }}>
            {network.downloadSpeedFormatted}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            Aggregate Rx Bandwidth Throughput
          </div>
        </div>

        {/* Total Upload */}
        <div className="card">
          <div className="card-title">
            <span>Upload Speed (Tx)</span>
            <ArrowUp color="#3b82f6" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#3b82f6' }}>
            {network.uploadSpeedFormatted}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            Aggregate Tx Bandwidth Throughput
          </div>
        </div>
      </div>

      {/* Interface List */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-title">
          <span>Active Network Interfaces</span>
          <Wifi color="#10b981" />
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Interface</th>
                <th>Download Speed (Rx)</th>
                <th>Upload Speed (Tx)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {network.interfaces.map((iface) => (
                <tr key={iface.interfaceName}>
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{iface.interfaceName}</td>
                  <td style={{ color: '#10b981' }}>{iface.downloadSpeedFormatted}</td>
                  <td style={{ color: '#3b82f6' }}>{iface.uploadSpeedFormatted}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      background: iface.interfaceName === 'lo' ? 'rgba(255,255,255,0.06)' : 'rgba(16,185,129,0.15)',
                      color: iface.interfaceName === 'lo' ? '#9ca3af' : '#10b981',
                    }}>
                      {iface.interfaceName === 'lo' ? 'Loopback' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Socket Connections & Process Association */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <span>Active Connections & Process Association ({filteredConnections.length})</span>
            <Network color="#00f2fe" />
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="search-input"
              placeholder="Search process, PID, IP, port..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#9ca3af', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Network connections show active local/remote TCP & UDP endpoints and owning PIDs. Encrypted payload content remains strictly private.</span>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Process / Application</th>
                <th>PID</th>
                <th>Protocol</th>
                <th>Local Address</th>
                <th>Remote Address</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '24px' }}>
                    No active socket connections match the search filter.
                  </td>
                </tr>
              ) : (
                filteredConnections.slice(0, 100).map((conn, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#00f2fe' }}>
                      {conn.processName || 'System Kernel / Hidden'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#f3f4f6' }}>
                      {conn.pid ? conn.pid : '-'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: '#a855f7' }}>
                      {conn.protocol}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{conn.localAddress}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: conn.remoteAddress.includes('*') ? '#9ca3af' : '#10b981' }}>
                      {conn.remoteAddress}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        background: conn.state === 'ESTABLISHED' ? 'rgba(16,185,129,0.2)' : conn.state === 'LISTEN' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                        color: conn.state === 'ESTABLISHED' ? '#10b981' : conn.state === 'LISTEN' ? '#3b82f6' : '#9ca3af',
                      }}>
                        {conn.state}
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
