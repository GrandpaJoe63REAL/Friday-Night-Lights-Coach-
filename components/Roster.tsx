
import React, { useState } from 'react';
import { Player } from '../types';
import PlayerProfile from './PlayerProfile';

interface RosterProps {
  roster: Player[];
  onCut: (playerId: string) => void;
}

type SortKey = 'name' | 'position' | 'archetype' | 'grade' | 'overall' | 'potential' | 'academics' | 'injuryStatus';

const Roster: React.FC<RosterProps> = ({ roster, onCut }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('overall');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'DE', 'DT', 'LB', 'CB', 'S', 'K/P'];
  const ROSTER_CAP = 53;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const filteredRoster = roster.filter(p => {
    if (filter === 'ALL') return true;
    if (filter === 'K/P') return p.position === 'K' || p.position === 'P';
    return p.position === filter;
  }).sort((a, b) => {
    let valA = a[sortKey] ?? '';
    let valB = b[sortKey] ?? '';

    // Handle string comparisons
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }

    // Handle numeric comparisons
    const numA = valA as number;
    const numB = valB as number;
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  const SortIndicator = ({ activeKey }: { activeKey: SortKey }) => {
    if (sortKey !== activeKey) return <span className="ml-1 opacity-20">⇅</span>;
    return <span className="ml-1 text-blue-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-black text-white italic">Roster Hub</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-400 font-medium">Manage your program athletes.</p>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${roster.length >= ROSTER_CAP ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
              Capacity: {roster.length} / {ROSTER_CAP}
            </div>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5 overflow-x-auto max-w-lg scrollbar-hide">
          {positions.map(pos => (
            <button
              key={pos}
              onClick={() => setFilter(pos)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                filter === pos ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  Player <SortIndicator activeKey="name" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('position')}
                >
                  Pos <SortIndicator activeKey="position" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('archetype')}
                >
                  Archetype <SortIndicator activeKey="archetype" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('grade')}
                >
                  Grade <SortIndicator activeKey="grade" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('overall')}
                >
                  OVR <SortIndicator activeKey="overall" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('potential')}
                >
                  POT <SortIndicator activeKey="potential" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('academics')}
                >
                  GPA <SortIndicator activeKey="academics" />
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => toggleSort('injuryStatus')}
                >
                  Status <SortIndicator activeKey="injuryStatus" />
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRoster.map((player) => (
                <tr 
                  key={player.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 text-sm group-hover:border-blue-500/50 transition-colors font-black">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-100">{player.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">
                          {player.primarySport !== 'Football' ? `⭐ ${player.primarySport} Star` : 'Football Primary'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-black text-blue-400">
                      {player.position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {player.archetype || 'Balanced'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-300">{player.grade}th</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-lg">{player.overall}</span>
                      <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${player.overall}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-400">{player.potential}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${player.academics < 2.0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {player.academics.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${player.injuryStatus === 'Healthy' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                      <span className="text-[10px] font-bold uppercase text-slate-400">{player.injuryStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayer(player);
                        }}
                        className="text-[10px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
                      >
                        Details
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onCut(player.id);
                        }}
                        className="text-[10px] font-black text-rose-500/50 hover:text-rose-400 transition-colors uppercase tracking-widest"
                      >
                        Cut
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRoster.length === 0 && (
          <div className="py-20 text-center italic text-slate-500 opacity-40">
            No players found for this selection.
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerProfile 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </div>
  );
};

export default Roster;
