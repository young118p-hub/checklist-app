import { Socket } from 'socket.io'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'

export interface AuthenticatedSocket extends Socket {
  userId: string
  userInfo: {
    id: string
    nickname: string
    userType: 'GUEST' | 'REGISTERED'
    avatar?: string
  }
}

// Socket 인증 미들웨어
export const socketAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }

    // Bearer 토큰 처리
    const authToken = token.startsWith('Bearer ') ? token.slice(7) : token

    // Supabase JWT 토큰 검증
    const { data: { user }, error } = await supabase.auth.getUser(authToken)
    
    if (error || !user) {
      return next(new Error('Invalid authentication token'))
    }

    // DB에서 사용자 정보 조회
    const userInfo = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nickname: true,
        userType: true,
        avatar: true,
        isVerified: true,
        expiresAt: true
      }
    })

    if (!userInfo) {
      return next(new Error('User not found'))
    }

    // 임시 사용자 만료 확인
    if (userInfo.userType === 'GUEST' && userInfo.expiresAt && userInfo.expiresAt < new Date()) {
      return next(new Error('Guest session expired'))
    }

    // 인증된 소켓에 사용자 정보 추가
    const authSocket = socket as AuthenticatedSocket
    authSocket.userId = userInfo.id
    authSocket.userInfo = {
      id: userInfo.id,
      nickname: userInfo.nickname,
      userType: userInfo.userType,
      avatar: userInfo.avatar || undefined
    }

    // 마지막 활동 시간 업데이트
    await prisma.user.update({
      where: { id: userInfo.id },
      data: { lastActiveAt: new Date() }
    })

    next()

  } catch (error) {
    console.error('Socket authentication error:', error)
    next(new Error('Authentication failed'))
  }
}

// 협업 권한 확인 유틸리티
export const checkCollaborationPermission = async (
  userId: string, 
  checklistId: string,
  requiredPermissions: string[] = ['READ']
): Promise<{
  hasPermission: boolean
  role?: string
  permissions?: string[]
}> => {
  try {
    // 체크리스트 소유자 확인
    const checklist = await prisma.checklist.findUnique({
      where: { id: checklistId },
      select: { 
        userId: true, 
        isCollaborative: true,
        maxCollaborators: true
      }
    })

    if (!checklist) {
      return { hasPermission: false }
    }

    // 체크리스트 소유자인 경우 모든 권한 허용
    if (checklist.userId === userId) {
      return {
        hasPermission: true,
        role: 'OWNER',
        permissions: ['READ', 'WRITE', 'DELETE', 'INVITE', 'MANAGE']
      }
    }

    // 협업이 비활성화된 경우
    if (!checklist.isCollaborative) {
      return { hasPermission: false }
    }

    // 협업자 권한 확인
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        checklistId_userId: {
          checklistId,
          userId
        }
      },
      select: {
        role: true,
        permissions: true,
        isActive: true
      }
    })

    if (!collaboration || !collaboration.isActive) {
      return { hasPermission: false }
    }

    // 필요한 권한 확인
    const hasAllPermissions = requiredPermissions.every(permission => 
      collaboration.permissions.includes(permission as any)
    )

    return {
      hasPermission: hasAllPermissions,
      role: collaboration.role,
      permissions: collaboration.permissions
    }

  } catch (error) {
    console.error('Permission check error:', error)
    return { hasPermission: false }
  }
}

// Rate limiting을 위한 사용자별 액션 추적
const userActions = new Map<string, { count: number, resetTime: number }>()

export const rateLimitMiddleware = (socket: AuthenticatedSocket, maxActions: number = 30, windowMs: number = 60000) => {
  return (next: Function) => {
    const userId = socket.userId
    const now = Date.now()
    
    const userAction = userActions.get(userId)
    
    // 윈도우 초기화 또는 첫 액션
    if (!userAction || now > userAction.resetTime) {
      userActions.set(userId, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    // Rate limit 확인
    if (userAction.count >= maxActions) {
      return next(new Error('Rate limit exceeded'))
    }
    
    // 액션 카운트 증가
    userAction.count++
    next()
  }
}