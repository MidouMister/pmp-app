"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroHeader } from "@/components/site/hero5-header";
import { AnimatedGroup } from "../motion-primitives/animated-group";
import { TextShimmerWave } from "../motion-primitives/text-shimmer-wave";
import Particles from "../Particles";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const features = [
  {
    icon: Users,
    title: "Collaboration en temps réel",
    description:
      "Travaillez ensemble, où que vous soyez. Synchronisation instantanée pour toute l'équipe.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Suivi avancé",
    description:
      "Tableaux de bord intuitifs et rapports détaillés pour mesurer votre progression.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description:
      "Vos données sont protégées avec un chiffrement de niveau entreprise.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description: "Interface rapide et réactive pour une productivité maximale.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Clock,
    title: "Gestion du temps",
    description:
      "Planifiez, suivez et optimisez le temps de travail de votre équipe.",
    gradient: "from-rose-500 to-red-500",
  },
  {
    icon: CheckCircle2,
    title: "Validation simplifiée",
    description:
      "Processus d'approbation fluides et workflows personnalisables.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const testimonials = [
  {
    name: "Marie Dupont",
    role: "Directrice de Projet",
    company: "TechCorp",
    content:
      "PMP a transformé notre façon de gérer les projets. L'équipe est plus productive que jamais.",
    avatar: "MD",
  },
  {
    name: "Ahmed Benali",
    role: "Chef d'équipe",
    company: "InnovaStart",
    content:
      "Interface intuitive et fonctionnalités puissantes. Exactement ce dont nous avions besoin.",
    avatar: "AB",
  },
  {
    name: "Sophie Martin",
    role: "Product Manager",
    company: "DigitalFlow",
    content:
      "Le suivi en temps réel nous permet de réagir instantanément aux changements.",
    avatar: "SM",
  },
];

const stats = [
  { value: "10K+", label: "Utilisateurs actifs" },
  { value: "500+", label: "Entreprises" },
  { value: "99.9%", label: "Disponibilité" },
  { value: "24/7", label: "Support" },
];

export default function HeroSection() {
  return (
    <>
      {/* LightRays - Dark Mode */}
      <div className="absolute inset-0 top-0 z-[-1] min-h-screen hidden dark:block">
        {/* <LightRays
          raysOrigin="top-center"
          raysColor="#6366f1"
          raysSpeed={0.8}
          lightSpread={2}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.02}
          noiseAmount={0.0}
          distortion={0.01}
        /> */}
        <Particles
          particleColors={["#440ae6"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <HeroHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10">
          {/* Animated orbs - Light mode */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-400/40 rounded-full blur-[100px] animate-pulse dark:hidden" />
          <div
            className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-400/40 rounded-full blur-[100px] animate-pulse dark:hidden"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/30 to-purple-300/30 rounded-full blur-[120px] dark:hidden" />

          {/* Animated orbs - Dark mode */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse hidden dark:block" />
          <div
            className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse hidden dark:block"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-[120px] hidden dark:block" />
        </div>

        <div className="relative pt-32 md:pt-40 pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              {/* Badge */}
              <AnimatedGroup variants={transitionVariants}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-sm mb-8">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-foreground">
                    Nouvelle version disponible
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
              </AnimatedGroup>

              {/* Main Heading */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.15,
                        delayChildren: 0.1,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                  Gérez vos projets
                </h1>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">
                  partout, en un seul endroit
                </h1>
              </AnimatedGroup>

              {/* Subtitle */}
              <TextShimmerWave
                duration={1.5}
                spread={1}
                zDistance={1}
                scaleDistance={1.05}
                rotateYDistance={15}
                className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl text-muted-foreground"
              >
                Collaboration en temps réel, suivi centralisé et contrôle total
                pour transformer la productivité de votre entreprise.
              </TextShimmerWave>

              {/* CTA Buttons */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.8,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="group relative px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                >
                  <Link href="/company">
                    <span>Commencer gratuitement</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300 hover:scale-105"
                >
                  <Link href="#features">
                    <span>Découvrir les fonctionnalités</span>
                  </Link>
                </Button>
              </AnimatedGroup>

              {/* Stats */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 1.2,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </AnimatedGroup>
            </div>

            {/* Hero Image */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      delayChildren: 1,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-20"
            >
              <div className="relative mx-auto max-w-5xl">
                {/* Glow effect behind image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl scale-95" />

                <div className="relative rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm p-2 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
                  <Image
                    className="rounded-xl hidden dark:block"
                    src="/assets/dark-card.webp"
                    alt="Interface PMP - Mode sombre"
                    width={2700}
                    height={1440}
                    priority
                  />
                  <Image
                    className="rounded-xl dark:hidden"
                    src="/assets/card.png"
                    alt="Interface PMP - Mode clair"
                    width={2700}
                    height={1440}
                    priority
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Tout ce dont vous avez{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                besoin
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils puissants pour gérer vos projets, votre équipe et votre
              productivité.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>

                  {/* Hover gradient border effect */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-10`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ils nous font{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                confiance
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez pourquoi des centaines d'entreprises choisissent PMP.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />

        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Prêt à transformer votre{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              productivité
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'équipes qui utilisent PMP pour atteindre
            leurs objectifs plus rapidement.
          </p>
          <Button
            asChild
            size="lg"
            className="px-8 py-6 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <Link href="/company">
              <span>Commencer maintenant</span>
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-xl font-bold">PMP</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                La solution complète pour gérer vos projets et améliorer la
                collaboration de votre équipe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-foreground transition-colors"
                  >
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Intégrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
            © 2024 PMP. Tous droits réservés.
          </div>
        </div>
      </footer>
    </>
  );
}
