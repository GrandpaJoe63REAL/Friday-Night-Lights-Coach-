
import React, { useState } from 'react';
import { Player, CoachProfile, RecruitSource } from '../types';
import PlayerProfile from './PlayerProfile';

interface RecruitingProps {
  onRecruit: (player: Player) => void;
  onScout: (playerId: string) => void;
  coach: CoachProfile;
  recruitmentPool: Player[];
  scoutingPoints: number;
  currentRosterCount: number;
  rosterCap: number;
}

const Recruiting: React.FC<RecruitingProps> = ({ 
  onRecruit, 
  onScout, 
  coach, 
  recruitmentPool, 
  scoutingPoints, 
  currentRosterCount, 
  rosterCap 
}) => {
  const [activeTab, setActiveTab] = useState<RecruitSource | 'All'>('All');
  const [recruitingEnergy, setRecruitingEnergy] = useState(5);
  const [selectedProspect, setSelectedProspect] = useState<Player | null>(null);

  const filteredPool = recruitmentPool.filter(p => activeTab === 'All' || p.source === activeTab);

  const handleRecruit = (player: Player) => {
    if (currentRosterCount >= rosterCap) {
      alert(`Cannot sign more players! Roster is at capacity (${rosterCap}). Cut a player first.`);
      return;
    }

    if (recruitingEnergy <= 0) {
      alert("Out of recruiting focus for this week!");
      return;
    }

    setRecruitingEnergy(prev => prev - 1);
    
    // Archetype bonuses
    const recruiterBonus = coach.archetype === 'Recruiter' ? 20 : 0;
    const successChance = (player.interestLevel + recruiterBonus) / 100;
    
    const roll = Math.random();
    if (roll < successChance) {
      alert(`COMMITMENT! ${player.name} has signed with the program!`);
      onRecruit({ ...player, scoutingLevel: 3 }); // Commits are fully scouted
    } else {
      alert(`${player.name} is leaning elsewhere. Their interest dropped.`);
      player.interestLevel = Math.max(0, player.interestLevel - 15);
    }
  };

  const getOvrRange = (player: Player) => {
    const margin = [12, 7, 3, 0][player.scoutingLevel];
    if (margin === 0) return `${player.overall}`;
    return `${Math.max(25, player.overall - margin)}-${Math.min(99, player.overall + margin)}`;
  };

  const getSourceIcon = (source?: RecruitSource) => {
    switch (source) {
      case 'Middle School': return '🏫';
      case 'Youth League': return '👦';
      case 'Transfer Portal': return '🔄';
      case 'Other Sport': return '🏀';
      case 'Walk-On': return '👟';
      default: return '👤';
    }
  };

  const getSourceColor = (source?: RecruitSource) => {
    switch (source) {
      case 'Middle School': return 'text-sky-400 bg-sky-500/10';
      case 'Youth League': return 'text-emerald-400 bg-emerald-500/10';
      case 'Transfer Portal': return 'text-rose-400 bg-rose-500/10';
      case 'Other Sport': return 'text-amber-400 bg-amber-500/10';
      case 'Walk-On': return 'text-slate-400 bg-slate-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const isRosterFull = currentRosterCount >= rosterCap;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-white italic tracking-tight uppercase">Recruitment Hub</h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isRosterFull ? 'bg-rose-500/10 border-rose-500 text-rose-500' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
              Roster: {currentRosterCount} / {rosterCap}
            </div>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
            Building a dynasty starts with scouting local pipelines. spend points to reveal true talent.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-4 glass px-6 py-4 rounded-[2rem] border-l-4 border-amber-500 shadow-xl">
            <div className="text-amber-500 text-4xl font-black">{recruitingEnergy}</div>
            <div>
              <div className="text-[10px] font-black uppercase text-amber-500/70 tracking-widest leading-none">Recruiting Focus</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">Interaction Budget</div>
            </div>
          </div>
          <div className="flex items-center gap-4 glass px-6 py-4 rounded-[2rem] border-l-4 border-blue-500 shadow-xl">
            <div className="text-blue-500 text-4xl font-black">{scoutingPoints}</div>
            <div>
              <div className="text-[10px] font-black uppercase text-blue-500/70 tracking-widest leading-none">Scouting Points</div>
              <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">Narrow OVR range</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Middle School', 'Youth League', 'Transfer Portal', 'Other Sport'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
              activeTab === tab 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
            }`}
          >
            {tab === 'All' ? 'Full Pool' : tab}
          </button>
        ))}
      </div>

      {isRosterFull && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="text-xs font-black text-rose-500 uppercase tracking-widest">Roster Capacity Reached</div>
            <p className="text-[10px] text-rose-400/70 font-bold">You must cut players in the Roster Hub before signing any new prospects.</p>
          </div>
        </div>
      )}

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPool.length > 0 ? (
          filteredPool.map((prospect) => (
            <div key={prospect.id} className="glass rounded-[2.5rem] p-6 flex flex-col group hover:translate-y-[-4px] transition-all border-b-4 border-white/5 hover:border-blue-600/50">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 ${getSourceColor(prospect.source)}`}>
                  <span>{getSourceIcon(prospect.source)}</span>
                  <span>{prospect.source}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white leading-none tracking-tighter">
                    {getOvrRange(prospect)}
                  </div>
                  <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">EST. Overall</div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-xl font-black text-white italic truncate tracking-tight">{prospect.name}</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mt-1">
                  <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{prospect.position}</span>
                  <span>Grade {prospect.grade}</span>
                  <span>•</span>
                  <span>{prospect.scoutingLevel === 3 ? `${prospect.potential} POT` : '??? POT'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Interest Level</span>
                    <span className={prospect.interestLevel > 70 ? 'text-emerald-400' : prospect.interestLevel > 40 ? 'text-amber-400' : 'text-rose-400'}>
                      {prospect.interestLevel}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${prospect.interestLevel > 70 ? 'bg-emerald-500' : prospect.interestLevel > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                      style={{ width: `${prospect.interestLevel}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSelectedProspect(prospect)}
                    className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl text-center border border-white/5 transition-colors"
                  >
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Scout Profile</div>
                    <div className="text-xs font-black text-white flex items-center justify-center gap-1">
                      📄 VIEW
                    </div>
                  </button>
                  <button 
                    disabled={prospect.scoutingLevel >= 3 || scoutingPoints <= 0}
                    onClick={() => onScout(prospect.id)}
                    className={`p-3 rounded-2xl text-center border border-white/5 transition-colors ${prospect.scoutingLevel >= 3 ? 'opacity-30 bg-white/5' : 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-500/20'}`}
                  >
                    <div className="text-[8px] font-black text-slate-500 uppercase mb-1">Scout (1 PT)</div>
                    <div className="text-xs font-black text-blue-400">
                      {prospect.scoutingLevel >= 3 ? 'FULLY SCOUTED' : `LEVEL ${prospect.scoutingLevel}/3`}
                    </div>
                  </button>
                </div>
              </div>

              <button 
                disabled={isRosterFull}
                onClick={() => handleRecruit(prospect)}
                className={`mt-auto w-full py-5 font-black uppercase text-xs rounded-2xl transition-all shadow-xl border-b-4 border-black/40 active:translate-y-1 ${
                  isRosterFull 
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border-transparent' 
                    : 'bg-slate-800 hover:bg-blue-600 text-white group-hover:shadow-blue-900/40'
                }`}
              >
                {isRosterFull ? 'Roster Full' : 'Attempt Commitment'}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass rounded-[3rem] border-dashed border-2 border-white/5">
            <div className="text-6xl mb-4 opacity-20">🔎</div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No prospects available in this category.</p>
            <p className="text-[10px] text-slate-600 font-medium mt-2">Check back next week for new local pipeline additions.</p>
          </div>
        )}
      </div>

      {selectedProspect && (
        <PlayerProfile 
          player={selectedProspect} 
          onClose={() => setSelectedProspect(null)} 
        />
      )}

      {/* Tip */}
      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="text-2xl">💡</div>
        <p className="text-sm text-blue-200/70 font-medium">
          <strong className="text-blue-200 uppercase">Coach Insight:</strong> 
          {coach.archetype === 'Recruiter' 
            ? " Your reputation as a top-tier Recruiter gives you a massive +20% boost to closing deals on every prospect." 
            : " spend scouting points on high-interest prospects first to ensure you don't commit to a 'bust' with a low OVR."}
        </p>
      </div>
    </div>
  );
};

export default Recruiting;
