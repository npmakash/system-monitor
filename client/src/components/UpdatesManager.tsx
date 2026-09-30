import React, { useState, useEffect } from 'react';
import { Download, ShieldCheck, RefreshCw, AlertCircle, Package } from 'lucide-react';
import type { UpdateSummary, UpdateInfo } from '../types/system';
import { fetchUpdates, approveUpdate } from '../services/api';

export const UpdatesManager: React.FC = () => {
  const [updates, setUpdates] = useState<UpdateSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateInfo | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadUpdates = async () => {
    setIsLoading(true);
    setUpdateMessage(null);
    try {
      const data = await fetchUpdates();
      setUpdates(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const handleApproveUpdate = async () => {
    if (!selectedUpdate) return;
    setIsUpdating(true);
    try {
      const res = await approveUpdate(selectedUpdate.manager, selectedUpdate.name, true);
      setUpdateMessage({ text: res.message, isError: !res.success });
      setSelectedUpdate(null);
      setTimeout(() => {
        setUpdateMessage(null);
        loadUpdates();
      }, 2000);
    } catch (err: any) {
      setUpdateMessage({ text: err.message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  const allUpdatesList: UpdateInfo[] = updates
    ? [...updates.apt, ...updates.snap, ...updates.flatpak]
    : [];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Software Update Manager</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Inspect available updates across APT, Snap, and Flatpak package managers with user-controlled approvals
        </p>
      </div>

      {updateMessage && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: updateMessage.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${updateMessage.isError ? '#ef4444' : '#10b981'}`,
          color: updateMessage.isError ? '#ef4444' : '#10b981',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {updateMessage.text}
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Total Pending Updates</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: updates && updates.total > 0 ? '#e95420' : '#10b981' }}>
              {updates ? updates.total : 0}
            </div>
          </div>
          <Download size={28} color="#e95420" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>APT Packages</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#00f2fe' }}>
              {updates ? updates.apt.length : 0}
            </div>
          </div>
          <Package size={24} color="#00f2fe" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Snap Packages</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#a855f7' }}>
              {updates ? updates.snap.length : 0}
            </div>
          </div>
          <ShieldCheck size={24} color="#a855f7" />
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Flatpak Apps</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981' }}>
              {updates ? updates.flatpak.length : 0}
            </div>
          </div>
          <Download size={24} color="#10b981" />
        </div>
      </div>

      {/* Control Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: '16px' }}>Available Updates Queue</span>
          <button className="btn-primary" onClick={loadUpdates} disabled={isLoading}>
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Check for Updates
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Package / Application</th>
                <th>Source</th>
                <th>Current Version</th>
                <th>Available Version</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allUpdatesList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#9ca3af' }}>
                    🎉 System is fully up to date across all package managers!
                  </td>
                </tr>
              ) : (
                allUpdatesList.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{item.name}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        background: item.manager === 'apt' ? 'rgba(0,242,254,0.15)' : item.manager === 'snap' ? 'rgba(168,85,247,0.15)' : 'rgba(16,185,129,0.15)',
                        color: item.manager === 'apt' ? '#00f2fe' : item.manager === 'snap' ? '#a855f7' : '#10b981',
                        textTransform: 'uppercase',
                      }}>
                        {item.manager}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)' }}>{item.currentVersion}</td>
                    <td style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.availableVersion}</td>
                    <td>
                      {item.isSecurityUpdate ? (
                        <span style={{ color: '#ef4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <AlertCircle size={12} /> Security
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>Feature / Maintenance</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-primary"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => setSelectedUpdate(item)}
                      >
                        Review & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedUpdate && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card" style={{ width: '450px', background: '#171424' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#00f2fe', marginBottom: '16px' }}>
              <Download size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Approve Update Execution</h3>
            </div>

            <div style={{ fontSize: '14px', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div>Package: <strong style={{ color: '#f3f4f6' }}>{selectedUpdate.name}</strong></div>
              <div>Source Manager: <span style={{ color: '#00f2fe', textTransform: 'uppercase' }}>{selectedUpdate.manager}</span></div>
              <div>Upgrade: <span style={{ color: '#9ca3af' }}>{selectedUpdate.currentVersion}</span> → <strong style={{ color: '#10b981' }}>{selectedUpdate.availableVersion}</strong></div>
              {selectedUpdate.description && <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedUpdate.description}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: '#9ca3af', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => setSelectedUpdate(null)}
              >
                Deny
              </button>
              <button
                className="btn-primary"
                onClick={handleApproveUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? 'Applying...' : 'Approve & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
