import { TournamentProvider } from '@/contexts/TournamentContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Players } from '@/components/Players';
import { Tournament } from '@/components/Tournament';
import { Games } from '@/components/Games';
import { Leaderboard } from '@/components/Leaderboard';
import { Users, Trophy, Calendar, Target } from 'lucide-react';

function App() {
    return (
        <TournamentProvider>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-4">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-primary mb-2">
                            Holland-Turnier Organisator
                        </h1>
                        <p className="text-muted-foreground">
                            Organisiere faire Fußball-Turniere für Jugendmannschaften
                        </p>
                    </div>

                    <Tabs defaultValue="players" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="players" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Spieler
                            </TabsTrigger>
                            <TabsTrigger value="tournament" className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Turnier
                            </TabsTrigger>
                            <TabsTrigger value="games" className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Spiele
                            </TabsTrigger>
                            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Rangliste
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="players">
                            <Players />
                        </TabsContent>

                        <TabsContent value="tournament">
                            <Tournament />
                        </TabsContent>

                        <TabsContent value="games">
                            <Games />
                        </TabsContent>

                        <TabsContent value="leaderboard">
                            <Leaderboard />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </TournamentProvider>
    );
}

export default App; 
