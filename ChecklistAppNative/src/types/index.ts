export interface User {
  id: string
  email: string
  nickname: string
  name?: string
  avatar?: string
  friendCode: string
  userType: 'GUEST' | 'REGISTERED'
  createdAt: Date
  updatedAt?: Date
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
  isCollaborative?: boolean
  shareCode?: string
  peopleCount?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  categoryId?: string
  user?: User
  category?: Category
  items: ChecklistItem[]
  participants?: CollaborativeParticipant[]
  likes?: ChecklistLike[]
  reviews?: Review[]
  comments?: Comment[]
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
  createdAt: Date
  updatedAt: Date
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
  isCollaborative?: boolean
  peopleCount?: number
  categoryId?: string
  userId?: string
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

// Collaboration types
export interface CollaborativeParticipant {
  id: string
  userId: string
  nickname: string
  color: string
  role: 'OWNER' | 'MEMBER'
  isOnline: boolean
  joinedAt: Date
}

export interface ShareSession {
  id: string
  checklistId: string
  shareCode: string
  isActive: boolean
  createdAt: Date
  expiresAt?: Date
}

// Friend system types
export interface Friend {
  id: string
  userId: string
  friendId: string
  nickname: string
  name?: string
  avatar?: string
  userType: 'GUEST' | 'REGISTERED'
  isOnline: boolean
  friendshipStatus: 'PENDING' | 'ACCEPTED' | 'SENT'
  addedAt: Date
}

export interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  senderNickname: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  sentAt: Date
  respondedAt?: Date
}

export interface RecentCollaboration {
  id: string
  checklistId: string
  title: string
  shareCode: string
  lastActiveAt: Date
  totalItems: number
  completedItems: number
  participants: Array<{
    nickname: string
    color: string
    isOnline: boolean
  }>
  role: 'OWNER' | 'MEMBER'
}