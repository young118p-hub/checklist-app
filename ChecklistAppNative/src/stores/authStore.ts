import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface User {
  id: string
  email: string
  nickname: string
  name?: string
  friendCode: string // 고유 친구 코드 (예: CS1A2B)
  userType: 'GUEST' | 'REGISTERED'
  createdAt: Date
}

interface AuthState {
  user: User | null
  loading: boolean
  isInitialized: boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>
  createGuestUser: (nickname: string) => Promise<{ error?: string }>
  upgradeGuestToRegistered: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ error?: string }>
  
  // Initialization
  initialize: () => Promise<void>
}

// Generate random friend code
const generateFriendCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate unique friend code (collision-free)
const generateUniqueFriendCode = async (): Promise<string> => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateFriendCode()
    const isUnique = await checkFriendCodeUnique(code)
    if (isUnique) {
      return code
    }
    attempts++
  }
  
  // Fallback: use timestamp-based code
  return `UC${Date.now().toString(36).toUpperCase().slice(-4)}`
}

// Check if friend code is unique
const checkFriendCodeUnique = async (friendCode: string): Promise<boolean> => {
  try {
    // Check registered users
    const registeredUsers = await AsyncStorage.getItem('registered_users')
    const users = registeredUsers ? JSON.parse(registeredUsers) : []
    
    // Check guest users
    const guestUsers = await AsyncStorage.getItem('guest_users')
    const guests = guestUsers ? JSON.parse(guestUsers) : []
    
    const allUsers = [...users, ...guests]
    return !allUsers.some((user: User) => user.friendCode === friendCode)
  } catch {
    return false
  }
}

