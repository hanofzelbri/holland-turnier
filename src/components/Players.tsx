import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Trash2, UserPlus, Star, Search, Filter, ArrowUpDown, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type SortOption = 'name' | 'number' | 'points' | 'skillRating';
type SortDirection = 'asc' | 'desc';

export function Players() {
    const { currentTournament, addPlayer, removePlayer, togglePlayerActive, updatePlayerSkillRating, renamePlayer } = useTournament();
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    const [newPlayerSkillRating, setNewPlayerSkillRating] = useState('3');
    const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
    const [playerToRename, setPlayerToRename] = useState<{ id: string; name: string } | null>(null);
    const [newName, setNewName] = useState('');

    const [addPlayerExpanded, setAddPlayerExpanded] = useState(false);
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const [activePlayersExpanded, setActivePlayersExpanded] = useState(true);
    const [inactivePlayersExpanded, setInactivePlayersExpanded] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [skillRatingFilter, setSkillRatingFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('number');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    if (!currentTournament) {
        return <div>Loading...</div>;
    }

    const tournament = currentTournament;

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim() && newPlayerNumber.trim()) {
            const number = parseInt(newPlayerNumber);
            const skillRating = parseInt(newPlayerSkillRating);
            if (!isNaN(number) && !isNaN(skillRating) && skillRating >= 1 && skillRating <= 5) {
                addPlayer(newPlayerName.trim(), number, skillRating);
                setNewPlayerName('');
                setNewPlayerNumber('');
                setNewPlayerSkillRating('3');
            }
        }
    };

    const handleSkillRatingChange = (playerId: string, newRating: number) => {
        if (newRating >= 1 && newRating <= 5) {
            updatePlayerSkillRating(playerId, newRating);
        }
    };

    const handleDeletePlayer = (playerId: string) => {
        removePlayer(playerId);
        setPlayerToDelete(null);
    };

    const handleRenamePlayer = (playerId: string, playerName: string) => {
        setPlayerToRename({ id: playerId, name: playerName });
        setNewName(playerName);
    };

    const confirmRename = () => {
        if (playerToRename && newName.trim()) {
            renamePlayer(playerToRename.id, newName.trim());
            setPlayerToRename(null);
            setNewName('');
        }
    };

    const filterAndSortPlayers = (players: typeof tournament.players) => {
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

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
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
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
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

    const activePlayers = filterAndSortPlayers(tournament.players.filter(p => p.active));
    const inactivePlayers = filterAndSortPlayers(tournament.players.filter(p => !p.active));

    return (
        <div className="space-y-6">
            <Card>
                <Collapsible open={addPlayerExpanded} onOpenChange={setAddPlayerExpanded}>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    Neuen Spieler hinzufügen
                                </div>
                                {addPlayerExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </CardTitle>
                            <CardDescription>
                                Füge neue Spieler zur Turnierliste hinzu
                            </CardDescription>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            <form onSubmit={handleAddPlayer} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Spielername"
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        className="col-span-1 sm:col-span-1"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Trikotnummer"
                                        value={newPlayerNumber}
                                        onChange={(e) => setNewPlayerNumber(e.target.value)}
                                        className="col-span-1 sm:col-span-1"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Fähigkeitsbewertung (1-5 Sterne)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewPlayerSkillRating(star.toString())}
                                                className="transition-colors hover:scale-110"
                                                disabled={tournament.started}
                                            >
                                                <Star
                                                    className={`h-6 w-6 transition-colors ${star <= parseInt(newPlayerSkillRating)
                                                        ? 'text-yellow-500 fill-yellow-500 hover:text-yellow-600'
                                                        : 'text-gray-300 hover:text-yellow-400'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {parseInt(newPlayerSkillRating)} von 5 Sternen
                                        </span>
                                    </div>
                                </div>
                                <Button type="submit" disabled={tournament.started} className="w-full sm:w-auto">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Spieler hinzufügen
                                </Button>
                            </form>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>

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
                                        {searchTerm && <span className="mr-2">Suche: "{searchTerm}"</span>}
                                        {skillRatingFilter !== 'all' && (
                                            <span className="mr-2">
                                                Fähigkeit: {'⭐'.repeat(parseInt(skillRatingFilter))}
                                            </span>
                                        )}
                                        <span>
                                            Sortiert nach: {
                                                sortBy === 'number' ? 'Trikotnummer' :
                                                    sortBy === 'name' ? 'Name' :
                                                        sortBy === 'points' ? 'Punkte' :
                                                            'Fähigkeitsstufe'
                                            } ({sortDirection === 'asc' ? 'aufsteigend' : 'absteigend'})
                                        </span>
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
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

                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sortieren nach..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="number">Trikotnummer</SelectItem>
                                            <SelectItem value="name">Name</SelectItem>
                                            <SelectItem value="points">Punkte</SelectItem>
                                            <SelectItem value="skillRating">Fähigkeitsstufe</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                        className="flex items-center gap-2 col-span-1 sm:col-span-2 lg:col-span-1"
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

            {(searchTerm || skillRatingFilter !== 'all') && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">
                            {activePlayers.length + inactivePlayers.length > 0 ? (
                                <>Zeige {activePlayers.length + inactivePlayers.length} von {tournament.players.length} Spielern</>
                            ) : (
                                <>Keine Spieler gefunden für aktuelle Filter</>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <Collapsible open={activePlayersExpanded} onOpenChange={setActivePlayersExpanded}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardTitle className="flex items-center justify-between text-green-600">
                                    <span>Aktive Spieler ({activePlayers.length})</span>
                                    {activePlayersExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Diese Spieler nehmen am Turnier teil
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {activePlayers.map((player) => (
                                        <div
                                            key={player.id}
                                            className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full text-sm font-medium text-green-800 dark:text-green-200 flex-shrink-0">
                                                        {player.number}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium truncate">{player.name}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {player.points} Punkte
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">Fähigkeit</span>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleSkillRatingChange(player.id, player.skillRating - 1)}
                                                                disabled={tournament.started || player.skillRating <= 1}
                                                            >
                                                                -
                                                            </Button>
                                                            {renderSkillRating(player.skillRating)}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleSkillRatingChange(player.id, player.skillRating + 1)}
                                                                disabled={tournament.started || player.skillRating >= 5}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Switch
                                                            checked={player.active}
                                                            onCheckedChange={() => togglePlayerActive(player.id)}
                                                            disabled={tournament.started}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleRenamePlayer(player.id, player.name)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setPlayerToDelete(player.id)}
                                                            disabled={tournament.started}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {activePlayers.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            Keine aktiven Spieler
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>

                <Card>
                    <Collapsible open={inactivePlayersExpanded} onOpenChange={setInactivePlayersExpanded}>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                                <CardTitle className="flex items-center justify-between text-gray-600">
                                    <span>Inaktive Spieler ({inactivePlayers.length})</span>
                                    {inactivePlayersExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Diese Spieler nehmen derzeit nicht am Turnier teil
                                </CardDescription>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    {inactivePlayers.map((player) => (
                                        <div
                                            key={player.id}
                                            className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-950/20"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">
                                                        {player.number}
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="font-medium text-gray-600 dark:text-gray-400 truncate">
                                                            {player.name}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {player.points} Punkte
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs text-muted-foreground">Fähigkeit</span>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleSkillRatingChange(player.id, player.skillRating - 1)}
                                                                disabled={tournament.started || player.skillRating <= 1}
                                                            >
                                                                -
                                                            </Button>
                                                            {renderSkillRating(player.skillRating)}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0"
                                                                onClick={() => handleSkillRatingChange(player.id, player.skillRating + 1)}
                                                                disabled={tournament.started || player.skillRating >= 5}
                                                            >
                                                                +
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Switch
                                                            checked={player.active}
                                                            onCheckedChange={() => togglePlayerActive(player.id)}
                                                            disabled={tournament.started}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleRenamePlayer(player.id, player.name)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => setPlayerToDelete(player.id)}
                                                            disabled={tournament.started}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {inactivePlayers.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">
                                            Keine inaktiven Spieler
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            </div>

            {tournament.started && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Hinweis:</strong> Das Turnier wurde bereits gestartet.
                        Spieler können nicht mehr hinzugefügt, entfernt oder deaktiviert werden.
                    </p>
                </div>
            )}

            <Dialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Spieler löschen</DialogTitle>
                        <DialogDescription>
                            Möchten Sie diesen Spieler wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlayerToDelete(null)}>Abbrechen</Button>
                        <Button onClick={() => playerToDelete && handleDeletePlayer(playerToDelete)}>Löschen</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!playerToRename} onOpenChange={() => setPlayerToRename(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Spieler umbenennen</DialogTitle>
                        <DialogDescription>
                            Geben Sie den neuen Namen für den Spieler ein.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Neuer Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlayerToRename(null)}>Abbrechen</Button>
                        <Button onClick={confirmRename} disabled={!newName.trim()}>
                            Umbenennen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
