import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { v4 as uuidv4 } from 'uuid'
import type { Note } from './types'
import {
  getAllNotes,
  saveNote,
  deleteNote,
  migrateFromLocalStorage,
  getMeta,
  setMeta,
} from './db'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { registerSW, skipWaitingAndReload } from './sw-register'
import FloatingToolbar from './components/FloatingToolbar'
import AIComplete from './components/AIComplete'
import CodeExplain from './components/CodeExplain'
import { getAIConfig, chat } from './ai/service'
import { MARKDOWN_FIX_SYSTEM } from './ai/prompts'
import './index.css'

const THEME_META_KEY = 'theme'

const formatTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a7 7 0 0 0 0 14 4 4 0 0 1 0 8 7 7 0 0 0 0-14" />
    <circle cx="12" cy="9" r="2" />
    <circle cx="9" cy="14" r="2" />
    <circle cx="15" cy="14" r="2" />
  </svg>
)

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const MaximizeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const MinimizeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="14" y1="10" x2="21" y2="3" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const OfflineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const CloudCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const WandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
)

// Syntax highlighting style
const syntaxStyle = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: 'transparent',
    margin: '0',
    padding: '0',
    borderRadius: '0',
    fontSize: '0.8125rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background: 'transparent',
    fontSize: '0.8125rem',
  },
}

