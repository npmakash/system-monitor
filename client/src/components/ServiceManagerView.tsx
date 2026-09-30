import React, { useState, useEffect } from 'react';
import { Server, Search, RefreshCw, Play, Square, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ServiceInfo } from '../types/system';
import { fetchServices, controlService } from '../services/api';

export const ServiceManagerView: React.FC = () => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'inactive' | 'failed'>('all');
  const [selectedService, setSelectedService] = useState<{ service: ServiceInfo; action: 'start' | 'stop' | 'restart' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const loadServices = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleServiceAction = async () => {
    if (!selectedService) return;
    setIsExecuting(true);
    try {
      const res = await controlService(selectedService.service.name, selectedService.action, true);
      setMessage({ text: res.message, isError: !res.success });
      setSelectedService(null);
      setTimeout(() => {
        setMessage(null);
        loadServices();
      }, 2000);
    } catch (err: any) {
      setMessage({ text: err.message, isError: true });
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredServices = services.filter((svc) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = svc.name.toLowerCase().includes(term) || svc.description.toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (filterState === 'active') return svc.activeState === 'active';
    if (filterState === 'inactive') return svc.activeState === 'inactive';
    if (filterState === 'failed') return svc.activeState === 'failed';
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>Systemd Services</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Monitor background system services, active states, and execute whitelisted service actions
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: message.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${message.isError ? '#ef4444' : '#10b981'}`,
          color: message.isError ? '#ef4444' : '#10b981',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {message.text}
        </div>
      )}

      {/* Control Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server color="#e95420" />
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{services.length} Registered Services</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search service name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <select
              className="refresh-select"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as any)}
              style={{ padding: '8px 12px' }}
            >
              <option value="all">All Services</option>
              <option value="active">Active Running</option>
              <option value="inactive">Inactive Stopped</option>
              <option value="failed">Failed</option>
            </select>

            <button className="btn-primary" onClick={loadServices} disabled={isLoading}>
              <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Service Unit Name</th>
                <th>Description</th>
                <th>Active State</th>
                <th>Sub-State</th>
                <th>Protection</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.slice(0, 100).map((svc) => (
                <tr key={svc.name}>
                  <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{svc.name}</td>
                  <td style={{ color: '#9ca3af', fontSize: '12px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {svc.description}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      background: svc.activeState === 'active' ? 'rgba(16,185,129,0.15)' : svc.activeState === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                      color: svc.activeState === 'active' ? '#10b981' : svc.activeState === 'failed' ? '#ef4444' : '#9ca3af',
                    }}>
                      {svc.activeState}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#9ca3af' }}>{svc.subState}</td>
                  <td>
                    {svc.isProtected ? (
                      <span style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} /> System Core
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>Standard</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {svc.activeState !== 'active' ? (
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedService({ service: svc, action: 'start' })}
                          disabled={svc.isProtected}
                          title="Start Service"
                          style={{ width: '28px', height: '28px', opacity: svc.isProtected ? 0.3 : 1 }}
                        >
                          <Play size={14} color="#10b981" />
                        </button>
                      ) : (
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedService({ service: svc, action: 'stop' })}
                          disabled={svc.isProtected}
                          title="Stop Service"
                          style={{ width: '28px', height: '28px', opacity: svc.isProtected ? 0.3 : 1 }}
                        >
                          <Square size={14} color="#ef4444" />
                        </button>
                      )}
                      <button
                        className="btn-icon"
                        onClick={() => setSelectedService({ service: svc, action: 'restart' })}
                        disabled={svc.isProtected}
                        title="Restart Service"
                        style={{ width: '28px', height: '28px', opacity: svc.isProtected ? 0.3 : 1 }}
                      >
                        <RefreshCw size={14} color="#00f2fe" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedService && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div className="card" style={{ width: '440px', background: '#171424' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e95420', marginBottom: '16px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                Confirm {selectedService.action.toUpperCase()} Service
              </h3>
            </div>

            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '20px' }}>
              Are you sure you want to execute <strong>systemctl {selectedService.action}</strong> on <strong style={{ color: '#f3f4f6' }}>{selectedService.service.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: '#9ca3af', padding: '8px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                onClick={() => setSelectedService(null)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleServiceAction}
                disabled={isExecuting}
              >
                {isExecuting ? 'Executing...' : `Confirm ${selectedService.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
