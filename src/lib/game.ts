export type Position =
  | "GK"
  | "RB"
  | "CB"
  | "LB"
  | "DM"
  | "CM"
  | "AM"
  | "RW"
  | "ST"
  | "LW";

export type Player = {
  id: string;
  name: string;
  country: string;
  flag: string;
  cup: number;
  number: number;
  positions: Position[];
  rating: number;
  legend?: boolean;
};

export type Squad = {
  id: string;
  country: string;
  flag: string;
  cup: number;
  overall: number;
  players: Player[];
};

export type Slot = {
  id: string;
  label: Position;
  x: number;
  y: number;
  player?: Player;
};

export type Style = "secure" | "balanced" | "bold";
export type FormationName = "4-3-3" | "4-4-2" | "4-2-3-1";

export type TeamStats = {
  attack: number;
  defense: number;
  overall: number;
};

export type MatchEvent = {
  minute: number;
  team: "us" | "opponent" | "neutral";
  type: "goal" | "chance" | "half" | "full" | "extra" | "pens";
  text: string;
};

export type Match = {
  phase: string;
  opponent: string;
  opponentFlag: string;
  opponentCup: number;
  opponentOverall: number;
  gf: number;
  ga: number;
  advanced: boolean;
  stoppage: number;
  events: MatchEvent[];
  penalties?: string;
};

export type Campaign = {
  champion: boolean;
  record: string;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  badge?: string;
  matches: Match[];
};

const formationSlots: Record<FormationName, Slot[]> = {
  "4-3-3": [
    { id: "gk", label: "GK", x: 50, y: 90 },
    { id: "rb", label: "RB", x: 82, y: 74 },
    { id: "cb1", label: "CB", x: 62, y: 78 },
    { id: "cb2", label: "CB", x: 38, y: 78 },
    { id: "lb", label: "LB", x: 18, y: 74 },
    { id: "dm", label: "DM", x: 50, y: 61 },
    { id: "cm", label: "CM", x: 66, y: 48 },
    { id: "am", label: "AM", x: 34, y: 45 },
    { id: "rw", label: "RW", x: 82, y: 23 },
    { id: "st", label: "ST", x: 50, y: 16 },
    { id: "lw", label: "LW", x: 18, y: 23 },
  ],
  "4-4-2": [
    { id: "gk", label: "GK", x: 50, y: 90 },
    { id: "rb", label: "RB", x: 82, y: 75 },
    { id: "cb1", label: "CB", x: 62, y: 78 },
    { id: "cb2", label: "CB", x: 38, y: 78 },
    { id: "lb", label: "LB", x: 18, y: 75 },
    { id: "dm", label: "DM", x: 40, y: 57 },
    { id: "cm", label: "CM", x: 60, y: 57 },
    { id: "rw", label: "RW", x: 80, y: 40 },
    { id: "lw", label: "LW", x: 20, y: 40 },
    { id: "st1", label: "ST", x: 42, y: 17 },
    { id: "st2", label: "ST", x: 58, y: 17 },
  ],
  "4-2-3-1": [
    { id: "gk", label: "GK", x: 50, y: 90 },
    { id: "rb", label: "RB", x: 82, y: 74 },
    { id: "cb1", label: "CB", x: 62, y: 78 },
    { id: "cb2", label: "CB", x: 38, y: 78 },
    { id: "lb", label: "LB", x: 18, y: 74 },
    { id: "dm1", label: "DM", x: 40, y: 61 },
    { id: "dm2", label: "DM", x: 60, y: 61 },
    { id: "am", label: "AM", x: 50, y: 43 },
    { id: "rw", label: "RW", x: 80, y: 31 },
    { id: "lw", label: "LW", x: 20, y: 31 },
    { id: "st", label: "ST", x: 50, y: 16 },
  ],
};

const styleShift: Record<Style, Partial<Record<Position, number>>> = {
  secure: { RB: 5, LB: 5, DM: 4, CM: 3, AM: 2, RW: 2, LW: 2, ST: 1 },
  balanced: {},
  bold: { RB: -6, LB: -6, DM: -5, CM: -4, AM: -4, RW: -3, LW: -3, ST: -2 },
};

export function formation(style: Style, shape: FormationName = "4-3-3"): Slot[] {
  return formationSlots[shape].map((slot) => ({
    ...slot,
    y: Math.max(12, Math.min(92, slot.y + (styleShift[style][slot.label] ?? 0))),
  }));
}

