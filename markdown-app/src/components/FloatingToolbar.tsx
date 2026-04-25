import { useEffect, useRef, useCallback } from 'react'

interface ToolbarAction {
  key: string
  label: string
  icon: React.ReactNode
  wrap: [string, string]
  block?: boolean
}

const BoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const ItalicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const StrikethroughIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.3 19c.58-1.1.7-2.38.7-3.6 0-3.2-2.3-5-5.3-5.5" />
    <path d="M6.5 5C5.87 6.1 5.5 7.38 5.5 8.6c0 3.2 2.3 5 5.3 5.5" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </svg>
)

const CodeInlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const H1Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="m17 12 3-2v8" />
  </svg>
)

const H2Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M21 18h-4c0-1.5.8-2.8 2-3.5 1.2-.7 2-1 2-2s-.5-1.5-1.5-1.5-1.5.5-1.5 1.5" />
  </svg>
)

const QuoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
  </svg>
)

const ListUlIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const ListOlIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
)

const CodeBlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const ACTIONS: ToolbarAction[] = [
  { key: 'bold', label: '加粗', icon: <BoldIcon />, wrap: ['**', '**'] },
  { key: 'italic', label: '斜体', icon: <ItalicIcon />, wrap: ['*', '*'] },
  { key: 'strike', label: '删除线', icon: <StrikethroughIcon />, wrap: ['~~', '~~'] },
  { key: 'code', label: '行内代码', icon: <CodeInlineIcon />, wrap: ['`', '`'] },
  { key: 'h1', label: '标题 1', icon: <H1Icon />, wrap: ['# ', ''], block: true },
  { key: 'h2', label: '标题 2', icon: <H2Icon />, wrap: ['## ', ''], block: true },
  { key: 'quote', label: '引用', icon: <QuoteIcon />, wrap: ['> ', ''], block: true },
  { key: 'ul', label: '无序列表', icon: <ListUlIcon />, wrap: ['- ', ''], block: true },
  { key: 'ol', label: '有序列表', icon: <ListOlIcon />, wrap: ['1. ', ''], block: true },
  { key: 'codeblock', label: '代码块', icon: <CodeBlockIcon />, wrap: ['```\n', '\n```'] },
  { key: 'link', label: '链接', icon: <LinkIcon />, wrap: ['[', '](url)'] },
]

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onFormat: (before: string, after: string, block?: boolean) => void
  visible: boolean
  onClose: () => void
}

export default function FloatingToolbar({ textareaRef, onFormat, visible, onClose }: Props) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ top: 0, left: 0 })

  const computePosition = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    if (start === end) return

    // Create a mirror element to calculate caret position
    const style = window.getComputedStyle(textarea)
    const mirror = document.createElement('div')
    Object.assign(mirror.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      font: style.font,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      padding: style.padding,
      border: style.border,
      width: `${textarea.clientWidth}px`,
      boxSizing: style.boxSizing,
    })

    const textBefore = textarea.value.slice(0, end)

    // Build content up to selection end
    const safeText = textBefore
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Insert a marker at the end
    const markerId = 'toolbar-caret-marker-' + Date.now()
    mirror.innerHTML = safeText + `<span id="${markerId}"></span>`

    document.body.appendChild(mirror)
    const marker = document.getElementById(markerId)
    const markerRect = marker?.getBoundingClientRect()
    const textareaRect = textarea.getBoundingClientRect()
    document.body.removeChild(mirror)

    if (markerRect) {
      const toolbarWidth = 360
      let left = markerRect.left - textareaRect.left + parseFloat(style.paddingLeft)
      let top = markerRect.top - textareaRect.top - 44 + textarea.scrollTop

      // Clamp within textarea bounds
      left = Math.max(8, Math.min(left, textarea.clientWidth - toolbarWidth - 8))
      top = Math.max(8, top)

      posRef.current = { top, left }
    }
  }, [textareaRef])

  useEffect(() => {
    if (visible) {
      computePosition()
    }
  }, [visible, computePosition])

  // Close on click outside
  useEffect(() => {
    if (!visible) return
    const handleDocClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div
      ref={toolbarRef}
      className="floating-toolbar"
      style={{
        position: 'absolute',
        top: `${posRef.current.top}px`,
        left: `${posRef.current.left}px`,
        zIndex: 50,
      }}
    >
      {ACTIONS.map(action => (
        <button
          key={action.key}
          className="toolbar-btn"
          title={action.label}
          onClick={() => onFormat(action.wrap[0], action.wrap[1], action.block)}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}
