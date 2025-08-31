import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Checklist, CreateChecklistData, ChecklistItem } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface ChecklistState {
  checklists: Checklist[]
  currentChecklist: Checklist | null
  loading: boolean
  error: string | null
  
  fetchChecklists: () => Promise<void>
  fetchChecklist: (id: string) => Promise<void>
  createChecklist: (data: CreateChecklistData) => Promise<void>
  updateChecklist: (id: string, data: Partial<Checklist>) => Promise<void>
  deleteChecklist: (id: string) => Promise<void>
  
  toggleItemComplete: (itemId: string) => void
  addItem: (checklistId: string, item: Omit<ChecklistItem, 'id' | 'checklistId'>) => Promise<void>
  updateItem: (itemId: string, data: Partial<ChecklistItem>) => Promise<void>
  deleteItem: (itemId: string) => Promise<void>
  
  setError: (error: string | null) => void
}

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      checklists: [],
      currentChecklist: null,
      loading: false,
      error: null,

      fetchChecklists: async () => {
        // 로컬 스토리지에서 자동으로 로드됨 (persist 미들웨어)
        set({ loading: false, error: null })
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
        set({ loading: true, error: null })
        try {
          const newChecklist: Checklist = {
            id: uuidv4(),
            title: data.title,
            description: data.description,
            isTemplate: data.isTemplate || false,
            isPublic: data.isPublic || false,
            peopleCount: data.peopleCount || 1,
            userId: 'local-user', // 로컬 사용자
            categoryId: data.categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: { id: 'local-user', email: '', name: 'Local User' },
            category: null,
            items: data.items.map((item, index) => ({
              id: uuidv4(),
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
            _count: { likes: 0, reviews: 0, comments: 0 }
          }

          // 아이템들의 checklistId 설정
          newChecklist.items.forEach(item => {
            item.checklistId = newChecklist.id
          })

          set((state) => ({
            checklists: [newChecklist, ...state.checklists],
            loading: false
          }))
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
        }
      },

  updateChecklist: async (id: string, data: Partial<Checklist>) => {
    set({ loading: true, error: null })
    try {
      set((state) => {
        const updatedChecklists = state.checklists.map(c => 
          c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
        )
        return {
          checklists: updatedChecklists,
          currentChecklist: state.currentChecklist?.id === id 
            ? { ...state.currentChecklist, ...data, updatedAt: new Date() }
            : state.currentChecklist,
          loading: false
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  deleteChecklist: async (id: string) => {
    set({ loading: true, error: null })
    try {
      set((state) => ({
        checklists: state.checklists.filter(c => c.id !== id),
        currentChecklist: state.currentChecklist?.id === id ? null : state.currentChecklist,
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  toggleItemComplete: (itemId: string) => {
    set((state) => {
      if (!state.currentChecklist) return state
      
      const updatedItems = state.currentChecklist.items.map(item =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      )
      
      return {
        ...state,
        currentChecklist: {
          ...state.currentChecklist,
          items: updatedItems
        }
      }
    })
  },

  addItem: async (checklistId: string, item: Omit<ChecklistItem, 'id' | 'checklistId'>) => {
    set({ loading: true, error: null })
    try {
      const newItem: ChecklistItem = {
        id: uuidv4(),
        checklistId,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity || 1,
        unit: item.unit || '',
        isCompleted: false,
        order: item.order || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      set((state) => ({
        currentChecklist: state.currentChecklist ? {
          ...state.currentChecklist,
          items: [...state.currentChecklist.items, newItem]
        } : null,
        checklists: state.checklists.map(c => 
          c.id === checklistId ? {
            ...c,
            items: [...c.items, newItem]
          } : c
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateItem: async (itemId: string, data: Partial<ChecklistItem>) => {
    set({ loading: true, error: null })
    try {
      set((state) => {
        const updateItemInList = (items: ChecklistItem[]) =>
          items.map(item =>
            item.id === itemId ? { ...item, ...data, updatedAt: new Date() } : item
          )

        return {
          currentChecklist: state.currentChecklist ? {
            ...state.currentChecklist,
            items: updateItemInList(state.currentChecklist.items)
          } : null,
          checklists: state.checklists.map(c => ({
            ...c,
            items: updateItemInList(c.items)
          })),
          loading: false
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  deleteItem: async (itemId: string) => {
    set({ loading: true, error: null })
    try {
      set((state) => ({
        currentChecklist: state.currentChecklist ? {
          ...state.currentChecklist,
          items: state.currentChecklist.items.filter(item => item.id !== itemId)
        } : null,
        checklists: state.checklists.map(c => ({
          ...c,
          items: c.items.filter(item => item.id !== itemId)
        })),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'checklist-storage',
      version: 1,
    }
  )
)