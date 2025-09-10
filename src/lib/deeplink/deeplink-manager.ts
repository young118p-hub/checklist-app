'use client'

interface PendingInvitation {
  shareCode: string
  checklistTitle: string
  inviterNickname: string
  inviteUrl: string
  timestamp: Date
  expiresAt?: Date
}

class DeepLinkManager {
  private static instance: DeepLinkManager
  private pendingInvitation: PendingInvitation | null = null
  private listeners: ((invitation: PendingInvitation | null) => void)[] = []

  private constructor() {
    this.loadPendingInvitation()
  }

  static getInstance(): DeepLinkManager {
    if (!DeepLinkManager.instance) {
      DeepLinkManager.instance = new DeepLinkManager()
    }
    return DeepLinkManager.instance
  }

  // 딥링크에서 초대 정보 추출 및 저장
  handleDeepLink(url: string): boolean {
    try {
      console.log('🔗 Processing deep link:', url)

      // URL 파싱
      const urlPattern = /(?:https?:\/\/[^\/]+)?\/join\/([A-Z0-9]+)/i
      const match = url.match(urlPattern)
      
      if (!match) {
        console.log('❌ Invalid deep link format')
        return false
      }

      const shareCode = match[1].toUpperCase()
      
      // 초대 정보 생성 (실제로는 서버에서 가져와야 함)
      const invitation: PendingInvitation = {
        shareCode,
        checklistTitle: '체크리스트 협업', // 임시값, 서버에서 실제 제목 가져올 것
        inviterNickname: '친구', // 임시값
        inviteUrl: url,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
      }

      this.storePendingInvitation(invitation)
      console.log('✅ Pending invitation stored:', shareCode)
      return true
      
    } catch (error) {
      console.error('❌ Deep link processing error:', error)
      return false
    }
  }

  // 앱 설치 후 referrer 데이터 처리
  handleInstallReferrer(referrerData: string): void {
    try {
      // URL에서 초대 코드 추출
      const params = new URLSearchParams(referrerData)
      const shareCode = params.get('shareCode') || params.get('join')
      const inviter = params.get('inviter')
      const title = params.get('title')

      if (shareCode) {
        const invitation: PendingInvitation = {
          shareCode: shareCode.toUpperCase(),
          checklistTitle: decodeURIComponent(title || '체크리스트 협업'),
          inviterNickname: decodeURIComponent(inviter || '친구'),
          inviteUrl: `https://checklistapp.com/join/${shareCode}`,
          timestamp: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }

        this.storePendingInvitation(invitation)
        console.log('✅ Install referrer processed:', shareCode)
      }
    } catch (error) {
      console.error('❌ Install referrer processing error:', error)
    }
  }

  // 대기 중인 초대 저장
  private storePendingInvitation(invitation: PendingInvitation): void {
    this.pendingInvitation = invitation
    
    // 로컬 스토리지에 저장 (앱 재시작 시에도 유지)
    try {
      localStorage.setItem('pendingInvitation', JSON.stringify(invitation))
    } catch (error) {
      console.warn('Failed to store pending invitation in localStorage:', error)
    }
    
    // 리스너들에게 알림
    this.notifyListeners()
  }

  // 로컬 스토리지에서 대기 중인 초대 로드
  private loadPendingInvitation(): void {
    try {
      const stored = localStorage.getItem('pendingInvitation')
      if (stored) {
        const invitation = JSON.parse(stored) as PendingInvitation
        
        // 만료 체크
        if (invitation.expiresAt && new Date() > new Date(invitation.expiresAt)) {
          console.log('⏰ Pending invitation expired, removing')
          this.clearPendingInvitation()
          return
        }
        
        this.pendingInvitation = invitation
        console.log('📂 Loaded pending invitation:', invitation.shareCode)
      }
    } catch (error) {
      console.warn('Failed to load pending invitation from localStorage:', error)
      this.clearPendingInvitation()
    }
  }

  // 대기 중인 초대 조회
  getPendingInvitation(): PendingInvitation | null {
    return this.pendingInvitation
  }

  // 대기 중인 초대가 있는지 확인
  hasPendingInvitation(): boolean {
    return this.pendingInvitation !== null
  }

  // 서버에서 초대 정보 상세 조회 및 업데이트
  async enrichPendingInvitation(): Promise<PendingInvitation | null> {
    if (!this.pendingInvitation) return null

    try {
      const response = await fetch(`/api/collaborations/info/${this.pendingInvitation.shareCode}`)
      if (response.ok) {
        const data = await response.json()
        
        // 상세 정보로 업데이트
        const enrichedInvitation: PendingInvitation = {
          ...this.pendingInvitation,
          checklistTitle: data.title || this.pendingInvitation.checklistTitle,
          inviterNickname: data.ownerNickname || this.pendingInvitation.inviterNickname,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : this.pendingInvitation.expiresAt
        }

        this.storePendingInvitation(enrichedInvitation)
        return enrichedInvitation
      }
    } catch (error) {
      console.warn('Failed to enrich pending invitation:', error)
    }
    
    return this.pendingInvitation
  }

  // 초대 수락 (대기 중인 초대 제거)
  acceptPendingInvitation(): PendingInvitation | null {
    const invitation = this.pendingInvitation
    if (invitation) {
      this.clearPendingInvitation()
      console.log('✅ Pending invitation accepted and cleared')
    }
    return invitation
  }

  // 초대 거절 (대기 중인 초대 제거)
  declinePendingInvitation(): void {
    if (this.pendingInvitation) {
      console.log('❌ Pending invitation declined')
      this.clearPendingInvitation()
    }
  }

  // 대기 중인 초대 제거
  clearPendingInvitation(): void {
    this.pendingInvitation = null
    
    try {
      localStorage.removeItem('pendingInvitation')
    } catch (error) {
      console.warn('Failed to clear pending invitation from localStorage:', error)
    }
    
    this.notifyListeners()
  }

  // 초대 상태 변경 리스너 등록
  onInvitationChange(listener: (invitation: PendingInvitation | null) => void): () => void {
    this.listeners.push(listener)
    
    // 즉시 현재 상태 알림
    listener(this.pendingInvitation)
    
    // 리스너 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 리스너들에게 알림
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.pendingInvitation)
      } catch (error) {
        console.error('Error in invitation change listener:', error)
      }
    })
  }

  // 개발자 도구용: 테스트 초대 생성
  createTestInvitation(shareCode: string = 'TEST123'): void {
    if (process.env.NODE_ENV === 'development') {
      const testInvitation: PendingInvitation = {
        shareCode: shareCode.toUpperCase(),
        checklistTitle: '테스트 캠핑 준비물',
        inviterNickname: '테스트친구',
        inviteUrl: `https://checklistapp.com/join/${shareCode}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
      }
      
      this.storePendingInvitation(testInvitation)
      console.log('🧪 Test invitation created:', shareCode)
    }
  }
}

// 전역 인스턴스 내보내기
export const deepLinkManager = DeepLinkManager.getInstance()

// 타입 내보내기
export type { PendingInvitation }