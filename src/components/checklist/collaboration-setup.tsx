'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Users, Link, Send, Search, UserPlus } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface Friend {
  id: string
  name: string
  nickname: string
  avatar?: string
  isOnline: boolean
}

interface CollaborationSetupProps {
  checklistTitle: string
  onInviteFriends: (friendIds: string[], message?: string) => void
  onGenerateLink: () => void
  onCancel: () => void
  friends: Friend[]
  isLoading?: boolean
}

export function CollaborationSetup({
  checklistTitle,
  onInviteFriends,
  onGenerateLink, 
  onCancel,
  friends,
  isLoading = false
}: CollaborationSetupProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([])
  const [inviteMessage, setInviteMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'link'>('friends')

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleInvite = () => {
    if (selectedFriends.length === 0) {
      alert('초대할 친구를 선택해주세요.')
      return
    }
    onInviteFriends(selectedFriends, inviteMessage)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          친구들과 함께하기
        </CardTitle>
        <CardDescription>
          "{checklistTitle}" 체크리스트를 친구들과 실시간으로 공유해보세요
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 탭 선택 */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={activeTab === 'friends' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('friends')}
            className="flex-1"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            친구 초대
          </Button>
          <Button
            variant={activeTab === 'link' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('link')}
            className="flex-1"
          >
            <Link className="w-4 h-4 mr-1" />
            링크 공유
          </Button>
        </div>

        {/* 친구 초대 탭 */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {/* 친구 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="친구 이름 또는 닉네임 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 선택된 친구들 */}
            {selectedFriends.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  선택된 친구들 ({selectedFriends.length}명)
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFriends.map(friendId => {
                    const friend = friends.find(f => f.id === friendId)
                    return friend ? (
                      <Badge 
                        key={friendId} 
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {friend.nickname}
                      </Badge>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* 친구 목록 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-all ${
                    selectedFriends.includes(friend.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar} alt={friend.name} />
                    <AvatarFallback>{friend.nickname.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{friend.nickname}</span>
                      {friend.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{friend.name}</p>
                  </div>

                  {selectedFriends.includes(friend.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))}
              
              {filteredFriends.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>검색 결과가 없습니다</p>
                  <p className="text-sm">친구를 먼저 추가해보세요!</p>
                </div>
              )}
            </div>

            {/* 초대 메시지 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">초대 메시지 (선택사항)</label>
              <Textarea
                placeholder="함께 준비해요! 🏕️"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={2}
              />
            </div>

            {/* 초대 버튼 */}
            <Button
              onClick={handleInvite}
              disabled={selectedFriends.length === 0 || isLoading}
              className="w-full"
              size="lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {isLoading 
                ? '초대 중...' 
                : `${selectedFriends.length}명 초대하기`
              }
            </Button>
          </div>
        )}

        {/* 링크 공유 탭 */}
        {activeTab === 'link' && (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <Link className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">공유 링크 생성</h3>
              <p className="text-gray-600 mb-4">
                링크를 생성하여 카카오톡, 문자 등으로 쉽게 공유하세요
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  링크를 받은 사람은 앱을 설치해야 참여 가능
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  실시간으로 함께 체크하고 알림 받기
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  링크는 7일 후 자동 만료
                </div>
              </div>
            </div>

            <Button
              onClick={onGenerateLink}
              disabled={isLoading}
              size="lg"
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              {isLoading ? '링크 생성 중...' : '공유 링크 생성하기'}
            </Button>
          </div>
        )}

        {/* 하단 버튼들 */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            나중에 하기
          </Button>
          <Button
            onClick={() => activeTab === 'friends' ? handleInvite() : onGenerateLink()}
            disabled={(activeTab === 'friends' && selectedFriends.length === 0) || isLoading}
            className="flex-1"
          >
            {activeTab === 'friends' ? '초대하기' : '링크 생성'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}