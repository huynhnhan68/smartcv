import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { getInsights } from '../../lib/api'
import type { Patterns } from '../../types'
import { TrendingUp, Target, Zap, RefreshCw, Lightbulb, Sparkles, Award, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n/context'

const COLORS = ['url(#colorPrimary)', 'url(#colorSuccess)', 'url(#colorWarning)', 'url(#colorDanger)', 'url(#colorInfo)', '#d85a30']

// Status history color per status
const STATUS_HISTORY_COLORS: Record<string, string> = {
  applied:   'url(#colorInfo)',
  screened:  'url(#colorPrimary)',
  interview: 'url(#colorWarning)',
  offer:     'url(#colorSuccess)',
  rejected:  'url(#colorDanger)',
}

const card = 'bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border border-gray-200/60 dark:border-white/10 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group'

const resolveColor = (color: string) => {
  if (color.includes('colorPrimary')) return '#7f77dd'
  if (color.includes('colorSuccess')) return '#1d9e75'
  if (color.includes('colorWarning')) return '#ef9f27'
  if (color.includes('colorDanger')) return '#e24b4a'
  if (color.includes('colorInfo')) return '#378add'
  return color
}

// ── Custom funnel bar label showing conversion % ───────────────────────────

function FunnelLabel({ x, y, width, height, value }: any) {
  if (!value || value === 0) return null
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {value}
    </text>
  )
}

