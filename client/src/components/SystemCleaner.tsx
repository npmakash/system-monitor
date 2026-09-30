import React, { useState } from 'react';
import { Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import type { JunkScanResult } from '../types/system';
import { scanJunk, cleanJunk } from '../services/api';

export const SystemCleaner: React.FC = () => {
  const [scanResult, setScanResult] = useState<JunkScanResult | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(['thumbnail_cache', 'user_trash']);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanFeedback, setCleanFeedback] = useState<{ message: string; results: string[] } | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setCleanFeedback(null);
    try {
      const res = await scanJunk();
      setScanResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClean = async () => {
    if (selectedIds.length === 0) return;
    setIsCleaning(true);
    try {
      const res = await cleanJunk(selectedIds);
      setCleanFeedback({
        message: `Successfully reclaimed ${res.cleanedMB} MB of disk space!`,
        results: res.results,
      });
      // Rescan after clean
      const updated = await scanJunk();
      setScanResult(updated);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>System Cleaner</h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
          Scan and reclaim disk space by safely purging temporary files, thumbnails, and trash
        </p>
      </div>

      {cleanFeedback && (
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            <CheckCircle size={20} />
            {cleanFeedback.message}
          </div>
          <ul style={{ paddingLeft: '24px', color: '#9ca3af', fontSize: '13px' }}>
            {cleanFeedback.results.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Ubuntu Disk Optimizer</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              {scanResult ? `Found ${scanResult.totalSizeMB} MB of recoverable files` : 'Click scan to analyze junk files'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.08)', boxShadow: 'none' }} onClick={handleScan} disabled={isScanning}>
              <RefreshCw size={16} style={{ animation: isScanning ? 'spin 1s linear infinite' : 'none' }} />
              {isScanning ? 'Scanning...' : 'Scan System'}
            </button>

            {scanResult && (
              <button className="btn-primary" onClick={handleClean} disabled={isCleaning || selectedIds.length === 0}>
                <Sparkles size={16} />
                {isCleaning ? 'Cleaning...' : 'Clean Selected'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category List */}
      {scanResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {scanResult.categories.map((cat) => (
            <div
              key={cat.id}
              className="card"
              style={{
                borderColor: selectedIds.includes(cat.id) ? 'var(--accent-ubuntu)' : 'var(--border-subtle)',
                opacity: cat.safeToClean ? 1 : 0.6,
              }}
            >
              <div className="card-title" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {cat.safeToClean && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#e95420' }}
                    />
                  )}
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: cat.sizeMB > 0 ? '#e95420' : '#9ca3af' }}>
                  {cat.sizeMB} MB
                </span>
              </div>

              <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '12px' }}>{cat.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#6b7280', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {cat.path}
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  background: cat.safeToClean ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                  color: cat.safeToClean ? '#10b981' : '#f59e0b',
                }}>
                  {cat.safeToClean ? 'Safe to Clean' : 'System Protected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
