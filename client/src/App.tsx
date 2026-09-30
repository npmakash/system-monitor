import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CpuMonitor } from './components/CpuMonitor';
import { MemoryMonitor } from './components/MemoryMonitor';
import { DiskMonitor } from './components/DiskMonitor';
import { NetworkMonitor } from './components/NetworkMonitor';
import { ProcessManager } from './components/ProcessManager';
import { UpdatesManager } from './components/UpdatesManager';
import { ServiceManagerView } from './components/ServiceManagerView';
import { StartupAppsView } from './components/StartupAppsView';
import { ActivityLog } from './components/ActivityLog';
import { SystemCleaner } from './components/SystemCleaner';
import { SettingsView } from './components/SettingsView';
import type { SystemSummary, ProcessSummary } from './types/system';
import { fetchSystemSummary, fetchProcesses } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [processSummary, setProcessSummary] = useState<ProcessSummary | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(2000);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadMetrics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const summaryData = await fetchSystemSummary();
      setSummary(summaryData);
      setIsConnected(true);

      if (activeTab === 'processes') {
        const procData = await fetchProcesses();
        setProcessSummary(procData);
      }
    } catch (err) {
      console.error('Failed to connect to System Agent:', err);
      setIsConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    if (refreshInterval === 0) return;

    const timer = setInterval(() => {
      loadMetrics();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval, loadMetrics]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard summary={summary} onNavigateTab={setActiveTab} />;
      case 'cpu':
        return <CpuMonitor cpu={summary ? summary.cpu : null} />;
      case 'memory':
        return <MemoryMonitor memory={summary ? summary.memory : null} />;
      case 'disk':
        return <DiskMonitor disks={summary ? summary.disks : null} />;
      case 'network':
        return <NetworkMonitor network={summary ? summary.network : null} />;
      case 'processes':
        return <ProcessManager summary={processSummary} onRefresh={loadMetrics} />;
      case 'updates':
        return <UpdatesManager />;
      case 'services':
        return <ServiceManagerView />;
      case 'startup':
        return <StartupAppsView />;
      case 'activity':
        return <ActivityLog />;
      case 'cleaner':
        return <SystemCleaner />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard summary={summary} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="main-content">
        <Navbar
          info={summary ? summary.info : null}
          isConnected={isConnected}
          refreshInterval={refreshInterval}
          onRefreshIntervalChange={setRefreshInterval}
          onManualRefresh={loadMetrics}
          isRefreshing={isRefreshing}
        />

        <main className="page-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
