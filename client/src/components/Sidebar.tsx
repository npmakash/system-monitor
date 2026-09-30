import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  HardDrive,
  Activity,
  Wifi,
  Terminal,
  Download,
  Server,
  PlayCircle,
  History,
  Trash2,
  Settings,
  Monitor,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'cpu'
  | 'memory'
  | 'disk'
  | 'network'
  | 'processes'
  | 'updates'
  | 'services'
  | 'startup'
  | 'activity'
  | 'cleaner'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'cpu', label: 'CPU & Cores', icon: <Cpu /> },
    { id: 'memory', label: 'Memory & Swap', icon: <Activity /> },
    { id: 'disk', label: 'Storage & Disks', icon: <HardDrive /> },
    { id: 'network', label: 'Network Speed', icon: <Wifi /> },
    { id: 'processes', label: 'Process Manager', icon: <Terminal /> },
    { id: 'updates', label: 'Software Updates', icon: <Download /> },
    { id: 'services', label: 'Systemd Services', icon: <Server /> },
    { id: 'startup', label: 'Startup Apps', icon: <PlayCircle /> },
    { id: 'activity', label: 'Activity Log', icon: <History /> },
    { id: 'cleaner', label: 'System Cleaner', icon: <Trash2 /> },
    { id: 'settings', label: 'Settings & Policy', icon: <Settings /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Monitor size={22} />
        </div>
        <div className="logo-text">
          <h1>System Manager</h1>
          <span>Ubuntu 24.04 LTS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: '#f3f4f6', fontWeight: 600 }}>Linux Agent v1.0</span>
          <span>Local System Interface</span>
        </div>
      </div>
    </aside>
  );
};
