import { SectionCards } from "@/components/section-cards";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertCircle,
  Swords,
  Users,
  Shield,
  ScrollText,
  HeartHandshake,
  Target,
  Skull,
  Trophy,
  Crown,
  Zap,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <SectionCards />
      </div>

      {/* Notice about placeholder data */}
      <div className="rounded-lg border bg-card p-4 text-card-foreground">
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            Os dados estatísticos mostrados abaixo são apenas demonstrativos e
            serão substituídos por dados reais em futuras implementações.
          </p>
        </div>
      </div>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Swords className="h-5 w-5 text-primary" />
              Resumo de Batalhas
            </CardTitle>
            <CardDescription>Performance em combates</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Batalhas Vencidas</span>
              </div>
              <span className="font-medium">16/24</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Dano Total Causado</span>
              </div>
              <span className="font-medium">4,832</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skull className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Taxa de Sobrevivência</span>
              </div>
              <span className="font-medium">85%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-primary" />
              Status das Campanhas
            </CardTitle>
            <CardDescription>Visão geral das campanhas</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Campanhas Ativas</span>
              </div>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total de Sessões</span>
              </div>
              <span className="font-medium">18</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Jogadores Ativos</span>
              </div>
              <span className="font-medium">12</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-primary" />
              Dados do Personagem
            </CardTitle>
            <CardDescription>Estatísticas dos seus heróis</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Personagens Ativos</span>
              </div>
              <span className="font-medium">5</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Dano Médio</span>
              </div>
              <span className="font-medium">31</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Conquistas</span>
              </div>
              <span className="font-medium">8</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
