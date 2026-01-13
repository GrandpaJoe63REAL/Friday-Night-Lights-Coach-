
import React, { useState, useEffect } from 'react';
import { Player, Position } from '../types';

interface DepthChartProps {
  roster: Player[];
  onReorder: (newRoster: Player[]) => void;
}

type Group = 'OFFENSE' | 'DEFENSE' | 'SPECIAL TEAMS' | 'SPECIALISTS';

const GROUP_CONFIG: Record<Group, { label: string; positions: { pos: string; filter: Position[] }[] }> = {
  'OFFENSE': {
    label: 'Offense',
    positions: [
      { pos: 'LT', filter: ['LT'] },
      { pos: 'LG', filter: ['LG'] },
      { pos: 'C', filter: ['C'] },
      { pos: 'RG', filter: ['RG'] },
      { pos: 'RT', filter: ['RT'] },
      { pos: 'QB', filter: ['QB'] },
      { pos: 'HB', filter: ['RB'] },
      { pos: 'WR', filter: ['WR'] },
      { pos: 'TE', filter: ['TE'] },
    ]
  },
  'DEFENSE': {
    label: 'Defense',
    positions: [
      { pos: 'DE', filter: ['DE'] },
      { pos: 'DT', filter: ['DT'] },
      { pos: 'LB', filter: ['LB'] },
      { pos: 'CB', filter: ['CB'] },
      { pos: 'S', filter: ['S'] },
    ]
  },
  'SPECIAL TEAMS': {
    label: 'Special Teams',
    positions: [
      { pos: 'K', filter: ['K'] },
      { pos: 'P', filter: ['P'] },
      { pos: 'KR', filter: ['WR', 'RB'] },
      { pos: 'PR', filter: ['WR', 'CB'] },
    ]
  },
  'SPECIALISTS': {
    label: 'Specialists',
    positions: [
      { pos: '3RD', filter: ['RB'] },
      { pos: 'SLOT', filter: ['WR'] },
      { pos: 'LS', filter: ['LT', 'LG', 'C', 'RG', 'RT', 'TE'] as any },
    ]
  }
};

