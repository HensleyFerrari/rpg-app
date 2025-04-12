"use client";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Dice6, Users, Swords, Scroll, ArrowRight } from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: <Dice6 className="h-8 w-8 text-primary" />,
      title: "Gerenciamento de Campanhas",
      description: "Crie e gerencie suas campanhas de RPG com facilidade.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Personagens",
      description: "Desenvolva personagens únicos e mantenha seu histórico.",
    },
    {
      icon: <Swords className="h-8 w-8 text-primary" />,
      title: "Sistema de Batalhas",
      description: "Sistema intuitivo para gerenciar combates e encontros.",
    },
    {
      icon: <Scroll className="h-8 w-8 text-primary" />,
      title: "Histórias Épicas",
      description: "Crie narrativas memoráveis para suas aventuras.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 bg-background">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Seu RPG de Mesa,
            <span className="text-primary"> Digital</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gerencie suas campanhas, personagens e batalhas de RPG em um só
            lugar. Uma ferramenta completa para mestres e jogadores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {status === "authenticated" ? (
              <Button
                size="lg"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    router.push("/");
                  });
                }}
              >
                Sair
              </Button>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Recursos Principais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nossa Comunidade em Números
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15.7K</div>
              <p className="text-muted-foreground">Personagens Criados</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">8.3K</div>
              <p className="text-muted-foreground">Campanhas Ativas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">42.9K</div>
              <p className="text-muted-foreground">Batalhas Realizadas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1.2M</div>
              <p className="text-muted-foreground">Dano Total Causado</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Começar sua Aventura?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Junte-se a nossa comunidade de mestres e jogadores hoje mesmo.
          </p>
          {status !== "authenticated" && (
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
