
import { GameState, Player, GameMatchup, ActiveGame, TeamGameStats, CoachProfile, SeasonPhase, RecruitSource, School, Position, PlayerStats, Staff } from '../types';
import { generatePlayer, generateSchool, generateStaff } from './generators';
import { PHASE_CONFIG } from '../constants';

export const calculateTeamRating = (roster: Player[]): number => {
  if (!roster || roster.length === 0) return 0;
  const footballRoster = roster.filter(p => p.grade > 8 && p.injuryStatus !== 'Out');
  if (footballRoster.length === 0) return 0;
  const sum = footballRoster.reduce((acc, player) => acc + player.overall, 0);
  return Math.round(sum / footballRoster.length);
};

export const calculateOffensiveRating = (roster: Player[]): number => {
  const offPositions: Position[] = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'];
  const off = roster.filter(p => p.grade > 8 && offPositions.includes(p.position) && p.injuryStatus !== 'Out');
  if (off.length === 0) return 0;
  const sum = off.reduce((acc, p) => acc + p.overall, 0);
  return Math.round(sum / off.length);
};

export const calculateDefensiveRating = (roster: Player[]): number => {
  const defPositions: Position[] = ['DE', 'DT', 'DL', 'LB', 'CB', 'S'] as any; 
  const def = roster.filter(p => p.grade > 8 && (defPositions.includes(p.position) || (p.position as string) === 'DL') && p.injuryStatus !== 'Out');
  if (def.length === 0) return 0;
  const sum = def.reduce((acc, p) => acc + p.overall, 0);
  return Math.round(sum / def.length);
};

const pickOne = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateWeeklyRecruits = (state: GameState): Player[] => {
  const pool: Player[] = [];
  const count = state.phase === 'OFFSEASON' ? 8 : 5;
  
  for (let i = 0; i < count; i++) {
    const sourceOptions: RecruitSource[] = ['Middle School', 'Youth League', 'Transfer Portal', 'Other Sport'];
    const source = pickOne(sourceOptions);
    
    let grade: 8 | 9 | 10 | 11 | 12;
    if (source === 'Middle School') {
      grade = 8;
    } else if (source === 'Youth League') {
      grade = 9;
    } else if (source === 'Transfer Portal') {
      grade = pickOne([10, 11, 12] as (10 | 11 | 12)[]);
    } else {
      grade = pickOne([9, 10, 11, 12] as (9 | 10 | 11 | 12)[]);
    }
    
    pool.push(generatePlayer(grade, undefined, source));
  }

  return pool;
};

const createEmptyTeamStats = (): TeamGameStats => ({
  totalYards: 0,
  passYards: 0,
  rushYards: 0,
  firstDowns: 0,
  turnovers: 0,
});

const createZeroStats = (): PlayerStats => ({
  passingYards: 0,
  passingTds: 0,
  interceptionsThrown: 0,
  rushingYards: 0,
  rushingTds: 0,
  receptions: 0,
  receivingYards: 0,
  receivingTds: 0,
  tackles: 0,
  sacks: 0,
  interceptionsCaught: 0,
  gamesPlayed: 0,
});

export const generateScheduleForYear = (userSchool: School, leagueSchools: School[]): GameMatchup[] => {
  const schedule: GameMatchup[] = [];
  
  for (let w = 1; w <= 2; w++) {
    const opponent = pickOne(leagueSchools);
    schedule.push({
      id: `scrimmage-${w}`,
      week: w,
      homeTeamId: w % 2 === 0 ? userSchool.id : opponent.id,
      awayTeamId: w % 2 === 0 ? opponent.id : userSchool.id,
      played: false,
      summary: 'SCRIMMAGE',
      opponentRating: Math.round(opponent.prestige + 10 + Math.random() * 10),
      opponentName: opponent.name
    });
  }

  for (let w = 1; w <= 9; w++) {
    const opponent = leagueSchools[w % leagueSchools.length];
    schedule.push({
      id: `reg-${w}`,
      week: w,
      homeTeamId: w % 2 === 0 ? userSchool.id : opponent.id,
      awayTeamId: w % 2 === 0 ? opponent.id : userSchool.id,
      played: false,
      summary: 'REGULAR',
      opponentRating: Math.round(opponent.prestige + 15 + Math.random() * 5),
      opponentName: opponent.name
    });
  }

  return schedule;
};

