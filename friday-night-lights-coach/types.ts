
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'LT' | 'LG' | 'C' | 'RG' | 'RT' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K' | 'P';
export type EnrollmentSize = '1A' | '2A' | '3A' | '4A' | '5A' | '6A';
export type SeasonPhase = 'OFFSEASON' | 'PRESEASON' | 'REGULAR_SEASON' | 'PLAYOFFS';
export type OtherSport = 'Basketball' | 'Track' | 'Baseball' | 'Soccer' | 'Wrestling' | 'Lacrosse';

export type CoachArchetype = 'Recruiter' | 'Motivator' | 'Tactician';
export type RecruitSource = 'Middle School' | 'Youth League' | 'Transfer Portal' | 'Other Sport' | 'Walk-On';

export interface CoachProfile {
  name: string;
  appearance: string;
  archetype: CoachArchetype;
}

export interface PlayerStats {
  passingYards: number;
  passingTds: number;
  interceptionsThrown: number;
  rushingYards: number;
  rushingTds: number;
  receptions: number;
  receivingYards: number;
  receivingTds: number;
  tackles: number;
  sacks: number;
  interceptionsCaught: number;
  gamesPlayed: number;
}

export interface Player {
  id: string;
  name: string;
  grade: 8 | 9 | 10 | 11 | 12;
  position: Position;
  archetype: string;
  overall: number;
  potential: number;
  morale: number;
  academics: number;
  injuryStatus: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out';
  injuryWeeks: number;
  primarySport: 'Football' | OtherSport;
  footballExperience: number;
  ratings: {
    speed: number;
    strength: number;
    awareness: number;
    tackling: number;
    hands: number;
  };
  traits: string[];
  stats: Record<SeasonPhase, PlayerStats>;
  source?: RecruitSource;
  interestLevel: number;
  scoutingLevel: number;
  lastOvrChange?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Head Coach' | 'Offensive Coordinator' | 'Defensive Coordinator' | 'Strength Coach' | 'Academic Advisor';
  skill: number;
  trait: 'Tactician' | 'Recruiter' | 'Motivator' | 'Developer';
  philosophy: string;
  almaMater: string;
  yearsExperience: number;
  prestige: number;
  careerRecord: { wins: number; losses: number };
  styleValue: number; // 0-100 for Aggressiveness, Intensity, etc.
}

export interface School {
  id: string;
  name: string;
  enrollment: EnrollmentSize;
  budget: number;
  facilities: number;
  academicStrictness: number;
  communitySupport: number;
  prestige: number;
  colors: { primary: string; secondary: string };
}

export interface GameMatchup {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  played: boolean;
  summary?: string;
  opponentRating: number;
  opponentName: string;
}

export interface TeamGameStats {
  totalYards: number;
  passYards: number;
  rushYards: number;
  firstDowns: number;
  turnovers: number;
}

export interface ActiveGame {
  matchupId: string;
  opponentName: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  timeRemaining: number;
  possession: 'home' | 'away';
  yardLine: number;
  down: number;
  distance: number;
  waitingForCoach: boolean;
  momentDescription: string;
  lastPlayResult: string;
  playHistory: string[];
  isGameOver: boolean;
  gameStats: {
    home: TeamGameStats;
    away: TeamGameStats;
  };
}

export interface CareerStats {
  wins: number;
  losses: number;
  titles: number;
  experience: number;
  reputation: number;
}

export interface GameState {
  year: number;
  week: number;
  phase: SeasonPhase;
  userSchool: School;
  coach: CoachProfile;
  roster: Player[];
  staff: Staff[];
  career: CareerStats;
  leagueSchools: School[];
  schedule: GameMatchup[];
  recruitmentPool: Player[];
  scoutingPoints: number;
  activeGame?: ActiveGame;
  lastSaved?: number;
  history: {
    year: number;
    record: string;
    achievement: string;
    schoolName: string;
  }[];
}
