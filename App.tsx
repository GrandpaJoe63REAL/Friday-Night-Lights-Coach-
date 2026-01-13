
import React, { useState, useEffect } from 'react';
import { GameState, Player, ActiveGame, Staff, CoachProfile } from './types';
import { createInitialState, advanceWeek, startInteractiveGame } from './engine/gameLogic';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Roster from './components/Roster';
import Recruiting from './components/Recruiting';
import Stats from './components/Stats';
import GameView from './components/GameView';
import StaffView from './components/StaffView';
import CoachCreation from './components/CoachCreation';
import DepthChart from './components/DepthChart';
import LoadingScreen from './components/LoadingScreen';
import SettingsView from './components/SettingsView';

const ROSTER_CAP = 53;
const SAVE_SLOTS = ['slot_1', 'slot_2', 'slot_3'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showCoachCreation, setShowCoachCreation] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<string>('slot_1');
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  useEffect(() => {
    const lastActiveSlot = localStorage.getItem('hs_football_coach_active_slot') || 'slot_1';
    setCurrentSlot(lastActiveSlot);
    const saved = localStorage.getItem(`hs_football_coach_${lastActiveSlot}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setIsGameStarted(true);
        setLastSaved(parsed.lastSaved || null);
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
  }, []);

  // Auto-save whenever gameState changes
  useEffect(() => {
    if (gameState) {
      const updatedState = { ...gameState, lastSaved: Date.now() };
      localStorage.setItem(`hs_football_coach_${currentSlot}`, JSON.stringify(updatedState));
      localStorage.setItem('hs_football_coach_active_slot', currentSlot);
      // We don't setLastSaved(updatedState.lastSaved) here to avoid infinite loop, 
      // but the state itself has it.
    }
  }, [gameState, currentSlot]);

  const handleManualSave = () => {
    if (!gameState) return;
    const now = Date.now();
    const updatedState = { ...gameState, lastSaved: now };
    setGameState(updatedState);
    setLastSaved(now);
    localStorage.setItem(`hs_football_coach_${currentSlot}`, JSON.stringify(updatedState));
  };

  const handleLoadSlot = (slot: string) => {
    const saved = localStorage.getItem(`hs_football_coach_${slot}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState(parsed);
        setCurrentSlot(slot);
        setIsGameStarted(true);
        setLastSaved(parsed.lastSaved || null);
        setActiveTab('dashboard');
      } catch (e) {
        alert("Failed to load save slot.");
      }
    } else {
      alert("This slot is empty.");
    }
  };

  const handleExportSave = () => {
    if (!gameState) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `career_${gameState.coach.name.replace(/\s/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportSave = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.coach && parsed.userSchool && parsed.roster) {
        setGameState(parsed);
        setIsGameStarted(true);
        setActiveTab('dashboard');
      } else {
        throw new Error("Invalid save file");
      }
    } catch (e) {
      alert("Failed to import save. Please check the file format.");
    }
  };

  const handleResetCareer = () => {
    if (confirm("Are you sure? This will delete the current career in this slot forever.")) {
      localStorage.removeItem(`hs_football_coach_${currentSlot}`);
      setGameState(null);
      setIsGameStarted(false);
      setShowCoachCreation(false);
      setActiveTab('dashboard');
    }
  };

  const handleStartNewCareer = () => {
    setShowCoachCreation(true);
  };

  const handleCoachCreationComplete = (profile: CoachProfile, teamName: string) => {
    const freshState = createInitialState(profile, teamName);
    setGameState(freshState);
    setIsGameStarted(true);
    setShowCoachCreation(false);
  };

  const handleAdvance = () => {
    if (!gameState) return;
    setIsAdvancing(true);
    setTimeout(() => {
      const nextState = advanceWeek(gameState);
      setGameState(nextState);
      setIsAdvancing(false);
      if (nextState.week === 1) {
        setActiveTab('dashboard');
      }
    }, 2000);
  };

  const getCurrentMatch = () => {
    if (!gameState) return null;
    return gameState.schedule.find(m => {
      if (gameState.phase === 'PRESEASON') return m.summary === 'SCRIMMAGE' && m.week === (gameState.week - 4) && !m.played;
      if (gameState.phase === 'REGULAR_SEASON') return m.summary === 'REGULAR' && m.week === gameState.week && !m.played;
      if (gameState.phase === 'PLAYOFFS') return m.summary === 'PLAYOFF' && m.week === gameState.week && !m.played;
      return false;
    });
  };

  const handlePlayGame = () => {
    const currentMatch = getCurrentMatch();
    if (!currentMatch || !gameState) return;
    const activeGame = startInteractiveGame(gameState, currentMatch.id);
    setGameState({ ...gameState, activeGame });
    setActiveTab('game');
  };

  const handleGameUpdate = (update: ActiveGame | ((prev: ActiveGame) => ActiveGame)) => {
    setGameState(prev => {
      if (!prev || !prev.activeGame) return prev;
      const nextActiveGame = typeof update === 'function' ? update(prev.activeGame) : update;
      return { ...prev, activeGame: nextActiveGame };
    });
  };

  const handleGameFinish = (finalGame: ActiveGame) => {
    setGameState(prev => {
      if (!prev) return prev;
      const updatedSchedule = prev.schedule.map(m => {
        if (m.id === finalGame.matchupId) {
          return {
            ...m,
            played: true,
            homeScore: finalGame.homeScore,
            awayScore: finalGame.awayScore,
          };
        }
        return m;
      });
      const finishedMatch = updatedSchedule.find(m => m.id === finalGame.matchupId);
      const isUserHome = finishedMatch?.homeTeamId === prev.userSchool.id;
      const userFinalScore = isUserHome ? finalGame.homeScore : finalGame.awayScore;
      const opponentFinalScore = isUserHome ? finalGame.awayScore : finalGame.homeScore;
      const win = userFinalScore > opponentFinalScore;
      const isScrimmage = finishedMatch?.summary === 'SCRIMMAGE';
      const phase = prev.phase;
      const teamStats = isUserHome ? finalGame.gameStats.home : finalGame.gameStats.away;
      const updatedRoster = prev.roster.map(player => {
        if (player.injuryStatus === 'Out') return player;
        const s = player.stats[phase];
        s.gamesPlayed++;
        if (player.position === 'QB') {
          s.passingYards += teamStats.passYards;
          s.passingTds += Math.floor(userFinalScore / 10);
        } else if (player.position === 'RB') {
          const portion = (player.overall / 300);
          s.rushingYards += teamStats.rushYards * portion;
          s.rushingTds += Math.random() > 0.7 ? 1 : 0;
        } else if (player.position === 'WR' || player.position === 'TE') {
          const portion = (player.overall / 400);
          s.receivingYards += teamStats.passYards * portion;
          s.receptions += Math.floor(Math.random() * 4);
          s.receivingTds += Math.random() > 0.8 ? 1 : 0;
        } else if (['DL', 'LB', 'CB', 'S', 'DE', 'DT'].includes(player.position)) {
          s.tackles += Math.floor(Math.random() * 6) + 2;
          if (Math.random() > 0.92) s.sacks++;
          if (Math.random() > 0.96) s.interceptionsCaught++;
        }
        return player;
      });
      return {
        ...prev,
        roster: updatedRoster,
        schedule: updatedSchedule,
        activeGame: undefined,
        career: {
          ...prev.career,
          wins: prev.career.wins + (!isScrimmage && win ? 1 : 0),
          losses: prev.career.losses + (!isScrimmage && !win ? 1 : 0),
        }
      };
    });
    setActiveTab('dashboard');
  };

  const handleRecruit = (player: Player) => {
    if (!gameState) return;
    if (gameState.roster.length >= ROSTER_CAP) {
      alert(`Roster is full! (Cap: ${ROSTER_CAP})`);
      return;
    }
    setGameState({
      ...gameState,
      roster: [...gameState.roster, player],
      recruitmentPool: gameState.recruitmentPool.filter(p => p.id !== player.id)
    });
  };

  const handleCutPlayer = (playerId: string) => {
    setGameState(prev => {
      if (!prev) return prev;
      const player = prev.roster.find(p => p.id === playerId);
      if (!player) return prev;
      if (!confirm(`Are you sure you want to cut ${player.name}? This cannot be undone.`)) return prev;
      return {
        ...prev,
        roster: prev.roster.filter(p => p.id !== playerId)
      };
    });
  };

  const handleScout = (playerId: string) => {
    setGameState(prev => {
      if (!prev || prev.scoutingPoints <= 0) return prev;
      const updatedPool = prev.recruitmentPool.map(p => {
        if (p.id === playerId && p.scoutingLevel < 3) {
          return { ...p, scoutingLevel: p.scoutingLevel + 1 };
        }
        return p;
      });
      return {
        ...prev,
        scoutingPoints: prev.scoutingPoints - 1,
        recruitmentPool: updatedPool
      };
    });
  };

  const handleHireStaff = (newStaff: Staff, cost: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      const newStaffList = prev.staff.map(s => s.role === newStaff.role ? newStaff : s);
      return {
        ...prev,
        staff: newStaffList,
        userSchool: {
          ...prev.userSchool,
          budget: prev.userSchool.budget - cost
        }
      };
    });
  };

  const handleUpdateStaffStyle = (staffId: string, styleValue: number) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        staff: prev.staff.map(s => s.id === staffId ? { ...s, styleValue } : s)
      };
    });
  };

  const handleReorderRoster = (newRoster: Player[]) => {
    setGameState(prev => prev ? ({ ...prev, roster: newRoster }) : prev);
  };

  if (showCoachCreation) {
    return <CoachCreation onComplete={handleCoachCreationComplete} />;
  }

  if (!isGameStarted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e3adbb17c3?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="relative text-center max-w-2xl animate-in zoom-in-90 duration-700">
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter mb-4 italic text-white leading-none">
            Friday Night Lights <br/><span className="text-blue-600">Coach</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            The most realistic high school football management simulator. Build a legacy, manage students, and win the State Championship.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button onClick={handleStartNewCareer} className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 border-b-8 border-blue-900">
              START CAREER
            </button>
            <div className="flex gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
              {SAVE_SLOTS.map(slot => (
                <button 
                  key={slot} 
                  onClick={() => handleLoadSlot(slot)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${localStorage.getItem(`hs_football_coach_${slot}`) ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/10' : 'border-slate-700 text-slate-700 opacity-50'}`}
                >
                  {slot.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gameState) return null;
  const currentMatch = getCurrentMatch();

  return (
    <>
      {isAdvancing && <LoadingScreen />}
      
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        gameYear={gameState.year}
        gameWeek={gameState.week}
        phase={gameState.phase}
        schoolName={gameState.userSchool.name}
      >
        {activeTab === 'game' && gameState.activeGame ? (
          <GameView 
            game={gameState.activeGame} 
            roster={gameState.roster} 
            schoolName={gameState.userSchool.name} 
            coach={gameState.coach}
            onUpdate={handleGameUpdate} 
            onFinish={handleGameFinish} 
          />
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <Dashboard state={gameState} onAdvance={handleAdvance} />
              {currentMatch && (
                <button 
                  onClick={handlePlayGame}
                  className="px-10 py-6 bg-amber-600 hover:bg-amber-500 text-white font-black text-2xl rounded-3xl shadow-2xl animate-bounce border-4 border-amber-400/20"
                >
                  PLAY {currentMatch.summary}
                </button>
              )}
            </div>
          </div>
        ) : activeTab === 'depth_chart' ? (
          <DepthChart roster={gameState.roster} onReorder={handleReorderRoster} />
        ) : activeTab === 'roster' ? (
          <Roster roster={gameState.roster} onCut={handleCutPlayer} />
        ) : activeTab === 'stats' ? (
          <Stats roster={gameState.roster} currentPhase={gameState.phase} />
        ) : activeTab === 'recruiting' ? (
          <Recruiting 
            onRecruit={handleRecruit} 
            onScout={handleScout}
            coach={gameState.coach} 
            recruitmentPool={gameState.recruitmentPool} 
            scoutingPoints={gameState.scoutingPoints}
            currentRosterCount={gameState.roster.length}
            rosterCap={ROSTER_CAP}
          />
        ) : activeTab === 'staff' ? (
          <StaffView 
            currentStaff={gameState.staff} 
            school={gameState.userSchool} 
            gameWeek={gameState.week}
            phase={gameState.phase}
            onHire={handleHireStaff} 
            onUpdateStyle={handleUpdateStaffStyle}
          />
        ) : activeTab === 'settings' ? (
          <SettingsView 
            gameState={gameState} 
            currentSlot={currentSlot}
            lastSaved={lastSaved}
            onSave={handleManualSave}
            onExport={handleExportSave}
            onImport={handleImportSave}
            onReset={handleResetCareer}
            onSwitchSlot={handleLoadSlot}
          />
        ) : activeTab === 'schedule' ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white italic">Season Schedule</h2>
            <div className="grid gap-4">
              {gameState.schedule.map((game, idx) => (
                <div key={idx} className={`glass p-6 rounded-3xl flex items-center justify-between border-l-4 ${game.summary === 'SCRIMMAGE' ? 'border-amber-500' : game.summary === 'PLAYOFF' ? 'border-rose-600' : 'border-blue-600'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 text-lg">W{game.week}</div>
                    <div>
                      <div className="font-black text-xl italic text-white">{game.opponentName}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{game.summary} • OVR {game.opponentRating}</div>
                    </div>
                  </div>
                  {game.played ? (
                    <div className="text-right">
                      <div className={`text-3xl font-black italic ${ (game.homeTeamId === gameState.userSchool.id ? game.homeScore! > game.awayScore! : game.awayScore! > game.homeScore!) ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {game.homeScore} - {game.awayScore}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-2 bg-slate-900 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Upcoming</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Layout>
    </>
  );
};

export default App;
