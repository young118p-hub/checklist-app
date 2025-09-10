export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  createdAt: Date
}

export interface Checklist {
  id: string
  title: string
  description?: string
  isTemplate: boolean
  isPublic: boolean
  peopleCount?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  categoryId?: string
  user: User
  category?: Category
  items: ChecklistItem[]
  likes: ChecklistLike[]
  reviews: Review[]
  comments: Comment[]
  _count?: {
    likes: number
    reviews: number
    comments: number
  }
}

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  quantity?: number
  unit?: string
  isCompleted: boolean
  order: number
  checklistId: string
}

export interface ChecklistLike {
  id: string
  userId: string
  checklistId: string
  createdAt: Date
}

export interface Review {
  id: string
  rating: number
  content?: string
  userId: string
  checklistId: string
  createdAt: Date
  user: User
}

export interface Comment {
  id: string
  content: string
  userId: string
  checklistId: string
  createdAt: Date
  updatedAt: Date
  user: User
}

export interface CreateChecklistData {
  title: string
  description?: string
  isTemplate?: boolean
  isPublic?: boolean
  peopleCount?: number
  categoryId?: string
  items: CreateChecklistItemData[]
}

export interface CreateChecklistItemData {
  title: string
  description?: string
  quantity?: number
  unit?: string
  order: number
}

export interface UpdateChecklistData {
  title?: string
  description?: string
  isPublic?: boolean
  peopleCount?: number
  categoryId?: string
}

export interface SituationTemplate {
  id: string
  name: string
  description: string
  category: string
  items: TemplateItem[]
  peopleMultiplier?: boolean
}

export interface TemplateItem {
  title: string
  description?: string
  baseQuantity?: number
  unit?: string
  multiplier?: number
}