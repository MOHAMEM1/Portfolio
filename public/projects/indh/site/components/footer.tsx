import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Heart, ExternalLink } from "lucide-react"

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600" />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-heading font-bold text-lg">I</span>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold">INDH</h3>
                <p className="text-xs text-gray-400">Développement Humain</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Initiative Nationale pour le Développement Humain, lancée en 2005 par Sa Majesté le Roi
              Mohammed VI. 20 ans d&apos;engagement pour un Maroc solidaire.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { icon: Youtube, href: "https://youtube.com", label: "Youtube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-green-600/20 border border-white/10 hover:border-green-500/30 flex items-center justify-center transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon size={16} className="text-gray-400 group-hover:text-green-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-heading font-semibold uppercase tracking-wider text-gray-300 mb-6">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Accueil" },
                { href: "/about", label: "Qui Sommes-Nous" },
                { href: "/projects", label: "Carte des Projets" },
                { href: "/statistics", label: "Statistiques" },
                { href: "/submit", label: "Soumettre une Idée" },
                { href: "/documents", label: "Documents & Conditions" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-green-500 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-sm font-heading font-semibold uppercase tracking-wider text-gray-300 mb-6">
              Programmes
            </h3>
            <ul className="space-y-3">
              {[
                "Inclusion Sociale",
                "Activités Génératrices de Revenus",
                "Éducation & Santé",
                "Infrastructure Rurale",
                "Capital Humain",
                "Accompagnement des Jeunes",
              ].map((program) => (
                <li key={program}>
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    {program}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-heading font-semibold uppercase tracking-wider text-gray-300 mb-6">
              Contact
            </h3>
            <address className="not-italic space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avenue Al Araar, Hay Riad</p>
                  <p className="text-sm text-gray-400">Rabat, Maroc</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-green-400" />
                </div>
                <a href="mailto:contact@indh.ma" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                  contact@indh.ma
                </a>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-green-400" />
                </div>
                <a href="tel:+212537000000" className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                  +212 537 XX XX XX
                </a>
              </div>
            </address>

            {/* Official Website Link */}
            <a
              href="https://www.indh.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-green-600/10 border border-white/10 hover:border-green-500/20 text-sm text-gray-300 hover:text-green-400 transition-all duration-300"
            >
              <ExternalLink size={14} />
              Site officiel INDH
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Initiative Nationale pour le Développement Humain. Tous droits
              réservés.
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              Développé avec <Heart size={14} className="text-red-500 fill-red-500" /> par{" "}
              <span className="text-green-400 font-medium">Groupe IMPACT</span>
              {" "}&middot;{" "}
              <span className="text-gray-600">Formation Web4Jobs</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
