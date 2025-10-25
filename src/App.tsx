import { useState } from 'react'
import Sidebar from './components/sidebar'
import HomeSection from './components/home-section'
import SwapSection from './components/swap-section'
import PensionCalculator from './components/pension-calculator'
import ContributeSection from './components/contribute-section'
import MyPlans from './components/my-plans'
import ManifestSection from './components/manifest-section'
import LandingPage from './components/landing-page'
import { ConnectWalletButton } from './components/Connectkit';
import { useAccount } from 'wagmi'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [language, setLanguage] = useState<'es' | 'en'>('en')
  const [activeSection, setActiveSection] = useState<'home' | 'swap' | 'retire' | 'contribute' | 'myPlans' | 'manifest'>('home')
  const { address: account } = useAccount()

  const translations = {
    es: {
      retire: "Retire",
      contribute: "Contribute",
      myPlans: "My Plans",
      invest: "Invest (soon)",
      manifest: "Manifiesto"
    },
    en: {
      retire: "Retire",
      contribute: "Contribute",
      myPlans: "My Plans",
      invest: "Invest (soon)",
      manifest: "Manifesto"
    }
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'swap':
        return <SwapSection language={language} />
      case 'retire':
        return <PensionCalculator language={language} />
      case 'myPlans':
        return <MyPlans language={language} account={account || null} />
      case 'contribute':
        return <ContributeSection language={language} />
      case 'manifest':
        return <ManifestSection language={language} />
      default:
        return <HomeSection language={language} onNavigate={setActiveSection} />
    }
  }

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} language={language} setLanguage={setLanguage} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#242424] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#242424] to-[#1a1a1a] shadow-lg">
        <div className="flex items-center justify-between px-8 py-5">
          <button 
            onClick={() => setActiveSection('home')}
            className="flex items-center space-x-1 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
          >
            <span className="text-3xl font-bold text-white">Pension</span>
            <span className="text-3xl font-bold text-[#27F5A9]">Fi</span>
          </button>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="relative inline-flex items-center bg-[#27F5A9] rounded-full p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`relative z-10 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  language === 'en'
                    ? 'bg-white text-[#1a1a1a] shadow-md'
                    : 'text-[#1a1a1a] hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`relative z-10 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  language === 'es'
                    ? 'bg-white text-[#1a1a1a] shadow-md'
                    : 'text-[#1a1a1a] hover:text-white'
                }`}
              >
                Español
              </button>
            </div>

            <ConnectWalletButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 p-2 md:p-4 gap-0 md:gap-4">
        <Sidebar
          language={language}
          setLanguage={setLanguage}
          translations={translations[language]}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
        />
        <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden w-full">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
}

export default App;
