import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authorization.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { friendCode } = body

    if (!friendCode) {
      return NextResponse.json(
        { message: '친구 코드를 입력해주세요' },
        { status: 400 }
      )
    }

    // 자신의 코드인지 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!currentUser) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 친구 코드 생성 로직 (실제로는 사용자 생성시 생성되어야 함)
    const generateFriendCode = (userId: string) => {
      // userId의 해시를 기반으로 6자리 코드 생성
      const hash = userId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      return Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6)
    }

    const currentUserFriendCode = generateFriendCode(user.id)
    
    if (friendCode === currentUserFriendCode) {
      return NextResponse.json(
        { message: '자신의 친구 코드는 추가할 수 없습니다' },
        { status: 400 }
      )
    }

    // 친구 코드로 사용자 찾기
    const targetUser = await prisma.user.findFirst({
      where: {
        // 실제로는 friendCode 필드가 있어야 하지만, 임시로 닉네임 검색
        OR: [
          { nickname: { contains: friendCode } },
          { id: { contains: friendCode } }
        ]
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