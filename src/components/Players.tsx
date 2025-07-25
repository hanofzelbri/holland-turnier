import { useState } from 'react';
import { useTournament } from '@/contexts/TournamentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trash2, UserPlus } from 'lucide-react';

export function Players() {
    const { tournament, addPlayer, removePlayer, togglePlayerActive } = useTournament();
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');

    const handleAddPlayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlayerName.trim() && newPlayerNumber.trim()) {
            const number = parseInt(newPlayerNumber);
            if (!isNaN(number)) {
                addPlayer(newPlayerName.trim(), number);
                setNewPlayerName('');
                setNewPlayerNumber('');
            }
        }
    };

    const activePlayers = tournament.players.filter(p => p.active);
    const inactivePlayers = tournament.players.filter(p => !p.active);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Neuen Spieler hinzufügen
                    </CardTitle>
                    <CardDescription>
                        Füge neue Spieler zur Turnierliste hinzu
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-4">
                        <Input
                            placeholder="Spielername"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="number"
                            placeholder="Trikotnummer"
                            value={newPlayerNumber}
                            onChange={(e) => setNewPlayerNumber(e.target.value)}
                            className="w-full sm:w-32"
                        />
                        <Button type="submit" disabled={tournament.started}>
                            Hinzufügen
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">
                            Aktive Spieler ({activePlayers.length})
                        </CardTitle>
                        <CardDescription>
                            Diese Spieler nehmen am Turnier teil
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activePlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full text-sm font-medium text-green-800 dark:text-green-200">
                                            {player.number}
                                        </div>
                                        <span className="font-medium">{player.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {player.points} Punkte
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={player.active}
                                            onCheckedChange={() => togglePlayerActive(player.id)}
                                            disabled={tournament.started}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePlayer(player.id)}
                                            disabled={tournament.started}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-600">
                            Inaktive Spieler ({inactivePlayers.length})
                        </CardTitle>
                        <CardDescription>
                            Diese Spieler nehmen derzeit nicht am Turnier teil
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inactivePlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-950/20"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {player.number}
                                        </div>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">
                                            {player.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {player.points} Punkte
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={player.active}
                                            onCheckedChange={() => togglePlayerActive(player.id)}
                                            disabled={tournament.started}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePlayer(player.id)}
                                            disabled={tournament.started}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
        </div>
    );
} 
