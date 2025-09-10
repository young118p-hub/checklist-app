'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getSocketManager, CollaborationUser } from '@/lib/socket/client'
import { offlineQueueManager } from '@/lib/offline/offline-queue-manager'
import { toast } from 'react-hot-toast'

interface CollaborationState {
  isConnected: boolean
  onlineUsers: CollaborationUser[]
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed'
  checklistId: string | null
  currentUser: CollaborationUser | null
  isOnline: boolean
  pendingActionCount: number
}

interface CollaborationActions {
  joinCollaboration: (checklistId: string, shareCode: string, user: CollaborationUser) => void
  leaveCollaboration: () => void
  toggleItem: (itemId: string, isCompleted: boolean) => void
  updateItem: (itemId: string, updates: any) => void
}

interface UseCollaborationReturn extends CollaborationState, CollaborationActions {
  // 실시간 이벤트 핸들러들
  onItemChecked: (callback: (data: any) => void) => void
  onItemUpdated: (callback: (data: any) => void) => void
  onUserJoined: (callback: (data: any) => void) => void
  onUserLeft: (callback: (data: any) => void) => void
  onCollaborationCompleted: (callback: (data: any) => void) => void
}

export function useCollaboration(): UseCollaborationReturn {
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    onlineUsers: [],
    connectionState: 'disconnected',
    checklistId: null,
    currentUser: null,
    isOnline: true,
    pendingActionCount: 0
  })

  const socketManager = useRef(getSocketManager())
  const eventCallbacks = useRef(new Map<string, Function[]>())
  const offlineCleanup = useRef<(() => void) | null>(null)

  // 이벤트 콜백 등록
  const registerCallback = useCallback((event: string, callback: Function) => {
    if (!eventCallbacks.current.has(event)) {
      eventCallbacks.current.set(event, [])
    }
    eventCallbacks.current.get(event)!.push(callback)
  }, [])

  // 이벤트 콜백 실행
  const executeCallbacks = useCallback((event: string, data: any) => {
    const callbacks = eventCallbacks.current.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} callback:`, error)
        }
      })
    }
  }, [])

  // 오프라인 큐 상태 모니터링
  useEffect(() => {
    const cleanup = offlineQueueManager.onStateChange((offlineState) => {
      setState(prev => ({
        ...prev,
        isOnline: offlineState.isOnline,
        pendingActionCount: offlineState.pendingActions.length
      }))

      // 오프라인 상태 변경 알림
      if (!offlineState.isOnline && prev.isOnline) {
        toast.error('인터넷 연결이 끊어졌습니다. 오프라인 모드로 동작합니다.', { 
          duration: 3000,
          icon: '📴'
        })
      } else if (offlineState.isOnline && !prev.isOnline) {
        toast.success('인터넷 연결이 복구되었습니다. 동기화 중...', {
          icon: '🌐'
        })
      }

      // 대기 중인 액션 알림
      if (offlineState.pendingActions.length > 0) {
        toast(`${offlineState.pendingActions.length}개 액션이 동기화를 기다리고 있습니다`, {
          icon: '⏳',
          duration: 2000
        })
      }
    })

    offlineCleanup.current = cleanup
    return cleanup
  }, [])

  // Socket.io 이벤트 리스너 설정
  useEffect(() => {
    const sm = socketManager.current

    // 연결 상태 변경
    sm.on('connection-state-change', (connectionState: string) => {
      setState(prev => ({
        ...prev,
        connectionState: connectionState as any,
        isConnected: connectionState === 'connected'
      }))

      // 연결 상태에 따른 알림
      if (connectionState === 'connected') {
        toast.success('실시간 협업에 연결되었습니다! 🎉')
      } else if (connectionState === 'disconnected') {
        toast.error('연결이 끊어졌습니다. 재연결 시도 중...')
      } else if (connectionState === 'failed') {
        toast.error('연결에 실패했습니다. 네트워크를 확인해주세요.')
      }
    })

    // 온라인 사용자 업데이트
    sm.on('users-online', (users: CollaborationUser[]) => {
      setState(prev => ({ ...prev, onlineUsers: users }))
    })

    // 사용자 참여
    sm.on('user-joined', (data: { user: CollaborationUser, onlineCount: number }) => {
      setState(prev => ({
        ...prev,
        onlineUsers: [...prev.onlineUsers, data.user]
      }))
      
      toast.success(`${data.user.nickname}님이 참여했습니다! 👋`)
      executeCallbacks('user-joined', data)
    })

    // 사용자 떠남
    sm.on('user-left', (data: { userId: string, onlineCount: number }) => {
      setState(prev => {
        const leftUser = prev.onlineUsers.find(u => u.id === data.userId)
        if (leftUser) {
          toast(`${leftUser.nickname}님이 나갔습니다`, { icon: '👋' })
        }
        
        return {
          ...prev,
          onlineUsers: prev.onlineUsers.filter(u => u.id !== data.userId)
        }
      })
      
      executeCallbacks('user-left', data)
    })

    // 아이템 체크 이벤트
    sm.on('item-checked', (data: any) => {
      const action = data.isCompleted ? '완료했습니다' : '완료 취소했습니다'
      toast.success(`${data.checkedBy.nickname}님이 "${data.itemId}"를 ${action} ✅`)
      executeCallbacks('item-checked', data)
    })

    // 아이템 업데이트 이벤트
    sm.on('item-updated', (data: any) => {
      toast(`${data.updatedBy.nickname}님이 항목을 수정했습니다`, { icon: '📝' })
      executeCallbacks('item-updated', data)
    })

    // 협업 완료 이벤트
    sm.on('collaboration-completed', (data: any) => {
      toast.success(`🎉 모든 항목이 완료되었습니다! ${data.completedBy.nickname}님이 마지막 항목을 체크했어요!`)
      executeCallbacks('collaboration-completed', data)
    })

    // 일반 알림
    sm.on('notification', (data: { type: string, title: string, message: string }) => {
      if (data.type === 'error') {
        toast.error(`${data.title}: ${data.message}`)
      } else if (data.type === 'success') {
        toast.success(`${data.title}: ${data.message}`)
      } else {
        toast(data.message, { icon: '🔔' })
      }
    })

    return () => {
      // 클리너프 시 이벤트 리스너 제거
      sm.off('connection-state-change')
      sm.off('users-online')
      sm.off('user-joined')
      sm.off('user-left')
      sm.off('item-checked')
      sm.off('item-updated')
      sm.off('collaboration-completed')
      sm.off('notification')
    }
  }, [executeCallbacks])

  // 협업 참여
  const joinCollaboration = useCallback((checklistId: string, shareCode: string, user: CollaborationUser) => {
    setState(prev => ({
      ...prev,
      checklistId,
      currentUser: user,
      connectionState: 'connecting'
    }))

    socketManager.current.connect()
    socketManager.current.joinCollaboration(checklistId, shareCode, user)
    
    toast.loading('협업에 참여하는 중...', { id: 'joining-collaboration' })
  }, [])

  // 협업 떠나기
  const leaveCollaboration = useCallback(() => {
    if (state.checklistId) {
      socketManager.current.leaveCollaboration(state.checklistId)
      
      setState(prev => ({
        ...prev,
        checklistId: null,
        currentUser: null,
        onlineUsers: []
      }))
      
      toast.success('협업을 종료했습니다')
    }
  }, [state.checklistId])

  // 아이템 토글 (오프라인 지원)
  const toggleItem = useCallback((itemId: string, isCompleted: boolean) => {
    if (state.isOnline && state.isConnected) {
      // 온라인 상태: 즉시 Socket으로 전송
      socketManager.current.toggleItem(itemId, isCompleted)
    } else {
      // 오프라인 상태: 큐에 저장
      if (state.checklistId && state.currentUser) {
        offlineQueueManager.addAction(
          'TOGGLE_ITEM',
          { itemId, isCompleted },
          state.checklistId,
          state.currentUser.id
        )
        
        toast('오프라인 상태입니다. 연결 복구 시 동기화됩니다.', {
          icon: '📴',
          duration: 2000
        })
      }
    }
  }, [state.isOnline, state.isConnected, state.checklistId, state.currentUser])

  // 아이템 업데이트 (오프라인 지원)
  const updateItem = useCallback((itemId: string, updates: any) => {
    if (state.isOnline && state.isConnected) {
      // 온라인 상태: 즉시 Socket으로 전송
      socketManager.current.updateItem(itemId, updates)
    } else {
      // 오프라인 상태: 큐에 저장
      if (state.checklistId && state.currentUser) {
        offlineQueueManager.addAction(
          'UPDATE_ITEM',
          { itemId, updates },
          state.checklistId,
          state.currentUser.id
        )
        
        toast('오프라인 상태입니다. 연결 복구 시 동기화됩니다.', {
          icon: '📴',
          duration: 2000
        })
      }
    }
  }, [state.isOnline, state.isConnected, state.checklistId, state.currentUser])

  // 이벤트 핸들러 등록 함수들
  const onItemChecked = useCallback((callback: (data: any) => void) => {
    registerCallback('item-checked', callback)
  }, [registerCallback])

  const onItemUpdated = useCallback((callback: (data: any) => void) => {
    registerCallback('item-updated', callback)
  }, [registerCallback])

  const onUserJoined = useCallback((callback: (data: any) => void) => {
    registerCallback('user-joined', callback)
  }, [registerCallback])

  const onUserLeft = useCallback((callback: (data: any) => void) => {
    registerCallback('user-left', callback)
  }, [registerCallback])

  const onCollaborationCompleted = useCallback((callback: (data: any) => void) => {
    registerCallback('collaboration-completed', callback)
  }, [registerCallback])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (state.checklistId) {
        leaveCollaboration()
      }
      
      // 오프라인 큐 매니저 정리
      if (offlineCleanup.current) {
        offlineCleanup.current()
        offlineCleanup.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    joinCollaboration,
    leaveCollaboration,
    toggleItem,
    updateItem,
    onItemChecked,
    onItemUpdated,
    onUserJoined,
    onUserLeft,
    onCollaborationCompleted
  }
}