function p(country: string, flag: string, cup: number, name: string, number: number, positions: Position[], rating: number, legend = false): Player {
  return { id: `${country}-${cup}-${name.toLowerCase().replaceAll(" ", "-")}`, country, flag, cup, name, number, positions, rating, legend };
}

export const squads: Squad[] = [
  { id: "bra-2002", country: "Brazil", flag: "🇧🇷", cup: 2002, overall: 91, players: [p("Brazil", "🇧🇷", 2002, "Marcos", 1, ["GK"], 84), p("Brazil", "🇧🇷", 2002, "Cafu", 2, ["RB"], 90, true), p("Brazil", "🇧🇷", 2002, "Lucio", 3, ["CB"], 87), p("Brazil", "🇧🇷", 2002, "Edmilson", 5, ["CB", "DM"], 84), p("Brazil", "🇧🇷", 2002, "Roberto Carlos", 6, ["LB"], 91, true), p("Brazil", "🇧🇷", 2002, "Gilberto Silva", 8, ["DM"], 84), p("Brazil", "🇧🇷", 2002, "Juninho", 19, ["CM", "AM"], 83), p("Brazil", "🇧🇷", 2002, "Rivaldo", 10, ["AM", "LW"], 92, true), p("Brazil", "🇧🇷", 2002, "Ronaldinho", 11, ["LW", "AM"], 89, true), p("Brazil", "🇧🇷", 2002, "Ronaldo", 9, ["ST"], 94, true), p("Brazil", "🇧🇷", 2002, "Denilson", 17, ["RW", "LW"], 82)] },
  { id: "arg-1986", country: "Argentina", flag: "🇦🇷", cup: 1986, overall: 89, players: [p("Argentina", "🇦🇷", 1986, "Pumpido", 18, ["GK"], 83), p("Argentina", "🇦🇷", 1986, "Brown", 5, ["CB"], 84), p("Argentina", "🇦🇷", 1986, "Ruggeri", 19, ["CB"], 86), p("Argentina", "🇦🇷", 1986, "Cuciuffo", 9, ["RB", "CB"], 80), p("Argentina", "🇦🇷", 1986, "Olarticoechea", 16, ["LB"], 82), p("Argentina", "🇦🇷", 1986, "Giusti", 14, ["DM", "CM"], 82), p("Argentina", "🇦🇷", 1986, "Burruchaga", 7, ["CM", "AM"], 86), p("Argentina", "🇦🇷", 1986, "Maradona", 10, ["AM", "ST"], 97, true), p("Argentina", "🇦🇷", 1986, "Valdano", 11, ["LW", "ST"], 88), p("Argentina", "🇦🇷", 1986, "Enrique", 12, ["RW", "CM"], 80), p("Argentina", "🇦🇷", 1986, "Borghi", 20, ["LW", "AM"], 81)] },
  { id: "fra-1998", country: "France", flag: "🇫🇷", cup: 1998, overall: 90, players: [p("France", "🇫🇷", 1998, "Barthez", 16, ["GK"], 88), p("France", "🇫🇷", 1998, "Thuram", 15, ["RB", "CB"], 91), p("France", "🇫🇷", 1998, "Blanc", 5, ["CB"], 89), p("France", "🇫🇷", 1998, "Desailly", 8, ["CB", "DM"], 90), p("France", "🇫🇷", 1998, "Lizarazu", 3, ["LB"], 86), p("France", "🇫🇷", 1998, "Deschamps", 7, ["DM"], 86), p("France", "🇫🇷", 1998, "Petit", 17, ["CM", "DM"], 85), p("France", "🇫🇷", 1998, "Zidane", 10, ["AM", "CM"], 94, true), p("France", "🇫🇷", 1998, "Djorkaeff", 6, ["RW", "AM"], 86), p("France", "🇫🇷", 1998, "Henry", 12, ["LW", "ST"], 85), p("France", "🇫🇷", 1998, "Guivarc'h", 9, ["ST"], 78)] },
  { id: "ger-2014", country: "Germany", flag: "🇩🇪", cup: 2014, overall: 90, players: [p("Germany", "🇩🇪", 2014, "Neuer", 1, ["GK"], 92, true), p("Germany", "🇩🇪", 2014, "Lahm", 16, ["RB", "DM"], 91, true), p("Germany", "🇩🇪", 2014, "Hummels", 5, ["CB"], 88), p("Germany", "🇩🇪", 2014, "Boateng", 20, ["CB", "RB"], 87), p("Germany", "🇩🇪", 2014, "Höwedes", 4, ["LB", "CB"], 82), p("Germany", "🇩🇪", 2014, "Khedira", 6, ["DM", "CM"], 85), p("Germany", "🇩🇪", 2014, "Kroos", 18, ["CM"], 90), p("Germany", "🇩🇪", 2014, "Özil", 8, ["AM", "RW"], 88), p("Germany", "🇩🇪", 2014, "Müller", 13, ["RW", "ST"], 89), p("Germany", "🇩🇪", 2014, "Klose", 11, ["ST"], 86), p("Germany", "🇩🇪", 2014, "Schürrle", 9, ["LW", "RW"], 83)] },
  { id: "esp-2010", country: "Spain", flag: "🇪🇸", cup: 2010, overall: 91, players: [p("Spain", "🇪🇸", 2010, "Casillas", 1, ["GK"], 91, true), p("Spain", "🇪🇸", 2010, "Ramos", 15, ["RB", "CB"], 90), p("Spain", "🇪🇸", 2010, "Piqué", 3, ["CB"], 88), p("Spain", "🇪🇸", 2010, "Puyol", 5, ["CB"], 90), p("Spain", "🇪🇸", 2010, "Capdevila", 11, ["LB"], 84), p("Spain", "🇪🇸", 2010, "Busquets", 16, ["DM"], 87), p("Spain", "🇪🇸", 2010, "Xavi", 8, ["CM"], 93, true), p("Spain", "🇪🇸", 2010, "Iniesta", 6, ["AM", "LW"], 92, true), p("Spain", "🇪🇸", 2010, "Pedro", 18, ["RW", "LW"], 83), p("Spain", "🇪🇸", 2010, "Villa", 7, ["ST", "LW"], 90), p("Spain", "🇪🇸", 2010, "Torres", 9, ["ST"], 85)] },
  { id: "ita-2006", country: "Italy", flag: "🇮🇹", cup: 2006, overall: 89, players: [p("Italy", "🇮🇹", 2006, "Buffon", 1, ["GK"], 93, true), p("Italy", "🇮🇹", 2006, "Zambrotta", 19, ["RB", "LB"], 88), p("Italy", "🇮🇹", 2006, "Cannavaro", 5, ["CB"], 94, true), p("Italy", "🇮🇹", 2006, "Nesta", 13, ["CB"], 89), p("Italy", "🇮🇹", 2006, "Grosso", 3, ["LB"], 84), p("Italy", "🇮🇹", 2006, "Gattuso", 8, ["DM"], 86), p("Italy", "🇮🇹", 2006, "Pirlo", 21, ["CM", "DM"], 91, true), p("Italy", "🇮🇹", 2006, "Totti", 10, ["AM"], 89), p("Italy", "🇮🇹", 2006, "Camoranesi", 16, ["RW", "CM"], 84), p("Italy", "🇮🇹", 2006, "Toni", 9, ["ST"], 87), p("Italy", "🇮🇹", 2006, "Del Piero", 7, ["LW", "ST"], 86)] },
  { id: "eng-1966", country: "England", flag: "🏴", cup: 1966, overall: 86, players: [p("England", "🏴", 1966, "Gordon Banks", 1, ["GK"], 88, true), p("England", "🏴", 1966, "George Cohen", 2, ["RB"], 83), p("England", "🏴", 1966, "Jack Charlton", 5, ["CB"], 84), p("England", "🏴", 1966, "Bobby Moore", 6, ["CB"], 93, true), p("England", "🏴", 1966, "Ray Wilson", 3, ["LB"], 82), p("England", "🏴", 1966, "Nobby Stiles", 4, ["DM"], 82), p("England", "🏴", 1966, "Alan Ball", 7, ["CM", "RW"], 84), p("England", "🏴", 1966, "Bobby Charlton", 9, ["AM", "CM"], 92, true), p("England", "🏴", 1966, "Martin Peters", 16, ["LW", "CM"], 84), p("England", "🏴", 1966, "Geoff Hurst", 10, ["ST"], 88), p("England", "🏴", 1966, "Roger Hunt", 21, ["ST"], 83)] },
  { id: "ned-1974", country: "Netherlands", flag: "🇳🇱", cup: 1974, overall: 88, players: [p("Netherlands", "🇳🇱", 1974, "Jongbloed", 8, ["GK"], 80), p("Netherlands", "🇳🇱", 1974, "Suurbier", 20, ["RB"], 84), p("Netherlands", "🇳🇱", 1974, "Rijsbergen", 17, ["CB"], 82), p("Netherlands", "🇳🇱", 1974, "Haan", 2, ["CB", "DM"], 85), p("Netherlands", "🇳🇱", 1974, "Krol", 12, ["LB", "CB"], 88), p("Netherlands", "🇳🇱", 1974, "Jansen", 6, ["DM", "CM"], 84), p("Netherlands", "🇳🇱", 1974, "Neeskens", 13, ["CM"], 90, true), p("Netherlands", "🇳🇱", 1974, "Cruyff", 14, ["AM", "ST"], 96, true), p("Netherlands", "🇳🇱", 1974, "Rensenbrink", 15, ["LW"], 87), p("Netherlands", "🇳🇱", 1974, "Rep", 16, ["RW", "ST"], 84), p("Netherlands", "🇳🇱", 1974, "Keizer", 11, ["LW", "AM"], 83)] },
  { id: "por-1966", country: "Portugal", flag: "🇵🇹", cup: 1966, overall: 84, players: [p("Portugal", "🇵🇹", 1966, "José Pereira", 1, ["GK"], 80), p("Portugal", "🇵🇹", 1966, "João Morais", 2, ["RB"], 79), p("Portugal", "🇵🇹", 1966, "Vicente", 3, ["CB"], 81), p("Portugal", "🇵🇹", 1966, "Hilário", 4, ["LB", "CB"], 80), p("Portugal", "🇵🇹", 1966, "Mário Coluna", 8, ["CM", "DM"], 87, true), p("Portugal", "🇵🇹", 1966, "José Augusto", 7, ["RW"], 82), p("Portugal", "🇵🇹", 1966, "Eusébio", 9, ["ST", "AM"], 95, true), p("Portugal", "🇵🇹", 1966, "Torres", 10, ["ST"], 84), p("Portugal", "🇵🇹", 1966, "Simões", 11, ["LW"], 84), p("Portugal", "🇵🇹", 1966, "Jaime Graça", 6, ["CM"], 81), p("Portugal", "🇵🇹", 1966, "Baptista", 5, ["DM"], 79)] },
  { id: "uru-1930", country: "Uruguay", flag: "🇺🇾", cup: 1930, overall: 82, players: [p("Uruguay", "🇺🇾", 1930, "Ballestrero", 1, ["GK"], 80), p("Uruguay", "🇺🇾", 1930, "Nasazzi", 2, ["CB"], 88, true), p("Uruguay", "🇺🇾", 1930, "Mascheroni", 3, ["CB", "LB"], 80), p("Uruguay", "🇺🇾", 1930, "Andrade", 4, ["CM", "DM"], 87, true), p("Uruguay", "🇺🇾", 1930, "Gestido", 6, ["CM"], 79), p("Uruguay", "🇺🇾", 1930, "Dorado", 7, ["RW"], 81), p("Uruguay", "🇺🇾", 1930, "Scarone", 8, ["AM"], 86, true), p("Uruguay", "🇺🇾", 1930, "Cea", 9, ["ST"], 85), p("Uruguay", "🇺🇾", 1930, "Castro", 10, ["ST", "LW"], 82), p("Uruguay", "🇺🇾", 1930, "Iriarte", 11, ["LW"], 80), p("Uruguay", "🇺🇾", 1930, "Fernández", 5, ["DM"], 78)] },
  { id: "mex-1970", country: "Mexico", flag: "🇲🇽", cup: 1970, overall: 78, players: [p("Mexico", "🇲🇽", 1970, "Calderón", 1, ["GK"], 78), p("Mexico", "🇲🇽", 1970, "Peña", 3, ["CB", "DM"], 80), p("Mexico", "🇲🇽", 1970, "Guzmán", 4, ["CB"], 79), p("Mexico", "🇲🇽", 1970, "Pérez", 2, ["RB"], 77), p("Mexico", "🇲🇽", 1970, "Rivas", 6, ["LB"], 77), p("Mexico", "🇲🇽", 1970, "Pulido", 5, ["DM"], 78), p("Mexico", "🇲🇽", 1970, "Fragoso", 8, ["CM"], 79), p("Mexico", "🇲🇽", 1970, "Valdivia", 10, ["AM"], 80), p("Mexico", "🇲🇽", 1970, "Basaguren", 7, ["RW"], 78), p("Mexico", "🇲🇽", 1970, "Hernández", 9, ["ST"], 79), p("Mexico", "🇲🇽", 1970, "Padilla", 11, ["LW"], 77)] },
  { id: "cmr-1990", country: "Cameroon", flag: "🇨🇲", cup: 1990, overall: 80, players: [p("Cameroon", "🇨🇲", 1990, "N'Kono", 1, ["GK"], 85, true), p("Cameroon", "🇨🇲", 1990, "Makanaky", 2, ["RB", "RW"], 78), p("Cameroon", "🇨🇲", 1990, "Massing", 4, ["CB"], 80), p("Cameroon", "🇨🇲", 1990, "Kunde", 5, ["CB", "DM"], 82), p("Cameroon", "🇨🇲", 1990, "Ebongué", 3, ["LB"], 77), p("Cameroon", "🇨🇲", 1990, "Pagal", 6, ["DM"], 78), p("Cameroon", "🇨🇲", 1990, "Mfédé", 8, ["CM"], 78), p("Cameroon", "🇨🇲", 1990, "Omam-Biyik", 9, ["ST", "LW"], 84), p("Cameroon", "🇨🇲", 1990, "Milla", 10, ["ST", "AM"], 86, true), p("Cameroon", "🇨🇲", 1990, "Mabouang", 7, ["RW"], 77), p("Cameroon", "🇨🇲", 1990, "Tataw", 11, ["LW", "LB"], 77)] },
];

