interface HomeSectionProps {
  language: 'es' | 'en'
  onNavigate: (section: string) => void
}

export default function HomeSection({ language, onNavigate }: HomeSectionProps) {
  const translations = {
    es: {
      title: "Pensiones hechas simples",
      description: "Un sistema de pensiones descentralizado, simple y no expropiable",
      cta: "Planifica tu Retiro"
    },
    en: {
      title: "Pensions made simple",
      description: "A descentralized, simple and non-expropiable pension system",
      cta: "Plan Your Retirement"
    }
  }

  const t = translations[language]

  return (
    <div className="flex-1 relative overflow-hidden bg-white">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-full p-8 text-center">
        {/* Main heading */}
        <h1 className="text-6xl font-bold text-gray-900 mb-6 max-w-4xl">
          {t.title}
        </h1>

        <p className="text-lg text-gray-600 mb-12 max-w-2xl">
          {t.description}
        </p>

        {/* CTA Button - Now functional! */}
        <button
          onClick={() => onNavigate('retire')}
          className="bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a] px-8 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-lg hover:shadow-[#27F5A9]/30"
        >
          {t.cta}
        </button>
      </div>
    </div>
  )
}