import { SectionCards } from "@/components/section-cards";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Swords,
  Users,
  UserCircle,
  Shield,
  Trophy,
  ScrollText,
  HeartHandshake,
  GaugeCircle,
  Target,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionCards />

      {/* Notice about placeholder data */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-2 flex items-center gap-2">
        <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <p className="text-yellow-600 dark:text-yellow-400 text-sm">
          Nota: Os dados estatísticos mostrados abaixo são apenas demonstrativos
          e serão substituídos por dados reais em futuras implementações.
        </p>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 gap-2">
            <Swords className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Suas Batalhas</CardTitle>
              <CardDescription>Estatísticas de combate</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Total de Batalhas
                </span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GaugeCircle className="h-4 w-4" />
                  Dano Total Causado
                </span>
                <span className="font-semibold">4,832</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Rodadas Jogadas
                </span>
                <span className="font-semibold">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Suas Campanhas</CardTitle>
              <CardDescription>Visão geral das campanhas</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4" />
                  Campanhas Ativas
                </span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <ScrollText className="h-4 w-4" />
                  Total de Sessões
                </span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Jogadores
                </span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Seus Personagens</CardTitle>
              <CardDescription>Estatísticas de personagem</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Personagens Ativos
                </span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Dano Médio
                </span>
                <span className="font-semibold">31</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Vitórias em Batalha
                </span>
                <span className="font-semibold">16</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
