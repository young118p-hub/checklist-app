'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { OfflineStatusIndicator } from './offline-status-indicator'
import { CollaborationUser } from '@/lib/socket/client'

interface CollaborationStatusPanelProps {
  isConnected: boolean
  onlineUsers: CollaborationUser[]
  currentUser: CollaborationUser | null
  className?: string
}

export function CollaborationStatusPanel({
  isConnected,
  onlineUsers,
  currentUser,
  className
}: CollaborationStatusPanelProps) {
  const activeCount = onlineUsers.filter(user => user.isOnline).length
  
  const getUserInitials = (nickname: string) => {
    return nickname.slice(0, 2).toUpperCase()
  }

  const getUserColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'red': 'bg-red-500',
      'blue': 'bg-blue-500',
      'green': 'bg-green-500',
      'yellow': 'bg-yellow-500',
      'purple': 'bg-purple-500',
      'pink': 'bg-pink-500',
      'indigo': 'bg-indigo-500',
      'teal': 'bg-teal-500'
    }
    return colorMap[color] || 'bg-gray-500'
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            실시간 협업
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'success' : 'destructive'} className="text-xs">
              {isConnected ? '연결됨' : '연결 끊김'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              참여자 ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              상태
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3 mt-4">
            {/* 현재 사용자 */}
            {currentUser && (
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Avatar className="w-8 h-8">
                  <AvatarFallback 
                    className={`text-white text-sm ${getUserColor(currentUser.color)}`}
                  >
                    {getUserInitials(currentUser.nickname)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{currentUser.nickname}</span>
                    <Badge variant="secondary" className="text-xs">나</Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentUser.userType === 'GUEST' ? '게스트 사용자' : '등록 사용자'}
                  </span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}

            {/* 다른 온라인 사용자들 */}
            {onlineUsers
              .filter(user => user.id !== currentUser?.id)
              .map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className={`text-white text-sm ${getUserColor(user.color)}`}
                    >
                      {getUserInitials(user.nickname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{user.nickname}</span>
                      {user.userType === 'REGISTERED' && (
                        <Badge variant="outline" className="text-xs">등록</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      실시간 참여 중
                    </span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
              ))}

            {onlineUsers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">아직 참여한 사용자가 없습니다</p>
                <p className="text-xs mt-1">링크를 공유해 친구들을 초대해보세요!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-4">
            {/* 연결 상태 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium">실시간 동기화</p>
                  <p className="text-xs text-gray-500">
                    {isConnected ? '정상적으로 연결되어 있습니다' : '연결이 끊어진 상태입니다'}
                  </p>
                </div>
              </div>

              {/* 오프라인 상태 */}
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">네트워크 상태</p>
                  <OfflineStatusIndicator showDetails={true} />
                </div>
              </div>

              {/* 협업 안내 */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-1">
                  실시간 협업 기능
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• 체크리스트 항목을 실시간으로 함께 완료</li>
                  <li>• 누가 무엇을 완료했는지 즉시 확인</li>
                  <li>• 오프라인에서도 작업 가능 (자동 동기화)</li>
                  <li>• 모든 항목 완료 시 축하 알림</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}