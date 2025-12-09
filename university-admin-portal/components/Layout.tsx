import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, ShieldCheck } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/') return 'Stats Dashboard';
    if (location.pathname.startsWith('/researchers')) return 'Researchers';
    if (location.pathname.startsWith('/publications')) return 'Publications';
    return 'University Admin';
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">University Admin</h1>
            <p className="text-xs text-slate-500">Research Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Stats" />
          <NavItem to="/publications" icon={<BookOpen size={20} />} label="Publications" />
          <NavItem to="/researchers" icon={<Users size={20} />} label="Researchers" />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-xl font-bold text-white">{getTitle()}</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-blue-500">
                A
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-900/40 text-blue-400 border-l-4 border-blue-500'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

export default Layout;
