import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Checklist, ChecklistItem, CreateChecklistData } from '../types'

interface ChecklistState {
  checklists: Checklist[]
  currentChecklist: Checklist | null
  loading: boolean
  error: string | null
  
  // Checklist management
  fetchChecklists: () => Promise<void>
  fetchChecklist: (id: string) => Promise<void>
  createChecklist: (data: CreateChecklistData) => Promise<Checklist>
  updateChecklist: (id: string, data: Partial<Checklist>) => Promise<void>
  deleteChecklist: (id: string) => Promise<void>
  
  // Item management
  toggleItemComplete: (itemId: string) => void
  addItem: (checklistId: string, item: Omit<ChecklistItem, 'id' | 'checklistId'>) => Promise<void>
  updateItem: (itemId: string, data: Partial<ChecklistItem>) => Promise<void>
  deleteItem: (itemId: string) => Promise<void>
  
  // Collaboration features
  shareChecklist: (id: string) => Promise<{ shareCode: string }>
  joinCollaborativeChecklist: (shareCode: string) => Promise<Checklist>
  
  // Utility
  setError: (error: string | null) => void
  clearCurrentChecklist: () => void
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate share code
const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate random colors for participants
const getRandomColor = (): string => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316']
  return colors[Math.floor(Math.random() * colors.length)]
}

// Generate unique share code
const generateUniqueShareCode = async (): Promise<string> => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateShareCode()
    const isUnique = await checkShareCodeUnique(code)
    if (isUnique) {
      return code
    }
    attempts++
  }
  
  // Fallback: timestamp-based code
  return `SHARE${Date.now().toString(36).toUpperCase().slice(-4)}`
}

// Check if share code is unique
const checkShareCodeUnique = async (shareCode: string): Promise<boolean> => {
  try {
    const storedChecklists = await AsyncStorage.getItem(STORAGE_KEY)
    const checklists: Checklist[] = storedChecklists ? JSON.parse(storedChecklists) : []
    
    return !checklists.some(c => c.shareCode === shareCode)
  } catch {
    return false
  }
}

