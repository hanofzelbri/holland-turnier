import { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { Tournament, Player, GameFormat, FormatConfig, Game, Round, TournamentHistory, PlayerOverallStats, TournamentStatus } from '@/types';

interface TournamentContextType {
    currentTournament: Tournament | null;
    tournamentHistory: TournamentHistory;
    addPlayer: (name: string, number: number, skillRating?: number) => void;
    removePlayer: (id: string) => void;
    togglePlayerActive: (id: string) => void;
    updatePlayerSkillRating: (id: string, skillRating: number) => void;
    renamePlayer: (id: string, newName: string) => void;
    updateFormatConfig: (format: GameFormat, gamesCount: number) => void;
    startTournament: (onNavigateToGames?: () => void) => void;
    endTournament: () => void;
    createNewTournament: (name: string) => void;
    resetTournament: () => void;
    renameTournament: (name: string) => void;
    generateNextRound: () => void;
    updateGameScore: (gameId: string, scoreA: number, scoreB: number) => void;
    setFairRoll: (fairRoll: boolean) => void;
    getPlayerOverallStats: () => PlayerOverallStats[];
    getHistoricalPlayerStats: () => PlayerOverallStats[];
}

type TournamentAction =
    | { type: 'ADD_PLAYER'; payload: { name: string; number: number; skillRating?: number } }
    | { type: 'REMOVE_PLAYER'; payload: string }
    | { type: 'TOGGLE_PLAYER_ACTIVE'; payload: string }
    | { type: 'UPDATE_PLAYER_SKILL_RATING'; payload: { id: string; skillRating: number } }
    | { type: 'RENAME_PLAYER'; payload: { id: string; newName: string } }
    | { type: 'UPDATE_FORMAT_CONFIG'; payload: { format: GameFormat; gamesCount: number } }
    | { type: 'START_TOURNAMENT' }
    | { type: 'END_TOURNAMENT' }
    | { type: 'CREATE_NEW_TOURNAMENT'; payload: { name: string } }
    | { type: 'RESET_TOURNAMENT' }
    | { type: 'RENAME_TOURNAMENT'; payload: { name: string } }
    | { type: 'GENERATE_NEXT_ROUND' }
    | { type: 'UPDATE_GAME_SCORE'; payload: { gameId: string; scoreA: number; scoreB: number } }
    | { type: 'SET_FAIR_ROLL'; payload: boolean }
    | { type: 'LOAD_TOURNAMENT'; payload: Tournament }
    | { type: 'LOAD_HISTORY'; payload: TournamentHistory };

const defaultPlayers: Player[] = [
    { id: '1', name: 'Leon Krolop', number: 1, points: 0, active: true, skillRating: 1, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '2', name: 'Henry Engstler', number: 2, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '3', name: 'Nico Grams', number: 3, points: 0, active: true, skillRating: 5, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '4', name: 'Alois Hage', number: 4, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '5', name: 'Ben Stock', number: 5, points: 0, active: true, skillRating: 2, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '6', name: 'Linus Haneberg', number: 6, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '7', name: 'Tim Zauner', number: 7, points: 0, active: true, skillRating: 2, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '8', name: 'Jannis Mayer', number: 8, points: 0, active: true, skillRating: 2, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '9', name: 'Finn Nuschele', number: 9, points: 0, active: true, skillRating: 5, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '10', name: 'Tizian Bellmann', number: 10, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '11', name: 'Sebastian Betz', number: 11, points: 0, active: true, skillRating: 5, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '12', name: 'Vinzenz Herz', number: 12, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '13', name: 'Tajo Dietrich', number: 13, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '14', name: 'Paul Querbach', number: 14, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '15', name: 'Emil Richter', number: 15, points: 0, active: true, skillRating: 5, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '16', name: 'Korbinian Koch', number: 16, points: 0, active: true, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '17', name: 'Leni Egger', number: 17, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '18', name: 'Lorik Mazrekaj', number: 18, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '19', name: 'Niklas Hauf', number: 19, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '20', name: 'Samuel Noak', number: 20, points: 0, active: true, skillRating: 4, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '21', name: 'Arman Tajmohammad', number: 21, points: 0, active: false, skillRating: 1, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '22', name: 'Fritz Lehmann', number: 22, points: 0, active: false, skillRating: 5, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '23', name: 'Phillip Herz', number: 23, points: 0, active: false, skillRating: 2, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '24', name: 'Sigi Kleinheinz', number: 24, points: 0, active: false, skillRating: 1, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '25', name: 'Luca Weigl', number: 25, points: 0, active: false, skillRating: 2, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '26', name: 'Timo Spatz', number: 26, points: 0, active: false, skillRating: 3, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
];

const defaultFormatConfigs: FormatConfig[] = [
    { format: '2vs2', gamesCount: 2, playersPerTeam: 2 },
    { format: '3vs3', gamesCount: 2, playersPerTeam: 3 },
    { format: '4+1vs4+1', gamesCount: 1, playersPerTeam: 5 },
];

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function isRoundCompleted(round: Round): boolean {
    return round.games.length > 0 && round.games.every(game => game.scoreA !== null && game.scoreB !== null);
}

function getCompletedRounds(tournament: Tournament): Round[] {
    return tournament.rounds.filter(isRoundCompleted);
}

function hasAnyCompletedRounds(tournament: Tournament): boolean {
    return tournament.rounds.some(isRoundCompleted);
}

const initialTournament: Tournament = {
    id: generateId(),
    name: 'Neues Turnier',
    createdAt: new Date(),
    status: 'draft' as TournamentStatus,
    gamesPerRound: 5,
    rounds: [],
    currentRound: 0,
    players: defaultPlayers,
    started: false,
    formatConfigs: defaultFormatConfigs,
    fairRoll: true,
};

const initialTournamentHistory: TournamentHistory = {
    tournaments: [],
    currentTournamentId: null,
};

function historyReducer(state: TournamentHistory, action: { type: 'ADD_TOURNAMENT'; payload: Tournament } | { type: 'LOAD_HISTORY'; payload: TournamentHistory }): TournamentHistory {
    switch (action.type) {
        case 'ADD_TOURNAMENT':
            return {
                ...state,
                tournaments: [...state.tournaments, action.payload]
            };
        case 'LOAD_HISTORY':
            return action.payload;
        default:
            return state;
    }
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createFairTeams(players: Player[], playersPerTeam: number, gamesCount: number, format: GameFormat, fairRoll: boolean): Game[] {
    const activePlayers = players.filter(p => p.active);

    let shuffledPlayers: Player[];

    if (fairRoll) {
        const playersWithCombinedRating = activePlayers.map(player => ({
            ...player,
            combinedRating: player.points + (player.skillRating * 2)
        }));

        const groupedByCombinedRating = playersWithCombinedRating.reduce((groups, player) => {
            const rating = player.combinedRating;
            if (!groups[rating]) groups[rating] = [];
            groups[rating].push(player);
            return groups;
        }, {} as Record<number, Player[]>);

        const sortedGroups = Object.entries(groupedByCombinedRating)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([, players]) => shuffleArray(players));

        shuffledPlayers = [];
        let maxLength = Math.max(...sortedGroups.map(g => g.length));

        for (let i = 0; i < maxLength; i++) {
            for (const group of sortedGroups) {
                if (group[i]) shuffledPlayers.push(group[i]);
            }
        }
    } else {
        shuffledPlayers = shuffleArray(activePlayers);
    }

    const games: Game[] = [];
    const totalPlayersNeeded = gamesCount * playersPerTeam * 2;

    for (let gameIndex = 0; gameIndex < gamesCount; gameIndex++) {
        const teamA: Player[] = [];
        const teamB: Player[] = [];
        const substitutesA: Player[] = [];
        const substitutesB: Player[] = [];

        for (let i = 0; i < playersPerTeam; i++) {
            const playerIndexA = gameIndex * playersPerTeam * 2 + i;
            const playerIndexB = gameIndex * playersPerTeam * 2 + playersPerTeam + i;

            if (playerIndexA < shuffledPlayers.length) teamA.push(shuffledPlayers[playerIndexA]);
            if (playerIndexB < shuffledPlayers.length) teamB.push(shuffledPlayers[playerIndexB]);
        }

        const remainingPlayers = shuffledPlayers.slice(totalPlayersNeeded);
        const halfRemaining = Math.ceil(remainingPlayers.length / 2);

        substitutesA.push(...remainingPlayers.slice(0, halfRemaining));
        substitutesB.push(...remainingPlayers.slice(halfRemaining));

        games.push({
            id: generateId(),
            round: 0,
            teamA,
            teamB,
            scoreA: null,
            scoreB: null,
            substitutesA,
            substitutesB,
            format,
        });
    }

    return games;
}

function calculatePoints(tournament: Tournament): Tournament {
    const updatedPlayers = tournament.players.map(player => ({
        ...player,
        points: 0,
        gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 }
    }));

    const completedRounds = getCompletedRounds(tournament);

    completedRounds.forEach(round => {
        round.games.forEach(game => {
            if (game.scoreA !== null && game.scoreB !== null) {
                const allPlayersA = [...game.teamA, ...game.substitutesA];
                const allPlayersB = [...game.teamB, ...game.substitutesB];

                [...allPlayersA, ...allPlayersB].forEach(player => {
                    const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
                    if (playerIndex !== -1) {
                        updatedPlayers[playerIndex].gamesPlayed[game.format]++;
                        updatedPlayers[playerIndex].gamesPlayed.total++;
                    }
                });

                allPlayersA.forEach(player => {
                    const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
                    if (playerIndex !== -1) {
                        updatedPlayers[playerIndex].points += game.scoreA!;
                        if (game.scoreA! > game.scoreB!) {
                            updatedPlayers[playerIndex].points += 5;
                        } else if (game.scoreA! === game.scoreB!) {
                            updatedPlayers[playerIndex].points += 2;
                        }
                    }
                });

                allPlayersB.forEach(player => {
                    const playerIndex = updatedPlayers.findIndex(p => p.id === player.id);
                    if (playerIndex !== -1) {
                        updatedPlayers[playerIndex].points += game.scoreB!;
                        if (game.scoreB! > game.scoreA!) {
                            updatedPlayers[playerIndex].points += 5;
                        } else if (game.scoreB! === game.scoreA!) {
                            updatedPlayers[playerIndex].points += 2;
                        }
                    }
                });
            }
        });
    });

    return { ...tournament, players: updatedPlayers };
}

function tournamentReducer(state: Tournament, action: TournamentAction): Tournament {
    switch (action.type) {
        case 'ADD_PLAYER': {
            const newPlayer: Player = {
                id: generateId(),
                name: action.payload.name,
                number: action.payload.number,
                points: 0,
                active: true,
                skillRating: action.payload.skillRating ?? 3,
                gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 },
            };
            return { ...state, players: [...state.players, newPlayer] };
        }

        case 'REMOVE_PLAYER':
            return { ...state, players: state.players.filter(p => p.id !== action.payload) };

        case 'TOGGLE_PLAYER_ACTIVE':
            return {
                ...state,
                players: state.players.map(p =>
                    p.id === action.payload ? { ...p, active: !p.active } : p
                ),
            };

        case 'UPDATE_PLAYER_SKILL_RATING':
            return {
                ...state,
                players: state.players.map(p =>
                    p.id === action.payload.id ? { ...p, skillRating: action.payload.skillRating } : p
                ),
            };

        case 'RENAME_PLAYER':
            return {
                ...state,
                players: state.players.map(p =>
                    p.id === action.payload.id ? { ...p, name: action.payload.newName } : p
                ),
            };

        case 'UPDATE_FORMAT_CONFIG':
            return {
                ...state,
                formatConfigs: state.formatConfigs.map(config =>
                    config.format === action.payload.format
                        ? { ...config, gamesCount: action.payload.gamesCount }
                        : config
                ),
            };

        case 'START_TOURNAMENT': {
            const allGames: Game[] = [];
            let roundNumber = 1;

            const activePlayers = state.players.filter(p => p.active);
            const activeFormatConfigs = state.formatConfigs.filter(config => config.gamesCount > 0);

            if (activeFormatConfigs.length === 0) {
                return state;
            }

            let usedPlayerIds: Set<string> = new Set();
            let availablePlayers = [...activePlayers];

            activeFormatConfigs.forEach(config => {
                if (config.gamesCount > 0) {
                    const playersNeededForFormat = config.playersPerTeam * 2 * config.gamesCount;
                    const formatPlayers = availablePlayers.slice(0, playersNeededForFormat);

                    if (formatPlayers.length >= config.playersPerTeam * 2) {
                        const games = createFairTeams(formatPlayers, config.playersPerTeam, config.gamesCount, config.format, state.fairRoll);
                        games.forEach(game => {
                            game.round = roundNumber;
                            allGames.push(game);

                            [...game.teamA, ...game.teamB].forEach(player => {
                                usedPlayerIds.add(player.id);
                            });
                        });

                        availablePlayers = availablePlayers.filter(p => !usedPlayerIds.has(p.id));
                    }
                }
            });

            const round: Round = {
                roundNumber,
                games: allGames,
                completed: false,
            };

            return {
                ...state,
                started: true,
                rounds: [round],
                currentRound: 1,
                status: 'running' as TournamentStatus,
            };
        }

        case 'GENERATE_NEXT_ROUND': {
            const allGames: Game[] = [];
            const nextRoundNumber = state.rounds.length + 1;

            const activePlayers = state.players.filter(p => p.active);
            const activeFormatConfigs = state.formatConfigs.filter(config => config.gamesCount > 0);

            if (activeFormatConfigs.length === 0) {
                return state;
            }

            let usedPlayerIds: Set<string> = new Set();
            let availablePlayers = [...activePlayers];

            activeFormatConfigs.forEach(config => {
                if (config.gamesCount > 0) {
                    const playersNeededForFormat = config.playersPerTeam * 2 * config.gamesCount;
                    const formatPlayers = availablePlayers.slice(0, playersNeededForFormat);

                    if (formatPlayers.length >= config.playersPerTeam * 2) {
                        const games = createFairTeams(formatPlayers, config.playersPerTeam, config.gamesCount, config.format, state.fairRoll);
                        games.forEach(game => {
                            game.round = nextRoundNumber;
                            allGames.push(game);

                            [...game.teamA, ...game.teamB].forEach(player => {
                                usedPlayerIds.add(player.id);
                            });
                        });

                        availablePlayers = availablePlayers.filter(p => !usedPlayerIds.has(p.id));
                    }
                }
            });

            const newRound: Round = {
                roundNumber: nextRoundNumber,
                games: allGames,
                completed: false,
            };

            return {
                ...state,
                rounds: [...state.rounds, newRound],
                currentRound: nextRoundNumber,
            };
        }

        case 'UPDATE_GAME_SCORE': {
            const updatedRounds = state.rounds.map(round => ({
                ...round,
                games: round.games.map(game =>
                    game.id === action.payload.gameId
                        ? { ...game, scoreA: action.payload.scoreA, scoreB: action.payload.scoreB }
                        : game
                ),
            }));

            const updatedState = { ...state, rounds: updatedRounds };
            return calculatePoints(updatedState);
        }

        case 'RESET_TOURNAMENT':
            return {
                ...initialTournament,
                id: state.id,
                name: state.name,
                createdAt: state.createdAt,
                players: state.players.map(p => ({
                    ...p,
                    points: 0,
                    gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 },
                })),
            };

        case 'SET_FAIR_ROLL':
            return { ...state, fairRoll: action.payload };

        case 'LOAD_TOURNAMENT':
            return action.payload;

        case 'RENAME_TOURNAMENT':
            return { ...state, name: action.payload.name };

        default:
            return state;
    }
}

