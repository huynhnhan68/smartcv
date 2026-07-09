import { useState, useMemo, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, ExternalLink, Trash2, Search, X, SlidersHorizontal, Keyboard, ChevronDown, Target, Zap, Award } from 'lucide-react'
import { useApplications } from '../../hooks/useApplications'
import AddApplicationModal from './AddApplicationModal'
import ApplicationDetailModal from './ApplicationDetailModal'
import ConfirmDialog from '../layout/ConfirmDialog'
import ShortcutsHelpModal from '../layout/ShortcutsHelpModal'
import CsvExportButton from './CsvExportButton'
import CsvImportModal from './CsvImportModal'
import { STATUS_LABELS, STATUS_COLORS, STATUS_COLUMNS } from '../../lib/utils'
import type { AppStatus, Application } from '../../types'
import type { ImportRow } from '../../lib/csv'
import toast from 'react-hot-toast'
import { useTranslation } from '../../lib/i18n/context'

// Bug fix: each entry has both light and dark variants so dark:border-gray-700
// on the card outer border cannot override the left border color.
const STATUS_GLOW: Record<AppStatus, string> = {
  applied:   'bg-blue-400 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
  screened:  'bg-purple-400 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  interview: 'bg-amber-400 dark:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
  offer:     'bg-green-400 dark:bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
  rejected:  'bg-red-400 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  withdrawn: 'bg-gray-400 dark:bg-gray-500 shadow-[0_0_10px_rgba(156,163,175,0.5)]',
}
const STATUS_DOT: Record<AppStatus, string> = {
  applied:   'bg-blue-500',
  screened:  'bg-purple-500',
  interview: 'bg-amber-500',
  offer:     'bg-green-500',
  rejected:  'bg-red-500',
  withdrawn: 'bg-gray-500',
}

// requiring a "Show more" click.
const PAGE_SIZE = 20

function defaultVisibleCounts(): Record<AppStatus, number> {
  return STATUS_COLUMNS.reduce((acc, status) => {
    acc[status] = PAGE_SIZE
    return acc
  }, {} as Record<AppStatus, number>)
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-3" />
      <div className="flex gap-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-12" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
      </div>
    </div>
  )
}

function EmptyColumn({ status, filtered }: { status: AppStatus; filtered: boolean }) {
  const { t } = useTranslation()
  const emptyInfo: Record<AppStatus, { msg: string; icon: React.ReactNode }> = {
    applied: { msg: t('board.empty.applied'), icon: <Plus size={16} /> },
    screened: { msg: t('board.empty.screened'), icon: <Target size={16} /> },
    interview: { msg: t('board.empty.interview'), icon: <Zap size={16} /> },
    offer: { msg: t('board.empty.offer'), icon: <Award size={16} /> },
    rejected: { msg: t('board.empty.rejected'), icon: <X size={16} /> },
    withdrawn: { msg: t('board.empty.withdrawn'), icon: <X size={16} /> },
  }
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200/50 dark:border-white/5 rounded-xl bg-gray-50/30 dark:bg-white/[0.02] h-full">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 mb-2">
        {filtered ? <Search size={14} /> : emptyInfo[status].icon}
      </div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{filtered ? t('board.noMatches') : emptyInfo[status].msg}</p>
    </div>
  )
}

