import { useState } from 'react'
import { X } from 'lucide-react'
import type { Application } from '../../types'
import ResumeVersionSelect from './ResumeVersionSelect'
import { useTranslation } from '../../lib/i18n/context'

interface Props {
  onClose: () => void
  onSave: (data: Omit<Application, 'appId' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

const defaultForm = {
  company: '', role: '', status: 'applied' as const,
  dateApplied: new Date().toISOString().split('T')[0],
  source: 'linkedin' as const, resumeVersion: '',
  companySize: '' as const, jobDescUrl: '', notes: '',
  followUpDate: null as string | null,
}

const inp = 'w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder:text-gray-400 dark:placeholder:text-gray-500'

export default function AddApplicationModal({ onClose, onSave }: Props) {
  const [form, setForm] = useState(defaultForm)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.role) return
    onSave({
      ...form,
      followUpDate: form.followUpDate?.trim() === '' ? null : form.followUpDate,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t('board.modal.addTitle')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.company')} *</label>
              <input className={inp} value={form.company} onChange={e => set('company', e.target.value)} placeholder="Anthropic" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.role')} *</label>
              <input className={inp} value={form.role} onChange={e => set('role', e.target.value)} placeholder="ML Engineer" required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.source')}</label>
              <select className={inp} value={form.source} onChange={e => set('source', e.target.value)}>
                <option value="linkedin">LinkedIn</option>
                <option value="referral">Referral</option>
                <option value="cold">Cold Apply</option>
                <option value="job-board">Job Board</option>
                <option value="unknown">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.dateApplied')}</label>
              <input type="date" className={inp} value={form.dateApplied} onChange={e => set('dateApplied', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.companySize')}</label>
              <select className={inp} value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                <option value="">Unknown</option>
                <option value="startup">Startup</option>
                <option value="mid">Mid-size</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.resumeVersion')}</label>
              <ResumeVersionSelect className={inp} value={form.resumeVersion} onChange={v => set('resumeVersion', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.url')}</label>
              <input className={inp} value={form.jobDescUrl} onChange={e => set('jobDescUrl', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.followUp')}</label>
              <input
                type="date"
                className={inp}
                value={form.followUpDate ?? ''}
                onChange={e => set('followUpDate', e.target.value || '')}
              />
              <p className="text-xs text-gray-400 mt-1">Optional - get a reminder to follow up.</p>
            </div>
          </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t('board.modal.notes')}</label>
              <textarea className={`${inp} min-h-[80px] resize-none`} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Referral from Priya..." />
            </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">{t('board.modal.cancel')}</button>
            <button type="submit" className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">{t('board.modal.addBtn')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
