"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronRight } from "lucide-react"
import Image from "next/image"

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/about", label: "Qui Sommes-Nous" },
  { href: "/projects", label: "Projets" },
  { href: "/statistics", label: "Statistiques" },
  { href: "/documents", label: "Documents" },
  { href: "/contact", label: "Contact" },
]

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-green-100/50"
          : "bg-white/95 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container mx-auto flex h-18 items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <Image src="/logo.jpg" alt="INDH Logo" fill className="object-contain" priority />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-bold text-gradient-green leading-tight">
              INDH
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-tight tracking-wider uppercase">
              Développement Humain
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isActive(link.href)
                  ? "text-green-700 bg-green-50"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <Button
            asChild
            className="bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6"
          >
            <Link href="/submit" className="flex items-center gap-2">
              Proposer un Projet
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-xl hover:bg-green-50"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          <div className="relative w-6 h-6">
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMenuOpen ? "top-3 rotate-45" : "top-1"
              }`}
            />
            <span
              className={`absolute left-0 top-3 block h-0.5 w-6 bg-current transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-6 bg-current transform transition-all duration-300 ${
                isMenuOpen ? "top-3 -rotate-45" : "top-5"
              }`}
            />
          </div>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-green-100 bg-white/95 backdrop-blur-xl p-4 space-y-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? "text-green-700 bg-green-50"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50/50"
              }`}
              onClick={toggleMenu}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.label}
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
          ))}
          <div className="pt-3">
            <Button
              asChild
              className="w-full bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white rounded-xl"
            >
              <Link href="/submit" onClick={toggleMenu}>
                Proposer un Projet
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
