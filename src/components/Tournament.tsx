import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { GameFormat } from '@/types';
import { Play, RotateCcw, Settings, AlertTriangle, Trophy, Plus, Minus, Edit2, Check, X } from 'lucide-react';

interface TournamentProps {
    onNavigateToGames?: () => void;
}

export function Tournament({ onNavigateToGames }: TournamentProps) {
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [tournamentName, setTournamentName] = useState('');

    const {
        currentTournament,
        updateFormatConfig,
        startTournament,
        endTournament,
        resetTournament,
        renameTournament,
        setFairRoll
    } = useTournament();

    if (!currentTournament) {
        return <div>Loading...</div>;
    }

    const tournament = currentTournament;
    const activePlayers = tournament.players.filter(p => p.active);

    const handleEditName = () => {
        setTournamentName(tournament.name);
        setEditingName(true);
    };

    const handleSaveName = () => {
        if (tournamentName.trim()) {
            renameTournament(tournamentName.trim());
        }
        setEditingName(false);
    };

    const handleCancelEdit = () => {
        setEditingName(false);
        setTournamentName('');
    };

    const getMinPlayersForFormat = (format: GameFormat): number => {
        const config = tournament.formatConfigs.find(c => c.format === format);
        return config ? config.playersPerTeam * 2 * config.gamesCount : 0;
    };

    const getTotalMinPlayers = (): number => {
        const activeConfigs = tournament.formatConfigs.filter(config => config.gamesCount > 0);
        if (activeConfigs.length === 0) {
            return 0;
        }
        return Math.max(...activeConfigs.map(config => config.playersPerTeam * 2 * config.gamesCount));
    };

    const canStartTournament = (): boolean => {
        const totalMinPlayers = getTotalMinPlayers();
        return activePlayers.length >= totalMinPlayers &&
            tournament.formatConfigs.some(config => config.gamesCount > 0);
    };

    const getFormatName = (format: GameFormat): string => {
        switch (format) {
            case '2vs2': return '2 gegen 2';
            case '3vs3': return '3 gegen 3';
            case '4+1vs4+1': return '4+1 gegen 4+1';
        }
    };

    const hasGamesInProgress = () => {
        return tournament.rounds.some(round =>
            round.games.some(game => game.scoreA !== null || game.scoreB !== null)
        );
    };

    const hasAnyCompletedRounds = () => {
        return tournament.rounds.some(round =>
            round.games.length > 0 && round.games.every(game => game.scoreA !== null && game.scoreB !== null)
        );
    };

    const handleResetTournament = () => {
        resetTournament();
        setResetDialogOpen(false);
    };

    const handleEndTournament = () => {
        endTournament();
        setEndDialogOpen(false);
    };

    const adjustFormatCount = (format: GameFormat, delta: number) => {
        const config = tournament.formatConfigs.find(c => c.format === format);
        if (config) {
            const newCount = Math.max(0, Math.min(10, config.gamesCount + delta));
            updateFormatConfig(format, newCount);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Turnier-Einstellungen
                    </CardTitle>
                    <CardDescription>
                        Konfiguriere die Spielformate und starte das Turnier
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h4 className="font-medium mb-2">Turniername</h4>
                                {editingName ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={tournamentName}
                                            onChange={(e) => setTournamentName(e.target.value)}
                                            placeholder="Turniername eingeben..."
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveName();
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleSaveName}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-medium">{tournament.name}</span>
                                        <Button size="sm" variant="ghost" onClick={handleEditName}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">Fair Roll aktivieren</h4>
                                <p className="text-sm text-muted-foreground">
                                    Intelligente Teamverteilung: Gruppiert Spieler nach kombinierter Bewertung (Punkte + Fähigkeitswert×2) und verteilt sie gleichmäßig auf Teams für ausgeglichene Spiele. Deaktiviert = zufällige Aufteilung.
                                </p>
                            </div>
                            <Switch
                                checked={tournament.fairRoll}
                                onCheckedChange={setFairRoll}
                                disabled={tournament.started}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Spielformate</h4>
                        {tournament.formatConfigs.map((config) => (
                            <div key={config.format} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="font-medium">
                                        {getFormatName(config.format)}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Spiele:</span>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => adjustFormatCount(config.format, -1)}
                                                disabled={tournament.started || config.gamesCount <= 0}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={config.gamesCount}
                                                onChange={(e) => updateFormatConfig(config.format, parseInt(e.target.value) || 0)}
                                                className="w-16 text-center"
                                                disabled={tournament.started}
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => adjustFormatCount(config.format, 1)}
                                                disabled={tournament.started || config.gamesCount >= 10}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{config.playersPerTeam} Spieler pro Team</span>
                                    <span>
                                        Min. {getMinPlayersForFormat(config.format)} Spieler
                                        {config.gamesCount > 0 && activePlayers.length < getMinPlayersForFormat(config.format) && (
                                            <span className="text-red-500 ml-1">
                                                (fehlen {getMinPlayersForFormat(config.format) - activePlayers.length})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-medium">Aktive Spieler: {activePlayers.length}</p>
                                <p className="text-sm text-muted-foreground">
                                    Mindestens {getTotalMinPlayers()} Spieler benötigt
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => startTournament(onNavigateToGames)}
                                disabled={!canStartTournament() || tournament.started}
                                className="flex-1"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Turnier starten
                            </Button>

                            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!tournament.started || hasAnyCompletedRounds()}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reset
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Turnier zurücksetzen</DialogTitle>
                                        <DialogDescription>
                                            {hasAnyCompletedRounds()
                                                ? "Das Turnier kann nicht zurückgesetzt werden, da bereits Runden abgeschlossen wurden. Ein Reset ist nur möglich, wenn noch keine Runde vollständig gespielt wurde."
                                                : "Möchten Sie das aktuelle Turnier wirklich zurücksetzen? Alle Spiele und Ergebnisse gehen verloren."
                                            }
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Abbrechen</Button>
                                        <Button onClick={handleResetTournament} disabled={hasAnyCompletedRounds()}>Zurücksetzen</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {tournament.started && hasGamesInProgress() && (
                            <div className="mt-4">
                                <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="w-full">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Turnier beenden
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Turnier beenden</DialogTitle>
                                            <DialogDescription>
                                                Möchten Sie das aktuelle Turnier beenden? Es wird in der Historie gespeichert und Sie können ein neues Turnier starten.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setEndDialogOpen(false)}>Abbrechen</Button>
                                            <Button onClick={handleEndTournament}>Turnier beenden</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {!canStartTournament() && !tournament.started && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                            <h5 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                                Turnier kann nicht gestartet werden
                            </h5>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                {activePlayers.length < getTotalMinPlayers() && (
                                    <li>• Nicht genügend aktive Spieler ({activePlayers.length} von {getTotalMinPlayers()} benötigt)</li>
                                )}
                                {!tournament.formatConfigs.some(config => config.gamesCount > 0) && (
                                    <li>• Mindestens ein Spielformat muss konfiguriert sein</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {tournament.started && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-green-600" />
                        <div>
                            <h5 className="font-medium text-green-800 dark:text-green-200">
                                Turnier läuft - {tournament.name}
                            </h5>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Runde {tournament.currentRound} • {tournament.rounds.length} Runde(n) gespielt • Erstellt: {new Date(tournament.createdAt).toLocaleDateString('de-DE')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 