function migrateTournamentData(tournament: any): Tournament {
    try {
        const migratedPlayers = (tournament.players || []).map((player: any) => ({
            id: player.id || generateId(),
            name: player.name || 'Unknown Player',
            number: player.number || 0,
            points: player.points || 0,
            active: player.active !== undefined ? player.active : true,
            skillRating: player.skillRating ?? 3,
            gamesPlayed: player.gamesPlayed || { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 }
        }));

        return {
            id: tournament.id || generateId(),
            name: tournament.name || 'Unbekanntes Turnier',
            createdAt: tournament.createdAt ? new Date(tournament.createdAt) : new Date(),
            endedAt: tournament.endedAt ? new Date(tournament.endedAt) : undefined,
            status: tournament.status || 'draft',
            gamesPerRound: tournament.gamesPerRound || 5,
            rounds: tournament.rounds || [],
            currentRound: tournament.currentRound || 0,
            players: migratedPlayers,
            started: tournament.started || false,
            formatConfigs: tournament.formatConfigs || defaultFormatConfigs,
            fairRoll: tournament.fairRoll !== undefined ? tournament.fairRoll : true
        };
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [tournament, dispatch] = useReducer(tournamentReducer, initialTournament);
    const [history, historyDispatch] = useReducer(historyReducer, initialTournamentHistory);

    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (hasLoaded) return;

        const loadData = () => {
            const saved = localStorage.getItem('holland-turnier');
            const savedHistory = localStorage.getItem('holland-turnier-history');

            console.log('Loading data from localStorage...');
            console.log('Tournament data:', saved ? 'found' : 'not found');
            console.log('History data:', savedHistory ? 'found' : 'not found');

            if (saved) {
                try {
                    const parsedTournament = JSON.parse(saved);
                    console.log('Parsed tournament:', parsedTournament);

                    if (parsedTournament && parsedTournament.id) {
                        const migratedTournament = migrateTournamentData(parsedTournament);
                        console.log('Migrated tournament:', migratedTournament);
                        dispatch({ type: 'LOAD_TOURNAMENT', payload: migratedTournament });
                    }
                } catch (error) {
                    console.error('Failed to load tournament from localStorage:', error);
                    localStorage.removeItem('holland-turnier');
                }
            }

            if (savedHistory) {
                try {
                    const parsedHistory = JSON.parse(savedHistory);
                    console.log('Parsed history:', parsedHistory);

                    if (parsedHistory && Array.isArray(parsedHistory.tournaments)) {
                        const migratedHistory = {
                            ...parsedHistory,
                            tournaments: parsedHistory.tournaments.map((t: any) => migrateTournamentData(t))
                        };
                        console.log('Migrated history:', migratedHistory);
                        historyDispatch({ type: 'LOAD_HISTORY', payload: migratedHistory });
                    }
                } catch (error) {
                    console.error('Failed to load history from localStorage:', error);
                    localStorage.removeItem('holland-turnier-history');
                }
            }

            setHasLoaded(true);
        };

        loadData();
    }, [hasLoaded]);

    useEffect(() => {
        try {
            const tournamentData = JSON.stringify(tournament, (_, value) => {
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            });
            localStorage.setItem('holland-turnier', tournamentData);
            console.log('Saved tournament to localStorage:', tournament.name, tournament.id);
        } catch (error) {
            console.error('Failed to save tournament to localStorage:', error);
        }
    }, [tournament]);

    useEffect(() => {
        try {
            const historyData = JSON.stringify(history, (_, value) => {
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value;
            });
            localStorage.setItem('holland-turnier-history', historyData);
            console.log('Saved history to localStorage:', history.tournaments.length, 'tournaments');
        } catch (error) {
            console.error('Failed to save history to localStorage:', error);
        }
    }, [history]);

    const addPlayer = (name: string, number: number, skillRating?: number) => {
        dispatch({ type: 'ADD_PLAYER', payload: { name, number, skillRating } });
    };

    const removePlayer = (id: string) => {
        dispatch({ type: 'REMOVE_PLAYER', payload: id });
    };

    const togglePlayerActive = (id: string) => {
        dispatch({ type: 'TOGGLE_PLAYER_ACTIVE', payload: id });
    };

    const updatePlayerSkillRating = (id: string, skillRating: number) => {
        dispatch({ type: 'UPDATE_PLAYER_SKILL_RATING', payload: { id, skillRating } });
    };

    const renamePlayer = (id: string, newName: string) => {
        dispatch({ type: 'RENAME_PLAYER', payload: { id, newName } });
    };

    const updateFormatConfig = (format: GameFormat, gamesCount: number) => {
        dispatch({ type: 'UPDATE_FORMAT_CONFIG', payload: { format, gamesCount } });
    };

    const startTournament = (onNavigateToGames?: () => void) => {
        dispatch({ type: 'START_TOURNAMENT' });
        if (onNavigateToGames) {
            onNavigateToGames();
        }
    };

    const endTournament = () => {
        const completedTournament = {
            ...tournament,
            status: 'completed' as TournamentStatus,
            endedAt: new Date()
        };

        // Add completed tournament to history
        historyDispatch({ type: 'ADD_TOURNAMENT', payload: completedTournament });

        // Reset current tournament instead of creating new one
        dispatch({ type: 'RESET_TOURNAMENT' });
    };

    const createNewTournament = (name: string) => {
        const newTournament = {
            ...initialTournament,
            id: generateId(),
            name: name,
            createdAt: new Date(),
            players: tournament?.players || defaultPlayers
        };
        dispatch({ type: 'LOAD_TOURNAMENT', payload: newTournament });
    };

    const resetTournament = () => {
        dispatch({ type: 'RESET_TOURNAMENT' });
    };

    const renameTournament = (name: string) => {
        dispatch({ type: 'RENAME_TOURNAMENT', payload: { name } });
    };

    const generateNextRound = () => {
        dispatch({ type: 'GENERATE_NEXT_ROUND' });
    };

    const updateGameScore = (gameId: string, scoreA: number, scoreB: number) => {
        dispatch({ type: 'UPDATE_GAME_SCORE', payload: { gameId, scoreA, scoreB } });
    };

    const setFairRoll = (fairRoll: boolean) => {
        dispatch({ type: 'SET_FAIR_ROLL', payload: fairRoll });
    };

    const getPlayerOverallStats = (): PlayerOverallStats[] => {
        if (!tournament) return [];

        return tournament.players.map(player => ({
            playerId: player.id,
            playerName: player.name,
            playerNumber: player.number,
            skillRating: player.skillRating,
            totalPoints: player.points,
            totalGames: player.gamesPlayed.total,
            tournamentsParticipated: 1, // For now, just current tournament
            averagePointsPerGame: player.gamesPlayed.total > 0 ? player.points / player.gamesPlayed.total : 0,
            averagePointsPerTournament: player.points,
            gamesPlayedByFormat: {
                "2vs2": player.gamesPlayed["2vs2"],
                "3vs3": player.gamesPlayed["3vs3"],
                "4+1vs4+1": player.gamesPlayed["4+1vs4+1"]
            }
        }));
    };

    const getHistoricalPlayerStats = (): PlayerOverallStats[] => {
        // Combine current tournament with historical tournaments
        const allTournaments = tournament ? [...history.tournaments, tournament] : history.tournaments;
        const playerStatsMap = new Map<string, PlayerOverallStats>();

        allTournaments.forEach(t => {
            t.players.forEach(player => {
                const existingStats = playerStatsMap.get(player.id);

                if (existingStats) {
                    // Update existing stats
                    existingStats.totalPoints += player.points;
                    existingStats.totalGames += player.gamesPlayed.total;
                    existingStats.tournamentsParticipated += 1;
                    existingStats.gamesPlayedByFormat["2vs2"] += player.gamesPlayed["2vs2"];
                    existingStats.gamesPlayedByFormat["3vs3"] += player.gamesPlayed["3vs3"];
                    existingStats.gamesPlayedByFormat["4+1vs4+1"] += player.gamesPlayed["4+1vs4+1"];
                    existingStats.averagePointsPerGame = existingStats.totalGames > 0 ? existingStats.totalPoints / existingStats.totalGames : 0;
                    existingStats.averagePointsPerTournament = existingStats.totalPoints / existingStats.tournamentsParticipated;
                } else {
                    // Create new stats
                    playerStatsMap.set(player.id, {
                        playerId: player.id,
                        playerName: player.name,
                        playerNumber: player.number,
                        skillRating: player.skillRating,
                        totalPoints: player.points,
                        totalGames: player.gamesPlayed.total,
                        tournamentsParticipated: 1,
                        averagePointsPerGame: player.gamesPlayed.total > 0 ? player.points / player.gamesPlayed.total : 0,
                        averagePointsPerTournament: player.points,
                        gamesPlayedByFormat: {
                            "2vs2": player.gamesPlayed["2vs2"],
                            "3vs3": player.gamesPlayed["3vs3"],
                            "4+1vs4+1": player.gamesPlayed["4+1vs4+1"]
                        }
                    });
                }
            });
        });

        return Array.from(playerStatsMap.values());
    };

    return (
        <TournamentContext.Provider
            value={{
                currentTournament: tournament,
                tournamentHistory: history,
                addPlayer,
                removePlayer,
                togglePlayerActive,
                updatePlayerSkillRating,
                renamePlayer,
                updateFormatConfig,
                startTournament,
                endTournament,
                createNewTournament,
                resetTournament,
                renameTournament,
                generateNextRound,
                updateGameScore,
                setFairRoll,
                getPlayerOverallStats,
                getHistoricalPlayerStats,
            }}
        >
            {children}
        </TournamentContext.Provider>
    );
}

export function useTournament() {
    const context = useContext(TournamentContext);
    if (context === undefined) {
        throw new Error('useTournament must be used within a TournamentProvider');
    }
    return context;
} 
