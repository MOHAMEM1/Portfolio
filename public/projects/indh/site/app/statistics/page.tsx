"use client"

import { Card, CardContent } from "@/components/ui/card"
import SectionHeader from "@/components/section-header"
import AnimatedCounter from "@/components/animated-counter"
import {
  Users,
  TrendingUp,
  Heart,
  Target,
  Building2,
  GraduationCap,
  Droplets,
  Home,
  Stethoscope,
  Briefcase,
  Baby,
  Landmark,
} from "lucide-react"

const keyStats = [
  { icon: Users, end: 12, suffix: "M+", label: "Bénéficiaires directs", color: "from-green-500 to-emerald-600" },
  { icon: Target, end: 10000, suffix: "+", label: "Projets réalisés", color: "from-blue-500 to-indigo-600" },
  { icon: TrendingUp, end: 43, suffix: "B DH", label: "Budget total investi", color: "from-amber-500 to-orange-600" },
  { icon: Heart, end: 1600, suffix: "+", label: "Associations partenaires", color: "from-rose-500 to-red-600" },
]

const phaseStats = [
  {
    phase: "Phase I (2005-2010)",
    budget: "10 Milliards DH",
    projects: "22 000+",
    beneficiaries: "5.2M",
    highlight: "403 communes rurales ciblées",
  },
  {
    phase: "Phase II (2011-2018)",
    budget: "17 Milliards DH",
    projects: "35 000+",
    beneficiaries: "8.5M",
    highlight: "Extension à tout le territoire",
  },
  {
    phase: "Phase III (2019-2023)",
    budget: "18 Milliards DH",
    projects: "12 000+",
    beneficiaries: "10M+",
    highlight: "Focus sur le capital humain",
  },
]

const sectorStats = [
  { icon: GraduationCap, label: "Éducation", value: "3 200+", desc: "écoles construites/réhabilitées", color: "bg-blue-50 text-blue-700" },
  { icon: Stethoscope, label: "Santé", value: "1 800+", desc: "centres de santé équipés", color: "bg-red-50 text-red-700" },
  { icon: Droplets, label: "Eau potable", value: "6 500+", desc: "km de réseau d'eau", color: "bg-cyan-50 text-cyan-700" },
  { icon: Home, label: "Habitat", value: "45 000+", desc: "logements sociaux", color: "bg-purple-50 text-purple-700" },
  { icon: Briefcase, label: "AGR", value: "8 400+", desc: "activités financées", color: "bg-amber-50 text-amber-700" },
  { icon: Baby, label: "Petite enfance", value: "2 100+", desc: "unités de préscolaire", color: "bg-pink-50 text-pink-700" },
  { icon: Building2, label: "Routes rurales", value: "12 000+", desc: "km construits", color: "bg-green-50 text-green-700" },
  { icon: Landmark, label: "Culture", value: "850+", desc: "maisons de culture", color: "bg-indigo-50 text-indigo-700" },
]

const regionStats = [
  { region: "Casablanca-Settat", projects: 1450, budget: "5.2B DH" },
  { region: "Rabat-Salé-Kénitra", projects: 1280, budget: "4.8B DH" },
  { region: "Marrakech-Safi", projects: 1350, budget: "5.0B DH" },
  { region: "Fès-Meknès", projects: 980, budget: "3.6B DH" },
  { region: "Souss-Massa", projects: 890, budget: "3.2B DH" },
  { region: "Tanger-Tétouan-Al Hoceïma", projects: 920, budget: "3.4B DH" },
  { region: "Oriental", projects: 750, budget: "2.8B DH" },
  { region: "Béni Mellal-Khénifra", projects: 680, budget: "2.5B DH" },
  { region: "Drâa-Tafilalet", projects: 620, budget: "2.3B DH" },
  { region: "Guelmim-Oued Noun", projects: 340, budget: "1.2B DH" },
  { region: "Laâyoune-Sakia El Hamra", projects: 280, budget: "1.0B DH" },
  { region: "Dakhla-Oued Ed Dahab", projects: 180, budget: "0.8B DH" },
]

export default function StatisticsPage() {
  const maxProjects = Math.max(...regionStats.map((r) => r.projects))

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============== HERO ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute inset-0 moroccan-pattern" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            📊 Impact mesurable
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Statistiques & Impact
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            20 ans de données au service du développement humain au Maroc.
          </p>
        </div>
      </section>

      {/* ============== KEY STATS ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 rounded-3xl p-10 md:p-16 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 moroccan-pattern" />
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-white">
              {keyStats.map((stat, i) => (
                <AnimatedCounter
                  key={i}
                  end={stat.end}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={<stat.icon className="h-6 w-6 text-emerald-300" />}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== PHASE COMPARISON ============== */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Évolution"
            title="Comparaison des 3 phases"
            description="L'évolution du budget, des projets et des bénéficiaires à travers les 3 phases de l'INDH."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {phaseStats.map((phase, index) => (
              <Card key={index} className="card-hover border-0 shadow-md overflow-hidden bg-white">
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-8 text-center">
                  <h3 className="text-sm font-heading font-bold text-green-700 mb-6 px-3 py-1.5 rounded-full bg-green-50 inline-block">
                    {phase.phase}
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <p className="text-3xl font-heading font-bold text-gray-900">{phase.budget}</p>
                      <p className="text-xs text-gray-500 mt-1">Budget alloué</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xl font-heading font-bold text-gray-900">{phase.projects}</p>
                        <p className="text-xs text-gray-500">Projets</p>
                      </div>
                      <div>
                        <p className="text-xl font-heading font-bold text-gray-900">{phase.beneficiaries}</p>
                        <p className="text-xs text-gray-500">Bénéficiaires</p>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <p className="text-xs text-gray-500 italic">{phase.highlight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============== SECTOR BREAKDOWN ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Par Secteur"
            title="Répartition sectorielle"
            description="L'impact de l'INDH ventilé par secteur d'intervention."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectorStats.map((sector, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl ${sector.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <sector.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{sector.label}</p>
                  <p className="text-xl font-heading font-bold text-gray-900">{sector.value}</p>
                  <p className="text-xs text-gray-500">{sector.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== REGIONAL BREAKDOWN ============== */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Par Région"
            title="Répartition régionale"
            description="Le nombre de projets INDH réalisés dans chaque région du Maroc."
          />

          <div className="max-w-4xl mx-auto space-y-3">
            {regionStats.map((region, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-heading font-semibold text-gray-900">{region.region}</h4>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{region.projects} projets</span>
                    <span className="text-green-700 font-semibold">{region.budget}</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000"
                    style={{ width: `${(region.projects / maxProjects) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
