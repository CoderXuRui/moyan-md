export interface Category {
  id: string
  name: string
  createdAt: number
}

export interface Note {
  id: string
  title: string
  content: string
  categoryId: string | null
  createdAt: number
  updatedAt: number
}
