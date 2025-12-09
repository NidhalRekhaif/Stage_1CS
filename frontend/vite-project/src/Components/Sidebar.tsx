import React from 'react';
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react';

type Page = 'stats' | 'publications' | 'researchers';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="w-64 h-screen bg-[#0b0d14] flex flex-col border-r border-slate-800 fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
          <img src="https://picsum.photos/40/40" alt="Admin" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">University Admin</h3>
          <p className="text-slate-500 text-xs">Research Analytics</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Stats" 
          active={currentPage === 'stats'}
          onClick={() => onNavigate('stats')}
        />
        <NavItem 
          icon={<FileText size={20} />} 
          label="Publications"
          active={currentPage === 'publications'}
          onClick={() => onNavigate('publications')}
        />
        <NavItem 
          icon={<Users size={20} />} 
          label="Researchers"
          active={currentPage === 'researchers'}
          onClick={() => onNavigate('researchers')}
        />
      </nav>
      
      <div className="p-4 space-y-2 border-t border-slate-800">
        <NavItem icon={<Settings size={20} />} label="Settings" onClick={() => {}} />
        <NavItem icon={<LogOut size={20} />} label="Log Out" onClick={() => {}} />
      </div>
    </div>
  );
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active 
          ? 'bg-blue-900/40 text-blue-400 border-l-2 border-blue-500' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};