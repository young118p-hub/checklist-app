'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  RotateCcw, 
  Clock,
  AlertCircle
} from 'lucide-react'
import { offlineQueueManager, OfflineState } from '@/lib/offline/offline-queue-manager'
import { toast } from 'react-hot-toast'

interface OfflineStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function OfflineStatusIndicator({ 
  className, 
  showDetails = false 
}: OfflineStatusIndicatorProps) {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: true,
    lastOnlineAt: null,
    pendingActions: []
  })
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const cleanup = offlineQueueManager.onStateChange((state) => {
      setOfflineState(state)
    })

    return cleanup
  }, [])

  const handleManualSync = async () => {
    if (!offlineState.isOnline) {
      toast.error('인터넷 연결을 확인해주세요')
      return
    }

    if (offlineState.pendingActions.length === 0) {
      toast('동기화할 항목이 없습니다', { icon: '✅' })
      return
    }

    setIsSyncing(true)
    try {
      await offlineQueueManager.forcSync()
      toast.success('수동 동기화가 완료되었습니다! 🎉')
    } catch (error) {
      toast.error('동기화 중 오류가 발생했습니다')
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusColor = () => {
    if (!offlineState.isOnline) return 'destructive'
    if (offlineState.pendingActions.length > 0) return 'warning'
    return 'success'
  }

  const getStatusIcon = () => {
    if (!offlineState.isOnline) return WifiOff
    if (offlineState.pendingActions.length > 0) return Clock
    return Wifi
  }

  const getStatusText = () => {
    if (!offlineState.isOnline) return '오프라인'
    if (offlineState.pendingActions.length > 0) return `${offlineState.pendingActions.length}개 동기화 대기`
    return '온라인'
  }

  const StatusIcon = getStatusIcon()

  if (!showDetails && offlineState.isOnline && offlineState.pendingActions.length === 0) {
    return null // 정상 상태일 때는 표시하지 않음
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={getStatusColor() as any}
        className="flex items-center gap-1 px-2 py-1"
      >
        <StatusIcon className="w-3 h-3" />
        <span className="text-xs font-medium">
          {getStatusText()}
        </span>
      </Badge>

      {showDetails && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {/* 마지막 온라인 시간 */}
          {!offlineState.isOnline && offlineState.lastOnlineAt && (
            <span className="text-xs">
              마지막 연결: {new Date(offlineState.lastOnlineAt).toLocaleTimeString()}
            </span>
          )}

          {/* 수동 동기화 버튼 */}
          {offlineState.isOnline && offlineState.pendingActions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="h-6 px-2 text-xs"
            >
              {isSyncing ? (
                <RotateCcw className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <RotateCcw className="w-3 h-3 mr-1" />
              )}
              지금 동기화
            </Button>
          )}
        </div>
      )}

      {/* 오프라인 경고 */}
      {!offlineState.isOnline && (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">
            오프라인 모드로 동작 중
          </span>
        </div>
      )}
    </div>
  )
}