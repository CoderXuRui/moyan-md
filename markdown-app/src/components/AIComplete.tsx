import { useState, useCallback, useEffect, useRef } from 'react'
import type { AIConfig } from '../ai/types'
import { chatStream } from '../ai/service'
import { buildAutoCompletePrompt, AUTO_COMPLETE_SYSTEM } from '../ai/prompts'

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  config: AIConfig | null
  editContent: string
  editTitle: string
}

export default function AIComplete({ textareaRef, config, editContent, editTitle }: Props) {
  const [suggestion, setSuggestion] = useState('')
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCursorRef = useRef(0)

  const computeCaretPos = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return { top: 0, left: 0 }

    const cursor = textarea.selectionStart
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

    const textBefore = editContent.slice(0, cursor)
    const safeText = textBefore
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    const markerId = 'ai-caret-' + Date.now()
    mirror.innerHTML = safeText + `<span id="${markerId}"></span>`

    document.body.appendChild(mirror)
    const marker = document.getElementById(markerId)
    const markerRect = marker?.getBoundingClientRect()
    const textareaRect = textarea.getBoundingClientRect()
    document.body.removeChild(mirror)

    if (markerRect) {
      const paddingLeft = parseFloat(style.paddingLeft)
      return {
        top: markerRect.top - textareaRect.top + textarea.scrollTop + 24,
        left: markerRect.left - textareaRect.left + paddingLeft,
      }
    }
    return { top: 0, left: 0 }
  }, [textareaRef, editContent])

  const fetchSuggestion = useCallback(async () => {
    if (!config?.enabled || !config.apiKey) return
    const textarea = textareaRef.current
    if (!textarea) return

    const cursor = textarea.selectionStart
    if (cursor < 10) return // Need some context

    // Don't re-fetch if cursor hasn't moved much
    if (Math.abs(cursor - lastCursorRef.current) < 3 && suggestion) return
    lastCursorRef.current = cursor

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setSuggestion('')
    const pos = computeCaretPos()
    setPos(pos)
    setVisible(true)

    let fullText = ''

    try {
      await chatStream(
        config,
        [
          { role: 'system', content: AUTO_COMPLETE_SYSTEM },
          { role: 'user', content: buildAutoCompletePrompt(editTitle, editContent, cursor) },
        ],
        (chunk) => {
          if (chunk.done) {
            setLoading(false)
          } else {
            fullText += chunk.content
            setSuggestion(fullText)
          }
        }
      )
    } catch {
      setLoading(false)
      setVisible(false)
    }
  }, [config, textareaRef, editContent, editTitle, computeCaretPos, suggestion])

  // Trigger suggestion after typing pause
  useEffect(() => {
    if (!config?.enabled) return
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      const cursor = textarea.selectionStart
      const end = textarea.selectionEnd
      // Only suggest when cursor is at end of content and no selection
      if (cursor === end && cursor === editContent.length && editContent.length > 10) {
        fetchSuggestion()
      }
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [editContent, config, fetchSuggestion, textareaRef])

  // Handle Tab to accept suggestion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && visible && suggestion) {
        e.preventDefault()
        const textarea = textareaRef.current
        if (!textarea) return

        const cursor = textarea.selectionStart
        const newContent = editContent.slice(0, cursor) + suggestion + editContent.slice(cursor)

        // Dispatch a synthetic input event to update state
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(textarea, newContent)
          textarea.dispatchEvent(new Event('input', { bubbles: true }))
        }

        // Move cursor to end of inserted suggestion
        setTimeout(() => {
          const newCursor = cursor + suggestion.length
          textarea.setSelectionRange(newCursor, newCursor)
          textarea.focus()
        }, 0)

        setVisible(false)
        setSuggestion('')
      }

      if (e.key === 'Escape' && visible) {
        setVisible(false)
        setSuggestion('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visible, suggestion, editContent, textareaRef])

  // Hide on click outside
  useEffect(() => {
    if (!visible) return
    const handleClick = () => {
      setVisible(false)
      setSuggestion('')
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="ai-complete-suggestion"
      style={{
        position: 'absolute',
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        zIndex: 50,
      }}
    >
      <span className="ai-complete-text">{suggestion}</span>
      {loading && <span className="ai-complete-pulse" />}
      {suggestion && (
        <span className="ai-complete-hint">
          <kbd>Tab</kbd> 接受
        </span>
      )}
    </div>
  )
}
