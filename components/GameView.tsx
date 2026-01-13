
import React, { useState, useEffect, useRef } from 'react';
import { ActiveGame, Player, TeamGameStats, CoachProfile } from '../types';
import { executeSinglePlay, executeCoachPlay, calculateTeamRating } from '../engine/gameLogic';

interface GameViewProps {
  game: ActiveGame;
  roster: Player[];
  schoolName: string;
  coach: CoachProfile;
  onUpdate: (update: any) => void;
  onFinish: (game: ActiveGame) => void;
}

const GameView: React.FC<GameViewProps> = ({ game, roster, schoolName, coach, onUpdate, onFinish }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const teamRating = calculateTeamRating(roster);
  const simIntervalRef = useRef<number | null>(null);

  const startTimeLapse = () => {
    if (game.waitingForCoach || game.isGameOver) return;
    setIsSimulating(true);
    
    simIntervalRef.current = window.setInterval(() => {
      onUpdate((prevGame: ActiveGame) => {
        const next = executeSinglePlay(prevGame);
        if (next.waitingForCoach || next.isGameOver) {
          stopTimeLapse();
        }
        return next;
      });
    }, 600);
  };

  const stopTimeLapse = () => {
    setIsSimulating(false);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  const handlePlayCall = (type: string) => {
    const next = executeCoachPlay(game, type, teamRating, coach.archetype);
    onUpdate(next);
    
    if (!next.waitingForCoach && !next.isGameOver) {
      setTimeout(() => {
        startTimeLapse();
      }, 1500);
    }
  };

  useEffect(() => {
    return () => stopTimeLapse();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(Math.max(0, secs) / 60);
    const s = Math.max(0, secs) % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (game.isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in-95 duration-500">
        <div className="glass p-12 rounded-[3.5rem] text-center border-b-8 border-blue-600 shadow-2xl">
          <h2 className="text-6xl font-black mb-4 uppercase italic tracking-tighter text-white">Final Score</h2>
          <div className="flex items-center justify-center gap-16 mb-12">
            <div className="text-center">
              <div className="text-xl text-slate-400 font-black uppercase mb-3">{schoolName}</div>
              <div className="text-8xl font-black text-white">{game.homeScore}</div>
            </div>
            <div className="text-5xl font-black text-slate-800">VS</div>
            <div className="text-center">
              <div className="text-xl text-slate-400 font-black uppercase mb-3">{game.opponentName}</div>
              <div className="text-8xl font-black text-white">{game.awayScore}</div>
            </div>
          </div>
          <button 
            onClick={() => onFinish(game)}
            className="px-16 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl rounded-[2rem] transition-all shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95"
          >
            RETURN TO PROGRAM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col pb-8">
      {/* Scoreboard */}
      <div className="glass p-6 rounded-[2.5rem] flex items-center justify-between border-b-4 border-blue-600 shadow-xl">
        <div className="flex items-center gap-10">
          <div className="text-center">
            <div className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] leading-none mb-1">
              {schoolName} <span className="bg-blue-500/10 px-1 rounded text-[9px] ml-1">OVR {teamRating}</span>
            </div>
            <div className="text-6xl font-black leading-none tracking-tighter text-white">{game.homeScore}</div>
          </div>
          <div className="h-16 w-px bg-white/10" />
          <div className="text-center">
            <div className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] leading-none mb-1">
              {game.opponentName} <span className="bg-rose-500/10 px-1 rounded text-[9px] ml-1">OVR ??</span>
            </div>
            <div className="text-6xl font-black leading-none tracking-tighter text-white">{game.awayScore}</div>
          </div>
        </div>
        
        <div className="text-center px-12 py-4 bg-black/50 rounded-3xl border border-white/5 shadow-inner">
          <div className="text-3xl font-black tracking-tighter text-white">Q{game.quarter} <span className="text-blue-500 mx-2">|</span> {formatTime(game.timeRemaining)}</div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5 animate-pulse">Live Coverage</div>
        </div>

        <div className="text-right">
          <div className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Down & Dist</div>
          <div className="text-3xl font-black italic text-white">{game.down === 0 ? 'K.O.' : `${game.down} & ${game.distance}`}</div>
        </div>
      </div>

      {/* Field View (Time Lapse Display) */}
      <div className="relative h-28 bg-emerald-950/60 rounded-[2.5rem] border-2 border-emerald-500/30 overflow-hidden flex items-center shadow-2xl">
        <div className="absolute inset-y-0 left-0 w-4 bg-blue-600/80 shadow-[10px_0_20px_rgba(37,99,235,0.4)] z-10" />
        <div className="absolute inset-y-0 right-0 w-4 bg-rose-600/80 shadow-[-10px_0_20px_rgba(225,29,72,0.4)] z-10" />
        
        <div className="absolute inset-y-0 left-4 w-12 bg-blue-600/10 flex items-center justify-center border-r border-white/5">
          <span className="[writing-mode:vertical-lr] text-[10px] font-black text-blue-500/50 uppercase tracking-[0.5em]">HOME</span>
        </div>
        <div className="absolute inset-y-0 right-4 w-12 bg-rose-600/10 flex items-center justify-center border-l border-white/5">
          <span className="[writing-mode:vertical-lr] text-[10px] font-black text-rose-500/50 uppercase tracking-[0.5em] rotate-180">AWAY</span>
        </div>

        <div 
          className="absolute h-10 w-10 bg-amber-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/80 transition-all duration-500 ease-out z-20"
          style={{ left: `${game.yardLine}%`, transform: 'translateX(-50%)' }}
        >
          <div className="text-xl animate-bounce">🏈</div>
        </div>

        <div className="w-full flex justify-between px-20 pointer-events-none opacity-20 z-0">
          {[10, 20, 30, 40, 50, 40, 30, 20, 10].map((num, i) => (
            <div key={i} className="text-3xl font-black text-white">{num}</div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden min-h-0">
        <div className="glass rounded-[2rem] p-6 flex flex-col lg:col-span-3 shadow-xl overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Game Feed (Time Lapse)</h3>
            {isSimulating && (
              <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-600/10 rounded-full text-blue-400 font-black text-[10px] uppercase tracking-widest animate-pulse border border-blue-500/20">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                Processing Drive...
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-4 custom-scrollbar">
            {game.playHistory.map((play, idx) => (
              <div 
                key={idx} 
                className={`p-5 rounded-2xl border-l-4 transition-all duration-500 animate-in slide-in-from-left-4 ${
                  idx === 0 
                    ? 'bg-blue-600/20 border-blue-500 scale-[1.02] shadow-lg text-white font-bold text-lg' 
                    : 'bg-white/5 border-slate-700 opacity-60 text-slate-400 text-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black opacity-30">#{game.playHistory.length - idx}</span>
                  <p>{play}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-1 overflow-y-auto pr-1">
          <div className="glass rounded-[2rem] p-6 shadow-xl border-t-4 border-blue-500 flex flex-col gap-3 bg-slate-900/40">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center border-b border-white/5 pb-3">Box Score</h3>
            
            <div className="grid grid-cols-3 items-center text-center">
              <div className="text-xs font-bold text-blue-400 uppercase truncate">Eagles</div>
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">STAT</div>
              <div className="text-xs font-bold text-rose-400 uppercase truncate">Away</div>
            </div>

            <div className="space-y-1">
              <StatRow label="YDS" home={game.gameStats.home.totalYards} away={game.gameStats.away.totalYards} />
              <StatRow label="PASS" home={game.gameStats.home.passYards} away={game.gameStats.away.passYards} />
              <StatRow label="RUSH" home={game.gameStats.home.rushYards} away={game.gameStats.away.rushYards} />
              <StatRow label="1ST DN" home={game.gameStats.home.firstDowns} away={game.gameStats.away.firstDowns} />
              <StatRow label="TO" home={game.gameStats.home.turnovers} away={game.gameStats.away.turnovers} />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 flex flex-col border-t-8 border-amber-600 shadow-2xl bg-slate-950/20">
            {game.waitingForCoach ? (
              <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center p-4 bg-amber-500/10 rounded-2xl mb-2 border border-amber-500/30">
                  <h4 className="font-black text-amber-500 uppercase tracking-widest text-lg italic">{game.momentDescription}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-relaxed">Decision Required</p>
                </div>
                
                <div className="space-y-2">
                  {game.momentDescription === "Quarter Break" ? (
                    <button onClick={() => handlePlayCall('CONTINUE')} className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-[1.25rem] font-black uppercase text-base border-b-6 border-black/40 text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-95">Next Quarter</button>
                  ) : (
                    <>
                      <button onClick={() => handlePlayCall('RUN')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-[1rem] font-black uppercase text-xs border-b-4 border-black/40 text-slate-100 transition-all hover:scale-[1.02] active:translate-y-1">Inside Run</button>
                      <button onClick={() => handlePlayCall('PASS_SHORT')} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-[1rem] font-black uppercase text-xs border-b-4 border-black/40 text-slate-100 transition-all hover:scale-[1.02] active:translate-y-1">Slant Pass</button>
                      <button onClick={() => handlePlayCall('PASS_LONG')} className="w-full py-3 bg-rose-900/60 hover:bg-rose-900/80 rounded-[1rem] font-black uppercase text-xs border-b-4 border-black/40 text-rose-100 transition-all hover:scale-[1.02] active:translate-y-1">Deep Bomb</button>
                      
                      {(game.down === 4 && game.yardLine < 70) && (
                        <button onClick={() => handlePlayCall('PUNT')} className="w-full py-3 bg-slate-950 hover:bg-black rounded-[1rem] font-black uppercase text-xs border-b-4 border-black/80 text-slate-500 mt-2">Punt Away</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <div className={`text-[5rem] mb-4 transition-all duration-1000 ${isSimulating ? 'rotate-[360deg] opacity-20 scale-75' : 'opacity-100'}`}>
                  {isSimulating ? '⚡' : '📋'}
                </div>
                
                <div className="mb-6">
                  <h4 className="text-xl font-black uppercase text-white tracking-tight">{isSimulating ? 'LIVE SIM' : 'STANDBY'}</h4>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 leading-relaxed">
                    Simulation pauses for critical moments.
                  </p>
                </div>

                {!isSimulating ? (
                  <button 
                    onClick={startTimeLapse}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.25rem] shadow-2xl shadow-blue-600/40 transition-all transform hover:scale-105 active:scale-95 text-lg uppercase tracking-widest border-b-6 border-black/40"
                  >
                    START SIM
                  </button>
                ) : (
                  <button 
                    onClick={stopTimeLapse}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-[1.25rem] transition-all text-[10px] uppercase tracking-widest border-b-4 border-black/40"
                  >
                    PAUSE
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{ label: string, home: number, away: number }> = ({ label, home, away }) => (
  <div className="grid grid-cols-3 items-center text-center py-1 bg-white/5 rounded-lg border border-white/5 mb-1">
    <div className="text-sm font-black text-white">{home}</div>
    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{label}</div>
    <div className="text-sm font-black text-white">{away}</div>
  </div>
);

export default GameView;