export function availablePlayers(squad: Squad, slots: Slot[], usedIds: Set<string>) {
  const openPositions = new Set(slots.filter((slot) => !slot.player).map((slot) => slot.label));
  return squad.players.filter((player) => !usedIds.has(player.id) && player.positions.some((position) => openPositions.has(position)));
}

export function compatibleSlotIds(player: Player, slots: Slot[]) {
  return slots.filter((slot) => !slot.player && player.positions.includes(slot.label)).map((slot) => slot.id);
}

export function calcStats(slots: Slot[]): TeamStats {
  const attackWeights: Record<Position, number> = { GK: 0, RB: 0.15, CB: 0, LB: 0.15, DM: 0.25, CM: 0.55, AM: 0.85, RW: 1, ST: 1, LW: 1 };
  const defenseWeights: Record<Position, number> = { GK: 1, RB: 0.85, CB: 1, LB: 0.85, DM: 0.85, CM: 0.45, AM: 0.2, RW: 0.05, ST: 0, LW: 0.05 };
  let attack = 0, attackW = 0, defense = 0, defenseW = 0, overall = 0, count = 0;
  for (const slot of slots) {
    if (!slot.player) continue;
    attack += slot.player.rating * attackWeights[slot.label];
    attackW += attackWeights[slot.label];
    defense += slot.player.rating * defenseWeights[slot.label];
    defenseW += defenseWeights[slot.label];
    overall += slot.player.rating;
    count += 1;
  }
  return { attack: attackW ? Math.round(attack / attackW) : 0, defense: defenseW ? Math.round(defense / defenseW) : 0, overall: count ? Math.round(overall / count) : 0 };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function poisson(lambda: number) {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let goals = 0;
  do {
    goals += 1;
    product *= Math.random();
  } while (product > threshold);
  return goals - 1;
}

function matchGoals(attack: number, defense: number, opponentOverall: number) {
  const ratingGap = (attack + defense) / 2 - opponentOverall;
  const gfLambda = clamp(1.35 + ratingGap * 0.065 + (attack - opponentOverall) * 0.035, 0.2, 4.5);
  const gaLambda = clamp(1.2 - ratingGap * 0.055 + (opponentOverall - defense) * 0.035, 0.15, 4.2);
  return { gf: poisson(gfLambda), ga: poisson(gaLambda) };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function goalMinutes(goals: number) {
  const minutes: number[] = [];
  for (let i = 0; i < goals; i += 1) minutes.push(Math.floor(4 + Math.random() * 86));
  return minutes.sort((a, b) => a - b);
}

function buildEvents(gf: number, ga: number, stoppage: number, penalties?: string): MatchEvent[] {
  const events: MatchEvent[] = [
    { minute: 1, team: "neutral", type: "chance", text: "Anstoß" },
    { minute: 45, team: "neutral", type: "half", text: "Halbzeit" },
  ];
  goalMinutes(gf).forEach((minute) => events.push({ minute, team: "us", type: "goal", text: "Tor für deine XI" }));
  goalMinutes(ga).forEach((minute) => events.push({ minute, team: "opponent", type: "goal", text: "Gegentor" }));
  const chanceCount = Math.max(2, Math.min(5, Math.floor((gf + ga + 3) / 2)));
  for (let i = 0; i < chanceCount; i += 1) {
    const us = Math.random() > 0.4;
    events.push({ minute: Math.floor(8 + Math.random() * 78), team: us ? "us" : "opponent", type: "chance", text: us ? "Große Chance" : "Gegnerchance" });
  }
  if (stoppage > 0) events.push({ minute: 90, team: "neutral", type: "extra", text: `Nachspielzeit: +${stoppage}` });
  if (penalties) events.push({ minute: 120, team: "neutral", type: "pens", text: penalties === "won on pens" ? "Elfmeterschießen gewonnen" : "Elfmeterschießen verloren" });
  events.push({ minute: 90 + stoppage, team: "neutral", type: "full", text: "Abpfiff" });
  return events.sort((a, b) => a.minute - b.minute);
}

const tournamentPhases = [
  { phase: "Group 1", knockout: false },
  { phase: "Group 2", knockout: false },
  { phase: "Group 3", knockout: false },
  { phase: "Round of 16", knockout: true },
  { phase: "Quarter-final", knockout: true },
  { phase: "Semi-final", knockout: true },
  { phase: "Final", knockout: true },
];

export function simulateCampaign(stats: TeamStats, ownSquadIds: string[] = []): Campaign {
  let wins = 0, draws = 0, losses = 0, gfTotal = 0, gaTotal = 0, stopped = false;
  const ownCountries = new Set(ownSquadIds);
  const opponents = shuffle(squads.filter((squad) => !ownCountries.has(squad.id)));
  const matches: Match[] = [];

  for (const item of tournamentPhases) {
    if (stopped) break;
    const opponent = opponents.shift() ?? squads[Math.floor(Math.random() * squads.length)] ?? squads[0];
    const { gf, ga } = matchGoals(stats.attack, stats.defense, opponent.overall);
    let advanced = gf >= ga;
    let penalties: string | undefined;
    const stoppage = Math.floor(1 + Math.random() * 6);

    if (gf > ga) wins += 1;
    if (gf === ga) draws += 1;
    if (gf < ga) losses += 1;

    if (item.knockout && gf === ga) {
      const chance = clamp(0.5 + (stats.overall - opponent.overall) * 0.018, 0.12, 0.88);
      advanced = Math.random() < chance;
      penalties = advanced ? "won on pens" : "lost on pens";
      if (!advanced) stopped = true;
    } else if (item.knockout && gf < ga) {
      stopped = true;
    }

    gfTotal += gf;
    gaTotal += ga;
    matches.push({
      phase: item.phase,
      opponent: opponent.country,
      opponentFlag: opponent.flag,
      opponentCup: opponent.cup,
      opponentOverall: opponent.overall,
      gf,
      ga,
      advanced,
      stoppage,
      penalties,
      events: buildEvents(gf, ga, stoppage, penalties),
    });
  }

  const champion = matches.length === tournamentPhases.length && matches.at(-1)?.advanced === true;
  const perfect = champion && wins === 7 && draws === 0 && losses === 0;
  const clean = champion && gaTotal === 0;
  const crusher = champion && gfTotal - gaTotal >= 18;

  return {
    champion,
    record: `${wins}-${losses}`,
    wins,
    draws,
    losses,
    gf: gfTotal,
    ga: gaTotal,
    badge: crusher ? "Record breaker" : clean ? "Iron wall" : perfect ? "Perfect run" : undefined,
    matches,
  };
}
