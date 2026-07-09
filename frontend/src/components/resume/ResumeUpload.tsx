import { useState, useRef, useEffect } from 'react'
import {
  Upload, FileText, CheckCircle, Trash2, RefreshCw, Loader2,
  Sparkles, ArrowUpRight, FolderOpen, Clock, ChevronRight
} from 'lucide-react'
import { getUploadUrl, uploadResumeToS3, listResumes, deleteResume } from '../../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from '../../lib/i18n/context'

interface Resume { versionName: string; filename: string; uploadedAt: string }

const inp = 'w-full border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200'

const card = 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/40 dark:border-gray-800/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_48px_rgba(255,255,255,0.02)]'

export default function ResumeUpload() {
  const { t } = useTranslation()
  const [versionName, setVersionName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [deletingVersion, setDeletingVersion] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fetchResumes = async () => {
    setLoadingResumes(true)
    try {
      const data = await listResumes()
      setResumes(data)
    } catch {
      // silently fail — not critical
    } finally {
      setLoadingResumes(false)
    }
  }

  useEffect(() => { fetchResumes() }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.type === 'application/pdf') setFile(f)
    else toast.error('Please select a PDF file')
  }

  const handleUpload = async () => {
    if (!file || !versionName.trim()) { toast.error('Add a version name and select a PDF'); return }
    setUploading(true)
    try {
      const { uploadUrl } = await getUploadUrl(file.name, versionName)
      await uploadResumeToS3(uploadUrl, file)
      toast.success(`Resume "${versionName}" uploaded`)
      setFile(null)
      setVersionName('')
      if (inputRef.current) inputRef.current.value = ''
      await fetchResumes()
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const handleDelete = async (versionName: string) => {
    if (!window.confirm(`Are you sure you want to delete the resume version "${versionName}"?\nIf this resume is attached to any applications, they will no longer be able to display it.`)) {
      return
    }

    setDeletingVersion(versionName)
    try {
      await deleteResume(versionName)
      toast.success(`Resume "${versionName}" deleted`)
      await fetchResumes()
    } catch {
      toast.error('Failed to delete resume')
    } finally {
      setDeletingVersion(null)
    }
  }

  // Get latest resume
  const latestResume = resumes.length > 0 ? resumes[0] : null

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-4xl mx-auto">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-brand-600 to-indigo-700 shadow-2xl shadow-brand-500/20 border border-white/10 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{t('resume.title')}</h1>
              <p className="text-sm text-blue-100/90 mt-1.5 font-medium">{t('resume.subtitle')}</p>
            </div>
            <div className="hidden sm:block p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <Sparkles size={32} className="text-white drop-shadow-lg animate-pulse" />
            </div>
          </div>
        </div>

      {/* Upload card */}
      <div className={`${card} p-8 space-y-6 relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 dark:from-brand-500/[0.02] dark:to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-purple-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('resume.uploadNew')}</p>
              <p className="text-xs text-gray-400">{t('resume.uploadDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Version name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('resume.versionName')}
              </label>
              <input
                className={inp}
                placeholder={t('resume.versionNamePlaceholder')}
                value={versionName}
                onChange={e => setVersionName(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Clock size={10} />
                {t('resume.versionNameHint')}
              </p>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                {t('resume.pdfFile')}
              </label>
              <div
                onClick={() => inputRef.current?.click()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && f.type === 'application/pdf') setFile(f)
                  else toast.error('Please select a PDF file')
                }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden
                  ${file ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-500/10' :
                    isDragging ? 'border-brand-400 bg-brand-50/30 dark:bg-brand-500/5' :
                      'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                `}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
                      <FileText size={20} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (inputRef.current) inputRef.current.value = '' }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                      <Upload size={24} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('resume.dropPdf')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('resume.clickToBrowse')}</p>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !versionName.trim()}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('resume.uploading')}
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {t('resume.uploadBtn')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Existing resumes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FolderOpen size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('resume.uploadedResumes')}</p>
              <p className="text-xs text-gray-400">{resumes.length} {resumes.length !== 1 ? t('resume.versionsCount') : t('resume.versionCount')}</p>
            </div>
          </div>
        </div>

        {loadingResumes ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`${card} p-4 animate-pulse`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className={`${card} p-12 text-center relative overflow-hidden group`}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={24} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('resume.noResumes')}</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                {t('resume.noResumesDesc')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r, i) => {
              const isLatest = i === 0
              return (
                <div
                  key={i}
                  className={`${card} p-4 group hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${isLatest ? 'bg-gradient-to-br from-brand-400 to-purple-400' : 'bg-gray-100 dark:bg-gray-800'}
                  `}>
                    <FileText size={16} className={isLatest ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {r.versionName}
                      </p>
                      {isLatest && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-gradient-to-r from-brand-400 to-purple-400 text-white rounded-full">
                          {t('resume.latest')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {r.filename} · {r.uploadedAt}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(r.versionName)}
                    disabled={deletingVersion === r.versionName}
                    className="p-2 text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300 disabled:opacity-50"
                    title="Delete resume"
                  >
                    {deletingVersion === r.versionName ? (
                      <Loader2 size={16} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
