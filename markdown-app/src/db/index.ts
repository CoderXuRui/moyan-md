/**
 * IndexedDB 封装 - 墨砚笔记存储引擎
 *
 * 特性：
 * - Promise-based API
 * - 自动版本升级与数据迁移
 * - 批量操作支持
 */

import type { Note } from '../types'

const DB_NAME = 'moyan-db'
const DB_VERSION = 1
const STORE_NOTES = 'notes'
const STORE_META = 'meta'
const OLD_LS_KEY = 'markdown-notes-v3'

interface DBMeta {
  key: string
  value: unknown
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        const store = db.createObjectStore(STORE_NOTES, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }
  })
}

/**
 * 从 LocalStorage 迁移数据到 IndexedDB
 */
export async function migrateFromLocalStorage(): Promise<boolean> {
  const stored = localStorage.getItem(OLD_LS_KEY)
  if (!stored) return false

  try {
    const notes: Note[] = JSON.parse(stored)
    if (!Array.isArray(notes) || notes.length === 0) return false

    const db = await openDB()
    const tx = db.transaction(STORE_NOTES, 'readwrite')
    const store = tx.objectStore(STORE_NOTES)

    for (const note of notes) {
      await promisifyRequest(store.put(note))
    }

    await promisifyRequest(tx as unknown as IDBRequest)
    db.close()

    // 迁移成功后删除 LocalStorage，但保留一个标记
    localStorage.setItem('moyan-migrated', 'true')
    localStorage.removeItem(OLD_LS_KEY)

    return true
  } catch {
    return false
  }
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ===========================
// Notes CRUD
// ===========================

export async function getAllNotes(): Promise<Note[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NOTES, 'readonly')
  const store = tx.objectStore(STORE_NOTES)
  const index = store.index('updatedAt')
  const request = index.openCursor(null, 'prev')

  const notes: Note[] = []

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        notes.push(cursor.value)
        cursor.continue()
      } else {
        db.close()
        resolve(notes)
      }
    }
    request.onerror = () => {
      db.close()
      reject(request.error)
    }
  })
}

export async function saveNote(note: Note): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NOTES, 'readwrite')
  const store = tx.objectStore(STORE_NOTES)
  await promisifyRequest(store.put(note))
  db.close()
}

export async function saveNotes(notes: Note[]): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NOTES, 'readwrite')
  const store = tx.objectStore(STORE_NOTES)

  for (const note of notes) {
    store.put(note)
  }

  await promisifyRequest(tx as unknown as IDBRequest)
  db.close()
}

export async function deleteNote(noteId: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NOTES, 'readwrite')
  const store = tx.objectStore(STORE_NOTES)
  await promisifyRequest(store.delete(noteId))
  db.close()
}

// ===========================
// Meta / Preferences
// ===========================

export async function getMeta(key: string): Promise<unknown> {
  const db = await openDB()
  const tx = db.transaction(STORE_META, 'readonly')
  const store = tx.objectStore(STORE_META)
  const result = await promisifyRequest<DBMeta | undefined>(store.get(key))
  db.close()
  return result?.value
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_META, 'readwrite')
  const store = tx.objectStore(STORE_META)
  await promisifyRequest(store.put({ key, value }))
  db.close()
}

// ===========================
// Export
// ===========================

export async function exportAllNotes(): Promise<Note[]> {
  return getAllNotes()
}
