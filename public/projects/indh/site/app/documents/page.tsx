"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import SectionHeader from "@/components/section-header"
import {
  FileText,
  Download,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  BookOpen,
  ClipboardList,
  FileCheck,
  Users,
  ArrowRight,
} from "lucide-react"

const documents = [
  {
    title: "Formulaire de demande",
    description: "Formulaire officiel de demande de financement INDH à remplir et signer.",
    icon: ClipboardList,
    type: "PDF",
    size: "245 KB",
    color: "from-red-500 to-rose-600",
  },
  {
    title: "Plan d'affaires",
    description: "Modèle de business plan pour les projets générateurs de revenus.",
    icon: FileSpreadsheet,
    type: "XLSX",
    size: "180 KB",
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Étude de faisabilité",
    description: "Modèle d'étude de faisabilité technique et financière du projet.",
    icon: FileCheck,
    type: "DOCX",
    size: "320 KB",
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Statuts d'association",
    description: "Modèle de statuts pour la création d'une association loi 1958.",
    icon: FileText,
    type: "PDF",
    size: "150 KB",
    color: "from-purple-500 to-violet-600",
  },
  {
    title: "Statuts de coopérative",
    description: "Modèle de statuts pour la création d'une coopérative selon la loi 112-12.",
    icon: Users,
    type: "PDF",
    size: "200 KB",
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Guide du porteur de projet",
    description: "Guide complet avec toutes les étapes pour monter votre dossier INDH.",
    icon: BookOpen,
    type: "PDF",
    size: "1.2 MB",
    color: "from-teal-500 to-cyan-600",
  },
]

const processSteps = [
  { step: "01", title: "Soumission", description: "Déposez votre dossier auprès du comité provincial INDH." },
  { step: "02", title: "Étude", description: "Le comité examine la conformité et la viabilité de votre projet." },
  { step: "03", title: "Sélection", description: "Les projets retenus sont présentés au comité de validation." },
  { step: "04", title: "Financement", description: "Déblocage des fonds et accompagnement du porteur de projet." },
  { step: "05", title: "Suivi", description: "Suivi de la réalisation et évaluation de l'impact du projet." },
]

const faqs = [
  {
    question: "Qui peut bénéficier des financements de l'INDH ?",
    answer: "Les associations, les coopératives, les jeunes entrepreneurs, les femmes en situation difficile, et les personnes à besoins spécifiques. Les projets doivent s'aligner avec les objectifs de l'INDH.",
  },
  {
    question: "Quel est le montant maximal de financement ?",
    answer: "Pour les AGR (Activités Génératrices de Revenus), le financement peut atteindre 300 000 DH. Pour les projets d'infrastructure, les montants sont variables selon l'envergure du projet.",
  },
  {
    question: "Combien de temps dure le processus de sélection ?",
    answer: "Le processus dure généralement entre 3 et 6 mois, de la soumission du dossier à la décision finale. Cette durée varie selon la complexité et le volume de demandes.",
  },
  {
    question: "Faut-il un apport personnel ?",
    answer: "Oui, pour les AGR, un apport personnel d'au moins 10% du coût total est requis. Cet apport peut être en nature (terrain, matériel) ou en numéraire.",
  },
  {
    question: "Comment suivre l'état de ma demande ?",
    answer: "Contactez le comité provincial de l'INDH de votre province avec votre numéro de référence attribué lors du dépôt de votre dossier.",
  },
  {
    question: "Les associations étrangères sont-elles éligibles ?",
    answer: "Les associations étrangères peuvent bénéficier des financements à condition d'être légalement reconnues au Maroc et que leurs projets bénéficient aux populations cibles.",
  },
]

export default function DocumentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ============== HERO ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute inset-0 moroccan-pattern" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            Ressources
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Documents & Conditions
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Tous les documents nécessaires pour soumettre votre projet à l&apos;INDH.
          </p>
        </div>
      </section>

      {/* ============== DOCUMENTS ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Téléchargements"
            title="Documents Requis"
            description="Téléchargez les formulaires et modèles nécessaires pour constituer votre dossier."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => (
              <Card key={index} className="card-hover border-0 shadow-md group bg-white overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                      <doc.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-heading">{doc.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">{doc.type}</span>
                        <span className="text-[10px] text-gray-400">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4">{doc.description}</CardDescription>
                  <Button variant="outline" className="w-full rounded-xl group-hover:bg-green-50 group-hover:text-green-700 group-hover:border-green-200 transition-colors">
                    <Download className="mr-2 h-4 w-4" /> Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============== PROCESS ============== */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="Processus"
            title="Comment ça marche ?"
            description="Les étapes clés du processus de soumission et de validation de votre projet."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {processSteps.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4 text-white font-heading font-bold">
                    {item.step}
                  </div>
                  <h4 className="text-sm font-heading font-bold mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              badge="FAQ"
              title="Questions Fréquentes"
            />

            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-gray-100 rounded-xl px-6 shadow-sm data-[state=open]:shadow-md transition-shadow bg-white"
                >
                  <AccordionTrigger className="text-left font-heading font-semibold text-sm hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============== CONDITIONS ============== */}
      <section className="py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <SectionHeader badge="Éligibilité" title="Conditions d'Éligibilité" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-heading">Critères d&apos;éligibilité</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Projet aligné avec les objectifs de l'INDH",
                    "Porteur légalement constitué (association, coopérative)",
                    "Projet bénéficiant aux populations cibles",
                    "Viabilité technique et financière démontrée",
                    "Apport personnel d'au moins 10% pour les AGR",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <CardTitle className="text-lg font-heading">Motifs de rejet</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Dossier incomplet ou informations erronées",
                    "Projet ne répondant pas aux objectifs de l'INDH",
                    "Manque de viabilité économique ou technique",
                    "Absence d'impact social ou environnemental",
                    "Financement précédent non remboursé",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-emerald-800" />
        <div className="absolute inset-0 moroccan-pattern" />
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <HelpCircle className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Besoin d&apos;aide supplémentaire ?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Notre équipe est disponible pour vous aider à préparer votre dossier.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-green-800 hover:bg-white/90 rounded-xl px-8 h-14 font-semibold">
              <Link href="/contact">Contacter un conseiller</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-14">
              <Link href="/submit">Soumettre mon projet</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
