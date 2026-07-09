import { useScrollReveal } from './useScrollReveal'
import { useTranslation } from '../../lib/i18n/context'

// Professional SVG icon in a rounded dark container - matches reference design
function IconBox({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
      style={{ background: bg, border: `1px solid ${color}25` }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </div>
  )
}

export default function FeatureShowcase() {
  const { t } = useTranslation()
  useScrollReveal()

  const FEATURES = [
    {
      icon: (
        // Kanban grid
        <>
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="4" rx="1"/>
        </>
      ),
      color: '#60a5fa', bg: 'rgba(59,130,246,0.12)',
      title: t('landing.features.f1.title'),
      desc: t('landing.features.f1.desc'),
    },
    {
      icon: (
        // Waveform / pulse
        <polyline points="2 12 6 6 10 18 14 8 18 14 22 12"/>
      ),
      color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',
      title: t('landing.features.f2.title'),
      desc: t('landing.features.f2.desc'),
    },
    {
      icon: (
        // Chat bubble with dots
        <>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <line x1="9" y1="11" x2="9" y2="11" strokeWidth="2.5"/>
          <line x1="12" y1="11" x2="12" y2="11" strokeWidth="2.5"/>
          <line x1="15" y1="11" x2="15" y2="11" strokeWidth="2.5"/>
        </>
      ),
      color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',
      title: t('landing.features.f3.title'),
      desc: t('landing.features.f3.desc'),
    },
    {
      icon: (
        // Calendar with notification
        <>
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
          <circle cx="17" cy="17" r="3" fill="rgba(248,113,113,0.2)" stroke="#f87171"/>
          <line x1="17" y1="15.5" x2="17" y2="17.5" stroke="#f87171"/>
          <line x1="17" y1="18.5" x2="17" y2="18.5" stroke="#f87171" strokeWidth="2.5"/>
        </>
      ),
      color: '#fb923c', bg: 'rgba(251,146,60,0.1)',
      title: t('landing.features.f4.title'),
      desc: t('landing.features.f4.desc'),
    },
    {
      icon: (
        // Document with version lines
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="13" y2="17"/>
        </>
      ),
      color: '#4ade80', bg: 'rgba(74,222,128,0.08)',
      title: t('landing.features.f5.title'),
      desc: t('landing.features.f5.desc'),
    },
    {
      icon: (
        // Envelope / mail
        <>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </>
      ),
      color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',
      title: t('landing.features.f6.title'),
      desc: t('landing.features.f6.desc'),
    },
    {
      icon: (
        // Target / goal
        <>
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </>
      ),
      color: '#f472b6', bg: 'rgba(244,114,182,0.08)',
      title: t('landing.features.f7.title'),
      desc: t('landing.features.f7.desc'),
    },
    {
      icon: (
        // Clock / notes
        <>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </>
      ),
      color: '#34d399', bg: 'rgba(52,211,153,0.08)',
      title: t('landing.features.f8.title'),
      desc: t('landing.features.f8.desc'),
    },
    {
      icon: (
        // CSV / arrows
        <>
          <polyline points="8 17 12 21 16 17"/>
          <line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
        </>
      ),
      color: '#67e8f9', bg: 'rgba(103,232,249,0.08)',
      title: t('landing.features.f9.title'),
      desc: t('landing.features.f9.desc'),
    },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="land-reveal text-xs font-semibold tracking-widest uppercase mb-4"
             style={{ color: '#22d3ee', letterSpacing: '0.15em' }}>
            {t('landing.features.label')}
          </p>
          <h2
            className="land-reveal text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif', transitionDelay: '0.05s' }}
          >
            {t('landing.features.title1')}<br />{t('landing.features.title2')}
          </h2>
          <p className="land-reveal text-gray-400 text-lg max-w-2xl mx-auto" style={{ transitionDelay: '0.1s' }}>
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Feature Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-auto md:auto-rows-[240px]">
          {FEATURES.map((f, i) => {
            let colSpan = 'md:col-span-1'
            let rowSpan = 'md:row-span-1'
            
            // Bento logic
            if (i === 0) { colSpan = 'md:col-span-2' }
            if (i === 1) { colSpan = 'md:col-span-2' }
            if (i === 2) { colSpan = 'md:col-span-2'; rowSpan = 'md:row-span-2' }
            if (i === 4) { colSpan = 'md:col-span-2' }
            if (i === 7) { colSpan = 'md:col-span-2' }
            if (i === 8) { colSpan = 'md:col-span-2' }

            return (
              <div
                key={i}
                className={`land-reveal land-glass p-8 flex flex-col group relative overflow-hidden ${colSpan} ${rowSpan}`}
                style={{ transitionDelay: `${0.04 * (i % 3)}s` }}
              >
                {/* Minimalist glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                     style={{ background: `radial-gradient(circle at 100% 100%, ${f.color}15 0%, transparent 50%)` }} />
                
                <div className="flex-1">
                  <IconBox color={f.color} bg={f.bg}>
                    {f.icon}
                  </IconBox>
                  <h3 className="text-white font-bold text-xl mb-3 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

