
import { Position, EnrollmentSize, OtherSport } from './types';

export const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P'];

export const ENROLLMENTS: EnrollmentSize[] = ['1A', '2A', '3A', '4A', '5A', '6A'];

export const OTHER_SPORTS: OtherSport[] = ['Basketball', 'Track', 'Baseball', 'Soccer', 'Wrestling', 'Lacrosse'];

export const ARCHETYPES_BY_POSITION: Record<string, string[]> = {
  QB: ['Strong Arm', 'Scrambler', 'Improvisor', 'Field General'],
  RB: ['Power Back', 'Elusive Back', 'Receiving Back'],
  WR: ['Deep Threat', 'Possession', 'Red Zone Threat', 'Slot Receiver'],
  TE: ['Vertical Threat', 'Possession', 'Blocking'],
  LT: ['Agile', 'Power', 'Pass Protector'],
  LG: ['Agile', 'Power', 'Pass Protector'],
  C: ['Agile', 'Power', 'Pass Protector'],
  RG: ['Agile', 'Power', 'Pass Protector'],
  RT: ['Agile', 'Power', 'Pass Protector'],
  DE: ['Run Stopper', 'Speed Rusher', 'Power Rusher'],
  DT: ['Run Stopper', 'Speed Rusher', 'Power Rusher'],
  LB: ['Field General', 'Pass Coverage', 'Run Stopper', 'Speed Rusher', 'Power Rusher'],
  CB: ['Man-to-Man', 'Zone Coverage', 'Slot Corner'],
  S: ['Zone Coverage', 'Run Support', 'Hybrid'],
  K: ['Accurate', 'Power'],
  P: ['Accurate', 'Power'],
};

export const TRAITS = [
  'Team Leader',
  'Locker Room Cancer',
  'Academic Risk',
  'Injury-Prone',
  'Raw Talent',
  'Dual Athlete',
  'Clutch',
  'Hard Worker',
  'Quiet Leader',
  'Spotlight Junkie',
  'Big Game Performer',
  'Coachable'
];

export const PHASE_CONFIG = {
  OFFSEASON: { weeks: 3, label: 'Off-Season', months: ['December', 'January', 'February', 'March'] },
  PRESEASON: { weeks: 6, label: 'Pre-Season', months: ['June', 'July', 'August'], scrimmages: [5, 6] },
  REGULAR_SEASON: { weeks: 9, label: 'Regular Season', months: ['September', 'October', 'November'] },
  PLAYOFFS: { weeks: 4, label: 'Post-Season', months: ['November', 'December'] }
};

export const SCHOOL_NAMES = [
  'Lincoln High', 'Westview Academy', 'Central Tech', 'Oak Ridge', 'Riverdale', 
  'Summit Prep', 'Lakeville North', 'Valley View', 'Pinecrest', 'Meadowbrook',
  'Sterling Heights', 'Grand Valley', 'Ironwood', 'Legacy Christian', 'Southside'
];

export const FIRST_NAMES = [
  'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher',
  'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Jackson', 'Liam', 'Noah', 'Aiden', 'Lucas', 'Caden', 'Grayson', 'Mason', 'Elijah', 'Logan'
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

export const STAFF_ROLES = [
  'Head Coach', 'Offensive Coordinator', 'Defensive Coordinator', 'Strength Coach', 'Academic Advisor'
];

export const OFFENSIVE_PHILOSOPHIES = [
  'Air Raid', 'West Coast', 'Ground & Pound', 'Triple Option', 'Pro-Style', 'Spread', 'Power-I'
];

export const DEFENSIVE_PHILOSOPHIES = [
  'Swarm & Punish', 'Bend Don\'t Break', 'No-Fly Zone', '4-3 Stack', '3-4 Multiple', 'Tampa 2', 'Blitz Heavy'
];

export const SUPPORT_PHILOSOPHIES = [
  'Holistic Development', 'Grades First', 'Power Lifting', 'Olympic Training', 'Mental Performance'
];

export const ALMA_MATERS = [
  'State University', 'Tech Institute', 'Central College', 'Metropolitan State', 'Northern University',
  'Southern Poly', 'Eastern Academy', 'Western University', 'A&M State', 'Land Grant University'
];
