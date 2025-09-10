'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserPlus, 
  Users, 
  Search, 
  Phone, 
  Copy,
  Check,
  UserCheck,
  Clock,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Friend {
  id: string
  nickname: string
  name?: string
  avatar?: string
  userType: 'GUEST' | 'REGISTERED'
  isOnline: boolean
  friendshipStatus: 'ACCEPTED' | 'PENDING' | 'SENT'
  addedAt: Date
}

interface FriendSystemProps {
  currentUser: {
    id: string
    nickname: string
    friendCode: string // 개인 고유 코드 (예: CS1A2B)
  }
}

export function FriendSystem({ currentUser }: FriendSystemProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [friendCode, setFriendCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'add' | 'requests'>('friends')

  // 친구 목록 로드
  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('친구 목록 로드 실패:', error)
    }
  }

  // 내 친구 코드 복사
  const copyMyFriendCode = async () => {
    try {
      await navigator.clipboard.writeText(currentUser.friendCode)
      toast.success('친구 코드가 복사되었습니다!')
    } catch (error) {
      toast.error('복사에 실패했습니다')
    }
  }

  // 친구 코드로 친구 추가
  const addFriendByCode = async () => {
    if (!friendCode.trim()) {
      toast.error('친구 코드를 입력해주세요')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/friends/add-by-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendCode: friendCode.trim().toUpperCase() })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success(`${data.friend.nickname}님에게 친구 요청을 보냈습니다!`)
        setFriendCode('')
        loadFriends()
      } else {
        toast.error(data.message || '친구 추가에 실패했습니다')
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 연락처에서 친구 찾기
  const findFriendsFromContacts = async () => {
    setIsLoading(true)
    try {
      // 연락처 권한 요청 (실제 구현에서는 native bridge 필요)
      const response = await fetch('/api/friends/find-from-contacts', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`${data.count}명의 친구를 찾았습니다!`)
        loadFriends()
      }
    } catch (error) {
      toast.error('연락처 동기화에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 친구 요청 수락/거절
  const handleFriendRequest = async (friendId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/friends/request/${friendId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const actionText = action === 'accept' ? '수락' : '거절'
        toast.success(`친구 요청을 ${actionText}했습니다`)
        loadFriends()
      }
    } catch (error) {
      toast.error('요청 처리에 실패했습니다')
    }
  }

  // 친구 검색 필터링
  const filteredFriends = friends.filter(friend => 
    friend.friendshipStatus === 'ACCEPTED' &&
    (friend.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
     friend.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // 대기중인 요청들
  const pendingRequests = friends.filter(f => f.friendshipStatus === 'PENDING')
  const sentRequests = friends.filter(f => f.friendshipStatus === 'SENT')

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          친구 관리
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              친구 ({filteredFriends.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-1">
              <UserPlus className="w-4 h-4" />
              친구 추가
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              요청 ({pendingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* 친구 목록 탭 */}
          <TabsContent value="friends" className="space-y-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="친구 이름 또는 닉네임 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 친구 목록 */}
            <div className="space-y-2">
              {filteredFriends.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-white font-medium bg-blue-500">
                      {friend.nickname.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{friend.nickname}</span>
                      {friend.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {friend.userType === 'REGISTERED' && (
                        <Badge variant="secondary" className="text-xs">인증</Badge>
                      )}
                    </div>
                    {friend.name && (
                      <p className="text-sm text-gray-500">{friend.name}</p>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {new Date(friend.addedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {filteredFriends.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>아직 친구가 없습니다</p>
                  <p className="text-sm">친구를 추가해보세요!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 친구 추가 탭 */}
          <TabsContent value="add" className="space-y-6">
            {/* 내 친구 코드 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">내 친구 코드</h3>
              <p className="text-sm text-blue-700 mb-3">
                이 코드를 친구에게 알려주세요
              </p>
              <div className="flex items-center gap-2">
                <Input
                  value={currentUser.friendCode}
                  readOnly
                  className="bg-white border-blue-300 font-mono text-lg text-center"
                />
                <Button 
                  onClick={copyMyFriendCode}
                  variant="outline"
                  size="icon"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 친구 코드로 추가 */}
            <div className="space-y-3">
              <h3 className="font-semibold">친구 코드로 추가</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="친구 코드 입력 (예: AB1C2D)"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="font-mono"
                  maxLength={6}
                />
                <Button 
                  onClick={addFriendByCode}
                  disabled={isLoading || !friendCode.trim()}
                >
                  {isLoading ? '추가 중...' : '친구 추가'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                친구의 6자리 코드를 입력하면 친구 요청이 전송됩니다
              </p>
            </div>

            {/* 연락처에서 찾기 */}
            <div className="space-y-3">
              <h3 className="font-semibold">연락처에서 친구 찾기</h3>
              <Button 
                onClick={findFriendsFromContacts}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                {isLoading ? '검색 중...' : '연락처 동기화'}
              </Button>
              <p className="text-xs text-gray-500">
                연락처에 저장된 번호로 앱을 사용하는 친구들을 찾아드려요
              </p>
            </div>
          </TabsContent>

          {/* 친구 요청 탭 */}
          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">받은 요청 ({pendingRequests.length}개)</h3>
              {pendingRequests.map(friend => (
                <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-white font-medium bg-yellow-500">
                      {friend.nickname.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{friend.nickname}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">대기 중</Badge>
                    </div>
                    <p className="text-sm text-gray-600">친구 요청을 보냈습니다</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleFriendRequest(friend.id, 'accept')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      수락
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFriendRequest(friend.id, 'decline')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      거절
                    </Button>
                  </div>
                </div>
              ))}
              
              {pendingRequests.length === 0 && (
                <p className="text-center text-gray-500 py-4">받은 친구 요청이 없습니다</p>
              )}
            </div>

            {sentRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">보낸 요청 ({sentRequests.length}개)</h3>
                {sentRequests.map(friend => (
                  <div key={friend.id} className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-white font-medium bg-blue-500">
                        {friend.nickname.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{friend.nickname}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">전송됨</Badge>
                      </div>
                      <p className="text-sm text-gray-600">상대방의 수락을 기다리는 중</p>
                    </div>
                    
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}