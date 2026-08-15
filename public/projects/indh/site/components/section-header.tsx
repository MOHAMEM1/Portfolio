"use client"

import { useEffect, useRef, useState } from "react"

interface SectionHeaderProps {
  badge?: string
  title: string
  description?: string
  align?: "left" | "center"
  light?: boolean
}

export default function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`mb-12 md:mb-16 ${align === "center" ? "text-center" : "text-left"} ${
        isVisible ? "animate-fade-in-up" : "opacity-0"
      }`}
    >
      {badge && (
        <span
          className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${
            light
              ? "bg-white/10 text-white/80 border border-white/20"
              : "bg-green-50 text-green-700 border border-green-100"
          }`}
        >
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 ${
          light ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-lg max-w-3xl leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-white/70" : "text-gray-500"}`}
        >
          {description}
        </p>
      )}
      {/* Decorative line */}
      <div
        className={`mt-6 flex items-center gap-2 ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <span className="w-8 h-1 rounded-full bg-green-600" />
        <span className="w-3 h-1 rounded-full bg-emerald-400" />
        <span className="w-1.5 h-1 rounded-full bg-green-300" />
      </div>
    </div>
  )
}
