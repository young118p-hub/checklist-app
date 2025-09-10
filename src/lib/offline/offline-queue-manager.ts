'use client'

interface QueuedAction {
  id: string
  type: 'TOGGLE_ITEM' | 'UPDATE_ITEM' | 'ADD_ITEM' | 'DELETE_ITEM'
  data: any
  timestamp: Date
  retries: number
  maxRetries: number
  checklistId: string
  userId: string
}

interface OfflineState {
  isOnline: boolean
  lastOnlineAt: Date | null
  pendingActions: QueuedAction[]
}

class OfflineQueueManager {
  private static instance: OfflineQueueManager
  private state: OfflineState
  private listeners: ((state: OfflineState) => void)[] = []
  private syncInterval: NodeJS.Timeout | null = null
  private storage_key = 'offline_actions_queue'

  private constructor() {
    this.state = {
      isOnline: navigator.onLine,
      lastOnlineAt: navigator.onLine ? new Date() : null,
      pendingActions: []
    }

    this.loadFromStorage()
    this.setupNetworkListeners()
    this.startSyncInterval()
  }

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager()
    }
    return OfflineQueueManager.instance
  }

  // 네트워크 상태 리스너 설정
  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // 주기적으로 실제 네트워크 상태 확인 (navigator.onLine이 부정확할 수 있음)
    setInterval(this.checkRealNetworkStatus.bind(this), 10000) // 10초마다
  }

  // 온라인 상태로 변경
  private handleOnline(): void {
    console.log('🌐 Network: Online detected')
    this.updateState({
      isOnline: true,
      lastOnlineAt: new Date()
    })
    
    // 즉시 동기화 시도
    this.syncPendingActions()
  }

  // 오프라인 상태로 변경
  private handleOffline(): void {
    console.log('📴 Network: Offline detected')
    this.updateState({
      isOnline: false
    })
  }

  // 실제 네트워크 상태 확인
  private async checkRealNetworkStatus(): Promise<void> {
    try {
      // 작은 이미지 요청으로 실제 연결 테스트
      const response = await fetch('/api/health-check', { 
        method: 'HEAD',
        timeout: 5000,
        cache: 'no-cache'
      } as any)
      
      const isActuallyOnline = response.ok
      
      if (isActuallyOnline !== this.state.isOnline) {
        if (isActuallyOnline) {
          this.handleOnline()
        } else {
          this.handleOffline()
        }
      }
    } catch (error) {
      // 요청 실패 = 오프라인
      if (this.state.isOnline) {
        this.handleOffline()
      }
    }
  }

  // 동기화 주기 시작
  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && this.state.pendingActions.length > 0) {
        this.syncPendingActions()
      }
    }, 30000) // 30초마다
  }

  // 액션을 큐에 추가
  addAction(
    type: QueuedAction['type'],
    data: any,
    checklistId: string,
    userId: string
  ): string {
    const action: QueuedAction = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date(),
      retries: 0,
      maxRetries: 3,
      checklistId,
      userId
    }

    this.state.pendingActions.push(action)
    this.saveToStorage()
    this.notifyListeners()

    console.log(`📝 Queued ${type} action (offline=${!this.state.isOnline})`, action)

    // 온라인이면 즉시 동기화 시도
    if (this.state.isOnline) {
      this.syncPendingActions()
    }

    return action.id
  }

  // 대기 중인 액션들을 서버와 동기화
  private async syncPendingActions(): Promise<void> {
    if (!this.state.isOnline || this.state.pendingActions.length === 0) {
      return
    }

    console.log(`🔄 Syncing ${this.state.pendingActions.length} pending actions...`)

    const actionsToProcess = [...this.state.pendingActions]
    const failedActions: QueuedAction[] = []

    for (const action of actionsToProcess) {
      try {
        await this.executeAction(action)
        console.log(`✅ Synced ${action.type} action:`, action.id)
        
        // 성공한 액션은 큐에서 제거
        this.removeActionFromQueue(action.id)
        
      } catch (error) {
        console.error(`❌ Failed to sync ${action.type} action:`, error)
        
        action.retries += 1
        
        if (action.retries >= action.maxRetries) {
          console.error(`🚫 Max retries exceeded for action ${action.id}, removing from queue`)
          this.removeActionFromQueue(action.id)
        } else {
          failedActions.push(action)
        }
      }
    }

    // 실패한 액션들만 큐에 유지
    this.state.pendingActions = failedActions
    this.saveToStorage()
    this.notifyListeners()

    if (failedActions.length === 0) {
      console.log('✅ All actions synced successfully')
    } else {
      console.log(`⚠️ ${failedActions.length} actions failed, will retry later`)
    }
  }

  // 개별 액션 실행
  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'TOGGLE_ITEM':
        await this.executeToggleItem(action)
        break
      case 'UPDATE_ITEM':
        await this.executeUpdateItem(action)
        break
      case 'ADD_ITEM':
        await this.executeAddItem(action)
        break
      case 'DELETE_ITEM':
        await this.executeDeleteItem(action)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  // 아이템 토글 실행
  private async executeToggleItem(action: QueuedAction): Promise<void> {
    const response = await fetch(`/api/checklist-items/${action.data.itemId}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        isCompleted: action.data.isCompleted,
        timestamp: action.timestamp
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 아이템 업데이트 실행
  private async executeUpdateItem(action: QueuedAction): Promise<void> {
    const response = await fetch(`/api/checklist-items/${action.data.itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(action.data.updates)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 아이템 추가 실행
  private async executeAddItem(action: QueuedAction): Promise<void> {
    const response = await fetch(`/api/checklists/${action.checklistId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(action.data.item)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 아이템 삭제 실행
  private async executeDeleteItem(action: QueuedAction): Promise<void> {
    const response = await fetch(`/api/checklist-items/${action.data.itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  // 큐에서 액션 제거
  private removeActionFromQueue(actionId: string): void {
    this.state.pendingActions = this.state.pendingActions.filter(
      action => action.id !== actionId
    )
  }

  // 로컬 스토리지에 저장
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storage_key, JSON.stringify(this.state.pendingActions))
    } catch (error) {
      console.warn('Failed to save offline queue to storage:', error)
    }
  }

  // 로컬 스토리지에서 로드
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storage_key)
      if (stored) {
        const actions = JSON.parse(stored)
        this.state.pendingActions = actions.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }))
        console.log(`📂 Loaded ${this.state.pendingActions.length} pending actions from storage`)
      }
    } catch (error) {
      console.warn('Failed to load offline queue from storage:', error)
      this.state.pendingActions = []
    }
  }

  // 상태 업데이트
  private updateState(updates: Partial<OfflineState>): void {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  // 리스너들에게 알림
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.state)
      } catch (error) {
        console.error('Error in offline state listener:', error)
      }
    })
  }

  // 상태 변경 리스너 등록
  onStateChange(listener: (state: OfflineState) => void): () => void {
    this.listeners.push(listener)
    
    // 즉시 현재 상태 알림
    listener(this.state)
    
    // 리스너 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 현재 상태 조회
  getState(): OfflineState {
    return { ...this.state }
  }

  // 대기 중인 액션 수 조회
  getPendingActionCount(): number {
    return this.state.pendingActions.length
  }

  // 수동 동기화 트리거
  async forcSync(): Promise<void> {
    await this.syncPendingActions()
  }

  // 유틸리티 함수들
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getAuthToken(): string {
    // 실제로는 auth store에서 가져와야 함
    return localStorage.getItem('auth_token') || ''
  }

  // 정리
  destroy(): void {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    
    this.listeners = []
  }
}

// 전역 인스턴스 내보내기
export const offlineQueueManager = OfflineQueueManager.getInstance()

// 타입 내보내기
export type { QueuedAction, OfflineState }