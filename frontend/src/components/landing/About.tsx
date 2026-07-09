import { useScrollReveal } from './useScrollReveal'
import { useTranslation } from '../../lib/i18n/context'

export default function About() {
  const { t } = useTranslation()
  useScrollReveal()

  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="land-reveal land-glass p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar / logo mark */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                   style={{ background: '#2563eb' }}>
                H
              </div>
            </div>

            <div>
              <div className="land-reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-xs text-indigo-400 mb-4">
                {t('landing.about.badge')}
              </div>

              <h2 className="text-3xl font-bold text-white mb-6">
                <div className="font-bold text-white text-xl tracking-tight mb-2">Huynh Nhan</div>
                {t('landing.about.title')}
              </h2>

              <div className="space-y-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                <p>
                  {t('landing.about.p1a')}<em className="text-gray-300 not-italic">{t('landing.about.p1why')}</em>{t('landing.about.p1b')}
                </p>
                <p>
                  {t('landing.about.p2')}
                </p>
                <p>
                  {t('landing.about.p3')}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-4">
                <a
                  href="https://github.com/huynhnhan68"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-500 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  huynhnhan68
                </a>
                <a
                  href="https://github.com/huynhnhan68"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  github.com/huynhnhan68
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}



