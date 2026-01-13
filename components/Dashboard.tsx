
import React from 'react';
import { GameState, Player, Position } from '../types';
import { calculateTeamRating, calculateOffensiveRating, calculateDefensiveRating } from '../engine/gameLogic';
import { PHASE_CONFIG } from '../constants';

interface DashboardProps {
  state: GameState;
  onAdvance: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdvance }) => {
  const teamRating = calculateTeamRating(state.roster);
  const offRating = calculateOffensiveRating(state.roster);
  const defRating = calculateDefensiveRating(state.roster);
  
  const config = PHASE_CONFIG[state.phase];
  const currentMonth = config.months[Math.floor((state.week - 1) / (config.weeks / config.months.length)) % config.months.length];

  const currentMatch = state.schedule.find(m => {
    if (state.phase === 'PRESEASON') return m.summary === 'SCRIMMAGE' && m.week === (state.week - 4) && !m.played;
    if (state.phase === 'REGULAR_SEASON') return m.summary === 'REGULAR' && m.week === state.week && !m.played;
    if (state.phase === 'PLAYOFFS') return m.summary === 'PLAYOFF' && m.week === state.week && !m.played;
    return false;
  });

  const injuredPlayers = state.roster.filter(p => p.injuryStatus === 'Out');
  
  // Players who progressed the most this week
  const topImprovers = [...state.roster]
    .filter(p => (p.lastOvrChange || 0) > 0)
    .sort((a, b) => (b.lastOvrChange || 0) - (a.lastOvrChange || 0))
    .slice(0, 5);

  // Checklist Logic
  const isRecruitmentComplete = state.scoutingPoints === 0 || state.recruitmentPool.length === 0;
  
  // Roster is "Updated" if no starters are currently injured
  const positionsToCheck: Position[] = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P'];
  const injuredStarters = positionsToCheck.some(pos => {
    const playersAtPos = state.roster.filter(p => p.position === pos);
    return playersAtPos.length > 0 && playersAtPos[0].injuryStatus === 'Out';
  });
  const isRosterUpdated = !injuredStarters;

  // Training is "Set" if staff style values have been tweaked from default 50
  const isTrainingSet = state.staff.some(s => s.styleValue !== 50);

  // Game is "Played" if there's no active match pending
  const isGamePlayed = !currentMatch;

  const checklistItems = [
    { label: 'Complete recruitment', completed: isRecruitmentComplete, detail: `${state.scoutingPoints} points remaining` },
    { label: 'Update roster', completed: isRosterUpdated, detail: injuredStarters ? 'Injured starter detected' : 'Depth chart optimized' },
    { label: 'Set training regime', completed: isTrainingSet, detail: 'Strategy sliders reviewed' },
    { label: 'Play game', completed: isGamePlayed, detail: isGamePlayed ? 'Week finalized' : 'Matchup pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white">{currentMonth}</span>
            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{state.phase.replace('_', ' ')} • Week {state.week}</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">{state.userSchool.name}</h2>
          <p className="text-slate-400 mt-2 font-medium">Record: {state.career.wins}-{state.career.losses}</p>
        </div>
        <button 
          onClick={onAdvance}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transform hover:scale-105 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-2"
        >
          <span>{currentMatch ? 'Simulate Week' : 'Advance Week'}</span>
          <span className="text-xl">➔</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all" />
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Program Rating</h3>
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-5xl font-black text-white">{teamRating}</span>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">TOTAL</span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-400 uppercase">OFF</span>
                <span className="text-xl font-black text-white">{offRating}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-400 uppercase">DEF</span>
                <span className="text-xl font-black text-white">{defRating}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <StatLine label="Prestige" value={state.userSchool.prestige} color="blue" />
            <StatLine label="Budget" value={Math.min(100, Math.round(state.userSchool.budget / 500))} color="emerald" />
          </div>
        </div>

        <div className="glass rounded-3xl p-6 md:col-span-2 border-l-4 border-blue-600">
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Activity: {state.phase}</h3>
          {currentMatch ? (
            <div className="flex items-center justify-between gap-8 h-full pb-8">
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-blue-900/40 rounded-full mx-auto flex items-center justify-center text-2xl mb-2">🦅</div>
                <div className="font-black text-lg truncate">{state.userSchool.name}</div>
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest bg-blue-500/10 rounded px-2 py-0.5 mt-1">OVR {teamRating}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white italic mb-1">{currentMatch.summary}</div>
                <div className="text-4xl font-black text-slate-700">VS</div>
              </div>
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-2xl mb-2">🛡️</div>
                <div className="font-black text-lg truncate">{currentMatch.opponentName}</div>
                <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest bg-rose-500/10 rounded px-2 py-0.5 mt-1">OVR {currentMatch.opponentRating}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full pb-8">
               <div className="text-4xl mb-2">{state.phase === 'OFFSEASON' ? '🏋️‍♂️' : '🏃‍♂️'}</div>
               <div className="text-xl font-black text-white uppercase italic">
                 {state.phase === 'OFFSEASON' ? 'Winter Training & Drills' : 'Summer Lifts & Practice'}
               </div>
               <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">Recruitment activity is high</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Checklist */}
        <div className="glass rounded-[2.5rem] p-8 border-t-8 border-amber-500 shadow-2xl bg-slate-900/40">
          <h3 className="font-black text-xl italic mb-6 flex items-center gap-2 text-white">
            <span className="text-amber-500">📋</span> Coach's Checklist
          </h3>
          <div className="space-y-4">
            {checklistItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${
                  item.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/20' 
                    : 'bg-white/5 border-white/5 opacity-80'
                }`}
              >
                <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                  item.completed 
                    ? 'bg-emerald-500 border-emerald-400 text-white' 
                    : 'bg-slate-800 border-slate-700 text-transparent'
                }`}>
                  <span className="text-sm font-black">✓</span>
                </div>
                <div>
                  <div className={`font-black text-sm uppercase tracking-wider ${item.completed ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-0.5">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Growth - NEW */}
        <div className="glass rounded-3xl p-6 border-l-4 border-emerald-500">
           <h3 className="font-black text-xl italic mb-6 flex items-center gap-2">
             <span className="text-emerald-500">📈</span> Weekly Growth
           </h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {topImprovers.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex justify-between items-center animate-in slide-in-from-right-4">
                <div>
                  <div className="font-bold text-white text-sm">{p.name}</div>
                  <div className="text-[10px] text-emerald-400 font-black uppercase">{p.position} • {p.overall} OVR</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-400 flex items-center gap-1">
                    <span className="text-xs">▲</span>+{p.lastOvrChange}
                  </div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">IMPROVED</div>
                </div>
              </div>
            ))}
            {topImprovers.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center italic text-slate-500 opacity-40">
                <div className="text-4xl mb-2">🐌</div>
                <div className="text-center px-4">No OVR increases this week. Adjust training intensity!</div>
              </div>
            )}
           </div>
        </div>

        {/* Injury Report */}
        <div className="glass rounded-3xl p-6 border-l-4 border-rose-600">
           <h3 className="font-black text-xl italic mb-6">Injury Report</h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {injuredPlayers.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white text-sm">{p.name}</div>
                  <div className="text-[10px] text-rose-400 font-black uppercase">{p.position} • {p.overall} OVR</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-white">{p.injuryWeeks} Wks</div>
                  <div className="text-[9px] font-bold text-slate-500 uppercase">RECOVERY</div>
                </div>
              </div>
            ))}
            {injuredPlayers.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center italic text-slate-500 opacity-40">
                <div className="text-4xl mb-2">💚</div>
                <div>Full Strength! No injuries.</div>
              </div>
            )}
           </div>
        </div>

        {/* Season Log */}
        <div className="glass rounded-3xl p-6">
           <h3 className="font-black text-xl italic mb-6">Recent Results</h3>
           <div className="space-y-4">
            {state.schedule.filter(m => m.played).slice(-4).reverse().map(game => (
              <div key={game.id} className="p-4 rounded-2xl bg-white/5 flex items-center justify-between border-l-2 border-white/10">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{game.summary} • W{game.week}</div>
                  <div className="font-bold text-white flex items-center gap-2">
                    vs {game.opponentName}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${ (game.homeTeamId === state.userSchool.id ? game.homeScore! > game.awayScore! : game.awayScore! > game.homeScore!) ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {game.homeScore} - {game.awayScore}
                  </div>
                </div>
              </div>
            ))}
            {state.schedule.filter(m => m.played).length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center italic text-slate-500 opacity-40">
                <div className="text-4xl mb-2">🏈</div>
                <div>No games played yet.</div>
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatLine: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => {
  const barColor = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }[color] || 'bg-slate-500';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-200">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

export default Dashboard;
