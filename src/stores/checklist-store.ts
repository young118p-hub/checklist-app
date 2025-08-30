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

  fetchChecklists: async () => {},
  fetchChecklist: async () => {},
  createChecklist: async () => {},
  updateChecklist: async () => {},
  deleteChecklist: async () => {},
  toggleItemComplete: () => {},
  addItem: async () => {},
  updateItem: async () => {},
  deleteItem: async () => {},
  setError: () => {},
}))