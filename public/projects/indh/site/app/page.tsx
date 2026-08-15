"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  Heart,
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles,
  Target,
  HandHeart,
  Landmark,
  MapPin,
  Banknote,
} from "lucide-react"
import AnimatedCounter from "@/components/animated-counter"
import SectionHeader from "@/components/section-header"
import { useEffect, useRef, useState } from "react"

/* ──────────────────────────── DATA ──────────────────────────── */

const programs = [
  {
    icon: HandHeart,
    title: "Inclusion Sociale",
    description:
      "Soutien aux personnes en situation de précarité, protection de l'enfance et accompagnement des groupes vulnérables.",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    stat: "4.2M",
    statLabel: "bénéficiaires",
  },
  {
    icon: TrendingUp,
    title: "Activités Génératrices de Revenus",
    description:
      "Soutien aux micro-entreprises, coopératives et projets économiques pour améliorer les revenus des populations.",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    stat: "8K+",
    statLabel: "projets financés",
  },
  {
    icon: GraduationCap,
    title: "Éducation & Santé",
    description:
      "Construction et réhabilitation d'écoles, centres de santé, soutien scolaire et alphabétisation des adultes.",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    stat: "3.5K",
    statLabel: "centres construits",
  },
  {
    icon: Landmark,
    title: "Infrastructure Rurale",
    description:
      "Routes rurales, électrification, adduction d'eau potable et assainissement dans les zones enclavées.",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    stat: "12K+",
    statLabel: "km de routes",
  },
]

const featuredProjects = [
  {
    title: "Coopérative de Safran — Taliouine",
    description:
      "Soutien à 120 femmes rurales pour la production et la commercialisation du safran, l'or rouge du Maroc.",
    image: "/zaefrane.jpg",
    region: "Souss-Massa",
    beneficiaries: 120,
    category: "Agriculture",
  },
  {
    title: "Centre de Formation Artisanale",
    description:
      "Formation de 85 jeunes aux métiers de l'artisanat traditionnel marocain : tapis, poterie, zellij.",
    image: "/Centre_formation_artisanale.jpg",
    region: "Marrakech-Safi",
    beneficiaries: 85,
    category: "Artisanat",
  },
  {
    title: "Unité de Production de Miel",
    description:
      "Soutien aux apiculteurs locaux pour la production et commercialisation du miel de qualité.",
    image: "/miel1.jpg",
    region: "Fès-Meknès",
    beneficiaries: 60,
    category: "Agriculture",
  },
]

const phases = [
  {
    year: "2005",
    title: "Phase I — Le Lancement",
    description:
      "Lancement de l'INDH par Sa Majesté le Roi Mohammed VI. Focus sur la lutte contre la pauvreté en milieu rural et l'exclusion sociale en milieu urbain.",
    budget: "10 Milliards DH",
  },
  {
    year: "2011",
    title: "Phase II — L'Expansion",
    description:
      "Extension des programmes avec un budget renforcé. Nouveau focus sur les activités génératrices de revenus et la mise à niveau territoriale.",
    budget: "17 Milliards DH",
  },
  {
    year: "2019",
    title: "Phase III — Capital Humain",
    description:
      "Troisième phase axée sur le développement du capital humain des générations montantes, l'accompagnement des personnes vulnérables et l'inclusion économique des jeunes.",
    budget: "18 Milliards DH",
  },
]

/* ──────────────────────────── COMPONENT ──────────────────────────── */

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* ============== HERO SECTION ============== */}
      <HeroSection />

      {/* ============== KEY STATS ============== */}
      <StatsSection />

      {/* ============== PROGRAMS ============== */}
      <ProgramsSection />

      {/* ============== FEATURED PROJECTS ============== */}
      <ProjectsSection />

      {/* ============== TIMELINE ============== */}
      <TimelineSection />

      {/* ============== CTA SECTION ============== */}
      <CTASection />
    </div>
  )
}

