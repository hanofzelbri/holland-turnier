import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { GameFormat } from '@/types';
import { Play, RotateCcw, Settings, AlertTriangle } from 'lucide-react';

export function Tournament() {
    const {
        tournament,
        updateFormatConfig,
        startTournament,
        resetTournament,
        setFairRoll
    } = useTournament();

    const activePlayers = tournament.players.filter(p => p.active);

    const getMinPlayersForFormat = (format: GameFormat): number => {
        const config = tournament.formatConfigs.find(c => c.format === format);
        return config ? config.playersPerTeam * 2 * config.gamesCount : 0;
    };

    const getTotalMinPlayers = (): number => {
        return Math.max(...tournament.formatConfigs
            .filter(config => config.gamesCount > 0)
            .map(config => config.playersPerTeam * 2 * config.gamesCount)
        );
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
                            <div>
                                <h4 className="font-medium">Fair Roll aktivieren</h4>
                                <p className="text-sm text-muted-foreground">
                                    Intelligente Teamverteilung basierend auf Punktestand
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
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={config.gamesCount}
                                            onChange={(e) => updateFormatConfig(config.format, parseInt(e.target.value) || 0)}
                                            className="w-16 text-center"
                                            disabled={tournament.started}
                                        />
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
                            <div className="flex gap-2">
                                {tournament.started ? (
                                    <Button
                                        variant="destructive"
                                        onClick={resetTournament}
                                        className="flex items-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Turnier zurücksetzen
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={startTournament}
                                        disabled={!canStartTournament()}
                                        className="flex items-center gap-2"
                                    >
                                        <Play className="h-4 w-4" />
                                        Turnier starten
                                    </Button>
                                )}
                            </div>
                        </div>

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
                                                <li>• Nicht genügend aktive Spieler</li>
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
                                            Turnier läuft
                                        </h5>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Runde {tournament.currentRound} • {tournament.rounds.length} Runde(n) gespielt
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 