export default function KanbanBoard() {
  const { applications, loading, create, update, remove, changeStatus } = useApplications()
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Application | null>(null)
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { t } = useTranslation()

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [visibleCounts, setVisibleCounts] = useState<Record<AppStatus, number>>(defaultVisibleCounts)

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const newStatus = result.destination.droppableId as AppStatus
    const app = applications.find(a => a.appId === result.draggableId)
    if (app && app.status !== newStatus) changeStatus(result.draggableId, newStatus)
  }

  const filtered = useMemo(() => {
    let list = applications
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
    }
    if (filterSource) list = list.filter(a => a.source === filterSource)
    return list
  }, [applications, search, filterSource])

  const isFiltering = search.trim() !== '' || filterSource !== ''
  const byStatus = (status: AppStatus) => filtered.filter(a => a.status === status)
  const visibleByStatus = (status: AppStatus) => byStatus(status).slice(0, visibleCounts[status])
  const clearFilters = () => { setSearch(''); setFilterSource('') }

  const showMore = (status: AppStatus) => {
    setVisibleCounts(prev => ({ ...prev, [status]: prev[status] + PAGE_SIZE }))
  }

  // filtered set changes, so a new search/filter doesn't stay expanded
  useEffect(() => {
    setVisibleCounts(defaultVisibleCounts())
  }, [search, filterSource])

  // N      - open "Add application" (only when no dialog is open)
  // Escape - close whichever dialog is currently open (topmost first)
  // ?      - toggle the shortcuts help overlay (only when no dialog is open)
  useEffect(() => {
    const anyModalOpen = showModal || showImport || !!selectedApp || !!confirmDelete

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) { setConfirmDelete(null); return }
        if (selectedApp) { setSelectedApp(null); return }
        if (showImport) { setShowImport(false); return }
        if (showModal) { setShowModal(false); return }
        if (showShortcutsHelp) { setShowShortcutsHelp(false); return }
        return
      }

      const target = e.target as HTMLElement | null
      const isTyping = !!target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable)
      if (isTyping) return

      if ((e.key === 'n' || e.key === 'N') && !anyModalOpen && !showShortcutsHelp) {
        e.preventDefault()
        setShowModal(true)
        return
      }

      if (e.key === '?' && !anyModalOpen) {
        e.preventDefault()
        setShowShortcutsHelp(s => !s)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showModal, showImport, selectedApp, confirmDelete, showShortcutsHelp])

  const handleImport = async (rows: ImportRow[]): Promise<{ imported: number; failed: number }> => {
    let imported = 0
    let failed = 0
    for (const row of rows) {
      try {
        await create({
          company: row.company,
          role: row.role,
          status: row.status as AppStatus,
          dateApplied: row.dateApplied,
          source: row.source as Application['source'],
          resumeVersion: row.resumeVersion,
          companySize: row.companySize as Application['companySize'],
          jobDescUrl: row.jobDescUrl,
          notes: row.notes,
          followUpDate: row.followUpDate,
        })
        imported++
      } catch {
        failed++
      }
    }
    if (imported > 0) toast.success(`Imported ${imported} application${imported !== 1 ? 's' : ''}`)
    if (failed > 0) toast.error(`${failed} application${failed !== 1 ? 's' : ''} failed to import`)
    return { imported, failed }
  }

  if (loading) return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-16 animate-pulse mb-1.5" />
          <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-28 animate-pulse" />
        </div>
        <div className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg w-36 animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map(s => (
          <div key={s} className="flex-shrink-0 w-60 lg:w-64">
            <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-20 animate-pulse mb-3" />
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-2 space-y-2">
              {[...Array(s === 'applied' ? 3 : 1)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  if (applications.length === 0) return (
    <div className="p-4 lg:p-6 h-full relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Board</h1>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">{t('board.source')}:</span>
              <select 
                value={filterSource} 
                onChange={e => setFilterSource(e.target.value)}
                className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 focus:outline-none focus:border-brand-500 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('board.allSources')}</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard size={15} />
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 rounded-full transition-all shadow-sm"
          >
            <span className="hidden sm:inline font-medium">Import</span>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-sm font-semibold rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300">
            <Plus size={15} /> Add application
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-800/20 flex items-center justify-center mb-4">
          <Plus size={20} className="text-brand-600 dark:text-brand-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No applications yet</p>
        <p className="text-sm text-gray-400 mb-5">Add your first application or import from a CSV file. Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">N</kbd> to get started.</p>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Import CSV
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors">
            Add first application
          </button>
        </div>
      </div>
      </div>
      {showModal && <AddApplicationModal onClose={() => setShowModal(false)} onSave={(data) => create(data as Omit<Application, 'appId' | 'userId' | 'createdAt' | 'updatedAt'>)} />}
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
      {showShortcutsHelp && <ShortcutsHelpModal onClose={() => setShowShortcutsHelp(false)} />}
    </div>
  )

  const interviewingCount = byStatus('interview').length
  const offerCount = byStatus('offer').length

  return (
    <div className="p-4 lg:p-6 h-full flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/10 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{t('board.title')}</h1>
            <div className="px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs font-semibold rounded-full border border-brand-100 dark:border-brand-500/20">
              {applications.length}
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder={t('board.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-48 sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-all"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${showFilters || filterSource ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title={t('board.filters')}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CsvExportButton applications={applications} />
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20 rounded-full transition-all shadow-sm"
          >
            <span className="hidden sm:inline font-medium">{t('board.import')}</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">{t('board.addApp')}</span>
            <span className="sm:hidden">{t('board.addShortcut')}</span>
          </button>
          <button
            onClick={() => setShowShortcutsHelp(true)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm border border-gray-200/60 dark:border-white/10 rounded-full hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard size={15} />
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2 mb-6 shrink-0 relative z-10">
        {isFiltering && (
          <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
        )}
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-white/5 shrink-0 flex-wrap animate-in slide-in-from-top-2 fade-in duration-200 shadow-sm relative z-10">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">Source</span>
          <div className="flex gap-2 flex-wrap">
            {['', 'linkedin', 'referral', 'cold', 'job-board', 'unknown'].map(src => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  filterSource === src ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 bg-white dark:bg-gray-900'
                }`}
              >
                {src === '' ? 'All' : src === 'job-board' ? 'Job board' : src.charAt(0).toUpperCase() + src.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-4 flex-1">
          {STATUS_COLUMNS.map(status => {
            const columnApps = byStatus(status)
            const visibleApps = visibleByStatus(status)
            const remaining = columnApps.length - visibleApps.length

            return (
              <div key={status} className="flex-shrink-0 w-60 lg:w-64">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]} shadow-sm`} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                      {t(`board.column.${status}` as keyof typeof t)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 bg-white/50 dark:bg-[#0a0a0a]/50 px-2 py-0.5 rounded-full border border-gray-200/50 dark:border-white/10">{columnApps.length}</span>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-32 rounded-2xl p-2 space-y-3 transition-all duration-300 border ${
                        snapshot.isDraggingOver ? 'bg-brand-500/5 border-brand-500/20' : 'bg-transparent border-transparent'
                      }`}
                    >
                      {columnApps.length === 0 && <EmptyColumn status={status} filtered={isFiltering} />}
                      {visibleApps.map((app, index) => (
                        <Draggable key={app.appId} draggableId={app.appId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => !snapshot.isDragging && setSelectedApp(app)}
                              className={`group bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm rounded-xl p-3.5 border border-gray-200/60 dark:border-white/10 text-sm transition-all duration-300 cursor-pointer relative overflow-hidden ${
                                snapshot.isDragging ? 'shadow-2xl scale-[1.02] z-50 ring-1 ring-brand-500/50' : 'hover:shadow-lg hover:-translate-y-1 hover:border-gray-300 dark:hover:border-white/20'
                              }`}
                            >
                              <div className={`absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${STATUS_GLOW[status]}`} />
                              <div className="flex items-start justify-between gap-1 relative z-10">
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate tracking-tight">{app.company}</p>
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">{app.role}</p>
                                </div>
                                <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-[#0a0a0a] rounded-lg p-1 border border-gray-200 dark:border-white/10 shadow-sm">
                                  {app.jobDescUrl && (
                                    <a href={app.jobDescUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="p-1 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(app) }} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4 relative z-10 flex-wrap">
                                <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{app.source}</span>
                                {app.resumeVersion && (
                                  <span className="text-[10px] font-semibold bg-gray-100/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                    V{app.resumeVersion}
                                  </span>
                                )}
                                {app.followUpDate && new Date(app.followUpDate) <= new Date() && ['applied', 'screened'].includes(app.status) && (
                                  <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider ml-auto animate-pulse">
                                    {t('board.followUp')}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-medium text-gray-400 dark:text-gray-600 mt-2 relative z-10">{app.dateApplied}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* v2.1 Part 2: "Show more" pagination - keeps long columns from
                    rendering hundreds of cards (and DnD nodes) at once. */}
                {remaining > 0 && (
                  <button
                    onClick={() => showMore(status)}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 border border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 rounded-lg transition-colors"
                  >
                    <ChevronDown size={12} />
                    Show {Math.min(PAGE_SIZE, remaining)} more ({remaining} hidden)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {showModal && <AddApplicationModal onClose={() => setShowModal(false)} onSave={(data) => create(data as Omit<Application, 'appId' | 'userId' | 'createdAt' | 'updatedAt'>)} />}
      {showImport && <CsvImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
      {showShortcutsHelp && <ShortcutsHelpModal onClose={() => setShowShortcutsHelp(false)} />}
      {selectedApp && (
        <ApplicationDetailModal
          app={applications.find(a => a.appId === selectedApp.appId) ?? selectedApp}
          onClose={() => setSelectedApp(null)}
          onSave={(appId, data) => update(appId, data)}
          onDelete={(appId) => { remove(appId); setSelectedApp(null) }}
          onStatusChange={(appId, status) => changeStatus(appId, status)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete application"
          message={`Remove ${confirmDelete.company} - ${confirmDelete.role}? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { remove(confirmDelete.appId); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
