import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { v4 as uuidv4 } from 'uuid'
import './index.css'

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'markdown-notes-v3'

const loadNotes = (): Note[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

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
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

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
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleUpdateNote = useCallback(() => {
    if (!selectedNote) return
    setNotes(prev =>
      prev.map(note =>
        note.id === selectedNote.id
          ? { ...note, title: editTitle || '无标题', content: editContent, updatedAt: Date.now() }
          : note
      )
    )
    setSelectedNote(prev => prev ? { ...prev, title: editTitle || '无标题', content: editContent, updatedAt: Date.now() } : null)
    setIsCreating(false)
  }, [selectedNote, editTitle, editContent])

  const handleDeleteNote = useCallback((noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotes(prev => prev.filter(note => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setEditTitle('')
      setEditContent('')
    }
  }, [selectedNote])

  useEffect(() => {
    if (!selectedNote || isCreating) return
    const timer = setTimeout(handleUpdateNote, 800)
    return () => clearTimeout(timer)
  }, [editTitle, editContent, handleUpdateNote, isCreating, selectedNote])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNote()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleCreateNote])

  return (
    <div className="app-container">
      {/* Header */}
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
          <button className="new-note-btn" onClick={handleCreateNote}>
            <PlusIcon />
            <span>新建</span>
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar */}
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

        {isMobileMenuOpen && (
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
                <div className="editor-status">
                  <span className="status-dot" />
                  <span className="status-text">
                    {isCreating ? '新建中...' : '已保存'}
                  </span>
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
                <div className="editor-pane">
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="在此书写..."
                    className="content-textarea"
                  />
                </div>

                {/* Divider */}
                <div className="split-divider" />

                {/* Preview Pane */}
                <div className="preview-pane">
                  <ReactMarkdown
                    components={{
                      code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !match && !className
                        if (isInline) {
                          return <code className={className} {...props}>{children}</code>
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
    </div>
  )
}

export default App