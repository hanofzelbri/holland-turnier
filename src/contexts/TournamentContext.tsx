import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Tournament, Player, GameFormat, FormatConfig, Game, Round } from '@/types';

interface TournamentContextType {
    tournament: Tournament;
    addPlayer: (name: string, number: number) => void;
    removePlayer: (id: string) => void;
    togglePlayerActive: (id: string) => void;
    updateFormatConfig: (format: GameFormat, gamesCount: number) => void;
    startTournament: () => void;
    resetTournament: () => void;
    generateNextRound: () => void;
    updateGameScore: (gameId: string, scoreA: number, scoreB: number) => void;
    setFairRoll: (fairRoll: boolean) => void;
}

type TournamentAction =
    | { type: 'ADD_PLAYER'; payload: { name: string; number: number } }
    | { type: 'REMOVE_PLAYER'; payload: string }
    | { type: 'TOGGLE_PLAYER_ACTIVE'; payload: string }
    | { type: 'UPDATE_FORMAT_CONFIG'; payload: { format: GameFormat; gamesCount: number } }
    | { type: 'START_TOURNAMENT' }
    | { type: 'RESET_TOURNAMENT' }
    | { type: 'GENERATE_NEXT_ROUND' }
    | { type: 'UPDATE_GAME_SCORE'; payload: { gameId: string; scoreA: number; scoreB: number } }
    | { type: 'SET_FAIR_ROLL'; payload: boolean }
    | { type: 'LOAD_TOURNAMENT'; payload: Tournament };

const defaultPlayers: Player[] = [
    { id: '1', name: 'Alex', number: 1, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '2', name: 'Ben', number: 2, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '3', name: 'Charlie', number: 3, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '4', name: 'David', number: 4, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '5', name: 'Emil', number: 5, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '6', name: 'Felix', number: 6, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '7', name: 'Georg', number: 7, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '8', name: 'Hans', number: 8, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '9', name: 'Ivan', number: 9, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '10', name: 'Jakob', number: 10, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '11', name: 'Klaus', number: 11, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '12', name: 'Leon', number: 12, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
    { id: '13', name: 'Max', number: 13, points: 0, active: true, gamesPlayed: { '2vs2': 0, '3vs3': 0, '4+1vs4+1': 0, total: 0 } },
];

const defaultFormatConfigs: FormatConfig[] = [
    { format: '2vs2', gamesCount: 2, playersPerTeam: 2 },
    { format: '3vs3', gamesCount: 2, playersPerTeam: 3 },
    { format: '4+1vs4+1', gamesCount: 1, playersPerTeam: 5 },
];

const initialTournament: Tournament = {
    gamesPerRound: 5,
    rounds: [],
    currentRound: 0,
    players: defaultPlayers,
    started: false,
    formatConfigs: defaultFormatConfigs,
    fairRoll: true,
};

function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
        const groupedByPoints = activePlayers.reduce((groups, player) => {
            const points = player.points;
            if (!groups[points]) groups[points] = [];
            groups[points].push(player);
            return groups;
        }, {} as Record<number, Player[]>);

        const sortedGroups = Object.entries(groupedByPoints)
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
    const updatedPlayers = tournament.players.map(player => ({ ...player, points: 0 }));

    tournament.rounds.forEach(round => {
        round.games.forEach(game => {
            if (game.scoreA !== null && game.scoreB !== null) {
                const allPlayersA = [...game.teamA, ...game.substitutesA];
                const allPlayersB = [...game.teamB, ...game.substitutesB];

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

            state.formatConfigs.forEach(config => {
                if (config.gamesCount > 0) {
                    const games = createFairTeams(state.players, config.playersPerTeam, config.gamesCount, config.format, state.fairRoll);
                    games.forEach(game => {
                        game.round = roundNumber;
                        allGames.push(game);
                    });
                }
            });

            const round: Round = {
                roundNumber,
                games: allGames,
                completed: false,
            };

            const updatedPlayers = state.players.map(player => {
                const newGamesPlayed = { ...player.gamesPlayed };
                allGames.forEach(game => {
                    const isInGame =
                        game.teamA.some(p => p.id === player.id) ||
                        game.teamB.some(p => p.id === player.id) ||
                        game.substitutesA.some(p => p.id === player.id) ||
                        game.substitutesB.some(p => p.id === player.id);

                    if (isInGame) {
                        newGamesPlayed[game.format]++;
                        newGamesPlayed.total++;
                    }
                });

                return { ...player, gamesPlayed: newGamesPlayed };
            });

            return {
                ...state,
                started: true,
                rounds: [round],
                currentRound: 1,
                players: updatedPlayers,
            };
        }

        case 'GENERATE_NEXT_ROUND': {
            const allGames: Game[] = [];
            const nextRoundNumber = state.rounds.length + 1;

            state.formatConfigs.forEach(config => {
                if (config.gamesCount > 0) {
                    const games = createFairTeams(state.players, config.playersPerTeam, config.gamesCount, config.format, state.fairRoll);
                    games.forEach(game => {
                        game.round = nextRoundNumber;
                        allGames.push(game);
                    });
                }
            });

            const newRound: Round = {
                roundNumber: nextRoundNumber,
                games: allGames,
                completed: false,
            };

            const updatedPlayers = state.players.map(player => {
                const newGamesPlayed = { ...player.gamesPlayed };
                allGames.forEach(game => {
                    const isInGame =
                        game.teamA.some(p => p.id === player.id) ||
                        game.teamB.some(p => p.id === player.id) ||
                        game.substitutesA.some(p => p.id === player.id) ||
                        game.substitutesB.some(p => p.id === player.id);

                    if (isInGame) {
                        newGamesPlayed[game.format]++;
                        newGamesPlayed.total++;
                    }
                });

                return { ...player, gamesPlayed: newGamesPlayed };
            });

            return {
                ...state,
                rounds: [...state.rounds, newRound],
                currentRound: nextRoundNumber,
                players: updatedPlayers,
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

        default:
            return state;
    }
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
    const [tournament, dispatch] = useReducer(tournamentReducer, initialTournament);

    useEffect(() => {
        const saved = localStorage.getItem('holland-turnier');
        if (saved) {
            try {
                const parsedTournament = JSON.parse(saved);
                dispatch({ type: 'LOAD_TOURNAMENT', payload: parsedTournament });
            } catch (error) {
                console.error('Failed to load tournament from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('holland-turnier', JSON.stringify(tournament));
    }, [tournament]);

    const addPlayer = (name: string, number: number) => {
        dispatch({ type: 'ADD_PLAYER', payload: { name, number } });
    };

    const removePlayer = (id: string) => {
        dispatch({ type: 'REMOVE_PLAYER', payload: id });
    };

    const togglePlayerActive = (id: string) => {
        dispatch({ type: 'TOGGLE_PLAYER_ACTIVE', payload: id });
    };

    const updateFormatConfig = (format: GameFormat, gamesCount: number) => {
        dispatch({ type: 'UPDATE_FORMAT_CONFIG', payload: { format, gamesCount } });
    };

    const startTournament = () => {
        dispatch({ type: 'START_TOURNAMENT' });
    };

    const resetTournament = () => {
        dispatch({ type: 'RESET_TOURNAMENT' });
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

    return (
        <TournamentContext.Provider
            value={{
                tournament,
                addPlayer,
                removePlayer,
                togglePlayerActive,
                updateFormatConfig,
                startTournament,
                resetTournament,
                generateNextRound,
                updateGameScore,
                setFairRoll,
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
