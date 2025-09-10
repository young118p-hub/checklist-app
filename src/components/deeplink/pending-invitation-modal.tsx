'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  CheckCircle, 
  Users, 
  Clock, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { deepLinkManager, PendingInvitation } from '@/lib/deeplink/deeplink-manager'
import { toast } from 'react-hot-toast'

interface PendingInvitationModalProps {
  onAccept: (invitation: PendingInvitation) => void
  onDecline: () => void
  className?: string
}

export function PendingInvitationModal({ 
  onAccept, 
  onDecline, 
  className 
}: PendingInvitationModalProps) {
  const [invitation, setInvitation] = useState<PendingInvitation | null>(null)
  const [isEnriching, setIsEnriching] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  // 대기 중인 초대 감지
  useEffect(() => {
    const unsubscribe = deepLinkManager.onInvitationChange((invitation) => {
      setInvitation(invitation)
      
      if (invitation) {
        // 서버에서 상세 정보 가져오기
        enrichInvitationInfo()
      }
    })

    return unsubscribe
  }, [])

  // 만료 시간 카운트다운
  useEffect(() => {
    if (!invitation?.expiresAt) return

    const updateTimeLeft = () => {
      const now = new Date()
      const expires = new Date(invitation.expiresAt!)
      const diff = expires.getTime() - now.getTime()
      
      if (diff <= 0) {
        setTimeLeft('만료됨')
        deepLinkManager.clearPendingInvitation()
        return
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      if (hours > 24) {
        const days = Math.floor(hours / 24)
        setTimeLeft(`${days}일 후 만료`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}시간 후 만료`)
      } else {
        setTimeLeft(`${minutes}분 후 만료`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [invitation])

  // 서버에서 초대 상세 정보 가져오기
  const enrichInvitationInfo = async () => {
    setIsEnriching(true)
    try {
      const enrichedInvitation = await deepLinkManager.enrichPendingInvitation()
      if (enrichedInvitation) {
        setInvitation(enrichedInvitation)
      }
    } catch (error) {
      console.warn('초대 정보 조회 실패:', error)
    } finally {
      setIsEnriching(false)
    }
  }

  // 초대 수락
  const handleAccept = () => {
    if (!invitation) return
    
    const acceptedInvitation = deepLinkManager.acceptPendingInvitation()
    if (acceptedInvitation) {
      onAccept(acceptedInvitation)
      toast.success('협업에 참여합니다! 🎉')
    }
  }

  // 초대 거절
  const handleDecline = () => {
    deepLinkManager.declinePendingInvitation()
    onDecline()
    toast('초대를 거절했습니다', { icon: '👋' })
  }

  // 나중에 하기 (모달만 닫기, 초대는 유지)
  const handleLater = () => {
    onDecline() // 모달만 닫기
    toast('나중에 참여할 수 있어요', { icon: '⏰' })
  }

  if (!invitation) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-md animate-in slide-in-from-bottom ${className}`}>
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLater}
            className="absolute right-2 top-2"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <CardTitle className="text-xl">
            협업 초대를 받았어요!
          </CardTitle>
          <CardDescription>
            친구가 체크리스트 협업에 초대했습니다
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 초대 정보 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {isEnriching ? '로딩 중...' : invitation.checklistTitle}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs text-white bg-blue-500">
                      {invitation.inviterNickname.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {invitation.inviterNickname}님이 초대
                  </span>
                </div>
              </div>
            </div>

            {/* 초대 코드 */}
            <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-sm text-blue-800">초대 코드:</span>
              <span className="font-mono text-lg font-bold text-blue-900">
                {invitation.shareCode}
              </span>
            </div>

            {/* 만료 시간 */}
            {timeLeft && (
              <div className="flex items-center justify-center gap-2 text-sm text-orange-600">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}</span>
              </div>
            )}
          </div>

          {/* 협업 미리보기 정보 */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">실시간 협업 기능</span>
            </div>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• 실시간으로 함께 체크하기</li>
              <li>• 누가 무엇을 완료했는지 즉시 확인</li>
              <li>• 모든 항목 완료시 축하 알림</li>
            </ul>
          </div>

          {/* 액션 버튼들 */}
          <div className="space-y-3">
            <Button 
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              지금 참여하기
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleLater}
                variant="outline" 
                className="flex-1"
              >
                나중에 하기
              </Button>
              <Button 
                onClick={handleDecline}
                variant="ghost" 
                className="flex-1 text-gray-600"
              >
                거절하기
              </Button>
            </div>
          </div>

          {/* 안내 메시지 */}
          <p className="text-xs text-center text-gray-500">
            나중에 하기를 선택하면 메인 화면에서 언제든 참여할 수 있어요
          </p>
        </CardContent>
      </Card>
    </div>
  )
}