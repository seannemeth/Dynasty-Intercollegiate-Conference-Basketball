// Fictional player name generator for Dynasty Hoops
// All names are fictional composites

const FIRST_NAMES = [
  "Jaylen", "Marcus", "DeShawn", "Tremaine", "Kendrick", "Darius", "Tavion",
  "Malik", "Elijah", "Jordan", "Tyler", "Cameron", "Brandon", "Devante",
  "Rashad", "Tyrese", "Damien", "Quincy", "Isaiah", "Zion", "Caleb",
  "Darian", "Terrell", "Jalen", "Kobe", "Trevon", "Devin", "Marcus",
  "Alonzo", "Dominique", "Keenan", "Dontae", "Markel", "Reggie", "Lamar",
  "Dante", "Javon", "Trey", "Rodney", "Curtis", "Shaun", "Derrick",
  "Antoine", "Corey", "Lance", "Kevin", "Patrick", "Chase", "Drew",
  "Austin", "Ryan", "Connor", "Mason", "Logan", "Hunter", "Dylan",
  "Ethan", "Andrew", "Nathan", "Cole", "Luke", "Jake", "Alex",
  "Michael", "James", "Robert", "William", "David", "Anthony", "Chris",
  "Daniel", "Joshua", "Eric", "Brian", "Jason", "Aaron", "Adam",
  "Desmond", "Sterling", "Garrison", "Benicio", "Khalil", "Amari",
  "Jabari", "Kahari", "Omari", "Tahj", "Imari", "Jevon", "Davon",
  "Kevon", "Tevon", "Stevon", "Davian", "Keenan", "Tevin", "Levin",
  "Kevon", "Devyn", "Jevyn", "Tevyn", "Nevyn", "Aevyn", "Bevyn",
  "Caden", "Aiden", "Jayden", "Brayden", "Hayden", "Kayden", "Zayden",
  "Peyton", "Landen", "Camden", "Braden", "Graden", "Shaden", "Traden",
  "Nolan", "Declan", "Liam", "Owen", "Finn", "Rory", "Cian",
  "Sebastien", "Maxime", "Pierre", "Antoine", "Guillaume", "Florian",
];

const LAST_NAMES = [
  "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore",
  "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez",
  "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez",
  "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams",
  "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez",
  "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
  "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers",
  "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
  "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson",
  "Gray", "Ramirez", "James", "Watson", "Brooks", "Kelly", "Sanders",
  "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson", "Coleman",
  "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores",
  "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant",
  "Alexander", "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford",
  "Hamilton", "Graham", "Sullivan", "Wallace", "Woods", "Cole",
  "West", "Jordan", "Owens", "Reynolds", "Fisher", "Ellis", "Harrison",
  "Gibson", "Mcdonald", "Cruz", "Marshall", "Ortiz", "Gomez", "Murray",
  "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker", "Porter",
  "Hunter", "Hicks", "Crawford", "Henry", "Boyd", "Mason", "Morales",
  "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon",
  "Shaw", "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels",
  "Palmer", "Mills", "Nichols", "Grant", "Knight", "Ferguson", "Rose",
  "Stone", "Hawkins", "Dunn", "Perkins", "Hudson", "Spencer", "Gardner",
  "Stephens", "Payne", "Pierce", "Berry", "Matthews", "Arnold", "Wagner",
  "Willis", "Ray", "Watkins", "Olson", "Carroll", "Duncan", "Snyder",
  "Hart", "Cunningham", "Bradley", "Lane", "Andrews", "Ruiz", "Harper",
  "Fox", "Riley", "Armstrong", "Carpenter", "Weaver", "Greene", "Lawrence",
  "Elliott", "Chavez", "Sims", "Austin", "Peters", "Kelley", "Franklin",
  "Lawson", "Fields", "Gutierrez", "Ryan", "Schmidt", "Carr", "Vasquez",
  "Castillo", "Wheeler", "Chapman", "Oliver", "Montgomery", "Richards",
  "Williamson", "Johnston", "Banks", "Meyer", "Adams", "Jacobs", "Watkins",
  "Townsend", "Booker", "Wade", "Jefferson", "Curry", "Durant", "Irving",
  "George", "Leonard", "Paul", "Harden", "Lillard", "Mitchell", "Young",
];

