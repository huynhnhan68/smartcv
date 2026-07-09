import { useScrollReveal } from './useScrollReveal'
import { useTranslation } from '../../lib/i18n/context'

export default function HowItWorks() {
  const { t } = useTranslation()
  useScrollReveal()

  const STEPS = [
    {
      n: 1,
      iconColor: '#60a5fa',
      badgeText: '01',
      badgeColor: '#3b82f6',
      connectorColor: 'rgba(99,102,241,0.5)',
      icon: (
        <>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </>
      ),
      title: t('landing.howItWorks.s1.title'),
      desc: t('landing.howItWorks.s1.desc'),
      hint: t('landing.howItWorks.s1.hint'),
    },
    {
      n: 2,
      iconColor: '#22d3ee',
      badgeText: '02',
      badgeColor: '#06b6d4',
      connectorColor: 'rgba(139,92,246,0.5)',
      icon: (
        <polyline points="2 12 6 6 10 18 14 8 18 14 22 12"/>
      ),
      title: t('landing.howItWorks.s2.title'),
      desc: t('landing.howItWorks.s2.desc'),
      hint: t('landing.howItWorks.s2.hint'),
    },
    {
      n: 3,
      iconColor: '#38bdf8',
      badgeText: '03',
      badgeColor: '#0ea5e9',
      connectorColor: 'rgba(6,182,212,0.5)',
      icon: (
        <>
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </>
      ),
      title: t('landing.howItWorks.s3.title'),
      desc: t('landing.howItWorks.s3.desc'),
      hint: t('landing.howItWorks.s3.hint'),
    },
    {
      n: 4,
      iconColor: '#4ade80',
      iconBg: 'rgba(74,222,128,0.1)',
      badgeColor: '#22c55e',
      connectorColor: '',
      icon: (
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      ),
      title: t('landing.howItWorks.s4.title'),
      desc: t('landing.howItWorks.s4.desc'),
      hint: t('landing.howItWorks.s4.hint'),
    },
  ]

  // Height of the icon box is 104px. The number badge overflows by ~10px on top
  // (badge is -top-2.5 = -10px relative to the icon box container).
  // So the center of the icon box is at 52px from the top of the .relative wrapper.
  // Connectors use marginTop: 52px to align with that center.
  const CONNECTOR_TOP = 52

  return (
    <section id="how-it-works" className="py-24 px-6"
             style={{ background: 'rgba(10,10,20,0.5)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <p className="land-reveal text-xs font-semibold tracking-widest uppercase mb-4"
             style={{ color: '#60a5fa', letterSpacing: '0.15em' }}>
            {t('landing.howItWorks.label')}
          </p>
          <h2
            className="land-reveal text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight"
            style={{ transitionDelay: '0.05s' }}
          >
            {t('landing.howItWorks.title1')}{' '}
            <span className="land-grad-text">{t('landing.howItWorks.title2')}</span>
          </h2>
          <p className="land-reveal text-gray-400 text-lg max-w-xl mx-auto"
             style={{ transitionDelay: '0.1s' }}>
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        {/* ── Desktop: flex row with in-flow connector lines ───────────────── */}
        {/* Each connector is a plain div inserted between step columns.       */}
        {/* It never overlaps any icon box so transparent backgrounds are fine. */}
        <div className="hidden lg:flex items-start">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-start" style={{ flex: 1, minWidth: 0 }}>

              {/* Step column */}
              <div className="land-reveal flex flex-col items-center text-center w-full"
                   style={{ transitionDelay: `${i * 0.1}s` }}>

                {/* Icon box + badge */}
                <div className="relative mb-8">
                  <div
                    className="w-[104px] h-[104px] rounded-2xl flex items-center justify-center"
                    style={{
                      background: s.iconBg,
                      border: `1px solid ${s.iconColor}30`,
                    }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                         stroke={s.iconColor} strokeWidth="1.7"
                         strokeLinecap="round" strokeLinejoin="round">
                      {s.icon}
                    </svg>
                  </div>
                  {/* Number badge */}
                  <div
                    className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ background: s.badgeColor }}
                  >
                    {s.n}
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-white font-bold text-base mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 px-2">
                  {s.desc}
                </p>
                <div className="flex items-center gap-1.5 text-xs"
                     style={{ color: s.iconColor }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {s.hint}
                </div>
              </div>

              {/* Connector line - only between steps, not after the last one */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-shrink-0"
                  style={{
                    width: 48,
                    height: 1,
                    marginTop: CONNECTOR_TOP,
                    background: s.connectorColor,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Mobile / tablet: 2×2 grid ────────────────────────────────────── */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-10">
          {STEPS.map((s, i) => (
            <div key={s.n}
                 className="land-reveal flex flex-col items-center text-center"
                 style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className="relative mb-6">
                <div
                  className="w-[88px] h-[88px] rounded-2xl flex items-center justify-center"
                  style={{ background: s.iconBg, border: `1px solid ${s.iconColor}30` }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                       stroke={s.iconColor} strokeWidth="1.7"
                       strokeLinecap="round" strokeLinejoin="round">
                    {s.icon}
                  </svg>
                </div>
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: s.badgeColor, fontFamily: 'Syne, sans-serif' }}
                >
                  {s.n}
                </div>
              </div>
              <h3 className="text-white font-bold text-base mb-2"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{s.desc}</p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: s.iconColor }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {s.hint}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

