"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dice6, Users, Swords, Scroll, ArrowRight, Github } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const features = [
    {
      icon: <Dice6 className="h-8 w-8 text-primary" />,
      title: "Gerenciamento de Campanhas",
      description: "Crie e gerencie suas campanhas de RPG com total controle e organização.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Criação de Personagens",
      description: "Construa personagens detalhados e mantenha suas fichas sempre atualizadas.",
    },
    {
      icon: <Swords className="h-8 w-8 text-primary" />,
      title: "Combate Inteligente",
      description: "Sistema ágil para gerenciar turnos, vida e ações durante as sessões.",
    },
    {
      icon: <Scroll className="h-8 w-8 text-primary" />,
      title: "Crônicas Vivas",
      description: "Mantenha o histórico de suas aventuras e personagens em um só lugar.",
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Dice6 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Carregando aventura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Navigation - Transparent and blurry */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/20 dark:bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Dice6 className="h-6 w-6 text-primary-foreground" />
            </div> */}
            <Image src="/drpg-logo.png" alt="Drpg Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl font-bold tracking-tight">Drpg</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-primary mb-8 backdrop-blur-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Novo: Gerenciamento de Combates Redesenhado
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 leading-tight">
            Forje suas Lendas<br />no Mundo Digital
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            A plataforma definitiva para organizar suas campanhas de RPG.
            Mestres e jogadores conectados em uma experiência premium e intuitiva.
            Drpg é a ferramenta que você precisava para levar suas sessões para o próximo nível.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-10 text-lg font-semibold w-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 group transition-all duration-300">
                Começar Minha Jornada
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold w-full border-border bg-secondary/50 hover:bg-secondary/80 backdrop-blur-md text-foreground transition-all duration-300">
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Glass Cards */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Tudo o que você precisa</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Ferramentas poderosas para elevar o nível das suas sessões de RPG.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border backdrop-blur-sm transition-all duration-500 hover:bg-accent/50 hover:border-primary/50 hover:-translate-y-2"
              >
                <div className="mb-6 p-3 rounded-xl bg-primary/10 w-fit group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - Interactive & Modern */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent to-black/5 dark:to-black/40">
        <div className="container mx-auto">
          <div className="rounded-3xl p-12 bg-card border border-border backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>

            <h2 className="text-2xl md:text-4xl font-bold text-center mb-16 relative z-10">
              Transformando a forma de jogar RPG
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
              {[
                { value: "15.7K+", label: "Personagens", sub: "Criados por jogadores" },
                { value: "8.3K+", label: "Campanhas", sub: "Histórias ativas" },
                { value: "42.9K+", label: "Batalhas", sub: "Encontros épicos" },
                { value: "1.2M+", label: "Dano", sub: "Pontos totais" },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl md:text-5xl font-black text-primary mb-3 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform">
                    {stat.value}
                  </div>
                  <p className="text-lg font-bold text-foreground mb-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Epic Finish */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-right"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
            Sua próxima aventura<br />começa agora.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl mx-auto opacity-90">
            Junte-se a milhares de aventureiros e mestres. Totalmente gratuito para começar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xl hover:shadow-primary/20">
                Criar Conta Gratuita
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Image src="/drpg-logo.png" alt="Drpg Logo" width={24} height={24} className="h-6 w-6" />
            <span className="text-lg font-bold">Drpg</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Drpg. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
