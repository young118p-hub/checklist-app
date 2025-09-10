import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'
import { FriendCodeGenerator, SecurityRateLimiter } from '@/lib/security/friend-code-generator'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

// 입력 검증 스키마
const addFriendSchema = z.object({
  friendCode: z.string()
    .min(6, '친구 코드는 최소 6자리입니다')
    .max(12, '친구 코드는 최대 12자리입니다')
    .regex(/^[A-Z0-9]+$/, '친구 코드는 영문 대문자와 숫자만 포함할 수 있습니다')
})

export async function POST(request: NextRequest) {
  const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const startTime = Date.now()

  try {
    // Rate limiting 확인
    if (!SecurityRateLimiter.checkRateLimit(`friend-add:${clientIp}`, 3, 300000)) {
      logger.security('Rate limit exceeded for friend code addition', {
        ip: clientIp,
        userAgent,
        action: 'add_friend_by_code'
      })
      
      return NextResponse.json(
        { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // 인증 확인
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      logger.security('Unauthorized friend code addition attempt', {
        ip: clientIp,
        userAgent,
        hasAuth: !!authorization
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authorization.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      logger.security('Invalid token used for friend code addition', {
        ip: clientIp,
        error: error?.message
      })
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 입력 검증
    const body = await request.json()
    const validationResult = addFriendSchema.safeParse(body)
    
    if (!validationResult.success) {
      logger.warn('Invalid friend code format', {
        errors: validationResult.error.errors,
        userId: user.id
      })
      
      return NextResponse.json(
        { message: '올바른 친구 코드 형식이 아닙니다' },
        { status: 400 }
      )
    }

    const { friendCode } = validationResult.data

    // 사용자 정보 조회
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        nickname: true,
        friendCode: true
      }
    })

    if (!currentUser) {
      logger.error('User not found in database', { userId: user.id })
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 자신의 친구 코드인지 확인
    if (friendCode === currentUser.friendCode) {
      logger.warn('User tried to add own friend code', { userId: user.id })
      return NextResponse.json(
        { message: '자신의 친구 코드는 추가할 수 없습니다' },
        { status: 400 }
      )
    }

    // 친구 코드 유효성 검증
    if (!FriendCodeGenerator.isValidFriendCode(friendCode)) {
      logger.warn('Invalid friend code format detected', { 
        friendCode: friendCode.substring(0, 3) + '***',
        userId: user.id 
      })
      
      return NextResponse.json(
        { message: '올바르지 않은 친구 코드 형식입니다' },
        { status: 400 }
      )
    }

    // 친구 코드로 사용자 찾기 (보안 강화된 방식)
    const targetUser = await prisma.user.findUnique({
      where: { friendCode },
      select: {
        id: true,
        nickname: true,
        name: true,
        avatar: true,
        userType: true
      }
    })

    if (!targetUser) {
      return NextResponse.json(
        { message: '해당 친구 코드를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 친구인지 확인
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: user.id, receiverId: targetUser.id },
          { requesterId: targetUser.id, receiverId: user.id }
        ]
      }
    })

    if (existingFriendship) {
      const statusMessage = {
        PENDING: '이미 친구 요청을 보냈습니다',
        ACCEPTED: '이미 친구입니다',
        DECLINED: '이전에 거절된 친구 요청입니다'
      }[existingFriendship.status]

      return NextResponse.json(
        { message: statusMessage },
        { status: 409 }
      )
    }

    // 친구 요청 생성
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: user.id,
        receiverId: targetUser.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            nickname: true,
            name: true,
            avatar: true,
            userType: true
          }
        }
      }
    })

    // 상대방에게 알림 발송 (실제로는 푸시 알림)
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'FRIEND_REQUEST',
        title: '새로운 친구 요청',
        message: `${currentUser.nickname}님이 친구 요청을 보냈습니다`,
        data: {
          requesterId: user.id,
          requesterNickname: currentUser.nickname
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '친구 요청을 보냈습니다',
      friend: friendship.receiver
    })

  } catch (error) {
    console.error('친구 추가 오류:', error)
    return NextResponse.json(
      { message: '친구 추가 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}