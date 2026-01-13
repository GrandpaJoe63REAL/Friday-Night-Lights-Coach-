
import React from 'react';
import { Player, PlayerStats } from '../types';

interface PlayerProfileProps {
  player: Player;
  onClose: () => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onClose }) => {
  // Helper to aggregate stats across all phases (OFFSEASON, PRESEASON, REGULAR_SEASON, PLAYOFFS)
  // Fix: Explicitly type 'curr' as PlayerStats and the accumulator to resolve 'unknown' property access errors
  const aggregateStats = Object.values(player.stats).reduce((acc, curr: PlayerStats) => ({
    passingYards: acc.passingYards + curr.passingYards,
    passingTds: acc.passingTds + curr.passingTds,
    rushingYards: acc.rushingYards + curr.rushingYards,
    rushingTds: acc.rushingTds + curr.rushingTds,
    gamesPlayed: acc.gamesPlayed + curr.gamesPlayed,
  }), { passingYards: 0, passingTds: 0, rushingYards: 0, rushingTds: 0, gamesPlayed: 0 });

  // Fix: Property access errors resolved by using aggregateStats
  const isRecruit = aggregateStats.gamesPlayed === 0 && player.scoutingLevel !== undefined;
  // USER REQUEST: Traits revealed after 2 scouting levels
  const traitsVisible = !isRecruit || player.scoutingLevel >= 2;
  const isFullyScouted = !isRecruit || player.scoutingLevel === 3;

  const getVisibleRating = (val: number) => {
    if (isFullyScouted) return val;
    const margin = [15, 10, 5, 0][player.scoutingLevel || 0];
    return `${Math.max(25, val - margin)}-${Math.min(99, val + margin)}`;
  };

  const getVisibleOvr = () => {
    if (isFullyScouted) return player.overall;
    const margin = [12, 7, 3, 0][player.scoutingLevel || 0];
    return `${Math.max(25, player.overall - margin)}-${Math.min(99, player.overall + margin)}`;
  };

  const getTraitStyle = (trait: string) => {
    const negativeTraits = ['Locker Room Cancer', 'Academic Risk', 'Injury-Prone', 'Spotlight Junkie'];
    const positiveTraits = ['Team Leader', 'Clutch', 'Hard Worker', 'Big Game Performer', 'Coachable'];
    
    if (negativeTraits.includes(trait)) {
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    }
    if (positiveTraits.includes(trait)) {
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const getTraitIcon = (trait: string) => {
    if (trait === 'Locker Room Cancer') return '☢️';
    if (trait === 'Academic Risk') return '📚';
    if (trait === 'Injury-Prone') return '🤕';
    if (trait === 'Team Leader') return '👑';
    return '✨';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="glass w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="relative p-8 pb-0">
          <button 
            onClick={onClose}
            className="absolute top-6 right-8 text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
          
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-slate-800 flex items-center justify-center text-5xl border-4 border-slate-700 shadow-xl font-black">
                {player.name.charAt(0)}
              </div>
              <div className="absolute -bottom-3 -right-3 min-w-[3rem] h-12 px-3 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white border-4 border-slate-950 shadow-lg text-sm">
                {getVisibleOvr()}
              </div>
            </div>

            <div className="flex-1 pt-2">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-4xl font-black text-white leading-none tracking-tight italic">{player.name}</h2>
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-black uppercase tracking-widest">
                    {player.position}
                  </span>
                  <span className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border border-white/10">
                    {isFullyScouted || player.scoutingLevel >= 1 ? player.archetype : 'Unknown Archetype'}
                  </span>
                </div>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest ml-1">
                  {player.grade}th Grade • {player.source || (player.primarySport === 'Football' ? 'Football Focus' : `${player.primarySport} Convert`)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {traitsVisible ? (
                  player.traits.map(trait => (
                    <span key={trait} className={`px-2 py-0.5 border rounded-md text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 ${getTraitStyle(trait)}`}>
                      {getTraitIcon(trait)} {trait}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 bg-slate-500/10 text-slate-500 border border-white/5 rounded-md text-[10px] font-black uppercase tracking-tight italic flex items-center gap-2">
                    🔒 Level 2 Scouting Required
                  </span>
                )}
                {traitsVisible && player.traits.length === 0 && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase italic">No Special Traits Found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Scouting Data</h3>
            <div className="grid grid-cols-2 gap-3">
              {isRecruit ? (
                <>
                  <StatSnippet label="Source" value={player.source || 'N/A'} />
                  <StatSnippet label="Football Exp" value={isFullyScouted ? `${player.footballExperience}%` : '???'} />
                  <StatSnippet label="Sport" value={player.primarySport} />
                  <StatSnippet label="Scouted" value={`Lvl ${player.scoutingLevel}/3`} />
                </>
              ) : (
                <>
                  {/* Fix: Accessing aggregated stats instead of the stats record directly */}
                  {player.position === 'QB' && (
                    <>
                      <StatSnippet label="Pass Yds" value={aggregateStats.passingYards.toFixed(0)} />
                      <StatSnippet label="Pass TDs" value={aggregateStats.passingTds} />
                    </>
                  )}
                  {['RB', 'QB'].includes(player.position) && (
                    <>
                      <StatSnippet label="Rush Yds" value={aggregateStats.rushingYards.toFixed(0)} />
                      <StatSnippet label="Rush TDs" value={aggregateStats.rushingTds} />
                    </>
                  )}
                  <StatSnippet label="Games" value={aggregateStats.gamesPlayed} />
                </>
              )}
            </div>

            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mt-4">Physical Attributes</h3>
            <div className="space-y-4">
              <RatingDisplay label="Speed" value={getVisibleRating(player.ratings.speed)} trueValue={player.ratings.speed} isScouted={isFullyScouted} />
              <RatingDisplay label="Strength" value={getVisibleRating(player.ratings.strength)} trueValue={player.ratings.strength} isScouted={isFullyScouted} />
              <RatingDisplay label="Awareness" value={getVisibleRating(player.ratings.awareness)} trueValue={player.ratings.awareness} isScouted={isFullyScouted} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Player Vitals</h3>
              <div className="grid grid-cols-2 gap-4">
                <VitalBox 
                  label="GPA" 
                  value={isFullyScouted || player.scoutingLevel >= 1 ? player.academics.toFixed(2) : '???'} 
                  status={player.academics < 2.0 ? 'critical' : 'good'} 
                />
                <VitalBox 
                  label="Morale" 
                  value={isFullyScouted ? `${player.morale}%` : '???'} 
                  status={player.morale < 50 ? 'warning' : 'good'} 
                />
                <VitalBox 
                  label="Status" 
                  value={player.injuryStatus} 
                  status={player.injuryStatus === 'Healthy' ? 'good' : 'critical'} 
                />
                <VitalBox 
                  label="Potential" 
                  value={isFullyScouted ? player.potential.toString() : '???'} 
                  status="neutral" 
                />
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                {isFullyScouted 
                  ? `"${player.name} is a ${player.grade}th grade ${player.position} playing as a ${player.archetype}. Scouting reports confirm a ceiling of ${player.potential}."`
                  : traitsVisible 
                    ? `"We've identified ${player.name} as a ${player.archetype} prospect. Key personality traits are confirmed, though physical metrics remain estimated. OVR range: ${getVisibleOvr()}."`
                    : `"Scouting report is incomplete for ${player.name}. Preliminary estimates place his ability between ${getVisibleOvr()}. more observation is needed to confirm his archetype."`}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-0 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const StatSnippet: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
  <div className="bg-blue-600/5 border border-blue-600/10 p-2 rounded-lg text-center">
    <div className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">{label}</div>
    <div className="text-sm font-black text-white">{value}</div>
  </div>
);

const RatingDisplay: React.FC<{ label: string, value: string | number, trueValue: number, isScouted: boolean }> = ({ label, value, trueValue, isScouted }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
      <div 
        className={`h-full bg-blue-50 transition-all duration-1000 ${isScouted ? 'opacity-100' : 'opacity-30 blur-sm'}`} 
        style={{ width: `${isScouted ? trueValue : 50}%` }} 
      />
    </div>
  </div>
);

const VitalBox: React.FC<{ label: string, value: string, status: 'good' | 'warning' | 'critical' | 'neutral' }> = ({ label, value, status }) => {
  const colorClass = {
    good: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
    neutral: 'text-blue-400',
  }[status];

  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-lg font-black ${colorClass}`}>{value}</div>
    </div>
  );
};

export default PlayerProfile;