export const createInitialState = (coach: CoachProfile, teamName: string): GameState => {
  const userSchool = generateSchool(teamName);
  userSchool.colors = { primary: '#1e40af', secondary: '#ffffff' };
  
  const roster: Player[] = [];
  const distribution: Record<string, number> = {
    'QB': 3, 'RB': 4, 'WR': 6, 'TE': 3, 'LT': 2, 'LG': 2, 'C': 2, 'RG': 2, 'RT': 2, 'DE': 4, 'DT': 4, 'LB': 6, 'CB': 5, 'S': 4, 'K': 1, 'P': 1
  };
  
  const moraleBonus = coach.archetype === 'Motivator' ? 15 : 0;

  Object.entries(distribution).forEach(([pos, count]) => {
    for (let i = 0; i < count; i++) {
      const p = generatePlayer(undefined, pos as Position);
      p.morale = Math.min(100, p.morale + moraleBonus);
      p.scoutingLevel = 3;
      roster.push(p);
    }
  });

  const leagueSchools = Array.from({ length: 9 }).map(() => generateSchool());
  const schedule = generateScheduleForYear(userSchool, leagueSchools);

  return {
    year: 2024,
    week: 1,
    phase: 'PRESEASON',
    userSchool,
    coach,
    roster,
    staff: [
      generateStaff('Offensive Coordinator'),
      generateStaff('Defensive Coordinator'),
      generateStaff('Strength Coach'),
      generateStaff('Academic Advisor'),
    ],
    career: { wins: 0, losses: 0, titles: 0, experience: 1, reputation: 50 },
    leagueSchools,
    schedule,
    recruitmentPool: [],
    scoutingPoints: 10,
    history: [],
  };
};

export const startInteractiveGame = (state: GameState, matchupId: string): ActiveGame => {
  const match = state.schedule.find(m => m.id === matchupId);
  return {
    matchupId,
    opponentName: match?.opponentName || 'Opponent',
    homeScore: 0, awayScore: 0,
    quarter: 1, timeRemaining: 480,
    possession: Math.random() > 0.5 ? 'home' : 'away',
    yardLine: 25, down: 1, distance: 10,
    waitingForCoach: false,
    momentDescription: "Game Start",
    lastPlayResult: "Kickoff incoming!",
    playHistory: ["Game Start"],
    isGameOver: false,
    gameStats: { home: createEmptyTeamStats(), away: createEmptyTeamStats() },
  };
};

export const executeSinglePlay = (game: ActiveGame): ActiveGame => {
  let nextGame = { ...game };
  const teamOffense = nextGame.possession === 'home' ? 'Home' : 'Away';
  const stats = nextGame.possession === 'home' ? nextGame.gameStats.home : nextGame.gameStats.away;
  const timeBurn = 25 + Math.floor(Math.random() * 10);
  nextGame.timeRemaining -= timeBurn;

  if (nextGame.timeRemaining <= 0) {
    if (nextGame.quarter < 4) {
      nextGame.quarter++;
      nextGame.timeRemaining = 480;
      nextGame.waitingForCoach = true;
      nextGame.momentDescription = "Quarter Break";
      nextGame.lastPlayResult = `End of Quarter ${nextGame.quarter - 1}`;
      nextGame.playHistory = [nextGame.lastPlayResult, ...nextGame.playHistory].slice(0, 50);
      return nextGame;
    } else {
      nextGame.isGameOver = true;
      nextGame.lastPlayResult = "Final Whistle.";
      nextGame.playHistory = [nextGame.lastPlayResult, ...nextGame.playHistory].slice(0, 50);
      return nextGame;
    }
  }

  let yards = Math.floor(Math.random() * 12) - 2;
  const isPass = Math.random() > 0.45;
  
  if (yards > 0) {
    stats.totalYards += yards;
    if (isPass) stats.passYards += yards; else stats.rushYards += yards;
  }

  nextGame.yardLine += (nextGame.possession === 'home' ? yards : -yards);
  
  if (nextGame.yardLine >= 100 || nextGame.yardLine <= 0) {
    if (nextGame.possession === 'home') nextGame.homeScore += 7; else nextGame.awayScore += 7;
    nextGame.possession = nextGame.possession === 'home' ? 'away' : 'home';
    nextGame.yardLine = 25; nextGame.down = 1; nextGame.distance = 10;
  } else if (yards >= nextGame.distance) {
    nextGame.down = 1; nextGame.distance = 10;
    stats.firstDowns++;
  } else {
    nextGame.down++; nextGame.distance -= yards;
    if (nextGame.down > 4) {
      nextGame.possession = nextGame.possession === 'home' ? 'away' : 'home';
      nextGame.yardLine = 100 - nextGame.yardLine;
      nextGame.down = 1; nextGame.distance = 10;
    }
  }

  const text = `${teamOffense} ${isPass ? 'pass' : 'run'} for ${yards} yds.`;
  nextGame.lastPlayResult = text;
  nextGame.playHistory = [text, ...nextGame.playHistory].slice(0, 50);
  return nextGame;
};

