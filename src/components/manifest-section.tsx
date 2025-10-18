interface ManifestSectionProps {
  language: 'es' | 'en'
}

export default function ManifestSection({ language }: ManifestSectionProps) {
  const content = {
    es: {
      title: "Manifiesto PensionFi",
      subtitle: "Descubre la visión completa del proyecto",
      description: "El manifiesto de PensionFi detalla nuestra misión de revolucionar el sistema de pensiones mediante tecnología blockchain. En este documento encontrarás:",
      points: [
        "La problemática actual de los sistemas de pensiones tradicionales",
        "Nuestra propuesta de solución descentralizada y transparente",
        "Los principios fundamentales que guían el desarrollo del proyecto",
        "La arquitectura técnica y el modelo económico sostenible",
        "El roadmap y la visión a largo plazo para el futuro de las pensiones"
      ],
      callToAction: "Este documento es esencial para comprender la profundidad y el alcance de PensionFi. Te invitamos a descargarlo y conocer cómo estamos construyendo un futuro financiero más justo y accesible para todos.",
      buttonText: "Descargar Manifiesto"
    },
    en: {
      title: "PensionFi Manifesto",
      subtitle: "Discover the complete vision of the project",
      description: "The PensionFi manifesto details our mission to revolutionize the pension system through blockchain technology. In this document you will find:",
      points: [
        "The current problems with traditional pension systems",
        "Our decentralized and transparent solution proposal",
        "The fundamental principles guiding the project development",
        "The technical architecture and sustainable economic model",
        "The roadmap and long-term vision for the future of pensions"
      ],
      callToAction: "This document is essential to understand the depth and scope of PensionFi. We invite you to download it and learn how we are building a fairer and more accessible financial future for everyone.",
      buttonText: "Download Manifesto"
    }
  }

  const t = content[language]

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/PENSIONFI MANIFIESTO.pdf'
    link.download = 'PENSIONFI_MANIFIESTO.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-10 mb-8 border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {t.description}
          </p>

          {/* Key Points */}
          <ul className="space-y-4 mb-10">
            {t.points.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-[#27F5A9] rounded-lg flex items-center justify-center text-[#1a1a1a] font-bold mr-4 mt-1">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-lg leading-relaxed pt-1">
                  {point}
                </span>
              </li>
            ))}
          </ul>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#27F5A9]/10 to-[#20E096]/10 rounded-xl p-8 border-l-4 border-[#27F5A9]">
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              {t.callToAction}
            </p>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#27F5A9] to-[#20E096] text-[#1a1a1a] font-bold text-lg rounded-xl hover:shadow-xl hover:shadow-[#27F5A9]/30 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {t.buttonText}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>PDF Document - Available for download</p>
        </div>
      </div>
    </div>
  )
}
