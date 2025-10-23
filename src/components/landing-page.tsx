import { useState } from 'react'
import { Calculator, ArrowRight } from 'lucide-react'

interface LandingPageProps {
  onEnterApp: () => void
  language: 'es' | 'en'
}

export default function LandingPage({ onEnterApp, language }: LandingPageProps) {
  const [calcMonthly, setCalcMonthly] = useState<string>("1000")
  const [calcMonths, setCalcMonths] = useState<number>(12)

  const translations = {
    es: {
      hero: {
        titlePart1: "Asegura Tu Futuro",
        titlePart2: " El Sistema de Pensiones No Expropiable",
        subtitle: "Un camino descentralizado, transparente y simple hacia la seguridad en el retiro, impulsado por tecnología Web3 de vanguardia.",
        cta: "Comenzar Ahora",
        trust: "Asegurado por Contratos Inteligentes"
      },
      calculator: {
        title: "Calcula Tu Pensión",
        monthly: "Pensión mensual deseada",
        duration: "Duración (meses)",
        deposit: "Necesitas depositar",
        receive: "Recibirás en total",
        cta: "Crear Mi Plan"
      },
      howItWorks: {
        title: "Cómo Funciona",
        subtitle: "Simple y transparente en 3 pasos",
        step1: {
          title: "Conecta Tu Wallet",
          description: "Conecta tu billetera Web3 en segundos. Sin registro, sin KYC."
        },
        step2: {
          title: "Deposita Tu Capital",
          description: "Deposita USDC una sola vez. El contrato guarda tus fondos de forma segura."
        },
        step3: {
          title: "Recibe Pagos Automáticos",
          description: "Chainlink Automation procesa tus pagos mensuales automáticamente."
        },
        time: "Todo el proceso toma menos de 5 minutos"
      },
      pillars: {
        title: "¿Por Qué PensionFi? El Poder de la Descentralización",
        security: {
          title: "Seguridad Descentralizada",
          description: "Protección blockchain y activos no expropiables. Tu pensión está bajo tu control total."
        },
        transparency: {
          title: "Transparencia Total",
          description: "Contratos inteligentes de código abierto y seguimiento en tiempo real de tus contribuciones."
        },
        accessibility: {
          title: "Accesibilidad Simple",
          description: "Interfaz amigable y contribuciones de bajo costo. Pensiones al alcance de todos."
        }
      },
      conversion: {
        title: "¿Listo para Construir Tu Futuro?",
        description: "Solo toma unos minutos conectar tu billetera, explorar los planes disponibles y dar el primer paso hacia un retiro seguro y descentralizado.",
        cta: "Conectar Billetera",
        secondary: "Leer Nuestro Whitepaper"
      },
      footer: {
        terms: "Términos de Servicio",
        privacy: "Política de Privacidad"
      }
    },
    en: {
      hero: {
        titlePart1: "Secure Your Future:",
        titlePart2: " The Non-Expropriable Pension System",
        subtitle: "A decentralized, transparent, and simple path to retirement security, powered by cutting-edge Web3 technology.",
        cta: "Get Started",
        trust: "Secured by Audited Smart Contracts"
      },
      calculator: {
        title: "Calculate Your Pension",
        monthly: "Desired monthly pension",
        duration: "Duration (months)",
        deposit: "You need to deposit",
        receive: "You'll receive in total",
        cta: "Create My Plan"
      },
      howItWorks: {
        title: "How It Works",
        subtitle: "Simple and transparent in 3 steps",
        step1: {
          title: "Connect Your Wallet",
          description: "Connect your Web3 wallet in seconds. No signup, no KYC."
        },
        step2: {
          title: "Deposit Your Capital",
          description: "Deposit USDC once. The contract keeps your funds securely."
        },
        step3: {
          title: "Receive Automatic Payments",
          description: "Chainlink Automation processes your monthly payments automatically."
        },
        time: "The entire process takes less than 5 minutes"
      },
      pillars: {
        title: "Why PensionFi? The Power of Decentralization",
        security: {
          title: "Decentralized Security",
          description: "Blockchain protection and non-expropriable assets. Your pension is under your complete control."
        },
        transparency: {
          title: "Full Transparency",
          description: "Open-source smart contracts and real-time tracking of your contributions."
        },
        accessibility: {
          title: "Simple Accessibility",
          description: "User-friendly interface and low-cost contributions. Pensions accessible to everyone."
        }
      },
      conversion: {
        title: "Ready to Build Your Future?",
        description: "It only takes a few minutes to connect your wallet, explore available plans, and take the first step toward secure, decentralized retirement.",
        cta: "Connect Wallet",
        secondary: "Read Our Whitepaper"
      },
      footer: {
        terms: "Terms of Service",
        privacy: "Privacy Policy"
      }
    }
  }

  const t = translations[language]

  // Calculate deposit based on contract logic
  const calculateDeposit = (monthly: number, months: number): number => {
    const totalToReceive = monthly * months
    const totalWithFee = (totalToReceive * 100) / 110 // 10% fee
    return Math.floor(totalWithFee / 100) * 100 // Truncate to 2 decimals
  }

  const monthlyAmount = parseFloat(calcMonthly) || 0
  const totalDeposit = calculateDeposit(monthlyAmount, calcMonths)
  // Total to receive is deposit * 1.1 (10% fee)
  const totalReceive = totalDeposit * 1.1

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#27F5A9] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#27F5A9] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#1ed88a] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          
          {/* Animated Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#27F5A9] rounded-full animate-float"></div>
          <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-[#27F5A9] rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-[#27F5A9] rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-[#27F5A9] rounded-full animate-float animation-delay-3000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 w-full px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-3xl font-bold text-white">Pension</span>
            <span className="text-3xl font-bold text-[#27F5A9]">Fi</span>
          </div>
          <button 
            onClick={onEnterApp}
            className="bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a] px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-[#27F5A9]/20"
          >
            {t.conversion.cta}
          </button>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 pb-20">
          <div className="max-w-4xl text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-[#27F5A9]">{t.hero.titlePart1}</span>
              <span className="text-white">{t.hero.titlePart2}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
            <button 
              onClick={onEnterApp}
              className="bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a] px-10 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-[#27F5A9]/30 hover:scale-105"
            >
              {t.hero.cta}
            </button>
            <p className="text-sm text-gray-500 mt-6">
              {t.hero.trust}
            </p>
          </div>
        </div>
      </section>

      {/* Mini Calculator Section */}
      <section className="relative py-32 px-8 bg-gradient-to-b from-[#1a1a1a] to-[#242424] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#27F5A9] to-transparent opacity-30"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#27F5A9]/10 rounded-xl mb-4">
              <Calculator className="w-8 h-8 text-[#27F5A9]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t.calculator.title}</h2>
          </div>

          <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Monthly Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.calculator.monthly}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={calcMonthly}
                    onChange={(e) => setCalcMonthly(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-gray-600 rounded-lg px-4 py-3 pl-8 text-white focus:outline-none focus:border-[#27F5A9] focus:ring-1 focus:ring-[#27F5A9]"
                    placeholder="1000"
                    min="10"
                  />
                </div>
              </div>

              {/* Duration Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t.calculator.duration}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(parseInt(e.target.value))}
                    min="12"
                    max="120"
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#27F5A9]"
                  />
                  <span className="text-2xl font-bold text-[#27F5A9] min-w-[60px] text-right">
                    {calcMonths}
                  </span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">{t.calculator.deposit}</p>
                <p className="text-3xl font-bold text-[#27F5A9]">
                  ${totalDeposit.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">{t.calculator.receive}</p>
                <p className="text-3xl font-bold text-[#27F5A9]">
                  ${totalReceive.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={onEnterApp}
              className="w-full bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a] px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-[#27F5A9]/30 flex items-center justify-center gap-2"
            >
              {t.calculator.cta}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-8 bg-gradient-to-b from-[#242424] to-[#1a1a1a] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#27F5A9] to-transparent opacity-30"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 mt-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-lg text-gray-400">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { num: "1", ...t.howItWorks.step1 },
              { num: "2", ...t.howItWorks.step2 },
              { num: "3", ...t.howItWorks.step3 },
            ].map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#27F5A9] to-transparent opacity-30 z-0"></div>
                )}

                <div className="relative bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700 hover:border-[#27F5A9] transition-all duration-300 h-full">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-[#27F5A9] rounded-full text-[#1a1a1a] font-bold text-2xl">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-center">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#27F5A9]/10 border border-[#27F5A9]/30 rounded-full px-6 py-3">
              <span className="text-[#27F5A9] font-semibold">{t.howItWorks.time}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section className="relative py-32 px-8 bg-gradient-to-b from-[#1a1a1a] to-[#242424] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#27F5A9] to-transparent opacity-30"></div>
        <div className="absolute top-10 right-10 w-32 h-32 border border-[#27F5A9] opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 border border-white opacity-5 rounded-full"></div>

        <div className="max-w-6xl mx-auto relative z-10 mt-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-white">¿Por Qué </span>
            <span className="text-[#27F5A9]">PensionFi</span>
            <span className="text-white">?</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">El Poder de la Descentralización</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pillar 1: Security */}
            <div className="group relative bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700 hover:border-[#27F5A9] transition-all duration-300 hover:shadow-xl hover:shadow-[#27F5A9]/10 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#27F5A9] opacity-5 rounded-bl-full"></div>
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#27F5A9]/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-[#27F5A9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {t.pillars.security.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-center">
                {t.pillars.security.description}
              </p>
            </div>

            {/* Pillar 2: Transparency */}
            <div className="group relative bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700 hover:border-[#27F5A9] transition-all duration-300 hover:shadow-xl hover:shadow-[#27F5A9]/10 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-bl-full"></div>
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#27F5A9]/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-[#27F5A9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {t.pillars.transparency.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-center">
                {t.pillars.transparency.description}
              </p>
            </div>

            {/* Pillar 3: Accessibility */}
            <div className="group relative bg-[#2a2a2a] rounded-2xl p-8 border border-gray-700 hover:border-[#27F5A9] transition-all duration-300 hover:shadow-xl hover:shadow-[#27F5A9]/10 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#27F5A9] opacity-5 rounded-bl-full"></div>
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#27F5A9]/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-[#27F5A9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {t.pillars.accessibility.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-center">
                {t.pillars.accessibility.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Section */}
      <section className="relative py-32 px-8 bg-[#1a1a1a] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#27F5A9] rounded-full filter blur-[150px] opacity-5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Decorative line */}
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#27F5A9] to-transparent mx-auto mb-8 mt-8"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">¿Listo para </span>
            <span className="text-[#27F5A9]">Construir Tu Futuro</span>
            <span className="text-white">?</span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            {t.conversion.description}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onEnterApp}
              className="bg-[#27F5A9] hover:bg-[#20e094] text-[#1a1a1a] px-10 py-4 rounded-lg font-bold text-lg transition-all duration-200 hover:shadow-xl hover:shadow-[#27F5A9]/30 hover:scale-105"
            >
              {t.conversion.cta}
            </button>
            <a 
              href="/PENSIONFI MANIFIESTO.pdf" 
              download="PENSIONFI_MANIFIESTO.pdf"
              className="border-2 border-gray-600 hover:border-[#27F5A9] text-gray-300 hover:text-[#27F5A9] px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 inline-block"
            >
              {t.conversion.secondary}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f0f0f] py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-white">Pension</span>
              <span className="text-2xl font-bold text-[#27F5A9]">Fi</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-[#27F5A9] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#27F5A9] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </a>
            </div>
            
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#27F5A9] transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="text-gray-400 hover:text-[#27F5A9] transition-colors">
                {t.footer.privacy}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
