export type GameFormat = "2vs2" | "3vs3" | "4+1vs4+1";
export type TournamentStatus = "active" | "completed" | "draft";

export interface Player {
  id: string;
  name: string;
  number: number;
  points: number;
  active: boolean;
  skillRating: number;
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
  id: string;
  name: string;
  createdAt: Date;
  endedAt?: Date;
  status: TournamentStatus;
  gamesPerRound: number;
  rounds: Round[];
  currentRound: number;
  players: Player[];
  started: boolean;
  formatConfigs: FormatConfig[];
  fairRoll: boolean;
}

export interface TournamentHistory {
  tournaments: Tournament[];
  currentTournamentId: string | null;
}

export interface PlayerOverallStats {
  playerId: string;
  playerName: string;
  playerNumber: number;
  skillRating: number;
  totalPoints: number;
  totalGames: number;
  tournamentsParticipated: number;
  averagePointsPerGame: number;
  averagePointsPerTournament: number;
  gamesPlayedByFormat: {
    "2vs2": number;
    "3vs3": number;
    "4+1vs4+1": number;
  };
}
