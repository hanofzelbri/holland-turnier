export type GameFormat = "2vs2" | "3vs3" | "4+1vs4+1";

export interface Player {
  id: string;
  name: string;
  number: number;
  points: number;
  active: boolean;
  gamesPlayed: {
    "2vs2": number;
    "3vs3": number;
    "4+1vs4+1": number;
    total: number;
  };
}

export interface Game {
  id: string;
  round: number;
  teamA: Player[];
  teamB: Player[];
  scoreA: number | null;
  scoreB: number | null;
  substitutesA: Player[];
  substitutesB: Player[];
  format: GameFormat;
}

export interface Round {
  roundNumber: number;
  games: Game[];
  completed: boolean;
}

export interface FormatConfig {
  format: GameFormat;
  gamesCount: number;
  playersPerTeam: number;
}

export interface Tournament {
  gamesPerRound: number;
  rounds: Round[];
  currentRound: number;
  players: Player[];
  started: boolean;
  formatConfigs: FormatConfig[];
  fairRoll: boolean;
}
