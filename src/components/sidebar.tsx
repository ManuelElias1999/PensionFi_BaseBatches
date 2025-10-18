import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

type SectionKey = 'home' | 'swap' | 'retire' | 'contribute' | 'myPlans' | 'manifest';

interface SidebarProps {
  language: 'es' | 'en'
  setLanguage: (lang: 'es' | 'en') => void
  translations: {
    invest: string
    retire: string
    contribute: string
    myPlans: string
    manifest: string
  }
  activeSection: string
  onSectionClick: (section: SectionKey) => void
}

export default function Sidebar({ translations, activeSection, onSectionClick }: SidebarProps) {
  return (
    <div className="w-72 bg-gradient-to-b from-[#242424] to-[#1a1a1a] rounded-2xl shadow-xl p-8 flex flex-col">
      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {([
          { key: 'retire' as const, label: translations.retire },
          { key: 'myPlans' as const, label: translations.myPlans },
          { key: 'swap' as const, label: translations.invest },
          { key: 'contribute' as const, label: translations.contribute },
          { key: 'manifest' as const, label: translations.manifest }
        ] as const).map((item) => (
          <button
            key={item.key}
            onClick={() => onSectionClick(item.key)}
            className={`w-full text-left py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
              activeSection === item.key 
                ? 'text-[#27F5A9] bg-[#27F5A9]/10' 
                : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Decorative Element */}
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

      {/* X (Twitter) Link */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">Follow us</span>
        <a
          href="https://x.com/mejubilo_com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-[#27F5A9] text-[#1a1a1a] rounded-xl hover:bg-[#20E096] transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-[#27F5A9]/30"
        >
          <FontAwesomeIcon icon={faXTwitter} className="text-lg" />
        </a>
      </div>
    </div>
  )
}
