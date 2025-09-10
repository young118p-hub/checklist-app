import { Server } from 'socket.io'
import { createServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { nicknameManager } from '@/lib/collaboration/nickname-manager'

// Socket.io 이벤트 타입 정의
interface ServerToClientEvents {
  // 협업 관련
  'user-joined': (data: { user: CollaborationUser, onlineCount: number }) => void
  'user-left': (data: { userId: string, onlineCount: number }) => void
  'users-online': (users: CollaborationUser[]) => void
  
  // 체크리스트 아이템 관련
  'item-checked': (data: { itemId: string, isCompleted: boolean, checkedBy: CollaborationUser, timestamp: Date }) => void
  'item-updated': (data: { itemId: string, updates: any, updatedBy: CollaborationUser }) => void
  'item-added': (data: { item: any, addedBy: CollaborationUser }) => void
  'item-deleted': (data: { itemId: string, deletedBy: CollaborationUser }) => void
  
  // 알림 관련
  'notification': (data: { type: string, title: string, message: string, data?: any }) => void
  'collaboration-completed': (data: { checklistId: string, completedBy: CollaborationUser }) => void
}

interface ClientToServerEvents {
  // 방 관련
  'join-collaboration': (data: { checklistId: string, shareCode: string, user: CollaborationUser }) => void
  'leave-collaboration': (data: { checklistId: string }) => void
  
  // 체크리스트 아이템 관련
  'toggle-item': (data: { itemId: string, isCompleted: boolean }) => void
  'update-item': (data: { itemId: string, updates: any }) => void
  'add-item': (data: { checklistId: string, item: any }) => void
  'delete-item': (data: { itemId: string }) => void
  
  // 실시간 상태
  'typing': (data: { itemId?: string, isTyping: boolean }) => void
  'heartbeat': () => void
}

interface CollaborationUser {
  id: string
  nickname: string
  color: string
  userType: 'GUEST' | 'REGISTERED'
  avatar?: string
  isOnline: boolean
}

// Socket.io 서버 인스턴스
let io: Server<ClientToServerEvents, ServerToClientEvents>

// 온라인 사용자 관리
const onlineUsers = new Map<string, { 
  socketId: string
  user: CollaborationUser
  checklistId: string
  lastActivity: Date
}>()

// 협업 방 관리
const collaborationRooms = new Map<string, Set<string>>() // checklistId -> Set<userId>

export const initSocketServer = (server: any) => {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-app-domain.com'] 
        : ['http://localhost:3000'],
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`)

    // 협업 참여
    socket.on('join-collaboration', async (data) => {
      const { checklistId, shareCode, user } = data
      
      try {
        // 체크리스트 유효성 검증
        const checklist = await prisma.checklist.findFirst({
          where: {
            OR: [
              { id: checklistId },
              { shareCode: shareCode }
            ],
            isCollaborative: true
          }
        })

        if (!checklist) {
          socket.emit('notification', {
            type: 'error',
            title: '참여 실패',
            message: '존재하지 않거나 만료된 협업입니다.'
          })
          return
        }

        // 닉네임 충돌 해결
        const nicknameResolution = nicknameManager.addNicknameToCollaboration(
          checklist.id,
          user.id,
          user.nickname
        )

        // 해결된 닉네임으로 사용자 정보 업데이트
        const resolvedUser = {
          ...user,
          nickname: nicknameResolution.resolvedNickname,
          isOnline: true
        }

        // 닉네임 충돌 알림
        if (nicknameResolution.conflictResolved) {
          socket.emit('notification', {
            type: 'warning',
            title: '닉네임 변경됨',
            message: `"${nicknameResolution.originalNickname}"가 이미 사용 중이어서 "${nicknameResolution.resolvedNickname}"로 변경되었습니다.`,
            data: {
              originalNickname: nicknameResolution.originalNickname,
              newNickname: nicknameResolution.resolvedNickname,
              suggestions: nicknameResolution.suggestions
            }
          })
        }

        // 사용자를 방에 추가
        socket.join(checklist.id)
        
        // 온라인 사용자 추가 (해결된 닉네임 사용)
        onlineUsers.set(user.id, {
          socketId: socket.id,
          user: resolvedUser,
          checklistId: checklist.id,
          lastActivity: new Date()
        })

        // 방 참여자 수 업데이트
        if (!collaborationRooms.has(checklist.id)) {
          collaborationRooms.set(checklist.id, new Set())
        }
        collaborationRooms.get(checklist.id)!.add(user.id)

        // DB에 참여 기록 (해결된 닉네임 사용)
        await prisma.collaboration.upsert({
          where: {
            checklistId_userId: {
              checklistId: checklist.id,
              userId: user.id
            }
          },
          update: {
            lastActiveAt: new Date(),
            isActive: true,
            guestNickname: resolvedUser.nickname
          },
          create: {
            checklistId: checklist.id,
            userId: user.id,
            role: 'MEMBER',
            guestNickname: resolvedUser.nickname,
            guestColor: resolvedUser.color
          }
        })

        // 다른 참여자들에게 알림 (해결된 닉네임 사용)
        const onlineCount = collaborationRooms.get(checklist.id)!.size
        socket.to(checklist.id).emit('user-joined', { user: resolvedUser, onlineCount })

        // 현재 온라인 사용자 목록 전송
        const roomUsers = Array.from(onlineUsers.values())
          .filter(u => u.checklistId === checklist.id)
          .map(u => u.user)
        
        socket.emit('users-online', roomUsers)

        console.log(`👥 ${resolvedUser.nickname} joined collaboration ${checklist.title}${nicknameResolution.conflictResolved ? ' (nickname resolved)' : ''}`)

      } catch (error) {
        console.error('❌ Join collaboration error:', error)
        socket.emit('notification', {
          type: 'error',
          title: '참여 실패',
          message: '서버 오류가 발생했습니다.'
        })
      }
    })

    // 체크리스트 아이템 토글
    socket.on('toggle-item', async (data) => {
      const { itemId, isCompleted } = data
      const userInfo = getUserBySocketId(socket.id)
      
      if (!userInfo) return

      try {
        // DB 업데이트
        const updatedItem = await prisma.checklistItem.update({
          where: { id: itemId },
          data: {
            isCompleted,
            checkedById: isCompleted ? userInfo.user.id : null,
            checkedAt: isCompleted ? new Date() : null
          }
        })

        // 체크 히스토리 저장
        await prisma.checkHistory.create({
          data: {
            itemId,
            checklistId: userInfo.checklistId,
            userId: userInfo.user.id,
            action: isCompleted ? 'CHECKED' : 'UNCHECKED',
            timestamp: new Date()
          }
        })

        // 방의 모든 사용자에게 브로드캐스트
        io.to(userInfo.checklistId).emit('item-checked', {
          itemId,
          isCompleted,
          checkedBy: userInfo.user,
          timestamp: new Date()
        })

        // 체크리스트 완료 확인
        const checklist = await prisma.checklist.findUnique({
          where: { id: userInfo.checklistId },
          include: {
            items: true
          }
        })

        if (checklist && checklist.items.every(item => item.isCompleted)) {
          io.to(userInfo.checklistId).emit('collaboration-completed', {
            checklistId: userInfo.checklistId,
            completedBy: userInfo.user
          })
        }

        console.log(`✅ ${userInfo.user.nickname} ${isCompleted ? 'checked' : 'unchecked'} item ${itemId}`)

      } catch (error) {
        console.error('❌ Toggle item error:', error)
        socket.emit('notification', {
          type: 'error',
          title: '업데이트 실패',
          message: '아이템 상태를 변경할 수 없습니다.'
        })
      }
    })

    // 아이템 업데이트 (제목, 설명 등)
    socket.on('update-item', async (data) => {
      const { itemId, updates } = data
      const userInfo = getUserBySocketId(socket.id)
      
      if (!userInfo) return

      try {
        await prisma.checklistItem.update({
          where: { id: itemId },
          data: updates
        })

        // 히스토리 저장
        await prisma.checkHistory.create({
          data: {
            itemId,
            checklistId: userInfo.checklistId,
            userId: userInfo.user.id,
            action: 'EDITED',
            newValue: JSON.stringify(updates)
          }
        })

        // 브로드캐스트
        io.to(userInfo.checklistId).emit('item-updated', {
          itemId,
          updates,
          updatedBy: userInfo.user
        })

      } catch (error) {
        console.error('❌ Update item error:', error)
      }
    })

    // 연결 해제
    socket.on('disconnect', () => {
      const userInfo = getUserBySocketId(socket.id)
      if (userInfo) {
        // 닉네임 매니저에서 제거
        nicknameManager.removeNicknameFromCollaboration(
          userInfo.checklistId,
          userInfo.user.nickname
        )
        
        // 온라인 사용자에서 제거
        onlineUsers.delete(userInfo.user.id)
        
        // 방에서 제거
        const room = collaborationRooms.get(userInfo.checklistId)
        if (room) {
          room.delete(userInfo.user.id)
          const onlineCount = room.size
          
          // 다른 사용자들에게 알림
          socket.to(userInfo.checklistId).emit('user-left', {
            userId: userInfo.user.id,
            onlineCount
          })
          
          // 빈 방 정리
          if (onlineCount === 0) {
            nicknameManager.clearCollaboration(userInfo.checklistId)
          }
        }

        console.log(`👋 ${userInfo.user.nickname} left collaboration`)
      }
      
      console.log(`🔌 Socket disconnected: ${socket.id}`)
    })

    // 하트비트 (연결 상태 확인)
    socket.on('heartbeat', () => {
      const userInfo = getUserBySocketId(socket.id)
      if (userInfo) {
        userInfo.lastActivity = new Date()
      }
    })
  })

  // 비활성 사용자 정리 (5분마다)
  setInterval(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    for (const [userId, userInfo] of onlineUsers.entries()) {
      if (userInfo.lastActivity < fiveMinutesAgo) {
        // 닉네임 매니저에서 제거
        nicknameManager.removeNicknameFromCollaboration(
          userInfo.checklistId,
          userInfo.user.nickname
        )
        
        onlineUsers.delete(userId)
        
        const room = collaborationRooms.get(userInfo.checklistId)
        if (room) {
          room.delete(userId)
          const onlineCount = room.size
          
          io.to(userInfo.checklistId).emit('user-left', {
            userId,
            onlineCount
          })
          
          // 빈 방 정리
          if (onlineCount === 0) {
            nicknameManager.clearCollaboration(userInfo.checklistId)
          }
        }
      }
    }
  }, 5 * 60 * 1000)

  return io
}

// 유틸리티 함수들
function getUserBySocketId(socketId: string) {
  for (const userInfo of onlineUsers.values()) {
    if (userInfo.socketId === socketId) {
      return userInfo
    }
  }
  return null
}

export const getSocketServer = () => io

export { io }