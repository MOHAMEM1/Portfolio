"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Facebook,
  Instagram,
  Twitter,
  Globe,
} from "lucide-react"
import SectionHeader from "@/components/section-header"

const contactInfo = [
  {
    icon: MapPin,
    title: "Adresse",
    details: ["Avenue Al Araar, Hay Riad", "Rabat, Maroc"],
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: Phone,
    title: "Téléphone",
    details: ["+212 537 XX XX XX", "+212 537 XX XX XX"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["contact@indh.ma", "info@indh.ma"],
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Clock,
    title: "Horaires",
    details: ["Lundi - Vendredi: 8h30 - 16h30", "Samedi - Dimanche: Fermé"],
    color: "from-purple-500 to-violet-600",
  },
]

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

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
            Nous sommes à votre écoute
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
            Contactez-nous
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Notre équipe est disponible pour répondre à toutes vos questions sur l&apos;INDH et ses programmes.
          </p>
        </div>
      </section>

      {/* ============== CONTACT INFO ============== */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <Card key={index} className="card-hover border-0 shadow-md bg-white text-center group">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <info.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-base font-heading font-bold mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-gray-500">{detail}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ============== FORM + MAP ============== */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <SectionHeader
                badge="Formulaire"
                title="Envoyez-nous un message"
                align="left"
              />

              {isSubmitted ? (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <CardContent className="p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-green-700 mb-2">
                      Message envoyé !
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setForm({ name: "", email: "", phone: "", subject: "", message: "" })
                      }}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Envoyer un autre message
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-green-600 to-emerald-500" />
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="mb-2 block text-sm">Nom complet *</Label>
                          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom" required className="h-12 rounded-xl" />
                        </div>
                        <div>
                          <Label htmlFor="email" className="mb-2 block text-sm">Email *</Label>
                          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" required className="h-12 rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="mb-2 block text-sm">Téléphone</Label>
                          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="06XXXXXXXX" className="h-12 rounded-xl" />
                        </div>
                        <div>
                          <Label htmlFor="subject" className="mb-2 block text-sm">Sujet *</Label>
                          <Input id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Sujet de votre message" required className="h-12 rounded-xl" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="message" className="mb-2 block text-sm">Message *</Label>
                        <Textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Votre message..." className="min-h-32 rounded-xl" required />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-green-700 to-emerald-600 rounded-xl h-12 text-base">
                        <Send className="h-4 w-4 mr-2" /> Envoyer le message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Map / Info */}
            <div>
              <SectionHeader
                badge="Localisation"
                title="Nous trouver"
                align="left"
              />

              {/* Map placeholder with real styling */}
              <div className="relative h-80 rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-3 shadow-lg pulse-glow">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-heading font-bold text-gray-700">Siège de l&apos;INDH</p>
                    <p className="text-xs text-gray-500">Hay Riad, Rabat</p>
                  </div>
                </div>
                {/* Decorative grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </div>

              {/* Social links */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h4 className="text-sm font-heading font-bold mb-4">Suivez-nous</h4>
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, label: "Facebook", href: "#", color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" },
                    { icon: Twitter, label: "Twitter", href: "#", color: "hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200" },
                    { icon: Instagram, label: "Instagram", href: "#", color: "hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200" },
                    { icon: Globe, label: "Site officiel", href: "https://www.indh.ma", color: "hover:bg-green-50 hover:text-green-600 hover:border-green-200" },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}
                      aria-label={social.label}
                    >
                      <social.icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