const DepthChart: React.FC<DepthChartProps> = ({ roster, onReorder }) => {
  const [activeGroup, setActiveGroup] = useState<Group>('OFFENSE');
  const [movingPlayerId, setMovingPlayerId] = useState<string | null>(null);

  // Keyboard Navigation (Q/E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const groups: Group[] = ['OFFENSE', 'DEFENSE', 'SPECIAL TEAMS', 'SPECIALISTS'];
      const currentIndex = groups.indexOf(activeGroup);
      if (e.key.toLowerCase() === 'q') {
        const next = (currentIndex - 1 + groups.length) % groups.length;
        setActiveGroup(groups[next]);
      } else if (e.key.toLowerCase() === 'e') {
        const next = (currentIndex + 1) % groups.length;
        setActiveGroup(groups[next]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroup]);

  const handleMove = (playerId: string, direction: 'up' | 'down') => {
    const newRoster = [...roster];
    const index = newRoster.findIndex(p => p.id === playerId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newRoster.length) {
      const temp = newRoster[index];
      newRoster[index] = newRoster[targetIndex];
      newRoster[targetIndex] = temp;
      onReorder(newRoster);
    }
  };

  const handleAutoReorder = () => {
    const newRoster = [...roster].sort((a, b) => {
      // Primary sort by position name to group them (optional but cleaner for global roster)
      if (a.position !== b.position) return a.position.localeCompare(b.position);
      // Secondary sort by Overall descending
      return b.overall - a.overall;
    });
    onReorder(newRoster);
    setMovingPlayerId(null);
  };

  const handleSortByPotential = () => {
    const newRoster = [...roster].sort((a, b) => {
      if (a.position !== b.position) return a.position.localeCompare(b.position);
      return b.potential - a.potential;
    });
    onReorder(newRoster);
    setMovingPlayerId(null);
  };

  const renderColumn = (colName: string, filters: Position[]) => {
    const players = roster.filter(p => filters.includes(p.position));
    
    return (
      <div key={colName} className="flex flex-col gap-3 min-w-[140px] flex-1">
        <div className="text-center py-3 bg-slate-900/80 border-t-2 border-blue-500/50 rounded-t-xl">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{colName}</span>
        </div>
        
        <div className="flex flex-col gap-2 p-1 bg-black/20 rounded-b-xl min-h-[500px]">
          {players.map((player, idx) => {
            const isStarter = idx === 0;
            const isMoving = movingPlayerId === player.id;
            
            return (
              <div 
                key={player.id}
                onClick={() => setMovingPlayerId(isMoving ? null : player.id)}
                className={`
                  relative group cursor-pointer transition-all duration-300 rounded-xl p-3 border-2 
                  ${isStarter ? 'bg-slate-800 border-blue-500/40 shadow-lg' : 'bg-slate-900/40 border-white/5'}
                  ${isMoving ? 'ring-2 ring-amber-500 border-amber-500 z-10 scale-105' : 'hover:border-white/20'}
                  ${player.injuryStatus === 'Out' ? 'opacity-50 grayscale' : ''}
                `}
              >
                {/* Starter Badge */}
                {isStarter && (
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter">1st Team</div>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-slate-500">#{idx + 1}</span>
                  <span className={`text-sm font-black ${isStarter ? 'text-blue-400' : 'text-slate-300'}`}>{player.overall}</span>
                </div>

                <div className="text-[11px] font-bold text-white truncate mb-1">{player.name}</div>
                
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{player.position}</span>
                </div>

                {/* Direct Manipulation Controls */}
                {isMoving && (
                  <div className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1 pr-1 bg-gradient-to-l from-amber-500/20 to-transparent rounded-r-xl">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMove(player.id, 'up'); }}
                      className="p-1 hover:bg-amber-500 rounded text-white text-xs"
                    >▲</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMove(player.id, 'down'); }}
                      className="p-1 hover:bg-amber-500 rounded text-white text-xs"
                    >▼</button>
                  </div>
                )}
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">No Players</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tight uppercase">Depth Chart</h2>
          <p className="text-slate-400 text-sm font-medium">Reorder your starters and backups. Use Q/E to switch tabs.</p>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-white/5 shadow-xl">
          {(Object.keys(GROUP_CONFIG) as Group[]).map(group => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeGroup === group ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="flex-1 bg-black/40 rounded-[2.5rem] p-8 border border-white/5 overflow-x-auto overflow-y-hidden custom-scrollbar shadow-2xl relative">
          {/* Stadium Background Overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e3adbb17c3?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 pointer-events-none grayscale" />
          
          <div className="flex gap-6 h-full relative z-10">
            {GROUP_CONFIG[activeGroup].positions.map(p => renderColumn(p.pos, p.filter))}
          </div>
        </div>

        {/* Right Action Panel */}
        <aside className="lg:w-80 flex flex-col gap-6">
          <div className="glass p-6 rounded-[2rem] border-l-4 border-amber-500 shadow-xl bg-slate-900/40">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Depth Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Players</span>
                <span className="text-sm font-black text-white">{roster.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Avg Star OVR</span>
                <span className="text-sm font-black text-blue-400">
                  {Math.round(roster.slice(0, 11).reduce((acc, p) => acc + p.overall, 0) / 11)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Injured Out</span>
                <span className="text-sm font-black text-rose-500">{roster.filter(p => p.injuryStatus === 'Out').length}</span>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-[2rem] flex flex-col gap-4 bg-slate-900/40 border border-white/5 shadow-xl">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Roster Actions</h3>
             <button 
                onClick={handleAutoReorder}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-b-4 border-black/40 transition-all active:translate-y-1"
             >
               Auto-Reorder All
             </button>
             <button 
                onClick={handleSortByPotential}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-b-4 border-black/40 transition-all active:translate-y-1"
             >
               Sort by Potential
             </button>
             <div className="mt-4 p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
               <p className="text-[10px] text-blue-200/60 font-medium leading-relaxed italic">
                 "Tip: Starters play nearly 100% of snaps in simulation. Backups only enter if the starter is injured or fatigue hits 20%."
               </p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DepthChart;
