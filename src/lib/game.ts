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

export type TeamStats = {
  attack: number;
  defense: number;
  overall: number;
};

export type Match = {
  phase: string;
  opponent: string;
  opponentOverall: number;
  gf: number;
  ga: number;
  advanced: boolean;
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

const baseSlots: Slot[] = [
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
];

const styleShift: Record<Style, Partial<Record<Position, number>>> = {
  secure: { RB: 5, LB: 5, DM: 4, CM: 3, AM: 2, RW: 2, LW: 2, ST: 1 },
  balanced: {},
  bold: { RB: -6, LB: -6, DM: -5, CM: -4, AM: -4, RW: -3, LW: -3, ST: -2 },
};

export function formation(style: Style): Slot[] {
  return baseSlots.map((slot) => ({
    ...slot,
    y: Math.max(12, Math.min(92, slot.y + (styleShift[style][slot.label] ?? 0))),
  }));
}

function p(
  country: string,
  flag: string,
  cup: number,
  name: string,
  number: number,
  positions: Position[],
  rating: number,
  legend = false,
): Player {
  return {
    id: `${country}-${cup}-${name.toLowerCase().replaceAll(" ", "-")}`,
    country,
    flag,
    cup,
    name,
    number,
    positions,
    rating,
    legend,
  };
}

export const squads: Squad[] = [
  {
    id: "bra-2002",
    country: "Brazil",
    flag: "🇧🇷",
    cup: 2002,
    overall: 91,
    players: [
      p("Brazil", "🇧🇷", 2002, "Marcos", 1, ["GK"], 84),
      p("Brazil", "🇧🇷", 2002, "Cafu", 2, ["RB"], 90, true),
      p("Brazil", "🇧🇷", 2002, "Lucio", 3, ["CB"], 87),
      p("Brazil", "🇧🇷", 2002, "Edmilson", 5, ["CB", "DM"], 84),
      p("Brazil", "🇧🇷", 2002, "Roberto Carlos", 6, ["LB"], 91, true),
      p("Brazil", "🇧🇷", 2002, "Gilberto Silva", 8, ["DM"], 84),
      p("Brazil", "🇧🇷", 2002, "Juninho", 19, ["CM", "AM"], 83),
      p("Brazil", "🇧🇷", 2002, "Rivaldo", 10, ["AM", "LW"], 92, true),
      p("Brazil", "🇧🇷", 2002, "Ronaldinho", 11, ["LW", "AM"], 89, true),
      p("Brazil", "🇧🇷", 2002, "Ronaldo", 9, ["ST"], 94, true),
      p("Brazil", "🇧🇷", 2002, "Denilson", 17, ["RW", "LW"], 82),
    ],
  },
  {
    id: "arg-1986",
    country: "Argentina",
    flag: "🇦🇷",
    cup: 1986,
    overall: 89,
    players: [
      p("Argentina", "🇦🇷", 1986, "Pumpido", 18, ["GK"], 83),
      p("Argentina", "🇦🇷", 1986, "Brown", 5, ["CB"], 84),
      p("Argentina", "🇦🇷", 1986, "Ruggeri", 19, ["CB"], 86),
      p("Argentina", "🇦🇷", 1986, "Cuciuffo", 9, ["RB", "CB"], 80),
      p("Argentina", "🇦🇷", 1986, "Olarticoechea", 16, ["LB"], 82),
      p("Argentina", "🇦🇷", 1986, "Giusti", 14, ["DM", "CM"], 82),
      p("Argentina", "🇦🇷", 1986, "Burruchaga", 7, ["CM", "AM"], 86),
      p("Argentina", "🇦🇷", 1986, "Maradona", 10, ["AM", "ST"], 97, true),
      p("Argentina", "🇦🇷", 1986, "Valdano", 11, ["LW", "ST"], 88),
      p("Argentina", "🇦🇷", 1986, "Enrique", 12, ["RW", "CM"], 80),
      p("Argentina", "🇦🇷", 1986, "Borghi", 20, ["LW", "AM"], 81),
    ],
  },
  {
    id: "fra-1998",
    country: "France",
    flag: "🇫🇷",
    cup: 1998,
    overall: 90,
    players: [
      p("France", "🇫🇷", 1998, "Barthez", 16, ["GK"], 88),
      p("France", "🇫🇷", 1998, "Thuram", 15, ["RB", "CB"], 91),
      p("France", "🇫🇷", 1998, "Blanc", 5, ["CB"], 89),
      p("France", "🇫🇷", 1998, "Desailly", 8, ["CB", "DM"], 90),
      p("France", "🇫🇷", 1998, "Lizarazu", 3, ["LB"], 86),
      p("France", "🇫🇷", 1998, "Deschamps", 7, ["DM"], 86),
      p("France", "🇫🇷", 1998, "Petit", 17, ["CM", "DM"], 85),
      p("France", "🇫🇷", 1998, "Zidane", 10, ["AM", "CM"], 94, true),
      p("France", "🇫🇷", 1998, "Djorkaeff", 6, ["RW", "AM"], 86),
      p("France", "🇫🇷", 1998, "Henry", 12, ["LW", "ST"], 85),
      p("France", "🇫🇷", 1998, "Guivarc'h", 9, ["ST"], 78),
    ],
  },
  {
    id: "ger-2014",
    country: "Germany",
    flag: "🇩🇪",
    cup: 2014,
    overall: 90,
    players: [
      p("Germany", "🇩🇪", 2014, "Neuer", 1, ["GK"], 92, true),
      p("Germany", "🇩🇪", 2014, "Lahm", 16, ["RB", "DM"], 91, true),
      p("Germany", "🇩🇪", 2014, "Hummels", 5, ["CB"], 88),
      p("Germany", "🇩🇪", 2014, "Boateng", 20, ["CB", "RB"], 87),
      p("Germany", "🇩🇪", 2014, "Höwedes", 4, ["LB", "CB"], 82),
      p("Germany", "🇩🇪", 2014, "Khedira", 6, ["DM", "CM"], 85),
      p("Germany", "🇩🇪", 2014, "Kroos", 18, ["CM"], 90),
      p("Germany", "🇩🇪", 2014, "Özil", 8, ["AM", "RW"], 88),
      p("Germany", "🇩🇪", 2014, "Müller", 13, ["RW", "ST"], 89),
      p("Germany", "🇩🇪", 2014, "Klose", 11, ["ST"], 86),
      p("Germany", "🇩🇪", 2014, "Schürrle", 9, ["LW", "RW"], 83),
    ],
  },
  {
    id: "esp-2010",
    country: "Spain",
    flag: "🇪🇸",
    cup: 2010,
    overall: 91,
    players: [
      p("Spain", "🇪🇸", 2010, "Casillas", 1, ["GK"], 91, true),
      p("Spain", "🇪🇸", 2010, "Ramos", 15, ["RB", "CB"], 90),
      p("Spain", "🇪🇸", 2010, "Piqué", 3, ["CB"], 88),
      p("Spain", "🇪🇸", 2010, "Puyol", 5, ["CB"], 90),
      p("Spain", "🇪🇸", 2010, "Capdevila", 11, ["LB"], 84),
      p("Spain", "🇪🇸", 2010, "Busquets", 16, ["DM"], 87),
      p("Spain", "🇪🇸", 2010, "Xavi", 8, ["CM"], 93, true),
      p("Spain", "🇪🇸", 2010, "Iniesta", 6, ["AM", "LW"], 92, true),
      p("Spain", "🇪🇸", 2010, "Pedro", 18, ["RW", "LW"], 83),
      p("Spain", "🇪🇸", 2010, "Villa", 7, ["ST", "LW"], 90),
      p("Spain", "🇪🇸", 2010, "Torres", 9, ["ST"], 85),
    ],
  },
  {
    id: "ita-2006",
    country: "Italy",
    flag: "🇮🇹",
    cup: 2006,
    overall: 89,
    players: [
      p("Italy", "🇮🇹", 2006, "Buffon", 1, ["GK"], 93, true),
      p("Italy", "🇮🇹", 2006, "Zambrotta", 19, ["RB", "LB"], 88),
      p("Italy", "🇮🇹", 2006, "Cannavaro", 5, ["CB"], 94, true),
      p("Italy", "🇮🇹", 2006, "Nesta", 13, ["CB"], 89),
      p("Italy", "🇮🇹", 2006, "Grosso", 3, ["LB"], 84),
      p("Italy", "🇮🇹", 2006, "Gattuso", 8, ["DM"], 86),
      p("Italy", "🇮🇹", 2006, "Pirlo", 21, ["CM", "DM"], 91, true),
      p("Italy", "🇮🇹", 2006, "Totti", 10, ["AM"], 89),
      p("Italy", "🇮🇹", 2006, "Camoranesi", 16, ["RW", "CM"], 84),
      p("Italy", "🇮🇹", 2006, "Toni", 9, ["ST"], 87),
      p("Italy", "🇮🇹", 2006, "Del Piero", 7, ["LW", "ST"], 86),
    ],
  },
];

export function availablePlayers(squad: Squad, slots: Slot[], usedIds: Set<string>) {
  const openPositions = new Set(slots.filter((slot) => !slot.player).map((slot) => slot.label));
  return squad.players.filter(
    (player) => !usedIds.has(player.id) && player.positions.some((position) => openPositions.has(position)),
  );
}

export function compatibleSlotIds(player: Player, slots: Slot[]) {
  return slots
    .filter((slot) => !slot.player && player.positions.includes(slot.label))
    .map((slot) => slot.id);
}

export function calcStats(slots: Slot[]): TeamStats {
  const attackWeights: Record<Position, number> = {
    GK: 0,
    RB: 0.15,
    CB: 0,
    LB: 0.15,
    DM: 0.25,
    CM: 0.55,
    AM: 0.85,
    RW: 1,
    ST: 1,
    LW: 1,
  };
  const defenseWeights: Record<Position, number> = {
    GK: 1,
    RB: 0.85,
    CB: 1,
    LB: 0.85,
    DM: 0.85,
    CM: 0.45,
    AM: 0.2,
    RW: 0.05,
    ST: 0,
    LW: 0.05,
  };

  let attack = 0;
  let attackW = 0;
  let defense = 0;
  let defenseW = 0;
  let overall = 0;
  let count = 0;

  for (const slot of slots) {
    if (!slot.player) continue;
    attack += slot.player.rating * attackWeights[slot.label];
    attackW += attackWeights[slot.label];
    defense += slot.player.rating * defenseWeights[slot.label];
    defenseW += defenseWeights[slot.label];
    overall += slot.player.rating;
    count += 1;
  }

  return {
    attack: attackW ? Math.round(attack / attackW) : 0,
    defense: defenseW ? Math.round(defense / defenseW) : 0,
    overall: count ? Math.round(overall / count) : 0,
  };
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
  const gfLambda = clamp(1.35 + (attack - opponentOverall) * 0.075, 0.15, 5);
  const gaLambda = clamp(1.35 + (opponentOverall - defense) * 0.075, 0.15, 5);
  return { gf: poisson(gfLambda), ga: poisson(gaLambda) };
}

const phases = [
  { phase: "Group 1", opponent: "Confident underdog", overall: 68, knockout: false },
  { phase: "Group 2", opponent: "Compact block", overall: 72, knockout: false },
  { phase: "Group 3", opponent: "Fast transition XI", overall: 76, knockout: false },
  { phase: "Round of 16", opponent: "Dark horse", overall: 79, knockout: true },
  { phase: "Quarter-final", opponent: "Tournament giant", overall: 83, knockout: true },
  { phase: "Semi-final", opponent: "Golden generation", overall: 87, knockout: true },
  { phase: "Final", opponent: "World elite", overall: 91, knockout: true },
];

export function simulateCampaign(stats: TeamStats): Campaign {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let gfTotal = 0;
  let gaTotal = 0;
  let stopped = false;
  const matches: Match[] = [];

  for (const item of phases) {
    if (stopped) break;
    const { gf, ga } = matchGoals(stats.attack, stats.defense, item.overall);
    let advanced = gf >= ga;
    let penalties: string | undefined;

    if (gf > ga) wins += 1;
    if (gf === ga) draws += 1;
    if (gf < ga) losses += 1;

    if (item.knockout && gf === ga) {
      const chance = clamp(0.5 + (stats.overall - item.overall) * 0.012, 0.1, 0.9);
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
      opponent: item.opponent,
      opponentOverall: item.overall,
      gf,
      ga,
      advanced,
      penalties,
    });
  }

  const champion = matches.length === phases.length && matches.at(-1)?.advanced === true;
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
