import { SectionCards } from "@/components/section-cards";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <SectionCards />

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Suas Batalhas</CardTitle>
            <CardDescription>Estatísticas de combate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de Batalhas</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Dano Total Causado
                </span>
                <span className="font-semibold">4,832</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rodadas Jogadas</span>
                <span className="font-semibold">156</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suas Campanhas</CardTitle>
            <CardDescription>Visão geral das campanhas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Campanhas Ativas</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de Sessões</span>
                <span className="font-semibold">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Jogadores</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Personagens</CardTitle>
            <CardDescription>Estatísticas de personagem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Personagens Ativos
                </span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Dano Médio</span>
                <span className="font-semibold">31</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
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
