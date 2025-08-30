import { create } from 'zustand'
import { Checklist, CreateChecklistData, ChecklistItem } from '@/types'

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

export const useChecklistStore = create<ChecklistState>((set) => ({
  checklists: [],
  currentChecklist: null,
  loading: false,
  error: null,

  fetchChecklists: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/checklists')
      if (!response.ok) throw new Error('Failed to fetch checklists')
      const checklists = await response.json()
      set({ checklists, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  },

  fetchChecklist: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/checklists/${id}`)
      if (!response.ok) throw new Error('Failed to fetch checklist')
      const checklist = await response.json()
      set({ currentChecklist: checklist, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  },

  createChecklist: async (data: CreateChecklistData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create checklist')
      const newChecklist = await response.json()
      set(state => ({
        checklists: [...state.checklists, newChecklist],
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  },

  updateChecklist: async (id: string, data: Partial<Checklist>) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update checklist')
      const updatedChecklist = await response.json()
      set(state => ({
        checklists: state.checklists.map(c => c.id === id ? updatedChecklist : c),
        currentChecklist: state.currentChecklist?.id === id ? updatedChecklist : state.currentChecklist,
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  },

  deleteChecklist: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete checklist')
      set(state => ({
        checklists: state.checklists.filter(c => c.id !== id),
        currentChecklist: state.currentChecklist?.id === id ? null : state.currentChecklist,
        loading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  },

  toggleItemComplete: (itemId: string) => {
    set(state => {
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

  addItem: async (checklistId: string, itemData: Omit<ChecklistItem, 'id' | 'checklistId'>) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      })
      if (!response.ok) throw new Error('Failed to add item')
      const newItem = await response.json()
      
      set(state => {
        if (!state.currentChecklist || state.currentChecklist.id !== checklistId) return state
        return {
          ...state,
          currentChecklist: {
            ...state.currentChecklist,
            items: [...state.currentChecklist.items, newItem]
          }
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  updateItem: async (itemId: string, data: Partial<ChecklistItem>) => {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update item')
      const updatedItem = await response.json()
      
      set(state => {
        if (!state.currentChecklist) return state
        return {
          ...state,
          currentChecklist: {
            ...state.currentChecklist,
            items: state.currentChecklist.items.map(item =>
              item.id === itemId ? updatedItem : item
            )
          }
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      const response = await fetch(`/api/checklist-items/${itemId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete item')
      
      set(state => {
        if (!state.currentChecklist) return state
        return {
          ...state,
          currentChecklist: {
            ...state.currentChecklist,
            items: state.currentChecklist.items.filter(item => item.id !== itemId)
          }
        }
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  setError: (error: string | null) => set({ error }),
}))