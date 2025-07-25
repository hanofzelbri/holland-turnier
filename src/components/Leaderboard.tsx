import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, TrendingUp, Star, Search, Filter, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Player } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type SortOption = 'points' | 'name' | 'number' | 'skillRating' | 'gamesPlayed';
type SortDirection = 'asc' | 'desc';

export function Leaderboard() {
    const { currentTournament, getHistoricalPlayerStats, tournamentHistory } = useTournament();
    const [searchTerm, setSearchTerm] = useState('');
    const [skillRatingFilter, setSkillRatingFilter] = useState<string>('all');
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('points');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    if (!currentTournament) {
        return <div>Loading...</div>;
    }

    const tournament = currentTournament;

    const filterAndSortPlayers = (players: Player[], defaultSort: SortOption = 'points') => {
        let filtered = players;

        if (searchTerm) {
            filtered = filtered.filter(player =>
                player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                player.number.toString().includes(searchTerm)
            );
        }

        if (skillRatingFilter !== 'all') {
            const rating = parseInt(skillRatingFilter);
            filtered = filtered.filter(player => player.skillRating === rating);
        }

        if (activityFilter !== 'all') {
            const isActive = activityFilter === 'active';
            filtered = filtered.filter(player => player.active === isActive);
        }

        const currentSortBy = sortBy === 'points' ? defaultSort : sortBy;

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (currentSortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'number':
                    comparison = a.number - b.number;
                    break;
                case 'points':
                    comparison = a.points - b.points;
                    break;
                case 'skillRating':
                    comparison = a.skillRating - b.skillRating;
                    break;
                case 'gamesPlayed':
                    comparison = a.gamesPlayed.total - b.gamesPlayed.total;
                    break;
            }

            if (currentSortBy === 'points' || currentSortBy === 'gamesPlayed') {
                return sortDirection === 'desc' ? -comparison : comparison;
            } else {
                return sortDirection === 'asc' ? comparison : -comparison;
            }
        });

        return filtered;
    };

    const sortedPlayersByPoints = filterAndSortPlayers([...tournament.players], 'points');
    const historicalStats = getHistoricalPlayerStats();
    const sortedPlayersByGames = filterAndSortPlayers(historicalStats.map(stat => ({
        id: stat.playerId,
        name: stat.playerName,
        number: stat.playerNumber,
        points: stat.totalPoints,
        active: tournament.players.find(p => p.id === stat.playerId)?.active ?? false,
        skillRating: stat.skillRating,
        gamesPlayed: {
            "2vs2": stat.gamesPlayedByFormat["2vs2"],
            "3vs3": stat.gamesPlayedByFormat["3vs3"],
            "4+1vs4+1": stat.gamesPlayedByFormat["4+1vs4+1"],
            total: stat.totalGames
        }
    } as Player)), 'points');

    const getPlayerRank = (playerIndex: number, players: Player[]) => {
        if (playerIndex === 0) return 1;

        let rank = 1;
        for (let i = 0; i < playerIndex; i++) {
            if (players[i].points !== players[playerIndex].points) {
                rank = i + 2;
                break;
            }
        }
        return rank;
    };

    const getPlayerRankByGames = (playerIndex: number, players: Player[]) => {
        if (playerIndex === 0) return 1;

        let rank = 1;
        for (let i = 0; i < playerIndex; i++) {
            if (players[i].gamesPlayed.total !== players[playerIndex].gamesPlayed.total) {
                rank = i + 2;
                break;
            }
        }
        return rank;
    };

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

    const renderSkillRating = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-3 w-3 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const PlayerRankingCard = ({ player, rank }: { player: Player; rank: number }) => (
        <div className={`p-4 rounded-lg border ${getRankStyle(rank)}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getRankIcon(rank)}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                            {rank}
                        </div>
                        <div>
                            <h4 className="font-medium">{player.name} #{player.number}</h4>
                            <p className="text-sm text-muted-foreground">
                                {player.active ? 'Aktiv' : 'Inaktiv'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Fähigkeit:</span>
                                {renderSkillRating(player.skillRating)}
                            </div>
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
                        #{player.number}
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
                    <p className="text-muted-foreground">Fähigkeitswert</p>
                    <div className="flex items-center gap-1">
                        {renderSkillRating(player.skillRating)}
                        <span className="text-xs">({player.skillRating}/5)</span>
                    </div>
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
                    <p className="text-muted-foreground">Aktiv</p>
                    <p className="font-medium">{player.active ? 'Ja' : 'Nein'}</p>
                </div>
            </div>
        </div>
    );



    return (
        <div className="space-y-6">
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
                            <CardDescription>
                                Verschiedene Ansichten der Spielerleistungen
                            </CardDescription>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Name oder Nummer suchen..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                                    <Select value={skillRatingFilter} onValueChange={setSkillRatingFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Fähigkeitsstufe" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Fähigkeitsstufen</SelectItem>
                                            <SelectItem value="1">⭐ (1 Stern)</SelectItem>
                                            <SelectItem value="2">⭐⭐ (2 Sterne)</SelectItem>
                                            <SelectItem value="3">⭐⭐⭐ (3 Sterne)</SelectItem>
                                            <SelectItem value="4">⭐⭐⭐⭐ (4 Sterne)</SelectItem>
                                            <SelectItem value="5">⭐⭐⭐⭐⭐ (5 Sterne)</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Aktivitätsstatus" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Spieler</SelectItem>
                                            <SelectItem value="active">Nur aktive</SelectItem>
                                            <SelectItem value="inactive">Nur inaktive</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sortieren nach" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="points">Punkte</SelectItem>
                                            <SelectItem value="gamesPlayed">Anzahl Spiele</SelectItem>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="number">Trikotnummer</SelectItem>
                                            <SelectItem value="skillRating">Fähigkeitsstufe</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowUpDown className="h-4 w-4" />
                                        <span className="hidden sm:inline">{sortDirection === 'asc' ? 'Aufsteigend' : 'Absteigend'}</span>
                                        <span className="sm:hidden">{sortDirection === 'asc' ? 'A-Z' : 'Z-A'}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <Tabs defaultValue="tournament" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1">
                    <TabsTrigger value="tournament" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs sm:text-sm">
                        <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-center leading-tight">Aktuelles<br className="sm:hidden" /> Turnier</span>
                    </TabsTrigger>
                    <TabsTrigger value="overall" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs sm:text-sm">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-center leading-tight">Gesamt-<br className="sm:hidden" />statistik</span>
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs sm:text-sm">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-center leading-tight">Detaillierte<br className="sm:hidden" /> Stats</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs sm:text-sm">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-center leading-tight">Turnier-<br className="sm:hidden" />historie</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tournament" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Turnier Rangliste</CardTitle>
                            <CardDescription>
                                {tournament.started
                                    ? `${tournament.name} - Erstellt am ${new Date(tournament.createdAt).toLocaleDateString('de-DE')} (nur aktive Spieler)`
                                    : 'Noch kein Turnier gestartet - Rangliste wird verfügbar sobald ein Turnier läuft'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tournament.started ? (
                                <div className="space-y-3">
                                    {sortedPlayersByPoints.filter(player => player.active).map((player, index) => (
                                        <PlayerRankingCard
                                            key={player.id}
                                            player={player}
                                            rank={getPlayerRank(index, sortedPlayersByPoints.filter(p => p.active))}
                                        />
                                    ))}
                                    {sortedPlayersByPoints.filter(player => player.active).length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            Keine aktiven Spieler vorhanden
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <h3 className="text-lg font-medium mb-2">Kein Turnier gestartet</h3>
                                        <p className="text-muted-foreground">
                                            Gehe zum Turnier-Tab und starte ein neues Turnier, um die Rangliste zu sehen.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overall" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gesamtstatistik Rangliste</CardTitle>
                            <CardDescription>
                                Alle Spieler sortiert nach Gesamtpunkten (zur besseren Vergleichbarkeit aller Teilnehmer)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sortedPlayersByPoints.map((player, index) => (
                                    <div key={player.id} className={`p-4 rounded-lg border ${getRankStyle(getPlayerRank(index, sortedPlayersByPoints))}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getRankIcon(getPlayerRank(index, sortedPlayersByPoints))}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                                                        {getPlayerRank(index, sortedPlayersByPoints)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{player.name} #{player.number}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {player.gamesPlayed.total} Spiele gespielt • {player.active ? 'Aktiv' : 'Inaktiv'}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">Fähigkeit:</span>
                                                            {renderSkillRating(player.skillRating)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">{player.points}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {player.gamesPlayed.total > 0
                                                        ? `Ø ${(player.points / player.gamesPlayed.total).toFixed(1)} Punkte/Spiel`
                                                        : 'Keine Spiele'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {sortedPlayersByPoints.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8">
                                        Keine Spieler vorhanden
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Detaillierte Spielstatistiken
                            </CardTitle>
                            <CardDescription>
                                Umfassende Statistiken für alle Spieler nach Spielformaten
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {historicalStats.map((stat) => (
                                    <div key={stat.playerId} className="p-4 border rounded-lg bg-card">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                                                    #{stat.playerNumber}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium">{stat.playerName}</h4>
                                                    <p className="text-sm text-muted-foreground">{stat.totalPoints} Punkte</p>
                                                </div>
                                            </div>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Gesamt Spiele</p>
                                                <p className="font-medium">{stat.totalGames}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Turniere</p>
                                                <p className="font-medium">{stat.tournamentsParticipated}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Ø Punkte/Spiel</p>
                                                <p className="font-medium">{stat.averagePointsPerGame.toFixed(1)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Ø Punkte/Turnier</p>
                                                <p className="font-medium">{stat.averagePointsPerTournament.toFixed(1)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">2vs2 Spiele</p>
                                                <p className="font-medium">{stat.gamesPlayedByFormat["2vs2"]}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">3vs3 Spiele</p>
                                                <p className="font-medium">{stat.gamesPlayedByFormat["3vs3"]}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-muted-foreground">4+1vs4+1 Spiele</p>
                                                <p className="font-medium">{stat.gamesPlayedByFormat["4+1vs4+1"]}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {historicalStats.length === 0 && (
                                    <p className="text-center text-muted-foreground py-8 col-span-full">
                                        Keine Statistiken verfügbar
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-yellow-600 text-sm">
                                    <Trophy className="h-4 w-4" />
                                    Punkteführer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {sortedPlayersByPoints[0] ? (
                                    <div>
                                        <p className="font-medium text-sm">{sortedPlayersByPoints[0].name}</p>
                                        <p className="text-lg font-bold text-yellow-600">{sortedPlayersByPoints[0].points} Punkte</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {renderSkillRating(sortedPlayersByPoints[0].skillRating)}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-xs">Noch kein Punkteführer</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-blue-600 text-sm">
                                    <TrendingUp className="h-4 w-4" />
                                    Meiste Spiele
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {historicalStats.length > 0 ? (
                                    (() => {
                                        const mostGamesPlayer = historicalStats.reduce((prev, current) =>
                                            current.totalGames > prev.totalGames ? current : prev
                                        );
                                        return (
                                            <div>
                                                <p className="font-medium text-sm">{mostGamesPlayer.playerName}</p>
                                                <p className="text-lg font-bold text-blue-600">{mostGamesPlayer.totalGames} Spiele</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {renderSkillRating(mostGamesPlayer.skillRating)}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-muted-foreground text-xs">Noch keine Spiele</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="sm:col-span-2 xl:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-green-600 text-sm">
                                    <Star className="h-4 w-4" />
                                    Höchste Fähigkeit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {tournament.players.length > 0 ? (
                                    (() => {
                                        const highestSkillPlayer = tournament.players.reduce((prev, current) =>
                                            current.skillRating > prev.skillRating ? current : prev
                                        );
                                        return (
                                            <div>
                                                <p className="font-medium text-sm">{highestSkillPlayer.name}</p>
                                                <p className="text-lg font-bold text-green-600">Fähigkeit {highestSkillPlayer.skillRating}/5</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {renderSkillRating(highestSkillPlayer.skillRating)}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <p className="text-muted-foreground text-xs">Keine Spieler</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Turnierhistorie
                            </CardTitle>
                            <CardDescription>
                                Vergangene Turniere und deren Ergebnisse
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tournamentHistory.tournaments.length > 0 ? (
                                <div className="space-y-4">
                                    {tournamentHistory.tournaments
                                        .slice()
                                        .reverse()
                                        .map((pastTournament) => (
                                            <Card key={pastTournament.id} className="border-l-4 border-l-primary">
                                                <CardHeader>
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div>
                                                            <CardTitle className="text-lg">{pastTournament.name}</CardTitle>
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(pastTournament.createdAt).toLocaleDateString('de-DE')} - {pastTournament.endedAt ? new Date(pastTournament.endedAt).toLocaleDateString('de-DE') : 'Laufend'}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {pastTournament.rounds.length} Runde(n) • {pastTournament.players.filter(p => p.active).length} Spieler
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <h4 className="font-medium">Top 3 Spieler:</h4>
                                                        {pastTournament.players
                                                            .filter(p => p.active)
                                                            .sort((a, b) => b.points - a.points)
                                                            .slice(0, 3)
                                                            .map((player, index) => (
                                                                <div key={player.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium">
                                                                            {index + 1}
                                                                        </div>
                                                                        <span className="font-medium">{player.name} #{player.number}</span>
                                                                    </div>
                                                                    <div className="text-sm font-medium">
                                                                        {player.points} Punkte
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Noch keine abgeschlossenen Turniere vorhanden.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 
