import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Player, Game } from '@/types';
import { ChevronDown, ChevronRight, Play, Users } from 'lucide-react';

export function Games() {
    const { tournament, generateNextRound, updateGameScore } = useTournament();
    const [expandedRounds, setExpandedRounds] = useState<number[]>([tournament.currentRound]);
    const [gameScores, setGameScores] = useState<Record<string, { scoreA: string; scoreB: string }>>({});

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
            }
        }
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

    const renderGame = (game: Game) => {
        const hasResult = game.scoreA !== null && game.scoreB !== null;
        const currentScores = gameScores[game.id] || { scoreA: '', scoreB: '' };

        return (
            <Card key={game.id} className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            {getFormatName(game.format)} Spiel
                        </CardTitle>
                        {hasResult ? (
                            <div className="text-lg font-bold">
                                {game.scoreA} : {game.scoreB}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Ergebnis ausstehend
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-3">
                            {renderPlayerList(game.teamA, 'Team A')}
                            {game.substitutesA.length > 0 && renderPlayerList(game.substitutesA, 'Auswechselspieler A')}
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="text-2xl font-bold">VS</div>
                            {!hasResult && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={currentScores.scoreA}
                                        onChange={(e) => handleScoreChange(game.id, 'scoreA', e.target.value)}
                                        className="w-16 text-center"
                                    />
                                    <span>:</span>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        min="0"
                                        value={currentScores.scoreB}
                                        onChange={(e) => handleScoreChange(game.id, 'scoreB', e.target.value)}
                                        className="w-16 text-center"
                                    />
                                </div>
                            )}
                            {!hasResult && (
                                <Button
                                    onClick={() => handleScoreSubmit(game)}
                                    disabled={!currentScores.scoreA || !currentScores.scoreB}
                                    size="sm"
                                >
                                    Ergebnis speichern
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {renderPlayerList(game.teamB, 'Team B')}
                            {game.substitutesB.length > 0 && renderPlayerList(game.substitutesB, 'Auswechselspieler B')}
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Spiele</h2>
                    <p className="text-muted-foreground">
                        Verwalte Spielpaarungen und trage Ergebnisse ein
                    </p>
                </div>
                {allCurrentRoundGamesCompleted() && (
                    <Button onClick={generateNextRound} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Nächste Runde
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {tournament.rounds.map((round) => (
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
                                    {round.games.map(renderGame)}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                ))}
            </div>

            {tournament.rounds.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Noch keine Runden generiert.</p>
                </div>
            )}
        </div>
    );
} 