const STORAGE_KEY = 'checklists'

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  checklists: [],
  currentChecklist: null,
  loading: false,
  error: null,

  fetchChecklists: async () => {
    try {
      set({ loading: true, error: null })
      
      const storedChecklists = await AsyncStorage.getItem(STORAGE_KEY)
      const checklists = storedChecklists ? JSON.parse(storedChecklists) : []
      
      set({ checklists, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load checklists',
        loading: false 
      })
    }
  },

  fetchChecklist: async (id: string) => {
    set({ loading: true, error: null })
    const state = get()
    const checklist = state.checklists.find(c => c.id === id)
    
    if (checklist) {
      set({ currentChecklist: checklist, loading: false })
    } else {
      set({ error: 'Checklist not found', loading: false })
    }
  },

  createChecklist: async (data: CreateChecklistData) => {
    try {
      set({ loading: true, error: null })
      
      const newChecklist: Checklist = {
        id: generateId(),
        title: data.title,
        description: data.description,
        isTemplate: data.isTemplate || false,
        isPublic: data.isPublic || false,
        peopleCount: data.peopleCount || 1,
        userId: data.userId || 'local-user',
        categoryId: data.categoryId,
        shareCode: generateShareCode(),
        isCollaborative: false,
        participants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        items: data.items.map((item, index) => ({
          id: generateId(),
          checklistId: '',
          title: item.title,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || '',
          isCompleted: false,
          order: index,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      }

      // Set checklistId for items
      newChecklist.items.forEach(item => {
        item.checklistId = newChecklist.id
      })

      const state = get()
      const updatedChecklists = [newChecklist, ...state.checklists]
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))
      
      set({
        checklists: updatedChecklists,
        loading: false
      })
      
      return newChecklist
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create checklist',
        loading: false 
      })
      throw error
    }
  },

  updateChecklist: async (id: string, data: Partial<Checklist>) => {
    try {
      set({ loading: true, error: null })
      
      const state = get()
      const updatedChecklists = state.checklists.map(c => 
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
      )
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))
      
      // Update current checklist if it's the one being updated
      const currentChecklist = state.currentChecklist
      const updatedCurrentChecklist = currentChecklist?.id === id 
        ? { ...currentChecklist, ...data, updatedAt: new Date() }
        : currentChecklist
      
      set({
        checklists: updatedChecklists,
        currentChecklist: updatedCurrentChecklist,
        loading: false
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update checklist',
        loading: false 
      })
    }
  },

  deleteChecklist: async (id: string) => {
    try {
      set({ loading: true, error: null })
      
      const state = get()
      const updatedChecklists = state.checklists.filter(c => c.id !== id)
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))
      
      set({
        checklists: updatedChecklists,
        currentChecklist: state.currentChecklist?.id === id ? null : state.currentChecklist,
        loading: false
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete checklist',
        loading: false 
      })
    }
  },

  toggleItemComplete: (itemId: string) => {
    const state = get()
    if (!state.currentChecklist) return

    const updatedItems = state.currentChecklist.items.map(item =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    )

    const updatedChecklist = {
      ...state.currentChecklist,
      items: updatedItems,
      updatedAt: new Date()
    }

    // Update in checklists array
    const updatedChecklists = state.checklists.map(c =>
      c.id === updatedChecklist.id ? updatedChecklist : c
    )

    // Save to AsyncStorage
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))

    set({
      currentChecklist: updatedChecklist,
      checklists: updatedChecklists
    })
  },

  addItem: async (checklistId: string, itemData: Omit<ChecklistItem, 'id' | 'checklistId'>) => {
    try {
      const state = get()
      const checklist = state.checklists.find(c => c.id === checklistId)
      if (!checklist) throw new Error('Checklist not found')

      const newItem: ChecklistItem = {
        ...itemData,
        id: generateId(),
        checklistId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const updatedItems = [...checklist.items, newItem]
      const updatedChecklist = { 
        ...checklist, 
        items: updatedItems, 
        updatedAt: new Date() 
      }

      const updatedChecklists = state.checklists.map(c =>
        c.id === checklistId ? updatedChecklist : c
      )

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))

      set({
        checklists: updatedChecklists,
        currentChecklist: state.currentChecklist?.id === checklistId ? updatedChecklist : state.currentChecklist
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add item'
      })
    }
  },

  updateItem: async (itemId: string, data: Partial<ChecklistItem>) => {
    try {
      const state = get()
      if (!state.currentChecklist) return

      const updatedItems = state.currentChecklist.items.map(item =>
        item.id === itemId ? { ...item, ...data, updatedAt: new Date() } : item
      )

      const updatedChecklist = {
        ...state.currentChecklist,
        items: updatedItems,
        updatedAt: new Date()
      }

      const updatedChecklists = state.checklists.map(c =>
        c.id === updatedChecklist.id ? updatedChecklist : c
      )

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))

      set({
        currentChecklist: updatedChecklist,
        checklists: updatedChecklists
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update item'
      })
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      const state = get()
      if (!state.currentChecklist) return

      const updatedItems = state.currentChecklist.items.filter(item => item.id !== itemId)
      const updatedChecklist = {
        ...state.currentChecklist,
        items: updatedItems,
        updatedAt: new Date()
      }

      const updatedChecklists = state.checklists.map(c =>
        c.id === updatedChecklist.id ? updatedChecklist : c
      )

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))

      set({
        currentChecklist: updatedChecklist,
        checklists: updatedChecklists
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete item'
      })
    }
  },

  shareChecklist: async (id: string) => {
    try {
      const state = get()
      const checklist = state.checklists.find(c => c.id === id)
      if (!checklist) throw new Error('체크리스트를 찾을 수 없습니다.')

      // 현재 사용자 확인
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      if (!currentUser || checklist.userId !== currentUser.id) {
        throw new Error('체크리스트 공유 권한이 없습니다.')
      }

      // 고유한 공유 코드 생성
      const shareCode = checklist.shareCode || await generateUniqueShareCode()
      
      // 체크리스트 소유자를 참가자 목록에 추가
      const ownerParticipant = {
        id: generateId(),
        userId: currentUser.id,
        nickname: currentUser.nickname,
        color: '#dc2626', // 소유자는 빨간색
        role: 'OWNER' as const,
        isOnline: true,
        joinedAt: new Date()
      }
      
      // Update checklist with share settings and owner as participant
      await get().updateChecklist(id, {
        shareCode,
        isCollaborative: true,
        isPublic: true,
        participants: [ownerParticipant]
      })

      return { shareCode }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : '체크리스트 공유에 실패했습니다.')
    }
  },

  joinCollaborativeChecklist: async (shareCode: string) => {
    try {
      set({ loading: true, error: null })
      
      // 현재 사용자 정보 확인
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      if (!currentUser) {
        set({ loading: false, error: '로그인이 필요합니다.' })
        throw new Error('로그인이 필요합니다.')
      }
      
      // 공유된 체크리스트 찾기
      const allChecklists = await AsyncStorage.getItem(STORAGE_KEY)
      const checklists: Checklist[] = allChecklists ? JSON.parse(allChecklists) : []
      
      const sharedChecklist = checklists.find(c => 
        c.shareCode === shareCode && c.isCollaborative && c.isPublic
      )
      
      if (!sharedChecklist) {
        set({ loading: false, error: '유효하지 않은 공유 코드입니다.' })
        throw new Error('유효하지 않은 공유 코드입니다.')
      }
      
      // 이미 참여 중인지 확인
      const isAlreadyParticipant = sharedChecklist.participants?.some(p => p.userId === currentUser.id)
      if (isAlreadyParticipant) {
        set({ loading: false, error: '이미 참여 중인 체크리스트입니다.' })
        throw new Error('이미 참여 중인 체크리스트입니다.')
      }
      
      // 새로운 참가자 추가
      const newParticipant = {
        id: generateId(),
        userId: currentUser.id,
        nickname: currentUser.nickname,
        color: getRandomColor(),
        role: 'MEMBER' as const,
        isOnline: true,
        joinedAt: new Date()
      }
      
      const updatedParticipants = [...(sharedChecklist.participants || []), newParticipant]
      
      // 체크리스트 업데이트
      const updatedChecklists = checklists.map(c => 
        c.id === sharedChecklist.id 
          ? { ...c, participants: updatedParticipants, updatedAt: new Date() }
          : c
      )
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChecklists))
      
      // 현재 사용자의 체크리스트 목록에 동일한 ID로 추가 (협업을 위해 같은 ID 유지)
      const state = get()
      const collaborativeChecklist = {
        ...sharedChecklist,
        participants: updatedParticipants,
        updatedAt: new Date()
      }
      
      // 기존 체크리스트에 이미 있는지 확인 (중복 방지)
      const existingIndex = state.checklists.findIndex(c => c.id === sharedChecklist.id)
      let userChecklists
      
      if (existingIndex >= 0) {
        // 이미 존재하면 업데이트
        userChecklists = state.checklists.map(c => 
          c.id === sharedChecklist.id ? collaborativeChecklist : c
        )
      } else {
        // 새로 추가
        userChecklists = [collaborativeChecklist, ...state.checklists]
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userChecklists))
      
      set({
        checklists: userChecklists,
        loading: false
      })
      
      return collaborativeChecklist
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '협업 참여에 실패했습니다.',
        loading: false 
      })
      throw error
    }
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearCurrentChecklist: () => {
    set({ currentChecklist: null })
  },
}))