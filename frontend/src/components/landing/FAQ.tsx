import { useState } from 'react'
import { useScrollReveal } from './useScrollReveal'
import { useTranslation } from '../../lib/i18n/context'

export default function FAQ() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)
  useScrollReveal()

  const FAQS = [
    {
      q: t('landing.faq.q1'),
      a: t('landing.faq.a1'),
    },
    {
      q: t('landing.faq.q2'),
      a: t('landing.faq.a2'),
    },
    {
      q: t('landing.faq.q3'),
      a: t('landing.faq.a3'),
    },
    {
      q: t('landing.faq.q4'),
      a: t('landing.faq.a4'),
    },
    {
      q: t('landing.faq.q5'),
      a: t('landing.faq.a5'),
    },
  ]
  useScrollReveal()

  return (
    <section id="faq" className="py-24 px-6"
             style={{ background: 'rgba(10,10,20,0.4)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="land-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs text-cyan-400 mb-4">
            {t('landing.faq.badge')}
          </div>
          <h2 className="land-reveal text-4xl sm:text-5xl font-bold text-white tracking-tight" style={{ transitionDelay: '0.1s' }}>
            {t('landing.faq.title')}
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={i}
              className="land-reveal land-glass overflow-hidden"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-white text-sm font-bold tracking-tight">
                  {f.q}
                </span>
                <span className={`flex-shrink-0 text-gray-500 transform transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div className={`land-faq-body px-6 ${open === i ? 'open' : ''}`}>
                <p className="text-gray-400 text-sm leading-relaxed pb-5">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

