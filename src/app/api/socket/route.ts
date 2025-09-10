import { NextRequest, NextResponse } from 'next/server'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { initSocketServer } from '@/lib/socket/server'

// Socket.io 서버 인스턴스 저장
let io: Server | null = null

export async function GET(request: NextRequest) {
  // Socket.io 서버가 이미 초기화되었는지 확인
  if (!io) {
    console.log('🚀 Initializing Socket.io server...')
    
    // HTTP 서버 생성
    const httpServer = createServer()
    
    // Socket.io 서버 초기화
    io = initSocketServer(httpServer)
    
    console.log('✅ Socket.io server initialized')
  }

  return NextResponse.json({ 
    success: true,
    message: 'Socket.io server is running',
    connected: io.engine.clientsCount 
  })
}

// Socket.io 서버 인스턴스를 외부에서 접근할 수 있도록 export
export { io }