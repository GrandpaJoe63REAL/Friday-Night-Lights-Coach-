import { Player, School, Staff, Position, EnrollmentSize, PlayerStats, RecruitSource, SeasonPhase } from '../types';
import { FIRST_NAMES, LAST_NAMES, POSITIONS, TRAITS, ENROLLMENTS, SCHOOL_NAMES, OFFENSIVE_PHILOSOPHIES, DEFENSIVE_PHILOSOPHIES, SUPPORT_PHILOSOPHIES, ALMA_MATERS, ARCHETYPES_BY_POSITION } from '../constants';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const pickOne = <T,>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const createInitialStats = (): PlayerStats => ({
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

export const generatePlayer = (grade?: 8 | 9 | 10 | 11 | 12, pos?: Position, source?: RecruitSource): Player => {
  // Use nullish coalescing to safely handle potential grade 0 or undefined.
  // We explicitly cast the random pick to the expected union type.
  let g: 8 | 9 | 10 | 11 | 12 = grade ?? (pickOne([9, 10, 11, 12] as const) as 9 | 10 | 11 | 12);
  let p = pos || pickOne(POSITIONS);
  
  if ((p as string) === 'OL') {
    p = pickOne(['LT', 'LG', 'C', 'RG', 'RT']);
  } else if ((p as string) === 'DL') {
    p = pickOne(['DE', 'DT']);
  }

  // Constraint: 8th graders ONLY come from Middle School.
  let finalSource = source || 'Walk-On';
  if (g === 8) {
    finalSource = 'Middle School';
  }

  const baseModifier = g === 8 ? -15 : (g - 9) * 8;
  const base = 40 + baseModifier + rand(0, 15);
  const pot = rand(base, 95);

  const archetype = pickOne(ARCHETYPES_BY_POSITION[p] || ['Balanced']);

  const ratings = {
    speed: rand(base - 10, base + 10),
    strength: rand(base - 10, base + 10),
    awareness: rand(base - 10, base + 10),
    tackling: rand(base - 10, base + 10),
    hands: rand(base - 10, base + 10),
  };

  // Archetype Modifiers
  switch (archetype) {
    case 'Strong Arm': ratings.strength += 15; ratings.speed -= 5; break;
    case 'Scrambler': ratings.speed += 15; ratings.strength -= 5; break;
    case 'Deep Threat': ratings.speed += 12; ratings.hands += 5; break;
    case 'Power Back': ratings.strength += 10; ratings.speed -= 5; break;
    case 'Elusive Back': ratings.speed += 10; ratings.awareness += 5; break;
    case 'Pass Protector': ratings.awareness += 10; ratings.hands += 5; break;
    case 'Run Stopper': ratings.tackling += 12; ratings.strength += 5; break;
    case 'Speed Rusher': ratings.speed += 12; ratings.awareness += 5; break;
    case 'Zone Coverage': ratings.awareness += 10; ratings.speed += 5; break;
    case 'Man-to-Man': ratings.speed += 10; ratings.hands += 5; break;
    case 'Power': ratings.strength += 15; break;
    case 'Accurate': ratings.awareness += 15; break;
  }

  // Recalculate OVR based on new ratings
  const newOvr = Math.round((ratings.speed + ratings.strength + ratings.awareness + ratings.tackling + ratings.hands) / 5);

  const playerTraits: string[] = [];
  if (Math.random() > 0.1) {
    playerTraits.push(pickOne(TRAITS));
    if (Math.random() > 0.7) {
      let secondTrait = pickOne(TRAITS);
      if (secondTrait !== playerTraits[0]) {
        playerTraits.push(secondTrait);
      }
    }
  }

  const phaseStats: Record<SeasonPhase, PlayerStats> = {
    OFFSEASON: createInitialStats(),
    PRESEASON: createInitialStats(),
    REGULAR_SEASON: createInitialStats(),
    PLAYOFFS: createInitialStats(),
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`,
    grade: g,
    position: p,
    archetype,
    overall: Math.max(25, newOvr),
    potential: pot,
    morale: rand(70, 100),
    academics: Number((Math.random() * (4.0 - 1.5) + 1.5).toFixed(2)),
    injuryStatus: 'Healthy',
    injuryWeeks: 0,
    primarySport: Math.random() > 0.9 ? 'Basketball' : 'Football',
    footballExperience: rand(20, 90),
    ratings,
    traits: playerTraits,
    stats: phaseStats,
    source: finalSource,
    interestLevel: rand(10, 80),
    scoutingLevel: 0,
  };
};

export const generateSchool = (name?: string): School => {
  const enrollment = pickOne(ENROLLMENTS);
  const prestige = rand(20, 80);
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: name || `${pickOne(SCHOOL_NAMES)}`,
    enrollment,
    budget: prestige * 1000 + rand(5000, 20000),
    facilities: rand(20, 80),
    academicStrictness: rand(30, 90),
    communitySupport: rand(40, 100),
    prestige,
    colors: {
      primary: pickOne(['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#000000']),
      secondary: '#ffffff',
    }
  };
};

export const generateStaff = (role: Staff['role']): Staff => {
  let philosophyList = SUPPORT_PHILOSOPHIES;
  if (role === 'Offensive Coordinator') philosophyList = OFFENSIVE_PHILOSOPHIES;
  if (role === 'Defensive Coordinator') philosophyList = DEFENSIVE_PHILOSOPHIES;

  const skill = rand(40, 85);
  const years = rand(1, 30);

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `Coach ${pickOne(LAST_NAMES)}`,
    role,
    skill,
    trait: pickOne(['Tactician', 'Recruiter', 'Motivator', 'Developer']),
    philosophy: pickOne(philosophyList),
    almaMater: pickOne(ALMA_MATERS),
    yearsExperience: years,
    prestige: Math.round((skill + years) / 2),
    careerRecord: {
      wins: rand(years * 3, years * 10),
      losses: rand(years * 3, years * 10),
    },
    styleValue: 50,
  };
};