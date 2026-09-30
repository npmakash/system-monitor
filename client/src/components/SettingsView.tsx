import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck } from 'lucide-react';
import type { UpdatePolicySettings } from '../types/system';
import { fetchUpdatePolicy, saveUpdatePolicy } from '../services/api';

export const SettingsView: React.FC = () => {
  const [policy, setPolicy] = useState<UpdatePolicySettings>({
    largeDownloadThresholdMB: 50,
    requireConfirmation: true,
    allowAutomaticSmallUpdates: false,
    notifyOnly: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUpdatePolicy()
      .then(setPolicy)
      .catch((err) => console.error('Failed to load settings policy:', err));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await saveUpdatePolicy(policy);
      setPolicy(updated);
      setMessage('Settings & update policy saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>System Settings & Update Policies</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Configure download size thresholds, user confirmation rules, and security preferences
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10b981', color: '#10b981', marginBottom: '20px', fontSize: '14px', fontWeight: 500,
        }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Policy Card */}
        <div className="card">
          <div className="card-title">
            <span>Update Thresholds & Policy</span>
            <ShieldCheck color="#e95420" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>
                Large Download Threshold (MB):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  className="search-input"
                  value={policy.largeDownloadThresholdMB}
                  onChange={(e) => setPolicy({ ...policy, largeDownloadThresholdMB: parseInt(e.target.value, 10) || 50 })}
                  style={{ width: '120px' }}
                />
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Downloads exceeding this size require explicit confirmation</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="requireConfirmation"
                checked={policy.requireConfirmation}
                onChange={(e) => setPolicy({ ...policy, requireConfirmation: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#e95420', cursor: 'pointer' }}
              />
              <label htmlFor="requireConfirmation" style={{ fontSize: '14px', color: '#f3f4f6', cursor: 'pointer' }}>
                Always require explicit user confirmation before package installations or updates
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="notifyOnly"
                checked={policy.notifyOnly}
                onChange={(e) => setPolicy({ ...policy, notifyOnly: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#e95420', cursor: 'pointer' }}
              />
              <label htmlFor="notifyOnly" style={{ fontSize: '14px', color: '#f3f4f6', cursor: 'pointer' }}>
                Notify only mode (no background automatic package downloads)
              </label>
            </div>

            <button className="btn-primary" onClick={handleSave} disabled={isSaving} style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Policy Settings'}
            </button>
          </div>
        </div>

        {/* Security & System Info */}
        <div className="card">
          <div className="card-title">
            <span>System Agent Security Constraints</span>
            <Settings color="#00f2fe" />
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
              🔒 <strong>Localhost Binding:</strong> The agent binds exclusively to <code>127.0.0.1</code>. No external network connections are permitted.
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
              🛡️ <strong>No Generic Command Execution:</strong> Shell injection vulnerability vectors are prohibited. Only whitelisted binary methods are allowed.
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
              ⚡ <strong>Low Resource Footprint:</strong> Efficient <code>/proc</code> readers eliminate heavy background sub-processes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