export interface GeneratedPlayer {
  first_name: string;
  last_name: string;
  position: 'PG' | 'SG' | 'SF' | 'PF' | 'C';
  year: 'FR' | 'SO' | 'JR' | 'SR' | 'GR';
  overall: number;
  potential: number;
  dev_trait: 'normal' | 'impact' | 'star' | 'elite';
  stars: number;
  attr_speed: number;
  attr_ball_handling: number;
  attr_shooting_2pt: number;
  attr_shooting_3pt: number;
  attr_defense: number;
  attr_rebounding: number;
  attr_iq: number;
  attr_athleticism: number;
  attr_free_throw: number;
  attr_passing: number;
  jersey_number: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function weightedRand(base: number, variance: number, rand: () => number): number {
  return clamp(base + (rand() - 0.5) * 2 * variance, 40, 99);
}

export function generatePlayerName(seed: number): { first_name: string; last_name: string } {
  const rand = seededRandom(seed);
  const fi = Math.floor(rand() * FIRST_NAMES.length);
  const li = Math.floor(rand() * LAST_NAMES.length);
  return {
    first_name: FIRST_NAMES[fi],
    last_name: LAST_NAMES[li],
  };
}

const POSITIONS: ('PG' | 'SG' | 'SF' | 'PF' | 'C')[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const YEARS: ('FR' | 'SO' | 'JR' | 'SR' | 'GR')[] = ['FR', 'SO', 'JR', 'SR', 'GR'];

// Position-based attribute biases
const POS_BIASES: Record<string, Partial<Record<string, number>>> = {
  PG:  { attr_speed: 10, attr_ball_handling: 15, attr_shooting_3pt: 5, attr_iq: 10, attr_passing: 15, attr_rebounding: -10 },
  SG:  { attr_speed: 5, attr_shooting_2pt: 10, attr_shooting_3pt: 10, attr_athleticism: 5 },
  SF:  { attr_athleticism: 8, attr_defense: 5, attr_shooting_2pt: 5 },
  PF:  { attr_rebounding: 12, attr_defense: 8, attr_athleticism: 5, attr_ball_handling: -8, attr_shooting_3pt: -10 },
  C:   { attr_rebounding: 18, attr_defense: 12, attr_speed: -10, attr_ball_handling: -15, attr_shooting_3pt: -15 },
};

export function generatePlayer(
  seed: number,
  teamPrestige: number, // 1-5
  index: number,
  forcePosition?: 'PG' | 'SG' | 'SF' | 'PF' | 'C',
  forceYear?: 'FR' | 'SO' | 'JR' | 'SR' | 'GR'
): GeneratedPlayer {
  const rand = seededRandom(seed * 997 + index * 13);

  const { first_name, last_name } = generatePlayerName(seed + index);

  const position = forcePosition || POSITIONS[Math.floor(rand() * POSITIONS.length)];
  const year = forceYear || YEARS[Math.floor(rand() * YEARS.length)];

  // Base overall based on team prestige + year
  const prestigeBonus = (teamPrestige - 3) * 5; // -10 to +10
  const yearBonus = YEARS.indexOf(year) * 2; // FR=0, SR=8
  const baseOverall = 65 + prestigeBonus + yearBonus + (rand() - 0.5) * 20;
  const overall = clamp(baseOverall, 55, 89);

  // Potential: always >= overall, higher for younger players
  const potentialBoost = (4 - YEARS.indexOf(year)) * 4;
  const potential = clamp(overall + potentialBoost + rand() * 10, overall, 95);

  // Dev trait
  const devRoll = rand();
  let dev_trait: 'normal' | 'impact' | 'star' | 'elite';
  if (devRoll > 0.97) dev_trait = 'elite';
  else if (devRoll > 0.90) dev_trait = 'star';
  else if (devRoll > 0.70) dev_trait = 'impact';
  else dev_trait = 'normal';

  // Stars (1-5)
  const stars = clamp(Math.floor(overall / 15) - 1, 1, 5) as 1 | 2 | 3 | 4 | 5;

  // Base attributes
  const biases = POS_BIASES[position] || {};
  const attrs: Record<string, number> = {
    attr_speed:         weightedRand(overall + (biases['attr_speed'] || 0), 10, rand),
    attr_ball_handling: weightedRand(overall + (biases['attr_ball_handling'] || 0), 10, rand),
    attr_shooting_2pt:  weightedRand(overall + (biases['attr_shooting_2pt'] || 0), 8, rand),
    attr_shooting_3pt:  weightedRand(overall - 5 + (biases['attr_shooting_3pt'] || 0), 12, rand),
    attr_defense:       weightedRand(overall - 3 + (biases['attr_defense'] || 0), 10, rand),
    attr_rebounding:    weightedRand(overall - 5 + (biases['attr_rebounding'] || 0), 10, rand),
    attr_iq:            weightedRand(overall + (biases['attr_iq'] || 0), 8, rand),
    attr_athleticism:   weightedRand(overall + (biases['attr_athleticism'] || 0), 10, rand),
    attr_free_throw:    weightedRand(overall - 5, 15, rand),
    attr_passing:       weightedRand(overall - 5 + (biases['attr_passing'] || 0), 10, rand),
  };

  return {
    first_name,
    last_name,
    position,
    year,
    overall,
    potential,
    dev_trait,
    stars,
    jersey_number: Math.floor(rand() * 45) + 1,
    ...attrs as any,
  };
}

// Generate a full 13-player roster for a team
export function generateRoster(
  teamSeed: number,
  teamPrestige: number
): GeneratedPlayer[] {
  const positions: ('PG' | 'SG' | 'SF' | 'PF' | 'C')[] = [
    'PG', 'PG',
    'SG', 'SG',
    'SF', 'SF',
    'PF', 'PF',
    'C',  'C',
    'SG', 'SF', 'PF',  // flex spots
  ];

  const years: ('FR' | 'SO' | 'JR' | 'SR' | 'GR')[] = [
    'SR', 'SR', 'JR', 'JR', 'JR', 'SO', 'SO', 'SO', 'FR', 'FR', 'FR', 'FR', 'GR'
  ];

  return positions.map((pos, i) =>
    generatePlayer(teamSeed + i * 31, teamPrestige, i, pos, years[i])
  );
}

export function generateRecruit(seed: number, stars: 1 | 2 | 3 | 4 | 5): GeneratedPlayer {
  const rand = seededRandom(seed * 1234);
  const position = POSITIONS[Math.floor(rand() * POSITIONS.length)];

  // Overall based on stars
  const overallRanges: Record<number, [number, number]> = {
    5: [87, 95],
    4: [78, 86],
    3: [70, 77],
    2: [63, 69],
    1: [55, 62],
  };
  const [minOvr, maxOvr] = overallRanges[stars];
  const overall = clamp(minOvr + Math.floor(rand() * (maxOvr - minOvr + 1)), minOvr, maxOvr);
  const potential = clamp(overall + Math.floor(rand() * 10) + 5, overall, 99);

  const devRoll = rand();
  let dev_trait: 'normal' | 'impact' | 'star' | 'elite';
  if (stars >= 5 || devRoll > 0.97) dev_trait = 'elite';
  else if (stars >= 4 || devRoll > 0.88) dev_trait = 'star';
  else if (stars >= 3 || devRoll > 0.65) dev_trait = 'impact';
  else dev_trait = 'normal';

  return generatePlayer(seed, 3, 0, position, 'FR');
}