export default function AnalyticsDashboard() {
  const [patterns, setPatterns] = useState<Patterns | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    getInsights().then(setPatterns).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-24 animate-pulse mb-1.5" />
        <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-48 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${card} p-4 animate-pulse`}>
            <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
            <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12 mb-1.5" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`${card} p-5 animate-pulse`}>
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
            <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )

  if (!patterns || patterns.summary.total === 0) return (
    <div className="p-4 lg:p-6 space-y-8 relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-tight">{t('analytics.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('analytics.subtitle')}</p>
      </div>
      <div className={`${card} p-12 text-center relative z-10 max-w-2xl mx-auto mt-12`}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full animate-ping bg-brand-500/20" />
          <TrendingUp size={28} className="text-brand-600 dark:text-brand-400 relative z-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Need more data points</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
          The AI needs at least 5 applications on the Board to start recognizing patterns in your response rates, velocity, and success sources.
        </p>
        <div className="w-64 mx-auto mb-8">
          <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
            <span>Data collected</span>
            <span className="text-brand-600 dark:text-brand-400">{patterns?.summary.total || 0}/5 apps</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(100, ((patterns?.summary.total || 0) / 5) * 100)}%` }} />
          </div>
        </div>
        <Link to="/board" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
          Go to Board <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )

  const sourceData = Object.entries(patterns.breakdowns.bySource).map(([name, d]) => ({ name, responseRate: d.responseRate, total: d.total }))
  const resumeData = Object.entries(patterns.breakdowns.byResumeVersion).map(([name, d]) => ({ name, responseRate: d.responseRate, total: d.total }))
  const statusData = Object.entries(patterns.summary.byStatus).map(([name, value]) => ({ name, value: value as number }))
  const velocityData = Object.entries(patterns.velocity).map(([key, count]) => ({ name: key.replace('week_', 'W-').replace('_ago', ''), count })).reverse()
  const timeToOffer = patterns.timeToOffer ?? { total: 0 }

  const funnelData = (patterns.funnel?.stages ?? []).map(s => ({
    stage: s.stage,
    count: s.count,
    label: s.stage === 'Applied' ? `${s.count}` : `${s.conversionFromPrev}%`,
  }))

  const rawTimeSeries = patterns.responseRateTimeSeries ?? []
  const firstNonEmpty = rawTimeSeries.findIndex(p => p.total > 0)
  const timeSeriesData = firstNonEmpty >= 0 ? rawTimeSeries.slice(firstNonEmpty) : rawTimeSeries

  const statusHistoryData = (patterns.statusHistory ?? []).filter(
    p => p.applied + p.screened + p.interview + p.offer + p.rejected > 0
  )

  const tickStyle = { fontSize: 11, fill: '#6b7280', fontWeight: 600 }
  const tooltipStyle = { fontSize: 12, backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: 8, fontWeight: 500, color: '#374151' }

  return (
    <div className="p-4 lg:p-8 space-y-8 relative min-h-full">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />
      
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7f77dd" stopOpacity={1}/>
            <stop offset="95%" stopColor="#6c63d9" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1d9e75" stopOpacity={1}/>
            <stop offset="95%" stopColor="#0f7a5a" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef9f27" stopOpacity={1}/>
            <stop offset="95%" stopColor="#d4880f" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e24b4a" stopOpacity={1}/>
            <stop offset="95%" stopColor="#c0392b" stopOpacity={0.8}/>
          </linearGradient>
          <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#378add" stopOpacity={1}/>
            <stop offset="95%" stopColor="#1a6fc4" stopOpacity={0.8}/>
          </linearGradient>
        </defs>
      </svg>
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 tracking-tight">{t('analytics.patternIntelligence')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{t('analytics.realTimeAnalysis')} {patterns.summary.total} {t('analytics.applications')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">{t('analytics.liveTracking')}</span>
          </div>
          <button 
            onClick={() => { setLoading(true); getInsights().then(setPatterns).finally(() => setLoading(false)) }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-full hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm group"
          >
            <RefreshCw size={15} className="group-active:animate-spin" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 relative z-10">
        {[
          { label: t('analytics.totalApplied'), value: patterns.summary.total, icon: Target, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
          { label: t('analytics.responseRate'), value: `${patterns.summary.responseRate}%`, icon: TrendingUp, gradient: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
          { label: t('analytics.interviews'), value: patterns.summary.byStatus.interview ?? 0, icon: Zap, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
          { label: t('analytics.offers'), value: patterns.summary.byStatus.offer ?? 0, icon: Award, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
        ].map(({ label, value, icon: Icon, gradient, shadow }) => (
          <div key={label} className={`${card} p-5 lg:p-6`}>
            <div className={`absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${gradient}`} />
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg ${shadow} text-white transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">{value}</p>
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      {/* Highlights Bento */}
      {(patterns.highlights.bestSource || patterns.highlights.bestResumeVersion || patterns.highlights.bestCompanySize) && (
        <div className={`${card} p-5 lg:p-6 bg-gradient-to-br from-brand-50/50 to-indigo-50/50 dark:from-brand-900/10 dark:to-indigo-900/10 relative z-10 overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500" />
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-brand-600 dark:text-brand-400" />
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">{t('analytics.topInsights')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 text-sm">
            {patterns.highlights.bestSource && (
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-white/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-amber-500" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('analytics.bestSource')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{patterns.highlights.bestSource.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">{patterns.highlights.bestSource.responseRate}%</p>
                  <p className="text-xs text-gray-500">{t('analytics.responseRate').toLowerCase()}</p>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${patterns.highlights.bestSource.responseRate}%` }} />
                </div>
              </div>
            )}
            {patterns.highlights.bestResumeVersion && (
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-white/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-brand-500" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{t('analytics.bestResume')}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{patterns.highlights.bestResumeVersion.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">{patterns.highlights.bestResumeVersion.responseRate}%</p>
                  <p className="text-xs text-gray-500">{t('analytics.responseRate').toLowerCase()}</p>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500" style={{ width: `${patterns.highlights.bestResumeVersion.responseRate}%` }} />
                </div>
              </div>
            )}
            {patterns.highlights.bestCompanySize && (
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 border border-white/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={14} className="text-purple-500" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Best company size</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{patterns.highlights.bestCompanySize.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400">{patterns.highlights.bestCompanySize.responseRate}%</p>
                  <p className="text-xs text-gray-500">response rate</p>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500" style={{ width: `${patterns.highlights.bestCompanySize.responseRate}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">

        {funnelData.length > 0 && (
          <div className={`${card} p-5 lg:p-6 group`}>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{t('analytics.appFunnel')}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-6">{t('analytics.conversionAtStage')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} barSize={40}>
                <XAxis dataKey="stage" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(127, 119, 221, 0.05)' }}
                  formatter={(value: number, _name: string, props: any) => [
                    `${value} apps (${props.payload.label})`,
                    'Count',
                  ]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} label={<FunnelLabel />}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} className="transition-all duration-300 hover:opacity-80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}


        {timeSeriesData.length > 0 && (
          <div className={`${card} p-5 lg:p-6 group`}>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{t('analytics.responseVelocity')}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-6">{t('analytics.weeklySuccessTrend')}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.04} vertical={false} />
                <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} unit="%" domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: 'rgba(127, 119, 221, 0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                  formatter={(v: number, _: string, props: any) => [
                    `${v}% (${props.payload.total} apps)`,
                    'Response rate',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="responseRate"
                  stroke="url(#colorPrimary)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#7f77dd', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#7f77dd', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Response rate by source */}
        <div className={`${card} p-5 lg:p-6 group`}>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{t('analytics.rateBySource')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourceData} barSize={28}>
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={tickStyle} unit="%" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(127, 119, 221, 0.05)' }} formatter={(v) => [`${v}%`, t('analytics.responseRate')]} />
              <Bar dataKey="responseRate" fill="url(#colorPrimary)" radius={[6, 6, 0, 0]} className="transition-all duration-300 hover:opacity-80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown pie */}
        <div className={`${card} p-5 lg:p-6 group flex flex-col`}>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{t('analytics.statusBreakdown')}</p>
          <div className="flex-1 min-h-[280px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  innerRadius={55}
                  paddingAngle={4}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    if (percent < 0.05) return null
                    const RADIAN = Math.PI / 180
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)
                    return (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
                        {`${Math.round(percent * 100)}%`}
                      </text>
                    )
                  }}
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 cursor-pointer transition-opacity duration-300" />
                  ))}
                </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
                formatter={(value, entry: any) => (
                  <span style={{ color: resolveColor(entry.color), fontWeight: 600 }}>
                    {t(`board.column.${value}` as any)} ({entry.payload.value})
                  </span>
                )}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [`${value} apps`, t(`board.column.${name}` as any)]}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Resume version */}
        <div className={`${card} p-5 lg:p-6 group`}>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{t('analytics.rateByResume')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={resumeData} barSize={28}>
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={tickStyle} unit="%" axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(29, 158, 117, 0.05)' }} formatter={(v) => [`${v}%`, t('analytics.responseRate')]} />
              <Bar dataKey="responseRate" fill="url(#colorSuccess)" radius={[6, 6, 0, 0]} className="transition-all duration-300 hover:opacity-80" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly velocity */}
        <div className={`${card} p-5 lg:p-6 group`}>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-6">{t('analytics.weeklyVelocity')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={velocityData} barSize={28}>
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(239, 159, 39, 0.05)' }} />
              <Bar dataKey="count" fill="url(#colorWarning)" radius={[6, 6, 0, 0]} className="transition-all duration-300 hover:opacity-80" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {statusHistoryData.length > 0 && (
          <div className={`${card} p-5 lg:p-6 group lg:col-span-2`}>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-1">{t('analytics.statusHistory')}</p>
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-6">{t('analytics.statusHistoryDesc')}</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusHistoryData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.04} vertical={false} />
                <XAxis dataKey="week" tick={tickStyle} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(127, 119, 221, 0.05)' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
                  formatter={(value, entry: any) => (
                    <span style={{ color: resolveColor(entry.color), fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                />
                {(['applied', 'screened', 'interview', 'offer', 'rejected'] as const).map(s => (
                  <Bar
                    key={s}
                    dataKey={s}
                    stackId="a"
                    fill={STATUS_HISTORY_COLORS[s]}
                    name={t(`board.column.${s}` as any)}
                    radius={s === 'rejected' ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  )
}
