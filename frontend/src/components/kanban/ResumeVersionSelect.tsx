import { useResumes } from '../../hooks/useResumes'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export default function ResumeVersionSelect({
  value,
  onChange,
  className = '',
  disabled = false
}: Props) {
  const { resumes, loading } = useResumes()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const knownNames = new Set(resumes.map(r => r.versionName))
  const hasStaleValue = value.trim() !== '' && !knownNames.has(value)
  const noResumesUploaded = !loading && resumes.length === 0
  const isLoading = loading

  const selectedResume = resumes.find(r => r.versionName === value)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        className={`
          w-full px-4 py-2.5 text-left 
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-xl 
          shadow-sm hover:shadow-md 
          transition-all duration-200
          flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:border-brand-400
          ${disabled || isLoading || noResumesUploaded ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300 dark:hover:border-gray-600'}
          ${className}
        `}
        onClick={() => !disabled && !isLoading && !noResumesUploaded && setIsOpen(!isOpen)}
        disabled={disabled || isLoading || noResumesUploaded}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isLoading ? (
            <Loader2 size={16} className="text-brand-500 animate-spin flex-shrink-0" />
          ) : hasStaleValue ? (
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
          ) : selectedResume ? (
            <FileText size={16} className="text-brand-500 flex-shrink-0" />
          ) : (
            <FileText size={16} className="text-gray-400 flex-shrink-0" />
          )}

          <span className={`truncate text-sm ${!value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {isLoading ? 'Loading resumes...' :
              noResumesUploaded ? 'No resumes uploaded yet' :
                hasStaleValue ? `${value} (no longer available)` :
                  selectedResume ? selectedResume.versionName : 'Select a resume version'}
          </span>
        </div>

        {!disabled && !isLoading && !noResumesUploaded && (
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && !disabled && !isLoading && !noResumesUploaded && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden animate-slideDown">
          <div className="max-h-60 overflow-y-auto py-1">
            {resumes.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                No resumes available
              </div>
            ) : (
              resumes.map((resume) => {
                const isSelected = resume.versionName === value
                return (
                  <button
                    key={resume.versionName}
                    onClick={() => {
                      onChange(resume.versionName)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full px-4 py-2.5 text-left text-sm
                      flex items-center gap-3
                      transition-colors duration-150
                      ${isSelected
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <FileText size={14} className={`flex-shrink-0 ${isSelected ? 'text-brand-500' : 'text-gray-400'}`} />
                    <span className="flex-1 truncate">{resume.versionName}</span>
                    {isSelected && (
                      <Check size={14} className="text-brand-500 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Status messages */}
      {hasStaleValue && !isOpen && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
          <AlertCircle size={12} />
          This resume version is no longer available
        </p>
      )}

      {noResumesUploaded && !isOpen && (
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <AlertCircle size={12} />
          No resumes uploaded yet - head to the Resumes page to upload one first
        </p>
      )}
    </div>
  )
}