export const executeCoachPlay = (game: ActiveGame, playType: string, teamRating: number, coachArchetype?: string): ActiveGame => {
  let nextGame = { ...game };
  nextGame.waitingForCoach = false;
  if (playType === 'CONTINUE') return nextGame;
  
  const stats = nextGame.possession === 'home' ? nextGame.gameStats.home : nextGame.gameStats.away;
  const isPass = playType.includes('PASS');
  
  let yards = Math.floor(Math.random() * 8) + 2;
  if (playType === 'PASS_LONG') yards = Math.random() > 0.7 ? 30 : -5;

  if (yards > 0) {
    stats.totalYards += yards;
    if (isPass) stats.passYards += yards; else stats.rushYards += yards;
  }

  nextGame.yardLine += (nextGame.possession === 'home' ? yards : -yards);
  nextGame.lastPlayResult = `Coach call: ${playType.replace('_', ' ')} for ${yards} yds.`;
  nextGame.playHistory = [nextGame.lastPlayResult, ...nextGame.playHistory].slice(0, 50);
  return nextGame;
};

export const advanceWeek = (state: GameState): GameState => {
  let newState = { ...state };
  
  const oc = newState.staff.find(s => s.role === 'Offensive Coordinator');
  const dc = newState.staff.find(s => s.role === 'Defensive Coordinator');
  const strengthCoach = newState.staff.find(s => s.role === 'Strength Coach');
  const academicAdvisor = newState.staff.find(s => s.role === 'Academic Advisor');

  const currentMatch = newState.schedule.find(m => {
    if (newState.phase === 'PRESEASON') return m.summary === 'SCRIMMAGE' && m.week === (newState.week - 4) && !m.played;
    if (newState.phase === 'REGULAR_SEASON') return m.summary === 'REGULAR' && m.week === newState.week && !m.played;
    if (newState.phase === 'PLAYOFFS') return m.summary === 'PLAYOFF' && m.week === newState.week && !m.played;
    return false;
  });

  if (currentMatch && !currentMatch.played) {
    const userRating = calculateTeamRating(newState.roster);
    const oppRating = currentMatch.opponentRating;
    
    const ocAgg = oc?.styleValue || 50;
    const dcAgg = dc?.styleValue || 50;
    const variance = (ocAgg + dcAgg) / 100; 

    currentMatch.homeScore = Math.round(14 + (Math.random() * 20 * (1 + variance)) + (userRating - oppRating)/2);
    currentMatch.awayScore = Math.round(14 + (Math.random() * 20 * (1 + variance)) - (userRating - oppRating)/2);
    currentMatch.played = true;

    const isUserHome = currentMatch.homeTeamId === state.userSchool.id;
    const userScore = isUserHome ? currentMatch.homeScore : currentMatch.awayScore;
    
    newState.roster = newState.roster.map(player => {
      if (player.injuryStatus === 'Out') return player;
      
      const pStats = player.stats[newState.phase];
      pStats.gamesPlayed++;

      const isOffPos = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'].includes(player.position);
      const isDefPos = ['DE', 'DT', 'LB', 'CB', 'S'].includes(player.position);

      if (isOffPos) {
        if (player.position === 'QB') {
          pStats.passingYards += userScore * (5 + Math.random() * 5);
          pStats.passingTds += Math.floor(userScore / 10);
        } else if (player.position === 'RB') {
          pStats.rushingYards += userScore * (2 + Math.random() * 3);
          pStats.rushingTds += Math.random() > 0.6 ? 1 : 0;
        } else if (player.position === 'WR' || player.position === 'TE') {
          pStats.receivingYards += userScore * (3 + Math.random() * 4);
          pStats.receivingTds += Math.random() > 0.7 ? 1 : 0;
        }
      } else if (isDefPos) {
        pStats.tackles += Math.floor(Math.random() * 8);
        if (Math.random() > 0.9) pStats.sacks++;
        if (Math.random() > 0.95) pStats.interceptionsCaught++;
      }
      return player;
    });
    
    if (currentMatch.summary !== 'SCRIMMAGE') {
      const win = (isUserHome && currentMatch.homeScore > currentMatch.awayScore) ||
                  (!isUserHome && currentMatch.awayScore > currentMatch.homeScore);
      if (win) newState.career.wins++; else newState.career.losses++;
    }
  }

  const intensity = strengthCoach?.styleValue || 50;
  const strictness = academicAdvisor?.styleValue || 50;

  newState.roster = newState.roster.map(p => {
    let player = { ...p };
    player.lastOvrChange = 0;

    if (player.injuryWeeks > 0) {
      player.injuryWeeks--;
      if (player.injuryWeeks === 0) {
        player.injuryStatus = 'Healthy';
      }
    }

    if (player.injuryStatus === 'Healthy' && (newState.phase === 'REGULAR_SEASON' || newState.phase === 'PRESEASON')) {
      const baseChance = 0.01;
      const intensityPenalty = (intensity / 100) * 0.05;
      const injuryProneBonus = player.traits.includes('Injury-Prone') ? 0.08 : 0;
      
      if (Math.random() < (baseChance + intensityPenalty + injuryProneBonus)) {
        player.injuryStatus = 'Out';
        player.injuryWeeks = Math.floor(Math.random() * 4) + 1;
      }
    }

    if (newState.phase === 'OFFSEASON' || newState.phase === 'PRESEASON') {
      const progChance = 0.1 + (intensity / 100) * 0.3;
      if (Math.random() < progChance) {
        const gain = (player.potential > 85 && Math.random() > 0.7) ? 2 : 1;
        player.overall = Math.min(99, player.overall + gain);
        player.lastOvrChange = gain;
      }
    }

    const gpaGain = (strictness / 100) * 0.1;
    player.academics = Math.min(4.0, player.academics + gpaGain);
    
    const moralePenalty = (strictness / 100) * 5;
    player.morale = Math.max(0, player.morale - moralePenalty);

    return player;
  });

  newState.recruitmentPool = generateWeeklyRecruits(newState);
  newState.scoutingPoints = newState.phase === 'OFFSEASON' ? 15 : 10;

  const config = PHASE_CONFIG[newState.phase];
  if (newState.week < config.weeks) {
    newState.week++;
  } else {
    newState.week = 1;
    if (newState.phase === 'OFFSEASON') {
      newState.phase = 'PRESEASON';
    } else if (newState.phase === 'PRESEASON') {
      newState.phase = 'REGULAR_SEASON';
    } else if (newState.phase === 'REGULAR_SEASON') {
      if (newState.career.wins >= 5) {
        newState.phase = 'PLAYOFFS';
        const playoffGames: GameMatchup[] = [];
        for (let i = 1; i <= 4; i++) {
          const opponent = pickOne(newState.leagueSchools);
          playoffGames.push({
            id: `playoff-${i}`,
            week: i,
            homeTeamId: newState.userSchool.id,
            awayTeamId: opponent.id,
            played: false,
            summary: 'PLAYOFF',
            opponentRating: Math.round(opponent.prestige + 20 + Math.random() * 10),
            opponentName: opponent.name
          });
        }
        newState.schedule = [...newState.schedule, ...playoffGames];
      } else {
        newState.phase = 'OFFSEASON';
        resetSeason(newState);
      }
    } else if (newState.phase === 'PLAYOFFS') {
      newState.phase = 'OFFSEASON';
      resetSeason(newState);
    }
  }

  return newState;
};

