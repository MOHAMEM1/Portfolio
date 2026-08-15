"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Users, Calendar, X, LayoutGrid, List, Building2, Filter } from "lucide-react"
import SectionHeader from "@/components/section-header"
import AnimatedCounter from "@/components/animated-counter"
import MoroccoMap from "@/components/morocco-map"

const PROJECTS = [
  {
    id: 1,
    title: "Coopérative agricole de Taliouine",
    type: "agriculture",
    region: "Souss-Massa",
    description:
      "Soutien à la production et commercialisation du safran par les femmes de la région. Création d'une unité de conditionnement moderne.",
    beneficiaries: 120,
    date: "2022",
    image: "/zaefrane.jpg",
    budget: "450 000 DH",
  },
  {
    id: 2,
    title: "Centre de formation artisanale",
    type: "artisanat",
    region: "Marrakech-Safi",
    description:
      "Formation des jeunes aux métiers de l'artisanat traditionnel marocain : tapis, poterie, zellij, bois.",
    beneficiaries: 85,
    date: "2021",
    image: "/Centre_formation_artisanale.jpg",
    budget: "680 000 DH",
  },
  {
    id: 3,
    title: "Unité de valorisation des déchets",
    type: "environnement",
    region: "Rabat-Salé-Kénitra",
    description:
      "Création d'une unité de recyclage et valorisation des déchets plastiques, créant des emplois verts.",
    beneficiaries: 45,
    date: "2023",
    image: "/dechets.jpg",
    budget: "320 000 DH",
  },
  {
    id: 4,
    title: "Centre d'alphabétisation",
    type: "education",
    region: "Oriental",
    description:
      "Centre d'alphabétisation et d'éducation non formelle pour les femmes rurales, avec garderie intégrée.",
    beneficiaries: 200,
    date: "2020",
    image: "/centre_alpha.png",
    budget: "250 000 DH",
  },
  {
    id: 5,
    title: "Unité de production de miel",
    type: "agriculture",
    region: "Fès-Meknès",
    description:
      "Soutien aux apiculteurs locaux pour la production et commercialisation du miel de qualité certifié.",
    beneficiaries: 60,
    date: "2022",
    image: "/miel1.jpg",
    budget: "180 000 DH",
  },
  {
    id: 6,
    title: "Centre de santé communautaire",
    type: "sante",
    region: "Casablanca-Settat",
    description:
      "Réhabilitation et équipement d'un centre de santé dans une zone défavorisée, avec service de maternité.",
    beneficiaries: 1500,
    date: "2021",
    image: "/santé.jpg",
    budget: "1 200 000 DH",
  },
]

const regions = [
  "Casablanca-Settat",
  "Rabat-Salé-Kénitra",
  "Marrakech-Safi",
  "Souss-Massa",
  "Fès-Meknès",
  "Oriental",
  "Tanger-Tétouan-Al Hoceïma",
  "Béni Mellal-Khénifra",
  "Drâa-Tafilalet",
  "Guelmim-Oued Noun",
  "Laâyoune-Sakia El Hamra",
  "Dakhla-Oued Ed Dahab",
]

const projectTypes = [
  { value: "agriculture", label: "Agriculture" },
  { value: "artisanat", label: "Artisanat" },
  { value: "education", label: "Éducation" },
  { value: "sante", label: "Santé" },
  { value: "environnement", label: "Environnement" },
]

const typeColors: Record<string, string> = {
  agriculture: "bg-green-100 text-green-700",
  artisanat: "bg-amber-100 text-amber-700",
  education: "bg-blue-100 text-blue-700",
  sante: "bg-red-100 text-red-700",
  environnement: "bg-teal-100 text-teal-700",
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion =
        selectedRegion === "all" || project.region === selectedRegion
      const matchesType =
        selectedType === "all" || project.type === selectedType
      return matchesSearch && matchesRegion && matchesType
    })
  }, [searchTerm, selectedRegion, selectedType])

  // Build region counts for the map
  const regionData = useMemo(() => {
    const counts: Record<string, number> = {}
    PROJECTS.forEach((p) => {
      counts[p.region] = (counts[p.region] || 0) + 1
    })
    return counts
  }, [])

  const activeFilters = [
    selectedRegion !== "all" && selectedRegion,
    selectedType !== "all" && selectedType,
    searchTerm,
  ].filter(Boolean)

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedRegion("all")
    setSelectedType("all")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ============== HERO ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute inset-0 moroccan-pattern" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            Explorez l&apos;impact
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Carte des Projets
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Découvrez les projets soutenus par l&apos;INDH à travers tout le Maroc.
          </p>
        </div>
      </section>

      {/* ============== MAP + FILTERS ============== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Map */}
            <div>
              <h3 className="text-lg font-heading font-bold mb-4 text-gray-900">
                Carte interactive
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Cliquez sur une région pour filtrer les projets.
              </p>
              <MoroccoMap
                onRegionSelect={setSelectedRegion}
                selectedRegion={selectedRegion}
                regionData={regionData}
              />
            </div>

            {/* Filters */}
            <div>
              <h3 className="text-lg font-heading font-bold mb-4 text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5 text-green-600" />
                Filtrer les projets
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un projet..."
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-green-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Région" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active filters */}
                {activeFilters.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Filtres actifs :</span>
                    {activeFilters.map((filter) => (
                      <span
                        key={String(filter)}
                        className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100"
                      >
                        {filter}
                      </span>
                    ))}
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Tout effacer
                    </button>
                  </div>
                )}

                {/* Results summary */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{filteredProjects.length}</span>{" "}
                    projet{filteredProjects.length !== 1 ? "s" : ""} trouvé
                    {filteredProjects.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === "grid" ? "bg-white shadow-sm text-green-700" : "text-gray-400"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === "list" ? "bg-white shadow-sm text-green-700" : "text-gray-400"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PROJECTS LIST ============== */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-700 mb-2">
                Aucun projet trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                Modifiez vos critères de recherche pour trouver des projets.
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-xl">
                Réinitialiser les filtres
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="group card-hover overflow-hidden border-0 shadow-md bg-white"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          typeColors[project.type] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {project.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {project.region}
                      </span>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading group-hover:text-green-700 transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-gray-400 pt-0 pb-5 px-6 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 pt-3">
                      <Users className="h-3.5 w-3.5" />
                      <span>{project.beneficiaries} bénéficiaires</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-3">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{project.date}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            typeColors[project.type] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {project.type}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {project.region}
                        </span>
                      </div>
                      <h3 className="text-lg font-heading font-bold mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {project.beneficiaries} bénéficiaires
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {project.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {project.budget}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============== STATS ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Impact Mesurable"
            title="Les chiffres de l'INDH"
          />
          <div className="relative bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 rounded-3xl p-10 md:p-14 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 moroccan-pattern" />
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 text-white">
              <AnimatedCounter end={12} suffix="M+" label="Bénéficiaires" />
              <AnimatedCounter end={10000} suffix="+" label="Projets réalisés" />
              <AnimatedCounter end={43} suffix="B DH" label="Budget investi" />
              <AnimatedCounter end={1600} suffix="+" label="Associations" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
