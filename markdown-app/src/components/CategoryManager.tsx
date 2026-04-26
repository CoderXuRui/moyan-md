import { useState, useCallback } from 'react'
import type { Category, Note } from '../types'

interface CategoryManagerProps {
  categories: Category[]
  selectedCategoryId: string | null | undefined
  onSelectCategory: (id: string | null | undefined) => void
  onAddCategory: (name: string) => void
  onDeleteCategory: (id: string) => void
}

const FolderIcon = ({ open }: { open?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 21 6 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

export default function CategoryManager({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const handleAddCategory = useCallback(() => {
    const name = newCategoryName.trim()
    if (name) {
      onAddCategory(name)
      setNewCategoryName('')
      setIsAdding(false)
    }
  }, [newCategoryName, onAddCategory])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddCategory()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewCategoryName('')
    }
  }, [handleAddCategory])

  return (
    <>
      <div className="sidebar-header">
        <span className="sidebar-title">分类</span>
      </div>

      <div className="category-list">
        {/* 全部笔记 */}
        <button
          className={`category-item ${selectedCategoryId === undefined ? 'category-item--active' : ''}`}
          onClick={() => onSelectCategory(undefined)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10.5V6a2 2 0 0 0-2-2h-6.5l-1-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6" />
            <path d="M14 22a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2h5" />
            <path d="M20 22a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
          </svg>
          <span className="category-name">全部笔记</span>
        </button>

        {/* 未分类 */}
        <button
          className={`category-item ${selectedCategoryId === null ? 'category-item--active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <InboxIcon />
          <span className="category-name">未分类</span>
        </button>

        {/* 分类列表 */}
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-item-wrapper ${selectedCategoryId === category.id ? 'category-item--active' : ''}`}
          >
            <button
              className="category-item"
              onClick={() => onSelectCategory(category.id)}
            >
              <FolderIcon />
              <span className="category-name">{category.name}</span>
            </button>
            <button
              className="category-delete"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`确定要删除分类「${category.name}」吗？里面的笔记会移到未分类。`)) {
                  onDeleteCategory(category.id)
                }
              }}
              title="删除分类"
            >
              <TrashIcon />
            </button>
          </div>
        ))}

        {/* 添加分类按钮 */}
        {!isAdding ? (
          <button className="category-add-btn" onClick={() => setIsAdding(true)}>
            <PlusIcon />
            <span>新建分类</span>
          </button>
        ) : (
          <div className="category-input-wrapper">
            <input
              className="category-input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入分类名"
              autoFocus
            />
            <button className="category-add-confirm" onClick={handleAddCategory}>
              ✓
            </button>
            <button className="category-add-cancel" onClick={() => { setIsAdding(false); setNewCategoryName(''); }}>
              ✕
            </button>
          </div>
        )}
      </div>
    </>
  )
}