/* ──────────────────── HERO ──────────────────── */

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-blob [animation-delay:2s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl animate-blob [animation-delay:4s]" />

      {/* Moroccan pattern overlay */}
      <div className="absolute inset-0 moroccan-pattern" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left - Text Content */}
          <div className="lg:w-1/2 text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8 animate-fade-in-up">
              <span className="text-sm font-medium">20 ans d&apos;impact — 2005-2025</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-6 leading-[1.1] animate-fade-in-up [animation-delay:100ms]">
              Initiative Nationale pour le{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-200">
                Développement Humain
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed animate-fade-in-up [animation-delay:200ms]">
              Lutter contre la pauvreté, la vulnérabilité et l&apos;exclusion sociale pour un Maroc
              solidaire et prospère.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:300ms]">
              <Button
                asChild
                size="lg"
                className="bg-white text-green-800 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl px-8 text-base font-semibold h-14"
              >
                <Link href="/submit" className="flex items-center gap-2">
                  Proposer Votre Projet
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl px-8 text-base font-semibold h-14"
              >
                <Link href="/about">Découvrir l&apos;INDH</Link>
              </Button>
            </div>

            {/* Mini stats */}
            <div className="mt-12 flex items-center gap-8 animate-fade-in-up [animation-delay:400ms]">
              {[
                { value: "12M+", label: "Bénéficiaires" },
                { value: "10K+", label: "Projets" },
                { value: "20", label: "Ans d'action" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-heading font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div className="lg:w-1/2 animate-fade-in-right [animation-delay:300ms]">
            <div className="relative">
              {/* Main Image */}
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/indhroi.jpg"
                  alt="Sa Majesté le Roi Mohammed VI - Lancement de l'INDH"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 33.3C672 36.7 768 43.3 864 45C960 46.7 1056 43.3 1152 38.3C1248 33.3 1344 26.7 1392 23.3L1440 20V60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}

/* ──────────────────── STATS ──────────────────── */

function StatsSection() {
  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 moroccan-pattern" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-white">
            <AnimatedCounter
              end={12}
              suffix="M+"
              label="Bénéficiaires"
              icon={<Users className="h-6 w-6 text-emerald-300" />}
            />
            <AnimatedCounter
              end={10000}
              suffix="+"
              label="Projets réalisés"
              icon={<Target className="h-6 w-6 text-emerald-300" />}
            />
            <AnimatedCounter
              end={43}
              suffix="B DH"
              label="Budget investi"
              icon={<TrendingUp className="h-6 w-6 text-emerald-300" />}
            />
            <AnimatedCounter
              end={1600}
              suffix="+"
              label="Associations partenaires"
              icon={<Heart className="h-6 w-6 text-emerald-300" />}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── PROGRAMS ──────────────────── */

function ProgramsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <SectionHeader
          badge="Nos Programmes"
          title="Quatre piliers pour le développement"
          description="L'INDH agit à travers quatre programmes complémentaires couvrant l'ensemble des besoins de développement humain."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <Card
              key={index}
              className="group card-hover border-0 shadow-md overflow-hidden bg-white"
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${program.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500`}
                  >
                    <program.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold mb-2 text-gray-900">
                      {program.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-4">{program.description}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${program.bgColor}`}>
                      <span className={`text-sm font-bold ${program.textColor}`}>{program.stat}</span>
                      <span className={`text-xs ${program.textColor} opacity-70`}>{program.statLabel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── FEATURED PROJECTS ──────────────────── */

function ProjectsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader
          badge="Projets Phares"
          title="Des projets qui changent des vies"
          description="Découvrez quelques-uns des projets soutenus par l'INDH qui ont transformé des communautés."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => (
            <Card
              key={index}
              className="group card-hover overflow-hidden border-0 shadow-md bg-white"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-green-700">
                    {project.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/80 text-xs">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{project.region}</span>
                    <span className="mx-1">•</span>
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.beneficiaries} bénéficiaires</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-heading font-bold mb-2 text-gray-900 group-hover:text-green-700 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {project.description}
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 group/link"
                >
                  En savoir plus
                  <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href="/projects" className="flex items-center gap-2">
              Voir Tous Les Projets
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── TIMELINE ──────────────────── */

function TimelineSection() {
  const [activePhase, setActivePhase] = useState(0)

  return (
    <section className="py-20 md:py-28 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <SectionHeader
          badge="Notre Parcours"
          title="20 ans d'engagement continu"
          description="Trois phases stratégiques pour un développement humain durable au Maroc."
        />

        {/* Phase selector */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-white rounded-2xl p-1.5 shadow-md border border-gray-100">
            {phases.map((phase, index) => (
              <button
                key={index}
                onClick={() => setActivePhase(index)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activePhase === index
                    ? "bg-gradient-to-r from-green-700 to-emerald-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {phase.year}
              </button>
            ))}
          </div>
        </div>

        {/* Phase content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left - Info */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-6">
                {phases[activePhase].year}
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-gray-900">
                {phases[activePhase].title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                {phases[activePhase].description}
              </p>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">Budget alloué</p>
                  <p className="text-lg font-heading font-bold text-amber-800">
                    {phases[activePhase].budget}
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              {/* Progress visualization */}
              <div className="space-y-6">
                {phases.map((phase, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      index <= activePhase ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-heading font-bold transition-all duration-500 ${
                        index === activePhase
                          ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg scale-110"
                          : index < activePhase
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {phase.year.slice(2)}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`h-3 rounded-full overflow-hidden ${
                          index <= activePhase ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            index < activePhase
                              ? "w-full bg-gradient-to-r from-green-500 to-emerald-500"
                              : index === activePhase
                              ? "w-3/4 bg-gradient-to-r from-green-500 to-emerald-500"
                              : "w-0"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{phase.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────── CTA ──────────────────── */

function CTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-emerald-800" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 moroccan-pattern" />

      <div className="container mx-auto px-4 relative z-10 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Heart className="h-4 w-4 text-red-400 fill-red-400" />
            <span className="text-sm font-medium">Participez au changement</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6">
            Vous avez une idée de projet ?
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed">
            Soumettez votre idée et contribuez au développement de votre communauté. L&apos;INDH
            accompagne les porteurs de projets à chaque étape.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-green-800 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl px-8 text-base font-semibold h-14"
            >
              <Link href="/submit" className="flex items-center gap-2">
                Proposer Votre Projet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 rounded-xl px-8 text-base font-semibold h-14"
            >
              <Link href="/documents">Consulter les Documents</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
