import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Friend, FriendRequest, RecentCollaboration } from '../types'

interface FriendState {
  friends: Friend[]
  friendRequests: FriendRequest[]
  recentCollaborations: RecentCollaboration[]
  loading: boolean
  error: string | null
  
  // Friend management
  addFriendByCode: (friendCode: string) => Promise<{ error?: string }>
  acceptFriendRequest: (requestId: string) => Promise<{ error?: string }>
  declineFriendRequest: (requestId: string) => Promise<{ error?: string }>
  removeFriend: (friendId: string) => Promise<{ error?: string }>
  
  // Data fetching
  loadFriends: () => Promise<void>
  loadFriendRequests: () => Promise<void>
  loadRecentCollaborations: () => Promise<void>
  
  // Collaboration
  addRecentCollaboration: (collaboration: RecentCollaboration) => Promise<void>
  removeRecentCollaboration: (collaborationId: string) => Promise<void>
  
  // Utility
  setError: (error: string | null) => void
  findFriendByCode: (friendCode: string) => Promise<Friend | null>
}

const FRIENDS_STORAGE_KEY = 'friends'
const FRIEND_REQUESTS_STORAGE_KEY = 'friend_requests'
const RECENT_COLLABORATIONS_STORAGE_KEY = 'recent_collaborations'

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Generate random colors for participants
const getRandomColor = (): string => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316']
  return colors[Math.floor(Math.random() * colors.length)]
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  friendRequests: [],
  recentCollaborations: [],
  loading: false,
  error: null,

  addFriendByCode: async (friendCode: string) => {
    try {
      set({ loading: true, error: null })
      
      // 시뮬레이션: 친구 코드로 사용자 찾기
      // 실제로는 백엔드 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 등록된 사용자들에서 찾기
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const users = registeredUsers ? JSON.parse(registeredUsers) : []
      const targetUser = users.find((u: any) => u.friendCode === friendCode)
      
      if (!targetUser) {
        set({ loading: false, error: '해당 친구 코드를 가진 사용자를 찾을 수 없습니다.' })
        return { error: '사용자를 찾을 수 없습니다.' }
      }
      
      // 현재 사용자 정보 가져오기
      const currentUserData = await AsyncStorage.getItem('current_user')
      if (!currentUserData) {
        set({ loading: false, error: '로그인이 필요합니다.' })
        return { error: '로그인이 필요합니다.' }
      }
      
      const currentUser = JSON.parse(currentUserData)
      
      // 자기 자신을 친구로 추가하는 것 방지
      if (targetUser.id === currentUser.id) {
        set({ loading: false, error: '자신을 친구로 추가할 수 없습니다.' })
        return { error: '자신을 친구로 추가할 수 없습니다.' }
      }
      
      // 이미 친구인지 확인
      const existingFriends = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY)
      const friends = existingFriends ? JSON.parse(existingFriends) : []
      const isAlreadyFriend = friends.some((f: Friend) => 
        f.friendId === targetUser.id && f.userId === currentUser.id
      )
      
      if (isAlreadyFriend) {
        set({ loading: false, error: '이미 친구입니다.' })
        return { error: '이미 친구입니다.' }
      }
      
      // 친구 요청 생성
      const newFriendRequest: FriendRequest = {
        id: generateId(),
        senderId: currentUser.id,
        receiverId: targetUser.id,
        senderNickname: currentUser.nickname,
        status: 'PENDING',
        sentAt: new Date()
      }
      
      const existingRequests = await AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY)
      const requests = existingRequests ? JSON.parse(existingRequests) : []
      requests.push(newFriendRequest)
      
      await AsyncStorage.setItem(FRIEND_REQUESTS_STORAGE_KEY, JSON.stringify(requests))
      
      set({ loading: false })
      return {}
      
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '친구 추가에 실패했습니다.' 
      })
      return { error: '친구 추가에 실패했습니다.' }
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null })
      
      const requestsData = await AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY)
      const requests: FriendRequest[] = requestsData ? JSON.parse(requestsData) : []
      const request = requests.find(r => r.id === requestId)
      
      if (!request) {
        set({ loading: false, error: '친구 요청을 찾을 수 없습니다.' })
        return { error: '친구 요청을 찾을 수 없습니다.' }
      }
      
      // 현재 사용자 정보
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      // 보내는 사용자 정보 가져오기
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const users = registeredUsers ? JSON.parse(registeredUsers) : []
      const senderUser = users.find((u: any) => u.id === request.senderId)
      
      if (!senderUser || !currentUser) {
        set({ loading: false, error: '사용자 정보를 찾을 수 없습니다.' })
        return { error: '사용자 정보를 찾을 수 없습니다.' }
      }
      
      // 양방향 친구 관계 생성
      const friendsData = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY)
      const friends: Friend[] = friendsData ? JSON.parse(friendsData) : []
      
      const newFriend1: Friend = {
        id: generateId(),
        userId: currentUser.id,
        friendId: senderUser.id,
        nickname: senderUser.nickname,
        name: senderUser.name,
        avatar: senderUser.avatar,
        userType: senderUser.userType,
        isOnline: Math.random() > 0.5, // 임시로 랜덤
        friendshipStatus: 'ACCEPTED',
        addedAt: new Date()
      }
      
      const newFriend2: Friend = {
        id: generateId(),
        userId: senderUser.id,
        friendId: currentUser.id,
        nickname: currentUser.nickname,
        name: currentUser.name,
        avatar: currentUser.avatar,
        userType: currentUser.userType,
        isOnline: true,
        friendshipStatus: 'ACCEPTED',
        addedAt: new Date()
      }
      
      friends.push(newFriend1, newFriend2)
      await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends))
      
      // 친구 요청 상태 업데이트
      const updatedRequests = requests.map(r => 
        r.id === requestId 
          ? { ...r, status: 'ACCEPTED' as const, respondedAt: new Date() }
          : r
      )
      await AsyncStorage.setItem(FRIEND_REQUESTS_STORAGE_KEY, JSON.stringify(updatedRequests))
      
      await get().loadFriends()
      await get().loadFriendRequests()
      
      set({ loading: false })
      return {}
      
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '친구 요청 수락에 실패했습니다.' 
      })
      return { error: '친구 요청 수락에 실패했습니다.' }
    }
  },

  declineFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true, error: null })
      
      const requestsData = await AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY)
      const requests: FriendRequest[] = requestsData ? JSON.parse(requestsData) : []
      
      const updatedRequests = requests.map(r => 
        r.id === requestId 
          ? { ...r, status: 'DECLINED' as const, respondedAt: new Date() }
          : r
      )
      
      await AsyncStorage.setItem(FRIEND_REQUESTS_STORAGE_KEY, JSON.stringify(updatedRequests))
      await get().loadFriendRequests()
      
      set({ loading: false })
      return {}
      
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '친구 요청 거절에 실패했습니다.' 
      })
      return { error: '친구 요청 거절에 실패했습니다.' }
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      set({ loading: true, error: null })
      
      const friendsData = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY)
      const friends: Friend[] = friendsData ? JSON.parse(friendsData) : []
      
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      if (!currentUser) {
        set({ loading: false, error: '로그인이 필요합니다.' })
        return { error: '로그인이 필요합니다.' }
      }
      
      // 양방향 친구 관계 삭제
      const updatedFriends = friends.filter(f => 
        !(
          (f.userId === currentUser.id && f.friendId === friendId) ||
          (f.userId === friendId && f.friendId === currentUser.id)
        )
      )
      
      await AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updatedFriends))
      await get().loadFriends()
      
      set({ loading: false })
      return {}
      
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '친구 삭제에 실패했습니다.' 
      })
      return { error: '친구 삭제에 실패했습니다.' }
    }
  },

  loadFriends: async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      if (!currentUser) {
        set({ friends: [] })
        return
      }
      
      const friendsData = await AsyncStorage.getItem(FRIENDS_STORAGE_KEY)
      const allFriends: Friend[] = friendsData ? JSON.parse(friendsData) : []
      
      // 현재 사용자의 친구만 필터링
      const userFriends = allFriends.filter(f => f.userId === currentUser.id)
      
      set({ friends: userFriends })
    } catch (error) {
      console.error('Failed to load friends:', error)
      set({ friends: [] })
    }
  },

  loadFriendRequests: async () => {
    try {
      const currentUserData = await AsyncStorage.getItem('current_user')
      const currentUser = currentUserData ? JSON.parse(currentUserData) : null
      
      if (!currentUser) {
        set({ friendRequests: [] })
        return
      }
      
      const requestsData = await AsyncStorage.getItem(FRIEND_REQUESTS_STORAGE_KEY)
      const allRequests: FriendRequest[] = requestsData ? JSON.parse(requestsData) : []
      
      // 현재 사용자가 받은 pending 요청만 필터링
      const userRequests = allRequests.filter(r => 
        r.receiverId === currentUser.id && r.status === 'PENDING'
      )
      
      set({ friendRequests: userRequests })
    } catch (error) {
      console.error('Failed to load friend requests:', error)
      set({ friendRequests: [] })
    }
  },

  loadRecentCollaborations: async () => {
    try {
      const collaborationsData = await AsyncStorage.getItem(RECENT_COLLABORATIONS_STORAGE_KEY)
      const collaborations: RecentCollaboration[] = collaborationsData ? JSON.parse(collaborationsData) : []
      
      // 7일 이내 협업만 표시
      const filtered = collaborations.filter(c => {
        const daysDiff = Math.floor((Date.now() - new Date(c.lastActiveAt).getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 7
      })
      
      set({ recentCollaborations: filtered.slice(0, 5) }) // 최대 5개
    } catch (error) {
      console.error('Failed to load recent collaborations:', error)
      set({ recentCollaborations: [] })
    }
  },

  addRecentCollaboration: async (collaboration: RecentCollaboration) => {
    try {
      const collaborationsData = await AsyncStorage.getItem(RECENT_COLLABORATIONS_STORAGE_KEY)
      const collaborations: RecentCollaboration[] = collaborationsData ? JSON.parse(collaborationsData) : []
      
      // 중복 제거
      const filtered = collaborations.filter(c => c.checklistId !== collaboration.checklistId)
      const updated = [collaboration, ...filtered].slice(0, 10) // 최대 10개 저장
      
      await AsyncStorage.setItem(RECENT_COLLABORATIONS_STORAGE_KEY, JSON.stringify(updated))
      await get().loadRecentCollaborations()
    } catch (error) {
      console.error('Failed to add recent collaboration:', error)
    }
  },

  removeRecentCollaboration: async (collaborationId: string) => {
    try {
      const collaborationsData = await AsyncStorage.getItem(RECENT_COLLABORATIONS_STORAGE_KEY)
      const collaborations: RecentCollaboration[] = collaborationsData ? JSON.parse(collaborationsData) : []
      
      const filtered = collaborations.filter(c => c.id !== collaborationId)
      await AsyncStorage.setItem(RECENT_COLLABORATIONS_STORAGE_KEY, JSON.stringify(filtered))
      await get().loadRecentCollaborations()
    } catch (error) {
      console.error('Failed to remove recent collaboration:', error)
    }
  },

  setError: (error: string | null) => {
    set({ error })
  },

  findFriendByCode: async (friendCode: string) => {
    try {
      // 등록된 사용자와 게스트 사용자 모두에서 검색
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const guestUsers = await AsyncStorage.getItem('guest_users')
      
      const allRegistered = registeredUsers ? JSON.parse(registeredUsers) : []
      const allGuests = guestUsers ? JSON.parse(guestUsers) : []
      const allUsers = [...allRegistered, ...allGuests]
      
      const user = allUsers.find((u: any) => u.friendCode === friendCode)
      
      if (!user) return null
      
      const friend: Friend = {
        id: user.id,
        userId: user.id,
        friendId: user.id,
        nickname: user.nickname,
        name: user.name,
        avatar: user.avatar,
        userType: user.userType,
        isOnline: Math.random() > 0.5,
        friendshipStatus: 'PENDING',
        addedAt: new Date()
      }
      
      return friend
    } catch (error) {
      console.error('Failed to find friend by code:', error)
      return null
    }
  },

  // 사용자 검증 강화 함수 추가
  getUserVerificationInfo: async (userId: string) => {
    try {
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const guestUsers = await AsyncStorage.getItem('guest_users')
      
      const allRegistered = registeredUsers ? JSON.parse(registeredUsers) : []
      const allGuests = guestUsers ? JSON.parse(guestUsers) : []
      const allUsers = [...allRegistered, ...allGuests]
      
      const user = allUsers.find((u: any) => u.id === userId)
      
      if (!user) return null
      
      return {
        id: user.id,
        nickname: user.nickname,
        userType: user.userType,
        friendCode: user.friendCode,
        createdAt: user.createdAt,
        isVerified: user.userType === 'REGISTERED', // 등록 사용자는 더 신뢰도 높음
        verificationLevel: user.userType === 'REGISTERED' ? 'HIGH' : 'LOW'
      }
    } catch (error) {
      console.error('Failed to get user verification info:', error)
      return null
    }
  },
}))