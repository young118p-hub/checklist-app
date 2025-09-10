'use client'

import { useState, useEffect } from 'react'
import { useCollaboration } from '@/hooks/useCollaboration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { CollaborationStatusPanel } from './collaboration-status-panel'
import { OfflineStatusIndicator } from './offline-status-indicator'
import { 
  Users, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  Clock,
  Loader2,
  AlertCircle,
  Settings
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description?: string
  quantity?: number
  unit?: string
  isCompleted: boolean
  checkedBy?: {
    nickname: string
    color: string
  }
  checkedAt?: Date
}

interface RealTimeChecklistProps {
  checklistId: string
  shareCode: string
  currentUser: {
    id: string
    nickname: string
    color: string
    userType: 'GUEST' | 'REGISTERED'
  }
  initialItems: ChecklistItem[]
  onItemsChange?: (items: ChecklistItem[]) => void
}

export function RealTimeChecklist({
  checklistId,
  shareCode,
  currentUser,
  initialItems,
  onItemsChange
}: RealTimeChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [isJoining, setIsJoining] = useState(true)
  const [showStatusPanel, setShowStatusPanel] = useState(false)
  
  const collaboration = useCollaboration()

  // 협업 참여
  useEffect(() => {
    const joinCollaboration = async () => {
      try {
        collaboration.joinCollaboration(checklistId, shareCode, {
          ...currentUser,
          isOnline: true
        })
        
        // 3초 후 참여 로딩 해제
        setTimeout(() => {
          setIsJoining(false)
        }, 3000)
      } catch (error) {
        console.error('협업 참여 실패:', error)
        setIsJoining(false)
      }
    }
    
    joinCollaboration()
  }, [checklistId, shareCode, currentUser, collaboration])

  // 실시간 이벤트 리스너
  useEffect(() => {
    // 아이템 체크 이벤트
    collaboration.onItemChecked((data: {
      itemId: string
      isCompleted: boolean
      checkedBy: { nickname: string; color: string }
      timestamp: Date
    }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? {
              ...item,
              isCompleted: data.isCompleted,
              checkedBy: data.isCompleted ? data.checkedBy : undefined,
              checkedAt: data.isCompleted ? data.timestamp : undefined
            }
          : item
      ))
    })

    // 아이템 업데이트 이벤트
    collaboration.onItemUpdated((data: {
      itemId: string
      updates: any
      updatedBy: { nickname: string; color: string }
    }) => {
      setItems(prev => prev.map(item => 
        item.id === data.itemId 
          ? { ...item, ...data.updates }
          : item
      ))
    })

    // 협업 완료 이벤트
    collaboration.onCollaborationCompleted((data: any) => {
      // 축하 효과 등 추가 가능
      console.log('🎉 모든 항목 완료!')
    })
  }, [collaboration])

  // items가 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    onItemsChange?.(items)
  }, [items, onItemsChange])

  // 아이템 체크 토글
  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    // 낙관적 업데이트 (즉시 UI 반영)
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            isCompleted,
            checkedBy: isCompleted ? { nickname: currentUser.nickname, color: currentUser.color } : undefined,
            checkedAt: isCompleted ? new Date() : undefined
          }
        : item
    ))

    // 서버에 실시간 업데이트 전송
    collaboration.toggleItem(itemId, isCompleted)
  }

  // 연결 상태 표시
  const getConnectionStatus = () => {
    switch (collaboration.connectionState) {
      case 'connected':
        return { icon: Wifi, text: '실시간 연결됨', color: 'text-green-600' }
      case 'connecting':
        return { icon: Loader2, text: '연결 중...', color: 'text-yellow-600' }
      case 'disconnected':
        return { icon: WifiOff, text: '연결 끊김', color: 'text-red-600' }
      case 'failed':
        return { icon: AlertCircle, text: '연결 실패', color: 'text-red-600' }
      default:
        return { icon: WifiOff, text: '오프라인', color: 'text-gray-500' }
    }
  }

  const connectionStatus = getConnectionStatus()
  const completedItems = items.filter(item => item.isCompleted).length
  const totalItems = items.length
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  if (isJoining) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">실시간 협업에 참여하는 중...</h3>
          <p className="text-gray-600">곧 친구들과 함께 체크할 수 있어요!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 상태 헤더 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              실시간 협업 체크리스트
            </CardTitle>
            <div className="flex items-center gap-2">
              <OfflineStatusIndicator />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStatusPanel(!showStatusPanel)}
                className="flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                협업 상태
              </Button>
              <div className="flex items-center gap-2">
                <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color} ${
                  collaboration.connectionState === 'connecting' ? 'animate-spin' : ''
                }`} />
                <span className={`text-sm ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </span>
              </div>
            </div>
          </div>
          
          {/* 진행률 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedItems}/{totalItems} 완료 ({progressPercentage}%)</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{collaboration.onlineUsers.length}명 온라인</span>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* 협업 상태 패널 */}
      {showStatusPanel && (
        <CollaborationStatusPanel
          isConnected={collaboration.isConnected}
          onlineUsers={collaboration.onlineUsers}
          currentUser={collaboration.currentUser}
        />
      )}

      {/* 체크리스트 아이템들 */}
      <Card>
        <CardHeader>
          <CardTitle>체크리스트 항목들</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className={`p-4 border rounded-lg transition-all ${
                item.isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={item.isCompleted}
                  onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      item.isCompleted ? 'line-through text-gray-500' : ''
                    }`}>
                      {item.title}
                      {item.quantity && (
                        <span className="text-gray-500 ml-2">
                          {item.quantity}{item.unit}
                        </span>
                      )}
                    </h4>
                    
                    {item.checkedBy && (
                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback
                            className="text-xs text-white font-medium"
                            style={{ backgroundColor: item.checkedBy.color }}
                          >
                            {item.checkedBy.nickname.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-gray-600">{item.checkedBy.nickname}</span>
                        {item.checkedAt && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.checkedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className={`text-sm mt-1 ${
                      item.isCompleted ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>아직 체크리스트 항목이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 완료 축하 */}
      {completedItems === totalItems && totalItems > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              모든 항목 완료!
            </h2>
            <p className="text-green-700">
              팀워크로 완성했네요! 수고하셨습니다 👏
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}