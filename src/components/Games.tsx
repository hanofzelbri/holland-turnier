import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Player, Game } from '@/types';
import { ChevronDown, ChevronRight, Play, Users, Filter, Edit, Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function Games() {
    const { currentTournament, generateNextRound, updateGameScore } = useTournament();

    if (!currentTournament) {
        return <div>Loading...</div>;
    }

    const tournament = currentTournament;
    const [expandedRounds, setExpandedRounds] = useState<number[]>([tournament.currentRound]);
    const [gameScores, setGameScores] = useState<Record<string, { scoreA: string; scoreB: string }>>({});
    const [editingGame, setEditingGame] = useState<string | null>(null);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    const [formatFilter, setFormatFilter] = useState<string>('all');
    const [completionFilter, setCompletionFilter] = useState<string>('all');
    const [roundFilter, setRoundFilter] = useState<string>('all');
    const [playerSearchFilter, setPlayerSearchFilter] = useState<string>('');

    const filterRounds = (rounds: typeof tournament.rounds) => {
        return rounds.map(round => {
            let filteredGames = round.games;

            if (formatFilter !== 'all') {
                filteredGames = filteredGames.filter(game => game.format === formatFilter);
            }

            if (completionFilter !== 'all') {
                const isCompleted = completionFilter === 'completed';
                filteredGames = filteredGames.filter(game =>
                    isCompleted ? (game.scoreA !== null && game.scoreB !== null) : (game.scoreA === null || game.scoreB === null)
                );
            }

            if (playerSearchFilter.trim()) {
                filteredGames = filteredGames.filter(game => {
                    const searchTerm = playerSearchFilter.toLowerCase().trim();
                    const allPlayers = [...game.teamA, ...game.teamB, ...game.substitutesA, ...game.substitutesB];
                    return allPlayers.some(player =>
                        player.name.toLowerCase().includes(searchTerm) ||
                        player.number.toString().includes(searchTerm)
                    );
                });
            }

            return {
                ...round,
                games: filteredGames
            };
        }).filter(round => {
            if (roundFilter !== 'all') {
                return round.roundNumber.toString() === roundFilter;
            }
            return round.games.length > 0;
        });
    };

    if (!tournament.started) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Kein Turnier gestartet</h3>
                    <p className="text-muted-foreground">
                        Gehe zum Turnier-Tab und starte ein neues Turnier.
                    </p>
                </div>
            </div>
        );
    }

    const toggleRound = (roundNumber: number) => {
        setExpandedRounds(prev =>
            prev.includes(roundNumber)
                ? prev.filter(r => r !== roundNumber)
                : [...prev, roundNumber]
        );
    };

    const handleScoreChange = (gameId: string, field: 'scoreA' | 'scoreB', value: string) => {
        setGameScores(prev => ({
            ...prev,
            [gameId]: {
                ...prev[gameId],
                [field]: value
            }
        }));
    };

    const handleScoreSubmit = (game: Game) => {
        const scores = gameScores[game.id];
        if (scores && scores.scoreA !== '' && scores.scoreB !== '') {
            const scoreA = parseInt(scores.scoreA);
            const scoreB = parseInt(scores.scoreB);
            if (!isNaN(scoreA) && !isNaN(scoreB)) {
                updateGameScore(game.id, scoreA, scoreB);
                setGameScores(prev => {
                    const newScores = { ...prev };
                    delete newScores[game.id];
                    return newScores;
                });
                setEditingGame(null);
            }
        }
    };

    const handleEditGame = (game: Game) => {
        setEditingGame(game.id);
        setGameScores(prev => ({
            ...prev,
            [game.id]: {
                scoreA: game.scoreA?.toString() || '',
                scoreB: game.scoreB?.toString() || ''
            }
        }));
    };

    const handleCancelEdit = (gameId: string) => {
        setEditingGame(null);
        setGameScores(prev => {
            const newScores = { ...prev };
            delete newScores[gameId];
            return newScores;
        });
    };

    const getFormatName = (format: string): string => {
        switch (format) {
            case '2vs2': return '2vs2';
            case '3vs3': return '3vs3';
            case '4+1vs4+1': return '4+1vs4+1';
            default: return format;
        }
    };

    const renderPlayerList = (players: Player[], title: string) => (
        <div>
            <h5 className="font-medium text-sm mb-1">{title}</h5>
            <div className="space-y-1">
                {players.map((player) => (
                    <div key={player.id} className="flex items-center gap-2 text-sm">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium">
                            {player.number}
                        </div>
                        <span>{player.name}</span>
                    </div>
                ))}
                {players.length === 0 && (
                    <p className="text-xs text-muted-foreground">Keine Spieler</p>
                )}
            </div>
        </div>
    );

    const renderGame = (game: Game, gameIndex: number) => {
        const hasResult = game.scoreA !== null && game.scoreB !== null;
        const isEditing = editingGame === game.id;
        const currentScores = gameScores[game.id] || { scoreA: '', scoreB: '' };
        const scoreA = currentScores.scoreA || '';
        const scoreB = currentScores.scoreB || '';

        return (
            <Card key={game.id} className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                                {gameIndex + 1}
                            </div>
                            <CardTitle className="text-base sm:text-lg">
                                Feld {gameIndex + 1} - {getFormatName(game.format)}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasResult && !isEditing ? (
                                <>
                                    <div className="text-lg font-bold">
                                        {game.scoreA} : {game.scoreB}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditGame(game)}
                                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : hasResult && isEditing ? (
                                <div className="text-sm text-blue-600">
                                    Ergebnis bearbeiten
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Ergebnis ausstehend
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Score section - always on top for mobile */}
                        <div className="flex flex-col items-center justify-center space-y-3 border-b pb-4">
                            <div className="text-xl sm:text-2xl font-bold">VS</div>
                            {(!hasResult || isEditing) && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={scoreA}
                                        onChange={(e) => handleScoreChange(game.id, 'scoreA', e.target.value)}
                                        className="w-12 sm:w-16 text-center"
                                    />
                                    <span>:</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={scoreB}
                                        onChange={(e) => handleScoreChange(game.id, 'scoreB', e.target.value)}
                                        className="w-12 sm:w-16 text-center"
                                    />
                                </div>
                            )}
                            {(!hasResult || isEditing) && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        onClick={() => handleScoreSubmit(game)}
                                        disabled={!scoreA || !scoreB}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                    >
                                        {isEditing ? 'Änderung speichern' : 'Ergebnis speichern'}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCancelEdit(game.id)}
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            Abbrechen
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Teams section - responsive layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                {renderPlayerList(game.teamA, 'Team A')}
                                {game.substitutesA.length > 0 && renderPlayerList(game.substitutesA, 'Auswechselspieler A')}
                            </div>

                            <div className="space-y-3">
                                {renderPlayerList(game.teamB, 'Team B')}
                                {game.substitutesB.length > 0 && renderPlayerList(game.substitutesB, 'Auswechselspieler B')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const allCurrentRoundGamesCompleted = () => {
        const currentRound = tournament.rounds.find(r => r.roundNumber === tournament.currentRound);
        return currentRound ? currentRound.games.every(game => game.scoreA !== null && game.scoreB !== null) : false;
    };

    const filteredRounds = filterRounds(tournament.rounds);

    return (
        <div className="space-y-4 sm:space-y-6">
            {allCurrentRoundGamesCompleted() && (
                <div className="flex justify-center sm:justify-end">
                    <Button onClick={() => {
                        const currentRoundNum = tournament.currentRound;
                        generateNextRound();
                        setExpandedRounds([currentRoundNum + 1]);
                    }} className="flex items-center gap-2 w-full sm:w-auto">
                        <Play className="h-4 w-4" />
                        Nächste Runde
                    </Button>
                </div>
            )}

            <Card>
                <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-5 w-5" />
                                    Filter & Suche
                                </div>
                                {filtersExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Nach Spielernamen oder Nummer suchen..."
                                        value={playerSearchFilter}
                                        onChange={(e) => setPlayerSearchFilter(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                    <Select value={formatFilter} onValueChange={setFormatFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Spielformat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Formate</SelectItem>
                                            <SelectItem value="2vs2">2vs2</SelectItem>
                                            <SelectItem value="3vs3">3vs3</SelectItem>
                                            <SelectItem value="4+1vs4+1">4+1vs4+1</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={completionFilter} onValueChange={setCompletionFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Spielstatus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Spiele</SelectItem>
                                            <SelectItem value="completed">Abgeschlossen</SelectItem>
                                            <SelectItem value="pending">Ausstehend</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={roundFilter} onValueChange={setRoundFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Runde" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Runden</SelectItem>
                                            {tournament.rounds.map((round) => (
                                                <SelectItem key={round.roundNumber} value={round.roundNumber.toString()}>
                                                    Runde {round.roundNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <div className="space-y-4">
                {filteredRounds.slice().reverse().map((round) => (
                    <Card key={round.roundNumber}>
                        <Collapsible
                            open={expandedRounds.includes(round.roundNumber)}
                            onOpenChange={() => toggleRound(round.roundNumber)}
                        >
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {expandedRounds.includes(round.roundNumber) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                            <CardTitle>Runde {round.roundNumber}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                {round.games.length} Spiele
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {round.games.filter(g => g.scoreA !== null && g.scoreB !== null).length}/{round.games.length} beendet
                                        </div>
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    {round.games.map((game, index) => renderGame(game, index))}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}
            </div>

            {filteredRounds.length === 0 && tournament.rounds.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Keine Spiele gefunden für aktuelle Filter.</p>
                </div>
            )}
            {tournament.rounds.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Noch keine Runden generiert.</p>
                </div>
            )}
        </div>
    );
} 