// Check nickname availability
const checkNicknameAvailability = async (nickname: string): Promise<boolean> => {
  try {
    // Check registered users
    const registeredUsers = await AsyncStorage.getItem('registered_users')
    const users = registeredUsers ? JSON.parse(registeredUsers) : []
    
    // Check guest users
    const guestUsers = await AsyncStorage.getItem('guest_users')
    const guests = guestUsers ? JSON.parse(guestUsers) : []
    
    const allUsers = [...users, ...guests]
    
    // Case-insensitive nickname check
    return allUsers.some((user: User) => 
      user.nickname.toLowerCase() === nickname.toLowerCase()
    )
  } catch {
    return false
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isInitialized: false,
  
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      
      // 실제 구현에서는 백엔드 API 호출
      // 여기서는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 임시로 로컬에서 사용자 조회
      const storedUsers = await AsyncStorage.getItem('registered_users')
      const users = storedUsers ? JSON.parse(storedUsers) : []
      const user = users.find((u: any) => u.email === email)
      
      if (!user) {
        set({ loading: false })
        return { error: '사용자를 찾을 수 없습니다.' }
      }
      
      // 사용자 정보 저장
      await AsyncStorage.setItem('current_user', JSON.stringify(user))
      set({ user, loading: false })
      
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : '로그인에 실패했습니다.' }
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    try {
      set({ loading: true })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 이메일 중복 검사
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const users = registeredUsers ? JSON.parse(registeredUsers) : []
      const emailExists = users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())
      
      if (emailExists) {
        set({ loading: false })
        return { error: '이미 가입된 이메일입니다.' }
      }
      
      // 닉네임 중복 검사
      const isNicknameTaken = await checkNicknameAvailability(name)
      if (isNicknameTaken) {
        set({ loading: false })
        return { error: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.' }
      }
      
      // 고유한 친구 코드 생성
      const uniqueFriendCode = await generateUniqueFriendCode()
      
      // 새 사용자 생성
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        nickname: name,
        name,
        friendCode: uniqueFriendCode,
        userType: 'REGISTERED',
        createdAt: new Date()
      }
      
      // 등록된 사용자 목록에 추가
      users.push(newUser)
      await AsyncStorage.setItem('registered_users', JSON.stringify(users))
      
      // 현재 사용자로 설정
      await AsyncStorage.setItem('current_user', JSON.stringify(newUser))
      set({ user: newUser, loading: false })
      
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : '회원가입에 실패했습니다.' }
    }
  },

  createGuestUser: async (nickname: string) => {
    try {
      set({ loading: true })
      
      // 간단한 닉네임 검증 (너무 짧거나 특수문자만 체크)
      if (nickname.trim().length < 2) {
        set({ loading: false })
        return { error: '닉네임은 2글자 이상이어야 합니다.' }
      }
      
      if (!/^[가-힣a-zA-Z0-9\s]+$/.test(nickname.trim())) {
        set({ loading: false })
        return { error: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.' }
      }
      
      // 세션 기반 고유 ID (중복은 허용하되 구분 가능하게)
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const guestUser: User = {
        id: sessionId,
        email: '',
        nickname: nickname.trim(),
        friendCode: generateFriendCode(), // 단순한 친구 코드
        userType: 'GUEST',
        createdAt: new Date()
      }
      
      // 현재 세션에만 저장 (글로벌 목록에는 저장하지 않음)
      await AsyncStorage.setItem('current_user', JSON.stringify(guestUser))
      set({ user: guestUser, loading: false })
      
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : '게스트 사용자 생성에 실패했습니다.' }
    }
  },

  // 게스트를 등록 사용자로 업그레이드하는 함수 추가
  upgradeGuestToRegistered: async (email: string, password: string) => {
    try {
      const { user } = get()
      if (!user || user.userType !== 'GUEST') {
        return { error: '게스트 사용자만 업그레이드할 수 있습니다.' }
      }

      set({ loading: true })

      // 이메일 중복 검사
      const registeredUsers = await AsyncStorage.getItem('registered_users')
      const users = registeredUsers ? JSON.parse(registeredUsers) : []
      const emailExists = users.some((u: User) => u.email.toLowerCase() === email.toLowerCase())
      
      if (emailExists) {
        set({ loading: false })
        return { error: '이미 가입된 이메일입니다.' }
      }

      // 현재 게스트 사용자를 등록 사용자로 업그레이드
      const upgradedUser: User = {
        ...user,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        userType: 'REGISTERED'
      }

      // 등록된 사용자 목록에 추가
      users.push(upgradedUser)
      await AsyncStorage.setItem('registered_users', JSON.stringify(users))
      
      // 현재 사용자 업데이트
      await AsyncStorage.setItem('current_user', JSON.stringify(upgradedUser))
      set({ user: upgradedUser, loading: false })
      
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : '계정 업그레이드에 실패했습니다.' }
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await AsyncStorage.removeItem('current_user')
      set({ user: null, loading: false })
    } catch (error) {
      console.error('Sign out error:', error)
      set({ loading: false })
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get()
      if (!user) return { error: '로그인이 필요합니다.' }
      
      set({ loading: true })
      
      const updatedUser = { ...user, ...updates }
      await AsyncStorage.setItem('current_user', JSON.stringify(updatedUser))
      
      // 등록된 사용자인 경우 사용자 목록도 업데이트
      if (user.userType === 'REGISTERED') {
        const storedUsers = await AsyncStorage.getItem('registered_users')
        const users = storedUsers ? JSON.parse(storedUsers) : []
        const userIndex = users.findIndex((u: User) => u.id === user.id)
        if (userIndex !== -1) {
          users[userIndex] = updatedUser
          await AsyncStorage.setItem('registered_users', JSON.stringify(users))
        }
      }
      
      set({ user: updatedUser, loading: false })
      return {}
    } catch (error) {
      set({ loading: false })
      return { error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.' }
    }
  },

  initialize: async () => {
    try {
      set({ loading: true })
      
      const storedUser = await AsyncStorage.getItem('current_user')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        set({ user, loading: false, isInitialized: true })
      } else {
        set({ user: null, loading: false, isInitialized: true })
      }
    } catch (error) {
      console.error('Initialize error:', error)
      set({ user: null, loading: false, isInitialized: true })
    }
  },
}))