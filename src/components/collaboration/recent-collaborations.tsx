'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, Users, CheckCircle } from 'lucide-react'

interface RecentCollaboration {
  id: string
  title: string
  shareCode: string
  lastActiveAt: Date
  totalItems: number
  completedItems: number
  participants: Array<{
    nickname: string
    color: string
    isOnline: boolean
  }>
  role: 'OWNER' | 'MEMBER'
}

interface RecentCollaborationsProps {
  onJoinCollaboration: (shareCode: string) => void
}

export function RecentCollaborations({ onJoinCollaboration }: RecentCollaborationsProps) {
  const [collaborations, setCollaborations] = useState<RecentCollaboration[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentCollaborations()
  }, [])

  const loadRecentCollaborations = async () => {
    setIsLoading(true)
    try {
      // 로컬 스토리지에서 최근 협업 목록 로드
      const stored = localStorage.getItem('recentCollaborations')
      if (stored) {
        const recent = JSON.parse(stored) as RecentCollaboration[]
        // 7일 이내 협업만 표시
        const filtered = recent.filter(c => {
          const daysDiff = Math.floor((Date.now() - new Date(c.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff <= 7
        })
        setCollaborations(filtered.slice(0, 5)) // 최대 5개만
      }
      
      // 서버에서도 동기화 (백그라운드)
      syncWithServer()
    } catch (error) {
      console.error('최근 협업 로드 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithServer = async () => {
    try {
      const response = await fetch('/api/collaborations/recent')
      if (response.ok) {
        const serverData = await response.json()
        setCollaborations(serverData)
        // 로컬에도 저장
        localStorage.setItem('recentCollaborations', JSON.stringify(serverData))
      }
    } catch (error) {
      console.log('서버 동기화 실패 (오프라인?)', error)
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return '방금'
    if (diffMinutes < 60) return `${diffMinutes}분 전`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}시간 전`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}일 전`
  }

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            최근 협업
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (collaborations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            최근 협업
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>최근 참여한 협업이 없습니다</p>
            <p className="text-sm">친구들과 함께하는 체크리스트를 만들어보세요!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          최근 협업
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {collaborations.map((collab) => (
          <div
            key={collab.id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onJoinCollaboration(collab.shareCode)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{collab.title}</h4>
                  {collab.role === 'OWNER' && (
                    <Badge variant="secondary" className="text-xs">소유자</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {getTimeAgo(collab.lastActiveAt)} • 코드: {collab.shareCode}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <CheckCircle className="w-3 h-3" />
                  {collab.completedItems}/{collab.totalItems}
                </div>
                <div className="text-xs text-gray-500">
                  {getProgressPercentage(collab.completedItems, collab.totalItems)}% 완료
                </div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${getProgressPercentage(collab.completedItems, collab.totalItems)}%` }}
              />
            </div>

            {/* 참여자들 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="flex -space-x-1">
                  {collab.participants.slice(0, 4).map((participant, index) => (
                    <Avatar key={index} className="w-6 h-6 border-2 border-white">
                      <AvatarFallback
                        className="text-xs text-white font-medium"
                        style={{ backgroundColor: participant.color }}
                      >
                        {participant.nickname.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {collab.participants.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        +{collab.participants.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 온라인 참여자 수 */}
                {collab.participants.some(p => p.isOnline) && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">
                      {collab.participants.filter(p => p.isOnline).length}명 온라인
                    </span>
                  </div>
                )}
              </div>
              
              <Button size="sm" variant="outline">
                다시 참여
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}