"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle2,
  User,
  FileText,
  Send,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Upload,
} from "lucide-react"

const steps = [
  { id: 1, title: "Informations", icon: User },
  { id: 2, title: "Projet", icon: Briefcase },
  { id: 3, title: "Détails", icon: FileText },
  { id: 4, title: "Confirmation", icon: Send },
]

export default function SubmitPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    cin: "",
    city: "",
    region: "",
    projectTitle: "",
    projectType: "",
    description: "",
    beneficiaries: "",
    budget: "",
    duration: "",
    objectives: "",
    impact: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
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
            Participez au changement
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Soumettre une Idée de Projet
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Partagez votre idée et contribuez au développement de votre communauté.
          </p>
        </div>
      </section>

      {/* ============== FORM ============== */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {isSubmitted ? (
              /* ---- Success State ---- */
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-green-700 mb-3">
                    Votre idée a été soumise avec succès !
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Merci pour votre contribution. Notre équipe examinera votre proposition et vous
                    contactera prochainement par email ou téléphone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setCurrentStep(1)
                        setFormState({
                          name: "", email: "", phone: "", cin: "", city: "", region: "",
                          projectTitle: "", projectType: "", description: "", beneficiaries: "",
                          budget: "", duration: "", objectives: "", impact: "",
                        })
                      }}
                      className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl"
                    >
                      Soumettre une autre idée
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ---- Stepper ---- */}
                <div className="mb-10">
                  <div className="flex items-center justify-between relative">
                    {/* Progress bar background */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
                    <div
                      className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-500"
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => (
                      <div key={step.id} className="relative flex flex-col items-center z-10">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            currentStep >= step.id
                              ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-lg"
                              : "bg-white text-gray-400 border-2 border-gray-200"
                          }`}
                        >
                          {currentStep > step.id ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-xs font-medium ${
                            currentStep >= step.id ? "text-green-700" : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ---- Form Card ---- */}
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-green-600 to-emerald-500" />
                  <CardContent className="p-8 md:p-10">
                    <form onSubmit={handleSubmit}>
                      {/* Step 1: Personal Info */}
                      {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                          <div>
                            <h3 className="text-xl font-heading font-bold mb-1">Informations personnelles</h3>
                            <p className="text-sm text-gray-500">Remplissez vos coordonnées pour nous contacter.</p>
                          </div>
                          <div>
                            <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-green-600" /> Nom complet *
                            </Label>
                            <Input id="name" name="name" value={formState.name} onChange={handleChange} placeholder="Votre nom complet" required className="h-12 rounded-xl" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                                <Mail className="h-4 w-4 text-green-600" /> Email *
                              </Label>
                              <Input id="email" name="email" type="email" value={formState.email} onChange={handleChange} placeholder="votre@email.com" required className="h-12 rounded-xl" />
                            </div>
                            <div>
                              <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                                <Phone className="h-4 w-4 text-green-600" /> Téléphone *
                              </Label>
                              <Input id="phone" name="phone" value={formState.phone} onChange={handleChange} placeholder="06XXXXXXXX" required className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="cin" className="mb-2 block">CIN *</Label>
                              <Input id="cin" name="cin" value={formState.cin} onChange={handleChange} placeholder="XX000000" required className="h-12 rounded-xl" />
                            </div>
                            <div>
                              <Label htmlFor="city" className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-green-600" /> Ville *
                              </Label>
                              <Input id="city" name="city" value={formState.city} onChange={handleChange} placeholder="Votre ville" required className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="region" className="mb-2 block">Région *</Label>
                            <Select value={formState.region} onValueChange={(v) => handleSelectChange("region", v)}>
                              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Sélectionnez une région" /></SelectTrigger>
                              <SelectContent>
                                {["Casablanca-Settat","Rabat-Salé-Kénitra","Marrakech-Safi","Souss-Massa","Fès-Meknès","Oriental","Tanger-Tétouan-Al Hoceïma","Béni Mellal-Khénifra","Drâa-Tafilalet","Guelmim-Oued Noun","Laâyoune-Sakia El Hamra","Dakhla-Oued Ed Dahab"].map((r) => (
                                  <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Project Info */}
                      {currentStep === 2 && (
                        <div className="space-y-6 animate-fade-in-up">
                          <div>
                            <h3 className="text-xl font-heading font-bold mb-1">Détails du projet</h3>
                            <p className="text-sm text-gray-500">Décrivez votre idée de projet.</p>
                          </div>
                          <div>
                            <Label htmlFor="projectTitle" className="mb-2 block">Titre du projet *</Label>
                            <Input id="projectTitle" name="projectTitle" value={formState.projectTitle} onChange={handleChange} placeholder="Ex: Coopérative de production de miel" required className="h-12 rounded-xl" />
                          </div>
                          <div>
                            <Label htmlFor="projectType" className="mb-2 block">Type de projet *</Label>
                            <Select value={formState.projectType} onValueChange={(v) => handleSelectChange("projectType", v)}>
                              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                              <SelectContent>
                                {[{v:"agriculture",l:"Agriculture"},{v:"artisanat",l:"Artisanat"},{v:"commerce",l:"Commerce"},{v:"education",l:"Éducation"},{v:"sante",l:"Santé"},{v:"tourisme",l:"Tourisme"},{v:"environnement",l:"Environnement"},{v:"autre",l:"Autre"}].map((t) => (
                                  <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="description" className="mb-2 block">Description du projet *</Label>
                            <Textarea id="description" name="description" value={formState.description} onChange={handleChange} placeholder="Décrivez votre idée de projet en détail..." className="min-h-32 rounded-xl" required />
                          </div>
                          <div>
                            <Label htmlFor="objectives" className="mb-2 block">Objectifs du projet *</Label>
                            <Textarea id="objectives" name="objectives" value={formState.objectives} onChange={handleChange} placeholder="Quels sont les objectifs principaux ?" className="min-h-24 rounded-xl" required />
                          </div>
                        </div>
                      )}

                      {/* Step 3: Details */}
                      {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in-up">
                          <div>
                            <h3 className="text-xl font-heading font-bold mb-1">Budget et impact</h3>
                            <p className="text-sm text-gray-500">Précisez les aspects financiers et l&apos;impact attendu.</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="beneficiaries" className="mb-2 block">Nombre de bénéficiaires *</Label>
                              <Input id="beneficiaries" name="beneficiaries" type="number" value={formState.beneficiaries} onChange={handleChange} placeholder="Ex: 50" required className="h-12 rounded-xl" />
                            </div>
                            <div>
                              <Label htmlFor="budget" className="mb-2 block">Budget estimé (DH) *</Label>
                              <Input id="budget" name="budget" value={formState.budget} onChange={handleChange} placeholder="Ex: 200 000" required className="h-12 rounded-xl" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="duration" className="mb-2 block">Durée du projet *</Label>
                            <Select value={formState.duration} onValueChange={(v) => handleSelectChange("duration", v)}>
                              <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Sélectionnez une durée" /></SelectTrigger>
                              <SelectContent>
                                {["3 mois","6 mois","1 an","2 ans","3 ans","Plus de 3 ans"].map((d) => (
                                  <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="impact" className="mb-2 block">Impact attendu *</Label>
                            <Textarea id="impact" name="impact" value={formState.impact} onChange={handleChange} placeholder="Décrivez l'impact positif de votre projet sur la communauté..." className="min-h-24 rounded-xl" required />
                          </div>
                          <div>
                            <Label className="mb-2 block">Documents (optionnel)</Label>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-500 mb-1">Glissez vos fichiers ici ou cliquez pour parcourir</p>
                              <p className="text-xs text-gray-400">PDF, DOC, XLS — Max 10MB</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Confirmation */}
                      {currentStep === 4 && (
                        <div className="space-y-6 animate-fade-in-up">
                          <div>
                            <h3 className="text-xl font-heading font-bold mb-1">Récapitulatif</h3>
                            <p className="text-sm text-gray-500">Vérifiez vos informations avant de soumettre.</p>
                          </div>
                          <div className="space-y-4">
                            {[
                              { label: "Nom", value: formState.name },
                              { label: "Email", value: formState.email },
                              { label: "Téléphone", value: formState.phone },
                              { label: "Ville", value: formState.city },
                              { label: "Région", value: formState.region },
                              { label: "Titre du projet", value: formState.projectTitle },
                              { label: "Type", value: formState.projectType },
                              { label: "Bénéficiaires", value: formState.beneficiaries },
                              { label: "Budget", value: formState.budget ? `${formState.budget} DH` : "" },
                              { label: "Durée", value: formState.duration },
                            ]
                              .filter((item) => item.value)
                              .map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                  <span className="text-sm text-gray-500">{item.label}</span>
                                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                                </div>
                              ))}
                          </div>
                          {formState.description && (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
                              <p className="text-sm text-gray-700">{formState.description}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                        {currentStep > 1 ? (
                          <Button type="button" variant="outline" onClick={prevStep} className="rounded-xl px-6 h-12">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
                          </Button>
                        ) : (
                          <div />
                        )}

                        {currentStep < 4 ? (
                          <Button type="button" onClick={nextStep} className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl px-6 h-12">
                            Suivant <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button type="submit" className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl px-8 h-12">
                            <Send className="h-4 w-4 mr-2" /> Soumettre mon projet
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============== TIPS ============== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">
            Conseils pour votre proposition
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Soyez précis", desc: "Décrivez clairement votre idée, ses objectifs et son impact." },
              { title: "Identifiez les bénéficiaires", desc: "Précisez qui bénéficiera de votre projet." },
              { title: "Pensez durabilité", desc: "Expliquez comment votre projet se maintiendra à long terme." },
              { title: "Restez joignable", desc: "Assurez-vous que vos coordonnées sont correctes." },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-green-50/50 border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold mb-0.5">{tip.title}</h4>
                  <p className="text-xs text-gray-500">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
