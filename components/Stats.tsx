
import React, { useState } from 'react';
import { Player, SeasonPhase } from '../types';

interface StatsProps {
  roster: Player[];
  currentPhase: SeasonPhase;
}

const Stats: React.FC<StatsProps> = ({ roster, currentPhase }) => {
  const [category, setCategory] = useState<'OFFENSE' | 'DEFENSE'>('OFFENSE');
  const [selectedPhase, setSelectedPhase] = useState<SeasonPhase>(currentPhase);

  const phases: SeasonPhase[] = ['PRESEASON', 'REGULAR_SEASON', 'PLAYOFFS'];

  const getPhaseLabel = (p: SeasonPhase) => {
    switch (p) {
      case 'PRESEASON': return 'Pre-Season';
      case 'REGULAR_SEASON': return 'Regular Season';
      case 'PLAYOFFS': return 'Post-Season';
      default: return p;
    }
  };

  const offenseStats = [...roster]
    .filter(p => ['QB', 'RB', 'WR', 'TE'].includes(p.position))
    .sort((a, b) => {
      const statsA = a.stats[selectedPhase];
      const statsB = b.stats[selectedPhase];
      return (statsB.passingYards + statsB.rushingYards + statsB.receivingYards) - 
             (statsA.passingYards + statsA.rushingYards + statsA.receivingYards);
    });

  const defenseStats = [...roster]
    .filter(p => ['DL', 'LB', 'CB', 'S'].includes(p.position))
    .sort((a, b) => b.stats[selectedPhase].tackles - a.stats[selectedPhase].tackles);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white italic">Season Stats</h2>
          <p className="text-slate-400 font-medium">Player performance for {getPhaseLabel(selectedPhase)}.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* Phase Selector */}
          <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/5">
            {phases.map(phase => (
              <button 
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${selectedPhase === phase ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {getPhaseLabel(phase).split(' ')[0]}
              </button>
            ))}
          </div>
          
          {/* Category Selector */}
          <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/5 self-end">
            <button 
              onClick={() => setCategory('OFFENSE')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${category === 'OFFENSE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              OFFENSE
            </button>
            <button 
              onClick={() => setCategory('DEFENSE')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${category === 'DEFENSE' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              DEFENSE
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-6 py-4">Player</th>
              {category === 'OFFENSE' ? (
                <>
                  <th className="px-6 py-4">Passing</th>
                  <th className="px-6 py-4">Rushing</th>
                  <th className="px-6 py-4">Receiving</th>
                  <th className="px-6 py-4">Total TD</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">Tackles</th>
                  <th className="px-6 py-4">Sacks</th>
                  <th className="px-6 py-4">INTs</th>
                  <th className="px-6 py-4">GP</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(category === 'OFFENSE' ? offenseStats : defenseStats).map((player) => {
              const s = player.stats[selectedPhase];
              return (
                <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-blue-400 text-xs border border-white/5">
                        {player.position}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{player.name}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Grade {player.grade}</div>
                      </div>
                    </div>
                  </td>
                  {category === 'OFFENSE' ? (
                    <>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-bold text-slate-200">{s.passingYards.toFixed(0)} YDS</div>
                        <div className="text-[10px] text-slate-500 font-bold">{s.passingTds} TD</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                         <div className="font-bold text-slate-200">{s.rushingYards.toFixed(0)} YDS</div>
                         <div className="text-[10px] text-slate-500 font-bold">{s.rushingTds} TD</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                         <div className="font-bold text-slate-200">{s.receivingYards.toFixed(0)} YDS</div>
                         <div className="text-[10px] text-slate-500 font-bold">{s.receivingTds} TD</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-blue-400">
                        {s.passingTds + s.rushingTds + s.receivingTds}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">{s.tackles}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-200">{s.sacks}</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-400">{s.interceptionsCaught}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{s.gamesPlayed}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {(category === 'OFFENSE' ? offenseStats : defenseStats).length === 0 && (
          <div className="p-20 text-center italic text-slate-500 opacity-40">
             No performance data for this phase.
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
