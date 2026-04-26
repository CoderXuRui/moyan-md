import { useState, useCallback, useMemo } from 'react'
import type { Note } from '../types'

interface TagManagerProps {
  allTags: string[]
  selectedNote: Note | null
  activeFilter: string | null
  onToggleTag: (tag: string) => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
  onFilterByTag: (tag: string | null) => void
}

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
)

export default function TagManager({
  allTags,
  selectedNote,
  activeFilter,
  onToggleTag,
  onAddTag,
  onRemoveTag,
  onFilterByTag
}: TagManagerProps) {
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)

  const noteTags = selectedNote?.tags || []

  // 过滤掉已选标签的建议
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return allTags.filter(t => !noteTags.includes(t))
    const lowerInput = inputValue.toLowerCase()
    return allTags.filter(
      t => !noteTags.includes(t) && t.toLowerCase().includes(lowerInput)
    )
  }, [allTags, noteTags, inputValue])

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault()
    const tag = inputValue.trim()
    if (tag) {
      onAddTag(tag)
      setInputValue('')
      setShowInput(false)
    }
  }, [inputValue, onAddTag])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setInputValue('')
      setShowInput(false)
    } else if (e.key === 'Enter') {
      handleSubmit()
    }
  }, [handleSubmit])

  return (
    <>
      {/* 侧边栏标签过滤器 */}
      <div className="sidebar-header">
        <span className="sidebar-title">标签</span>
      </div>

      <div className="tag-filter-list">
        <button
          className={`tag-filter-btn ${!activeFilter ? 'active' : ''}`}
          onClick={() => onFilterByTag(null)}
        >
          全部笔记
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-filter-btn ${activeFilter === tag ? 'active' : ''}`}
            onClick={() => onFilterByTag(tag)}
          >
            <span className="tag-pill">{tag}</span>
          </button>
        ))}
      </div>

      {/* 当前笔记的标签编辑区 */}
      {selectedNote && (
        <div className="note-tags-section">
          <div className="note-tags-list">
            {noteTags.map(tag => (
              <span key={tag} className="tag-pill tag-pill--removable">
                {tag}
                <button
                  className="tag-remove-btn"
                  onClick={() => onRemoveTag(tag)}
                  aria-label="移除标签"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
            {!showInput && (
              <button
                className="tag-add-btn"
                onClick={() => setShowInput(true)}
              >
                <PlusIcon />
                <span>添加标签</span>
              </button>
            )}
          </div>

          {showInput && (
            <form onSubmit={handleSubmit} className="tag-input-form">
              <div className="tag-input-wrapper">
                <input
                  className="tag-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setShowInput(false), 200)}
                  placeholder="输入标签名..."
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <div className="tag-suggestions">
                    {suggestions.map(tag => (
                      <button
                        key={tag}
                        className="tag-suggestion-item"
                        type="button"
                        onClick={() => {
                          onAddTag(tag)
                          setInputValue('')
                          setShowInput(false)
                        }}
                      >
                        <span className="tag-pill">{tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </>
  )
}
