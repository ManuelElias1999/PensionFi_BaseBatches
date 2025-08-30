import { useState } from "react"
import { ChevronRight, Book, History, Map, Info, BarChart3, Wrench, Library } from 'lucide-react'

interface LearnSectionProps {
  language: 'es' | 'en'
}

export default function LearnSection({ language }: LearnSectionProps) {
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null)

  const translations = {
    es: {
      title: "Centro de Aprendizaje",
      subsections: {
        manifesto: "Manifiesto",
        history: "Historia", 
        roadmap: "Roadmap",
        about: "Acerca de",
        stats: "Stats",
        tools: "Herramientas Gratuitas",
        library: "Biblioteca Previsional"
      },
      content: {
        manifesto: "Nuestro manifiesto para revolucionar el sistema de pensiones...",
        history: "La historia de cómo nació este proyecto...",
        roadmap: "Nuestro plan para el futuro del sistema previsional...",
        about: "Conoce más sobre nuestro equipo y misión...",
        stats: "Estadísticas del proyecto y el ecosistema...",
        tools: "Herramientas gratuitas para planificar tu jubilación...",
        library: "Biblioteca completa de recursos sobre pensiones..."
      }
    },
    en: {
      title: "Learning Center",
      subsections: {
        manifesto: "Manifesto",
        history: "History",
        roadmap: "Roadmap", 
        about: "About",
        stats: "Stats",
        tools: "Free Tools",
        library: "Pension Library"
      },
      content: {
        manifesto: "Our manifesto to revolutionize the pension system...",
        history: "The story of how this project was born...",
        roadmap: "Our plan for the future of the pension system...",
        about: "Learn more about our team and mission...",
        stats: "Project and ecosystem statistics...",
        tools: "Free tools to plan your retirement...",
        library: "Complete library of pension resources..."
      }
    }
  }

  const t = translations[language]

  const subsections = [
    { key: 'manifesto', icon: Book },
    { key: 'history', icon: History },
    { key: 'roadmap', icon: Map },
    { key: 'about', icon: Info },
    { key: 'stats', icon: BarChart3 },
    { key: 'tools', icon: Wrench },
    { key: 'library', icon: Library }
  ]

  return (
    <div className="flex-1 bg-white/90 backdrop-blur-sm m-6 rounded-lg shadow-lg overflow-hidden">
      <div className="flex h-full">
        {/* Subsections Menu */}
        <div className="w-80 border-r border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.title}</h2>
          <nav className="space-y-2">
            {subsections.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSubsection(key)}
                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                  activeSubsection === key
                    ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-medium">{t.subsections[key as keyof typeof t.subsections]}</span>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {activeSubsection ? (
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {t.subsections[activeSubsection as keyof typeof t.subsections]}
              </h3>
              <div className="prose max-w-none">
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t.content[activeSubsection as keyof typeof t.content]}
                </p>
                {/* Placeholder content */}
                <div className="mt-8 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Book size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Selecciona una sección para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
