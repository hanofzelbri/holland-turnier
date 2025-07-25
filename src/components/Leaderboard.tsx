import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, TrendingUp, Star, Search, Filter, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Player, Tournament } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type SortOption = 'points' | 'name' | 'number' | 'skillRating' | 'gamesPlayed';
type SortDirection = 'asc' | 'desc';

function TournamentHistorySection() {
    const { tournamentHistory } = useTournament();
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

    const tournaments = tournamentHistory.tournaments.slice().reverse();

    if (tournaments.length === 0) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Keine Turniere gefunden</h3>
                        <p className="text-muted-foreground">
                            Beende dein erstes Turnier, um die Historie zu sehen.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!selectedTournament) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Turnierhistorie
                    </CardTitle>
                    <CardDescription>
                        Wähle ein abgeschlossenes Turnier aus, um detaillierte Ergebnisse zu sehen
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {tournaments.map((tournament) => (
                            <div
                                key={tournament.id}
                                className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => setSelectedTournament(tournament)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">{tournament.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(tournament.createdAt).toLocaleDateString('de-DE')}
                                            {tournament.endedAt && (
                                                <> - {new Date(tournament.endedAt).toLocaleDateString('de-DE')}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right text-sm text-muted-foreground">
                                            <p>{tournament.rounds.length} Runden</p>
                                            <p>{tournament.players.length} Spieler</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const sortedPlayers = selectedTournament.players
        .slice()
        .sort((a, b) => b.points - a.points);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTournament(null)}
                        >
                            ← Zurück zur Historie
                        </Button>
                    </div>
                    <CardTitle>{selectedTournament.name}</CardTitle>
                    <CardDescription>
                        {new Date(selectedTournament.createdAt).toLocaleDateString('de-DE')} -
                        {selectedTournament.endedAt && new Date(selectedTournament.endedAt).toLocaleDateString('de-DE')} •
                        {selectedTournament.rounds.length} Runden • {selectedTournament.players.length} Spieler
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedPlayers.map((player, index) => (
                    <div key={player.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium">
                                    #{index + 1}
                                </div>
                                <div>
                                    <h4 className="font-medium">{player.name}</h4>
                                    <p className="text-sm text-muted-foreground">#{player.number}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-primary">{player.points}</div>
                                <div className="text-xs text-muted-foreground">Punkte</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Gesamt Spiele</p>
                                <p className="font-medium">{player.gamesPlayed.total}</p>
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
                            <div>
                                <p className="text-muted-foreground">2vs2 Spiele</p>
                                <p className="font-medium">{player.gamesPlayed['2vs2']}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">3vs3 Spiele</p>
                                <p className="font-medium">{player.gamesPlayed['3vs3']}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function Leaderboard() {
    const { currentTournament, getHistoricalPlayerStats } = useTournament();
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

    const getFilterSummary = () => {
        const filters = [];
        if (searchTerm) filters.push(`Suche: "${searchTerm}"`);
        if (skillRatingFilter !== 'all') {
            const stars = '⭐'.repeat(parseInt(skillRatingFilter));
            filters.push(`Fähigkeit: ${stars}`);
        }
        if (activityFilter !== 'all') {
            filters.push(`Status: ${activityFilter === 'active' ? 'Aktiv' : 'Inaktiv'}`);
        }
        return filters;
    };

    const getSortLabel = () => {
        const labels = {
            points: 'Punkte',
            name: 'Name',
            number: 'Trikotnummer',
            skillRating: 'Fähigkeitsstufe',
            gamesPlayed: 'Anzahl Spiele'
        };
        return `${labels[sortBy]} (${sortDirection === 'asc' ? 'aufsteigend' : 'absteigend'})`;
    };

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

    const renderSkillRating = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
            />
        ));
    };

    const getPlayerRank = (index: number, players: Player[]) => {
        if (index === 0) return 1;
        if (players[index].points === players[index - 1].points) {
            return getPlayerRank(index - 1, players);
        }
        return index + 1;
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
            case 2: return <Medal className="h-5 w-5 text-gray-400" />;
            case 3: return <Award className="h-5 w-5 text-amber-600" />;
            default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-muted-foreground">{rank}</span>;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1: return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800";
            case 2: return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800";
            case 3: return "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800";
            default: return "bg-card border-border";
        }
    };



    return (
        <div className="space-y-6">
            <Card>
                <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <CardTitle className="text-lg">Filter & Sortierung</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        {getFilterSummary().length > 0 && (
                                            <span className="mr-2">
                                                {getFilterSummary().join(' • ')}
                                            </span>
                                        )}
                                        Sortiert nach: {getSortLabel()}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Select value={skillRatingFilter} onValueChange={setSkillRatingFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Fähigkeitsstufe filtern" />
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
                                            <SelectValue placeholder="Aktivitätsstatus filtern" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Alle Spieler</SelectItem>
                                            <SelectItem value="active">Nur aktive</SelectItem>
                                            <SelectItem value="inactive">Nur inaktive</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sortieren nach..." />
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
                                        {sortDirection === 'asc' ? 'Aufsteigend' : 'Absteigend'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

            <Tabs defaultValue="tournament" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto gap-1">
                    <TabsTrigger value="tournament" className="flex flex-col sm:flex-row items-center gap-1 p-2 text-xs sm:text-sm">
                        <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-center leading-tight">Aktuelles<br className="sm:hidden" /> Turnier</span>
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
                            <CardTitle>Aktuelles Turnier Rangliste</CardTitle>
                            <CardDescription>
                                Spieler sortiert nach Punkten im aktuellen Turnier
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tournament.started ? (
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
                                            <div>
                                                <p className="text-muted-foreground">4+1vs4+1 Spiele</p>
                                                <p className="font-medium">{stat.gamesPlayedByFormat["4+1vs4+1"]}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Fähigkeitswert</p>
                                                <div className="flex items-center gap-1">
                                                    {renderSkillRating(stat.skillRating)}
                                                    <span className="text-xs">({stat.skillRating}/5)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {historicalStats.length === 0 && (
                                    <div className="col-span-full text-center py-8">
                                        <p className="text-muted-foreground">Keine Statistiken verfügbar.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <TournamentHistorySection />
                </TabsContent>
            </Tabs>
        </div>
    );
} 
