import { useTournament } from '@/contexts/TournamentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Player } from '@/types';

export function Leaderboard() {
    const { tournament } = useTournament();

    const sortedPlayers = [...tournament.players].sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return a.name.localeCompare(b.name);
    });

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">{rank}</span>;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800";
            case 2:
                return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800";
            case 3:
                return "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800";
            default:
                return "bg-card border-border";
        }
    };

    const PlayerRankingCard = ({ player, rank }: { player: Player; rank: number }) => (
        <div className={`p-4 rounded-lg border ${getRankStyle(rank)}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getRankIcon(rank)}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                            {player.number}
                        </div>
                        <div>
                            <h4 className="font-medium">{player.name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {player.active ? 'Aktiv' : 'Inaktiv'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{player.points}</div>
                    <div className="text-sm text-muted-foreground">Punkte</div>
                </div>
            </div>
        </div>
    );

    const StatisticsCard = ({ player }: { player: Player }) => (
        <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                        {player.number}
                    </div>
                    <div>
                        <h4 className="font-medium">{player.name}</h4>
                        <p className="text-sm text-muted-foreground">{player.points} Punkte</p>
                    </div>
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Gesamt Spiele</p>
                    <p className="font-medium">{player.gamesPlayed.total}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Aktiv</p>
                    <p className="font-medium">{player.active ? 'Ja' : 'Nein'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">2vs2 Spiele</p>
                    <p className="font-medium">{player.gamesPlayed['2vs2']}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">3vs3 Spiele</p>
                    <p className="font-medium">{player.gamesPlayed['3vs3']}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">4+1vs4+1 Spiele</p>
                    <p className="font-medium">{player.gamesPlayed['4+1vs4+1']}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Ø Punkte/Spiel</p>
                    <p className="font-medium">
                        {player.gamesPlayed.total > 0
                            ? (player.points / player.gamesPlayed.total).toFixed(1)
                            : '0.0'
                        }
                    </p>
                </div>
            </div>
        </div>
    );

    if (!tournament.started) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">Kein Turnier gestartet</h3>
                    <p className="text-muted-foreground">
                        Starte ein Turnier, um die Rangliste zu sehen.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Rangliste & Statistiken</h2>
                <p className="text-muted-foreground">
                    Aktuelle Punktestände und Spielstatistiken
                </p>
            </div>

            <Tabs defaultValue="ranking" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ranking" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Punkte-Rangliste
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Spielstatistiken
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ranking" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Aktuelle Rangliste</CardTitle>
                            <CardDescription>
                                Sortiert nach Punkten, bei Gleichstand alphabetisch
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sortedPlayers.map((player, index) => (
                                    <PlayerRankingCard
                                        key={player.id}
                                        player={player}
                                        rank={index + 1}
                                    />
                                ))}
                                {sortedPlayers.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        Keine Spieler vorhanden
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600">
                                    <Trophy className="h-5 w-5" />
                                    1. Platz
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sortedPlayers[0] ? (
                                    <div>
                                        <p className="font-medium">{sortedPlayers[0].name}</p>
                                        <p className="text-2xl font-bold text-yellow-600">{sortedPlayers[0].points} Punkte</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Noch kein Sieger</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gray-600">
                                    <Medal className="h-5 w-5" />
                                    2. Platz
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sortedPlayers[1] ? (
                                    <div>
                                        <p className="font-medium">{sortedPlayers[1].name}</p>
                                        <p className="text-2xl font-bold text-gray-600">{sortedPlayers[1].points} Punkte</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Noch kein Zweitplatzierter</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-600">
                                    <Award className="h-5 w-5" />
                                    3. Platz
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {sortedPlayers[2] ? (
                                    <div>
                                        <p className="font-medium">{sortedPlayers[2].name}</p>
                                        <p className="text-2xl font-bold text-amber-600">{sortedPlayers[2].points} Punkte</p>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Noch kein Drittplatzierter</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detaillierte Spielstatistiken</CardTitle>
                            <CardDescription>
                                Übersicht über Spiele pro Format und Gesamtleistung
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sortedPlayers.map((player) => (
                                    <StatisticsCard key={player.id} player={player} />
                                ))}
                                {sortedPlayers.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8 col-span-full">
                                        Keine Statistiken verfügbar
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
