import { useState, useMemo } from 'react'
import { useApplications } from '../hooks/useApplications'
import { useSettings } from '../hooks/useSettings'
import { STATUS_LABELS, STATUS_COLORS } from '../lib/utils'
import type { AppStatus } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { TrendingUp, Target, Zap, Award, ArrowRight, Flame, Pencil, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../lib/i18n/context'

const card = 'bg-white dark:bg-[#0a0a0a] border border-gray-200/60 dark:border-white/10 rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md'

function SkeletonStatCard() {
  return (
    <div className={`${card} p-4 animate-pulse`}>
      <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
      <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12 mb-1.5" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
    </div>
  )
}

// Returns the Monday of the ISO week containing the given date
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Sunday = 0, treat as day 7 for ISO week
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Dashboard() {
  const { applications, loading: appsLoading } = useApplications()
  const { settings, loading: settingsLoading, saveGoal } = useSettings()

  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const { t } = useTranslation()

  const loading = appsLoading || settingsLoading

  // Current week application count (Monday-Sunday ISO week)
  const currentWeekCount = useMemo(() => {
    const weekStart = getWeekStart(new Date())
    return applications.filter(a => {
      if (!a.dateApplied) return false
      const applied = new Date(a.dateApplied)
      return applied >= weekStart
    }).length
  }, [applications])

  const goalProgress = settings.weeklyGoal > 0
    ? Math.min(100, Math.round((currentWeekCount / settings.weeklyGoal) * 100))
    : 0

  const goalMet = currentWeekCount >= settings.weeklyGoal

  const handleGoalEdit = () => {
    setGoalInput(String(settings.weeklyGoal))
    setEditingGoal(true)
  }

  const handleGoalSave = async () => {
    const n = parseInt(goalInput, 10)
    if (!isNaN(n) && n >= 1 && n <= 500) {
      try {
        await saveGoal(n)
      } catch {
        // error toast already shown by useSettings - just close the editor
      }
    }
    setEditingGoal(false)
  }

  const handleGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGoalSave()
    if (e.key === 'Escape') setEditingGoal(false)
  }

  if (loading) return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-24 animate-pulse mb-1.5" />
        <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-40 animate-pulse" />
      </div>
      {/* Goal skeleton */}
      <div className={`${card} p-5 animate-pulse`}>
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32 mb-4" />
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-3" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${card} p-5 space-y-4 animate-pulse`}>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-28" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-28" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              </div>
              <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded-full w-16" />
            </div>
          ))}
        </div>
        <div className={`${card} p-5 space-y-3 animate-pulse`}>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
          {[...Array(4)].map((_, i) => <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded" />)}
        </div>
      </div>
    </div>
  )

  const total = applications.length
  const interviews = applications.filter(a => a.status === 'interview').length
  const offers = applications.filter(a => a.status === 'offer').length
  const responded = applications.filter(a => ['screened', 'interview', 'offer'].includes(a.status)).length
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

  const recent = [...applications]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (total === 0) return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('dashboard.welcome')}</p>
      </div>

      {/* Weekly goal card - shown even on empty state */}
      <WeeklyGoalCard
        currentWeekCount={currentWeekCount}
        weeklyGoal={settings.weeklyGoal}
        streakCount={settings.streakCount}
        goalProgress={goalProgress}
        goalMet={goalMet}
        editingGoal={editingGoal}
        goalInput={goalInput}
        onEditGoal={handleGoalEdit}
        onGoalInputChange={setGoalInput}
        onGoalSave={handleGoalSave}
        onGoalCancel={() => setEditingGoal(false)}
        onGoalKeyDown={handleGoalKeyDown}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: 'Total applied', value: '0' }, { label: 'Response rate', value: '0%' }, { label: 'Interviews', value: '0' }, { label: 'Offers', value: '0' }].map(({ label, value }) => (
          <div key={label} className={`${card} p-4`}>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="border border-dashed border-gray-300 dark:border-gray-700/60 rounded-2xl p-12 text-center bg-gray-50/50 dark:bg-[#0a0a0a]/50 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 dark:opacity-20 pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto mb-5 border border-brand-100 dark:border-brand-500/20 shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-300">
          <Target size={24} className="text-brand-600 dark:text-brand-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 relative z-10">Pipeline Empty</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto relative z-10">
          Your intelligence system is ready. Add your first application to start tracking patterns and metrics.
        </p>
        <Link to="/board" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full hover:scale-105 transition-all shadow-sm relative z-10">
          Initialize pipeline <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative p-4 lg:p-8 space-y-8 z-10">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your job search at a glance</p>
        </div>

        {/* Weekly goal + streak */}
        <WeeklyGoalCard
          currentWeekCount={currentWeekCount}
          weeklyGoal={settings.weeklyGoal}
          streakCount={settings.streakCount}
          goalProgress={goalProgress}
          goalMet={goalMet}
          editingGoal={editingGoal}
          goalInput={goalInput}
          onEditGoal={handleGoalEdit}
          onGoalInputChange={setGoalInput}
          onGoalSave={handleGoalSave}
          onGoalCancel={() => setEditingGoal(false)}
          onGoalKeyDown={handleGoalKeyDown}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: t('dashboard.activeApplications'), value: total, icon: Target, glow: 'bg-gray-400 dark:bg-white' },
            { label: t('dashboard.successRate'), value: `${responseRate}%`, icon: TrendingUp, glow: 'bg-blue-500' },
            { label: t('dashboard.interviewsThisWeek'), value: interviews, icon: Zap, glow: 'bg-amber-500' },
            { label: 'Offers', value: offers, icon: Award, glow: 'bg-emerald-500' },
          ].map(({ label, value, icon: Icon, glow }) => (
            <div key={label} className={`${card.replace('rounded-xl', 'rounded-2xl')} p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300 relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${glow}`} />

              <div className="flex items-start justify-between mb-8 relative z-10">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
                <div className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  <Icon size={16} strokeWidth={2} />
                </div>
              </div>
              <p className="text-4xl font-mono font-medium tracking-tighter text-gray-900 dark:text-white relative z-10">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${card} p-5`}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.recentActivity')}</p>
              <Link to="/board" className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                {t('dashboard.viewAll')}
              </Link>
            </div>
            <div className="space-y-1">
              {recent.map(app => (
                <div key={app.appId} className="flex items-center justify-between gap-3 p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{app.company}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{app.role}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-semibold border ${STATUS_COLORS[app.status as AppStatus].replace('bg-', 'bg-opacity-10 text-').replace('text-white', 'text-gray-900 dark:text-gray-100')} border-current opacity-80`}>
                      {STATUS_LABELS[app.status as AppStatus]}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block w-24 text-right">
                      {formatDistanceToNow(new Date(app.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-5`}>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-6">By Status</p>
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between group">
                  <span className={`text-xs font-medium text-gray-600 dark:text-gray-300`}>
                    {STATUS_LABELS[status as AppStatus]}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-16 lg:w-24 bg-gray-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                      <div className="bg-brand-500 dark:bg-brand-400 h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Weekly Goal Card component ─────────────────────────────────────────────────

interface WeeklyGoalCardProps {
  currentWeekCount: number
  weeklyGoal: number
  streakCount: number
  goalProgress: number
  goalMet: boolean
  editingGoal: boolean
  goalInput: string
  onEditGoal: () => void
  onGoalInputChange: (val: string) => void
  onGoalSave: () => void
  onGoalCancel: () => void
  onGoalKeyDown: (e: React.KeyboardEvent) => void
}

function WeeklyGoalCard({
  currentWeekCount,
  weeklyGoal,
  streakCount,
  goalProgress,
  goalMet,
  editingGoal,
  goalInput,
  onEditGoal,
  onGoalInputChange,
  onGoalSave,
  onGoalCancel,
  onGoalKeyDown,
}: WeeklyGoalCardProps) {
  const card = 'bg-white dark:bg-[#0a0a0a] border border-gray-200/60 dark:border-white/10 rounded-xl shadow-sm transition-shadow duration-300'
  const { t } = useTranslation()

  // Progress bar colour: gradient when not met
  const progressColor = goalMet
    ? 'bg-green-500'
    : goalProgress >= 70
      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
      : 'bg-gradient-to-r from-blue-500 to-cyan-400'

  return (
    <div className={`${card.replace('rounded-xl', 'rounded-2xl')} p-6 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]`}>
      {goalMet && <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/10 pointer-events-none" />}
      <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500 to-cyan-400" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('dashboard.weeklyTarget')}</p>
          {/* streak badge */}
          {streakCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <Flame size={12} className="text-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">
                {streakCount} {streakCount !== 1 ? t('dashboard.weeks') : t('dashboard.week')}
              </span>
            </div>
          )}
        </div>

        {/* goal label + edit */}
        <div className="flex items-center gap-1.5">
          {editingGoal ? (
            <>
              <input
                type="number"
                min={1}
                max={500}
                value={goalInput}
                onChange={e => onGoalInputChange(e.target.value)}
                onKeyDown={onGoalKeyDown}
                className="w-16 text-sm text-center border border-brand-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-400"
                autoFocus
              />
              <button
                onClick={onGoalSave}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                title="Save"
              >
                <Check size={14} />
              </button>
              <button
                onClick={onGoalCancel}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <span className="text-2xl font-mono font-medium tracking-tighter text-gray-900 dark:text-white">
                {currentWeekCount} <span className="text-sm text-gray-400 dark:text-gray-500">/ {weeklyGoal}</span>
              </span>
              <button
                onClick={onEditGoal}
                className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
                title="Edit weekly goal"
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1 mb-3 relative z-10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} ${goalMet ? 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' : ''}`}
          style={{ width: `${goalProgress}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {goalMet ? (
            <span className="text-green-600 dark:text-green-400 font-medium">{t('dashboard.goalReached')}</span>
          ) : (
            <span>
              {weeklyGoal - currentWeekCount} {t('dashboard.goalRemaining')}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600">{goalProgress}%</p>
      </div>
    </div>
  )
}
