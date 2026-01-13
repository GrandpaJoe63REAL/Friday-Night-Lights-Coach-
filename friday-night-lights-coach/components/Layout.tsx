
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  gameYear: number;
  gameWeek: number;
  phase: string;
  schoolName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, gameYear, gameWeek, phase, schoolName }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'depth_chart', label: 'Depth Chart', icon: '📋' },
    { id: 'roster', label: 'Roster Hub', icon: '🏈' },
    { id: 'stats', label: 'Stats', icon: '📈' },
    { id: 'recruiting', label: 'Recruitment Hub', icon: '🏃' },
    { id: 'staff', label: 'Staff', icon: '📋' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'settings', label: 'Save & Career', icon: '💾' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black uppercase tracking-tighter text-blue-400 leading-tight italic">Friday Night Lights</h1>
          <p className="text-[10px] text-slate-500 mt-1 font-black uppercase tracking-widest">{schoolName}</p>
          <div className="mt-4 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <div className="text-[9px] font-black uppercase text-blue-400 px-1.5 py-0.5 bg-blue-500/20 rounded">
              {phase.replace('_', ' ')}
            </div>
            <div className="text-xs font-bold whitespace-nowrap">Wk {gameWeek}, {gameYear}</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black pointer-events-none opacity-90" />
        <div className="relative p-8 h-full overflow-y-auto custom-scrollbar z-10">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