function App() {
  // ====== State ======
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [theme, setTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(true)
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const aiConfig = getAIConfig()
  const [explainCode, setExplainCode] = useState<string | null>(null)
  const [explainLang, setExplainLang] = useState<string | undefined>()
  const [fixingMarkdown, setFixingMarkdown] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(false)

  const { online } = useNetworkStatus()

  // ====== Init: load from IndexedDB ======
  useEffect(() => {
    const init = async () => {
      // 1. 尝试迁移旧数据
      await migrateFromLocalStorage()

      // 2. 加载笔记列表
      const loaded = await getAllNotes()
      setNotes(loaded)

      // 3. 加载主题偏好
      const savedTheme = (await getMeta(THEME_META_KEY) as string) || 'light'
      setTheme(savedTheme)

      setIsLoading(false)
      isMountedRef.current = true
    }
    init()
  }, [])

  // ====== Apply theme ======
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (isMountedRef.current) {
      setMeta(THEME_META_KEY, theme)
    }
  }, [theme])

  // ====== Register SW ======
  useEffect(() => {
    if (import.meta.env.PROD) {
      registerSW({
        onUpdate: () => setSwUpdateAvailable(true),
      })
    }
  }, [])

  const cycleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'sepia'
      return 'light'
    })
  }, [])

  // Word and character count
  const wordCount = useMemo(() => {
    if (!editContent.trim()) return 0
    return editContent.trim().split(/\s+/).length
  }, [editContent])

  const charCount = useMemo(() => {
    return editContent.length
  }, [editContent])

  // ====== Click outside export menu ======
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes
    const query = searchQuery.toLowerCase()
    return notes.filter(
      note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    )
  }, [notes, searchQuery])

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note)
    setEditTitle(note.title)
    setEditContent(note.content)
    setIsCreating(false)
    setIsMobileMenuOpen(false)
    setShowExportMenu(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleCreateNote = useCallback(() => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes(prev => [newNote, ...prev])
    setSelectedNote(newNote)
    setEditTitle('')
    setEditContent('')
    setIsCreating(true)
    setShowExportMenu(false)
    // 立即保存到 IndexedDB
    saveNote(newNote)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  // ====== Auto-save to IndexedDB (debounced) ======
  const triggerAutoSave = useCallback(async () => {
    if (!selectedNote) return

    const updated: Note = {
      ...selectedNote,
      title: editTitle || '无标题',
      content: editContent,
      updatedAt: Date.now(),
    }

    setNotes(prev =>
      prev.map(note => note.id === selectedNote.id ? updated : note)
    )
    setSelectedNote(updated)
    setIsCreating(false)

    await saveNote(updated)
  }, [selectedNote, editTitle, editContent])

  useEffect(() => {
    if (!selectedNote || isCreating) return

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      triggerAutoSave()
    }, 800)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [editTitle, editContent, selectedNote, isCreating, triggerAutoSave])

  const handleDeleteNote = useCallback(async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteNote(noteId)
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setEditTitle('')
      setEditContent('')
    }
  }, [selectedNote])

  // Import markdown file
  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = event.target?.result as string
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : file.name.replace('.md', '')
        const cleanContent = content.replace(/^#\s+.+\n+/, '')

        const newNote: Note = {
          id: uuidv4(),
          title,
          content: cleanContent,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        await saveNote(newNote)
        setNotes(prev => [newNote, ...prev])
        setSelectedNote(newNote)
        setEditTitle(title)
        setEditContent(cleanContent)
        setIsCreating(false)
        setIsMobileMenuOpen(false)
        setTimeout(() => textareaRef.current?.focus(), 100)
      }
      reader.readAsText(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Export functions
  const exportMarkdown = useCallback(() => {
    const content = `# ${editTitle || '无标题'}\n\n${editContent}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${editTitle || '无标题'}.md`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [editTitle, editContent])

  const exportHTML = useCallback(() => {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${editTitle || '无标题'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
    h1, h2, h3 { font-weight: 600; margin-top: 1.5em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Monaco, monospace; }
    pre { background: #1a1a1a; color: #f0f0f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 3px solid #c94a3a; margin: 1em 0; padding-left: 16px; color: #666; font-style: italic; }
    img { max-width: 100%; border-radius: 8px; }
  </style>
</head>
<body>
${editContent}
</body>
</html>`
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${editTitle || '无标题'}.html`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }, [editTitle, editContent])

  const exportPDF = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${editTitle || '无标题'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
    h1, h2, h3 { font-weight: 600; margin-top: 1.5em; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'SF Mono', Monaco, monospace; font-size: 0.9em; }
    pre { background: #1a1a1a; color: #f0f0f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 3px solid #c94a3a; margin: 1em 0; padding-left: 16px; color: #666; font-style: italic; }
    img { max-width: 100%; border-radius: 8px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
${editContent}
</body>
</html>`)
      printWindow.document.close()
      printWindow.print()
    }
    setShowExportMenu(false)
  }, [editTitle, editContent])

  // ====== Floating Toolbar ======
  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    setToolbarVisible(start !== end && start >= 0 && end > start)
  }, [])

  const handleFormatText = useCallback((before: string, after: string, block?: boolean) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = editContent.slice(start, end)

    if (!selected) return

    let replacement: string

    if (block) {
      // For block-level formatting (heading, quote, list)
      const lines = selected.split('\n')
      replacement = lines.map(line => before + line).join('\n')
    } else if (before === '```\n' && after === '\n```') {
      // Code block
      replacement = before + selected + after
    } else {
      // Inline formatting
      replacement = before + selected + after
    }

    const newContent = editContent.slice(0, start) + replacement + editContent.slice(end)
    setEditContent(newContent)
    setToolbarVisible(false)

    // Restore focus and adjust selection
    setTimeout(() => {
      textarea.focus()
      const newCursor = start + replacement.length
      textarea.setSelectionRange(newCursor, newCursor)
    }, 0)
  }, [editContent])

  // ====== AI: Markdown Fix ======
  const handleFixMarkdown = useCallback(async () => {
    if (!aiConfig?.enabled || !aiConfig.apiKey) {
      alert('AI 功能未启用，请联系开发者配置')
      return
    }
    setFixingMarkdown(true)
    try {
      const fixed = await chat(aiConfig, [
        { role: 'system', content: MARKDOWN_FIX_SYSTEM },
        { role: 'user', content: editContent },
      ])
      setEditContent(fixed)
    } catch (err) {
      alert(err instanceof Error ? err.message : '修正失败')
    } finally {
      setFixingMarkdown(false)
    }
  }, [aiConfig, editContent])

  // ====== AI: Code Explain ======
  const handleExplainSelection = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = editContent.slice(start, end).trim()
    if (!selected) return

    // Try to detect language from code block context
    const beforeText = editContent.slice(0, start)
    const langMatch = beforeText.match(/```(\w+)\s*\n[^`]*$/)
    const lang = langMatch ? langMatch[1] : undefined

    setExplainCode(selected)
    setExplainLang(lang)
  }, [editContent])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreateNote, isFocusMode])

  // ====== Loading State ======
  if (isLoading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
          <div style={{ fontFamily: "'Noto Serif SC', serif", fontSize: '32px', fontWeight: 700, marginBottom: '12px', color: 'var(--ink)' }}>
            墨砚
          </div>
          <div style={{ fontSize: '14px', color: 'var(--ink-faint)' }}>
            正在唤醒...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`app-container ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* SW Update Banner */}
      {swUpdateAvailable && (
        <div className="sw-update-banner">
          <span>新版本已就绪，刷新即可体验</span>
          <button className="sw-update-btn" onClick={skipWaitingAndReload}>
            立即刷新
          </button>
          <button className="sw-dismiss-btn" onClick={() => setSwUpdateAvailable(false)}>
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".md,text/markdown"
        style={{ display: 'none' }}
      />

      {/* Header - hidden in focus mode */}
      {!isFocusMode && (
      <header className="app-header">
        <div className="header-left">
          <button
            className="menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
          <div className="logo">
            <span className="logo-mark">墨</span>
            <span className="logo-text">砚</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="header-right">
          <button
            className="action-btn theme-btn"
            onClick={cycleTheme}
            title={`当前主题: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '护眼'}`}
          >
            {theme === 'light' && <SunIcon />}
            {theme === 'dark' && <MoonIcon />}
            {theme === 'sepia' && <PaletteIcon />}
          </button>
          <button
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="导入 Markdown 文件"
          >
            <UploadIcon />
          </button>
          <button className="new-note-btn" onClick={handleCreateNote}>
            <PlusIcon />
            <span>新建</span>
          </button>
        </div>
      </header>
      )}

      <div className="app-body">
        {/* Sidebar - hidden in focus mode */}
        {!isFocusMode && (
        <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar--open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">笔记 ({filteredNotes.length})</span>
          </div>

          <div className="note-list">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <p className="empty-text">
                  {searchQuery ? '无匹配结果' : '暂无笔记'}
                </p>
                {!searchQuery && (
                  <button className="empty-action" onClick={handleCreateNote}>
                    创建第一篇
                  </button>
                )}
              </div>
            ) : (
              filteredNotes.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`note-item ${selectedNote?.id === note.id ? 'note-item--active' : ''}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="note-item-header">
                    <span className="note-title">{note.title || '无标题'}</span>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="note-delete"
                      aria-label="Delete note"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <p className="note-preview">
                    {note.content.replace(/[#*`>\[\]]/g, '').slice(0, 60) || '空白笔记'}
                  </p>
                  <span className="note-time">{formatTime(note.updatedAt)}</span>
                </div>
              ))
            )}
          </div>
        </aside>
        )}

        {isMobileMenuOpen && !isFocusMode && (
          <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Editor + Preview Container */}
        <div className="editor-preview-container">
          {selectedNote ? (
            <>
              {/* Topbar */}
              <div className="editor-topbar">
                <button
                  className="editor-close"
                  onClick={() => setSelectedNote(null)}
                >
                  <CloseIcon />
                </button>

                <div className="topbar-actions">
                  {/* AI Markdown Fix */}
                  <button
                    className="action-btn"
                    onClick={handleFixMarkdown}
                    disabled={fixingMarkdown || !editContent.trim()}
                    title={fixingMarkdown ? '正在修正...' : 'AI 修正 Markdown 格式'}
                  >
                    <WandIcon />
                  </button>

                  {/* Focus mode */}
                  <button
                    className="action-btn"
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    title={isFocusMode ? '退出专注模式 (Esc)' : '专注模式'}
                  >
                    {isFocusMode ? <MinimizeIcon /> : <MaximizeIcon />}
                  </button>

                  {/* Export menu */}
                  <div className="export-menu-container" ref={exportMenuRef}>
                    <button
                      className="action-btn"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      title="导出文档"
                    >
                      <DownloadIcon />
                    </button>
                    {showExportMenu && (
                      <div className="export-menu">
                        <button className="export-option" onClick={exportMarkdown}>
                          <ExportIcon />
                          <span>导出 Markdown (.md)</span>
                        </button>
                        <button className="export-option" onClick={exportHTML}>
                          <ExportIcon />
                          <span>导出 HTML (.html)</span>
                        </button>
                        <button className="export-option" onClick={exportPDF}>
                          <ExportIcon />
                          <span>导出 PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="editor-status">
                  {/* Network status */}
                  <span className={`status-network ${online ? 'online' : 'offline'}`}>
                    {online ? <CloudCheckIcon /> : <OfflineIcon />}
                    <span className="status-text">{online ? '在线' : '离线'}</span>
                  </span>
                  <span className="status-divider">|</span>
                  <span className="status-dot" />
                  <span className="status-text">
                    {isCreating ? '新建中...' : '已保存'}
                  </span>
                  {selectedNote && (
                    <>
                      <span className="status-divider">|</span>
                      <span className="status-text">{wordCount} 字</span>
                      <span className="status-divider">|</span>
                      <span className="status-text">{charCount} 字符</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="title-area">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="无标题"
                  className="title-input"
                />
              </div>

              {/* Editor and Preview Side by Side */}
              <div className="split-view">
                {/* Editor Pane */}
                <div className="editor-pane" style={{ position: 'relative' }}>
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                    placeholder="在此书写...

支持 Markdown 语法：
# 标题
**粗体** *斜体*
- 列表项
`代码`
```代码块```
[链接](url)"
                    className="content-textarea"
                  />
                  <AIComplete
                    textareaRef={textareaRef}
                    config={aiConfig}
                    editContent={editContent}
                    editTitle={editTitle}
                  />
                  <FloatingToolbar
                    textareaRef={textareaRef}
                    onFormat={handleFormatText}
                    onExplain={handleExplainSelection}
                    visible={toolbarVisible}
                    onClose={() => setToolbarVisible(false)}
                  />
                </div>

                {/* Divider */}
                <div className="split-divider" />

                {/* Preview Pane */}
                <div className="preview-pane">
                  <ReactMarkdown
                    components={{
                      img({ src, alt, ...props }) {
                        if (!src) return null
                        return <img src={src} alt={alt || ''} style={{ maxWidth: '100%', borderRadius: '8px', margin: '1em 0' }} {...props} />
                      },
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !className
                        if (isInline) {
                          return <code {...props}>{children}</code>
                        }
                        return (
                          <SyntaxHighlighter
                            style={syntaxStyle}
                            language={match ? match[1] : 'text'}
                            PreTag="div"
                            customStyle={{
                              margin: '1em 0',
                              borderRadius: '8px',
                              padding: '16px',
                              fontSize: '0.8125rem',
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        )
                      }
                    }}
                  >
                    {editContent || '*暂无内容*'}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-state">
              <div className="welcome-card">
                <div className="welcome-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                    <path d="M2 2l7.586 7.586" />
                    <circle cx="11" cy="11" r="2" />
                  </svg>
                </div>
                <h2 className="welcome-title">墨香四溢</h2>
                <p className="welcome-desc">心随笔动，文思泉涌</p>
                <button className="welcome-btn" onClick={handleCreateNote}>
                  <PlusIcon />
                  <span>开始创作</span>
                </button>
                <div className="welcome-shortcut">
                  <kbd>⌘</kbd><kbd>N</kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Explain Panel */}
      {explainCode && (
        <CodeExplain
          code={explainCode}
          language={explainLang}
          config={aiConfig}
          onClose={() => {
            setExplainCode(null)
            setExplainLang(undefined)
          }}
        />
      )}
    </div>
  )
}

export default App