const resetSeason = (state: GameState) => {
  // Push to career history before clearing
  const record = `${state.career.wins}-${state.career.losses}`;
  const titlesGained = state.phase === 'PLAYOFFS' && state.career.wins > 8 ? 1 : 0; // Simple logic: deep playoff run or wins
  const achievement = titlesGained > 0 ? "State Champion" : state.career.wins >= 5 ? "Playoff Appearance" : "Rebuilding Year";
  
  state.history.push({
    year: state.year,
    record,
    achievement,
    schoolName: state.userSchool.name
  });

  state.year++;
  state.career.titles += titlesGained;
  state.career.wins = 0;
  state.career.losses = 0;
  
  state.roster = state.roster.filter(p => p.grade < 12).map(p => {
    const clearedStats: Record<SeasonPhase, PlayerStats> = {
      OFFSEASON: createZeroStats(),
      PRESEASON: createZeroStats(),
      REGULAR_SEASON: createZeroStats(),
      PLAYOFFS: createZeroStats(),
    };

    return {
      ...p,
      grade: (p.grade + 1) as 9 | 10 | 11 | 12,
      stats: clearedStats,
      lastOvrChange: 0,
      archetype: p.archetype
    };
  });
  state.schedule = generateScheduleForYear(state.userSchool, state.leagueSchools);
};
