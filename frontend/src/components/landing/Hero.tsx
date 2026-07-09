import { useNavigate, useLocation } from 'react-router-dom'
import { useScrollReveal } from './useScrollReveal'
import { useAuthStatus } from './useAuthStatus'
import { useTranslation } from '../../lib/i18n/context'

export default function Hero() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isAuthenticated = useAuthStatus()
  const { t } = useTranslation()
  useScrollReveal()

  const openAuth = (path: '/login' | '/signup') => {
    if (isAuthenticated) { navigate('/dashboard', { replace: true }); return }
    navigate(path, { state: { backgroundLocation: location } })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32 pb-24 text-center">
      {/* Vercel-style radial glow */}
      <div className="land-hero-glow" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full flex flex-col items-center">
        {/* Badge */}
        <div className="land-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
             style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', backdropFilter: 'blur(10px)' }}>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ boxShadow: '0 0 10px rgba(59,130,246,0.8)' }} />
          {t('landing.hero.badge')}
        </div>

        {/* Headline */}
        <h1
          className="land-reveal text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight tracking-tighter mb-6"
          style={{ transitionDelay: '0.05s' }}
        >
          {t('landing.hero.title1')}<br />
          <span className="land-grad-text">{t('landing.hero.title2')}</span>
        </h1>

        <p className="land-reveal text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
           style={{ transitionDelay: '0.1s' }}>
          {t('landing.hero.subtitle')}
        </p>

        {/* CTAs */}
        <div className="land-reveal flex flex-wrap gap-4 items-center justify-center mb-24" style={{ transitionDelay: '0.15s' }}>
          <button
            onClick={() => openAuth('/signup')}
            className="px-8 py-4 rounded-full font-bold text-white text-base transition-all hover:scale-105"
            style={{ background: '#2563eb', boxShadow: '0 0 40px rgba(37,99,235,0.5)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {isAuthenticated ? t('landing.nav.dashboard') : t('landing.hero.startFree')}
          </button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-full font-medium text-gray-300 text-base border border-white/10 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
          >
            {t('landing.hero.howItWorks')}
          </button>
        </div>

        {/* ── Main Dashboard Mockup (Centered at bottom) ───────────────────────── */}
        <div className="land-reveal relative w-full max-w-4xl mx-auto" style={{ transitionDelay: '0.2s' }}>
          <div className="land-dash-card p-2 w-full shadow-2xl relative z-10" style={{ boxShadow: '0 -20px 100px rgba(37,99,235,0.15)' }}>
            <div className="bg-[#0a0a0a] rounded-lg p-6 border border-white/5">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-gray-500 mb-1 font-medium">{t('landing.hero.pipeline')}</div>
                  <div className="font-bold text-white text-2xl tracking-tight">{t('landing.hero.thisWeek')}</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                     style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
                  +18%
                </div>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end gap-3 h-32 mb-8">
                {[
                  { h: '40%', delay: '0.1s' },
                  { h: '60%', delay: '0.2s' },
                  { h: '75%', delay: '0.3s' },
                  { h: '100%',delay: '0.4s' },
                  { h: '90%', delay: '0.5s' },
                  { h: '70%', delay: '0.6s' },
                  { h: '100%',delay: '0.7s' },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="land-bar flex-1 rounded-t-sm"
                    style={{ height: b.h, animationDelay: b.delay, background: 'linear-gradient(to top, #1e40af, #3b82f6)' }}
                  />
                ))}
              </div>

              {/* Status pills */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: t('landing.hero.applied'),    value: '24', color: '#60a5fa' },
                  { label: t('landing.hero.interviews'), value: '7',  color: '#22d3ee' },
                  { label: t('landing.hero.offers'),     value: '2',  color: '#4ade80' },
                  { label: t('landing.hero.rejected'),   value: '11', color: '#f87171' },
                ].map(s => (
                  <div key={s.label} className="rounded-lg p-4 bg-black border border-white/5">
                    <div className="text-sm text-gray-500 mb-1">{s.label}</div>
                    <div className="font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating AI Insight Card */}
          <div
            className="absolute -right-6 lg:-right-12 top-12 land-dash-card p-4 z-20 animate-bounce"
            style={{ width: 240, boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 20px rgba(37,99,235,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-blue-300">{t('landing.hero.coachLabel')}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              {t('landing.hero.coachMessage')}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

