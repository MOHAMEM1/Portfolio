"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import SectionHeader from "@/components/section-header"
import AnimatedCounter from "@/components/animated-counter"
import {
  CheckCircle2,
  Eye,
  Handshake,
  Shield,
  Lightbulb,
  Users,
  TrendingUp,
  Heart,
  Target,
} from "lucide-react"

const objectives = [
  {
    icon: Target,
    title: "Réduction de la pauvreté",
    description:
      "Améliorer les conditions de vie des populations les plus vulnérables et réduire les inégalités sociales.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "Inclusion économique",
    description:
      "Favoriser l'accès à l'emploi et soutenir les activités génératrices de revenus pour les jeunes et les femmes.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Heart,
    title: "Accès aux services de base",
    description:
      "Améliorer l'accès aux infrastructures et services de base : eau, électricité, routes, écoles, centres de santé.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Développement local",
    description:
      "Renforcer la gouvernance locale et encourager la participation citoyenne dans le développement communautaire.",
    color: "from-purple-500 to-violet-600",
  },
]

const values = [
  {
    icon: Eye,
    title: "Transparence",
    description: "Gestion rigoureuse et redevabilité dans tous nos programmes.",
  },
  {
    icon: Handshake,
    title: "Participation",
    description: "Implication active des communautés dans le développement local.",
  },
  {
    icon: Shield,
    title: "Dignité",
    description: "Respect de la dignité humaine au cœur de toutes nos actions.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Solutions créatives et adaptées aux réalités locales.",
  },
]

const targetGroups = [
  {
    title: "Jeunes sans emploi",
    description: "Accompagnement, formation et soutien à l'entrepreneuriat",
    image: "/sans_emploi.jpg",
    stat: "3.5M+",
  },
  {
    title: "Femmes en situation difficile",
    description: "Autonomisation économique et renforcement des capacités",
    image: "/femme_situation_diff.jpg",
    stat: "2.8M+",
  },
  {
    title: "Personnes à besoins spécifiques",
    description: "Inclusion sociale et accès aux services adaptés",
    image: "/Personnes_besoins.jpg",
    stat: "1.2M+",
  },
  {
    title: "Familles démunies",
    description: "Soutien direct et amélioration des conditions de vie",
    image: "/Familles_démunies.jpg",
    stat: "4.5M+",
  },
]

const timeline = [
  {
    year: "2005",
    title: "Lancement de l'INDH",
    description:
      "Discours royal historique du 18 mai 2005, lançant l'Initiative Nationale pour le Développement Humain.",
  },
  {
    year: "2006-2010",
    title: "Phase I — Les fondations",
    description:
      "Mise en place des structures, identification des communes cibles, lancement des premiers projets dans 403 communes rurales et 264 quartiers urbains.",
  },
  {
    year: "2011-2018",
    title: "Phase II — L'expansion",
    description:
      "Extension à l'ensemble du territoire national, renforcement des AGR, création de la plateforme d'accompagnement des porteurs de projets.",
  },
  {
    year: "2019-2023",
    title: "Phase III — Capital Humain",
    description:
      "Focus sur le développement du capital humain des générations montantes, la petite enfance, et l'accompagnement des personnes en situation de précarité.",
  },
  {
    year: "2024-Présent",
    title: "Impact continu",
    description:
      "L'INDH continue de soutenir des milliers de projets à travers le Royaume, capitalisant sur 20 ans d'expérience et d'impact mesurable.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ============== HERO ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-blob [animation-delay:3s]" />
        <div className="absolute inset-0 moroccan-pattern" />

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6 animate-fade-in-up">
            Depuis 2005
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 animate-fade-in-up [animation-delay:100ms]">
            Qui Sommes-Nous
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto animate-fade-in-up [animation-delay:200ms]">
            L&apos;Initiative Nationale pour le Développement Humain est une initiative royale
            lancée en 2005 par Sa Majesté le Roi Mohammed VI.
          </p>
        </div>
      </section>

      {/* ============== MISSION ============== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <SectionHeader
                badge="Notre Mission"
                title="Un engagement pour le Maroc"
                align="left"
              />
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                L&apos;INDH a pour mission de lutter contre la pauvreté, la vulnérabilité et
                l&apos;exclusion sociale à travers la réalisation de projets de développement humain
                au profit des populations les plus démunies.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Depuis son lancement, l&apos;INDH a contribué à améliorer les conditions de vie de
                millions de Marocains à travers le Royaume, en particulier dans les zones rurales
                et les quartiers urbains défavorisés.
              </p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "83", suffix: "%", label: "Taux de réalisation" },
                  { value: "12", suffix: " régions", label: "Couverture nationale" },
                  { value: "1600", suffix: "+", label: "Partenaires" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 bg-green-50 rounded-2xl border border-green-100"
                  >
                    <p className="text-xl md:text-2xl font-heading font-bold text-green-700">
                      {stat.value}
                      {stat.suffix}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/indhroi.jpg"
                    alt="Mission de l'INDH - Sa Majesté le Roi Mohammed VI"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden md:block">
                  <Image
                    src="/projet.jpg"
                    alt="Projets INDH"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== VALUES ============== */}
      <section className="py-20 md:py-28 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Nos Valeurs"
            title="Les principes qui nous guident"
            description="L'INDH s'appuie sur des valeurs fondamentales pour assurer un impact durable et équitable."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="card-hover border-0 shadow-md bg-white text-center group"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============== OBJECTIVES ============== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Nos Objectifs"
            title="Un développement humain durable"
            description="Des objectifs stratégiques pour un impact mesurable sur la vie des citoyens."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {objectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-start gap-5 p-6 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${objective.color} flex items-center justify-center flex-shrink-0`}
                >
                  <objective.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-bold mb-2">{objective.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{objective.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TARGET GROUPS ============== */}
      <section className="py-20 md:py-28 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Groupes Cibles"
            title="Au service des plus vulnérables"
            description="L'INDH cible les populations les plus démunies pour un impact social maximal."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {targetGroups.map((group, index) => (
              <Card
                key={index}
                className="card-hover border-0 shadow-md overflow-hidden bg-white text-center group"
              >
                <CardContent className="p-6">
                  <div className="relative w-28 h-28 mx-auto mb-5 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-500">
                    <Image
                      src={group.image}
                      alt={group.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-base font-heading font-bold mb-1">{group.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{group.description}</p>
                  <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-bold">
                    {group.stat}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============== TIMELINE ============== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Notre Histoire"
            title="20 ans au service du Maroc"
          />

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-emerald-400 to-green-300 md:-translate-x-px" />

              {timeline.map((event, index) => (
                <div
                  key={index}
                  className={`relative flex items-start gap-6 md:gap-0 mb-12 last:mb-0 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-green-500 border-4 border-white shadow-md z-10" />

                  {/* Spacer for mobile */}
                  <div className="w-12 md:hidden flex-shrink-0" />

                  {/* Content */}
                  <div className={`flex-1 md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                      <span className="inline-block px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold mb-3">
                        {event.year}
                      </span>
                      <h3 className="text-lg font-heading font-bold mb-2">{event.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{event.description}</p>
                    </div>
                  </div>

                  {/* Hidden spacer for alternating layout */}
                  <div className="hidden md:block md:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
