import { Languages } from 'lucide-react'
import { useLanguage, type Language } from '../i18n/LanguageContext'

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()
  const options: { value: Language; label: string }[] = [
    { value: 'zh-CN', label: '中文' },
    { value: 'en', label: 'EN' },
  ]

  return (
    <div
      className="fixed top-4 right-4 z-[90] flex items-center gap-1 rounded-lg border border-white/15 bg-black/65 p-1 shadow-lg backdrop-blur-md"
      aria-label={t('language')}
    >
      <Languages size={15} className="mx-1 text-neon-gold" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLanguage(option.value)}
          className={`h-8 min-w-10 rounded-md px-2 text-xs font-semibold transition-colors ${
            language === option.value
              ? 'bg-neon-gold text-black'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
          aria-pressed={language === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
