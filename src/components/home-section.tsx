interface HomeSectionProps {
  language: 'es' | 'en'
}

export default function HomeSection({ language }: HomeSectionProps) {
  const translations = {
    es: {
      title: "Pensiones hechas simples",
      description: "Un sistema de pensiones descentralizado, simple y no expropiable",
      cta: "Jubílate hoy"
    },
    en: {
      title: "Pensions made simple",
      description: "A descentralized, simple and non-expropiable pension system",
      cta: "Retire today"
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

        {/* CTA Button */}
        <button 
          className="bg-[#27F5A9] hover:bg-[#20e094] text-white px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:shadow-lg"
        >
          {t.cta}
        </button>
      </div>
    </div>
  )
}