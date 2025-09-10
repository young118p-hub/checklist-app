'use client'

import { io, Socket } from 'socket.io-client'

// Socket.io 클라이언트 타입 정의
interface ServerToClientEvents {
  'user-joined': (data: { user: CollaborationUser, onlineCount: number }) => void
  'user-left': (data: { userId: string, onlineCount: number }) => void
  'users-online': (users: CollaborationUser[]) => void
  'item-checked': (data: { itemId: string, isCompleted: boolean, checkedBy: CollaborationUser, timestamp: Date }) => void
  'item-updated': (data: { itemId: string, updates: any, updatedBy: CollaborationUser }) => void
  'item-added': (data: { item: any, addedBy: CollaborationUser }) => void
  'item-deleted': (data: { itemId: string, deletedBy: CollaborationUser }) => void
  'notification': (data: { type: string, title: string, message: string, data?: any }) => void
  'collaboration-completed': (data: { checklistId: string, completedBy: CollaborationUser }) => void
}

interface ClientToServerEvents {
  'join-collaboration': (data: { checklistId: string, shareCode: string, user: CollaborationUser }) => void
  'leave-collaboration': (data: { checklistId: string }) => void
  'toggle-item': (data: { itemId: string, isCompleted: boolean }) => void
  'update-item': (data: { itemId: string, updates: any }) => void
  'add-item': (data: { checklistId: string, item: any }) => void
  'delete-item': (data: { itemId: string }) => void
  'typing': (data: { itemId?: string, isTyping: boolean }) => void
  'heartbeat': () => void
}

interface CollaborationUser {
  id: string
  nickname: string
  color: string
  userType: 'GUEST' | 'REGISTERED'
  avatar?: string
  isOnline: boolean
}

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>

class SocketManager {
  private socket: ClientSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null

  // 연결 상태 관리
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected'
  private listeners = new Map<string, Function[]>()

  constructor() {
    this.setupHeartbeat()
  }

  // Socket 연결
  connect(): ClientSocket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.connectionState = 'connecting'
    
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-app-domain.com'
      : 'http://localhost:3000'

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
      autoConnect: true
    })

    this.setupEventListeners()
    return this.socket
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.socket) return

    // 연결 성공
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected')
      this.connectionState = 'connected'
      this.reconnectAttempts = 0
      this.emit('connection-state-change', 'connected')
    })

    // 연결 해제
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason)
      this.connectionState = 'disconnected'
      this.emit('connection-state-change', 'disconnected')

      // 자동 재연결 시도
      if (reason === 'io server disconnect') {
        // 서버에서 연결을 끊은 경우, 수동으로 재연결
        this.attemptReconnect()
      }
    })

    // 재연결 시도
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      this.attemptReconnect()
    })

    // 실시간 이벤트들
    this.socket.on('user-joined', (data) => {
      console.log('👥 User joined:', data.user.nickname)
      this.emit('user-joined', data)
    })

    this.socket.on('user-left', (data) => {
      console.log('👋 User left:', data.userId)
      this.emit('user-left', data)
    })

    this.socket.on('users-online', (users) => {
      console.log('👥 Online users:', users.map(u => u.nickname))
      this.emit('users-online', users)
    })

    this.socket.on('item-checked', (data) => {
      console.log(`✅ Item ${data.isCompleted ? 'checked' : 'unchecked'} by ${data.checkedBy.nickname}`)
      this.emit('item-checked', data)
    })

    this.socket.on('item-updated', (data) => {
      console.log(`📝 Item updated by ${data.updatedBy.nickname}`)
      this.emit('item-updated', data)
    })

    this.socket.on('notification', (data) => {
      console.log('🔔 Notification:', data.title)
      this.emit('notification', data)
    })

    this.socket.on('collaboration-completed', (data) => {
      console.log(`🎉 Collaboration completed by ${data.completedBy.nickname}`)
      this.emit('collaboration-completed', data)
    })
  }

  // 재연결 시도
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached')
      this.emit('connection-state-change', 'failed')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  // 하트비트 설정
  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat')
      }
    }, 30000) // 30초마다
  }

  // 협업 참여
  joinCollaboration(checklistId: string, shareCode: string, user: CollaborationUser) {
    if (!this.socket?.connected) {
      this.connect()
    }
    
    this.socket?.emit('join-collaboration', { checklistId, shareCode, user })
  }

  // 협업 떠나기
  leaveCollaboration(checklistId: string) {
    this.socket?.emit('leave-collaboration', { checklistId })
  }

  // 아이템 토글
  toggleItem(itemId: string, isCompleted: boolean) {
    this.socket?.emit('toggle-item', { itemId, isCompleted })
  }

  // 아이템 업데이트
  updateItem(itemId: string, updates: any) {
    this.socket?.emit('update-item', { itemId, updates })
  }

  // 아이템 추가
  addItem(checklistId: string, item: any) {
    this.socket?.emit('add-item', { checklistId, item })
  }

  // 아이템 삭제
  deleteItem(itemId: string) {
    this.socket?.emit('delete-item', { itemId })
  }

  // 이벤트 리스너 등록
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  // 이벤트 리스너 해제
  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event)
      return
    }

    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 이벤트 발생
  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // 연결 상태 반환
  getConnectionState(): 'disconnected' | 'connecting' | 'connected' | 'failed' {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return 'failed'
    }
    return this.connectionState
  }

  // 정리
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    
    this.socket?.disconnect()
    this.socket = null
    this.connectionState = 'disconnected'
    this.listeners.clear()
  }
}

// 싱글톤 인스턴스
let socketManager: SocketManager | null = null

export const getSocketManager = (): SocketManager => {
  if (!socketManager) {
    socketManager = new SocketManager()
  }
  return socketManager
}

export type { CollaborationUser, ClientSocket }
export { SocketManager }