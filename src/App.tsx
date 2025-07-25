import { useState } from 'react';
import { TournamentProvider } from '@/contexts/TournamentContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Players } from '@/components/Players';
import { Tournament } from '@/components/Tournament';
import { Games } from '@/components/Games';
import { Leaderboard } from '@/components/Leaderboard';
import { Users, Trophy, Calendar, Target } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState("players");

    const handleNavigateToGames = () => {
        setActiveTab("games");
    };

    return (
        <TournamentProvider>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto p-2 sm:p-4">
                    <div className="mb-3 sm:mb-8 text-center">
                        <h1 className="text-lg sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
                            Holland-Turnier Organisator
                        </h1>
                        <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
                            Organisiere faire Fußball-Turniere für Jugendmannschaften
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-auto">
                            <TabsTrigger value="players" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Spieler</span>
                            </TabsTrigger>
                            <TabsTrigger value="tournament" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Turnier</span>
                            </TabsTrigger>
                            <TabsTrigger value="games" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Spiele</span>
                            </TabsTrigger>
                            <TabsTrigger value="leaderboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
                                <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Rangliste</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="players">
                            <Players />
                        </TabsContent>

                        <TabsContent value="tournament">
                            <Tournament onNavigateToGames={handleNavigateToGames} />
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
