'use client'

interface NicknameConflictResolution {
  originalNickname: string
  resolvedNickname: string
  conflictResolved: boolean
  suggestions: string[]
}

class NicknameManager {
  private static instance: NicknameManager
  private collaborationNicknames: Map<string, Set<string>> = new Map()

  private constructor() {}

  static getInstance(): NicknameManager {
    if (!NicknameManager.instance) {
      NicknameManager.instance = new NicknameManager()
    }
    return NicknameManager.instance
  }

  // 협업방에 닉네임 추가 (충돌 시 자동 해결)
  addNicknameToCollaboration(
    checklistId: string, 
    userId: string, 
    desiredNickname: string
  ): NicknameConflictResolution {
    if (!this.collaborationNicknames.has(checklistId)) {
      this.collaborationNicknames.set(checklistId, new Set())
    }

    const roomNicknames = this.collaborationNicknames.get(checklistId)!
    const normalizedDesired = desiredNickname.trim()

    // 충돌이 없는 경우
    if (!roomNicknames.has(normalizedDesired)) {
      roomNicknames.add(normalizedDesired)
      console.log(`✅ Nickname "${normalizedDesired}" added to collaboration ${checklistId}`)
      
      return {
        originalNickname: desiredNickname,
        resolvedNickname: normalizedDesired,
        conflictResolved: false,
        suggestions: []
      }
    }

    // 충돌 해결
    const resolution = this.resolveNicknameConflict(checklistId, normalizedDesired)
    roomNicknames.add(resolution.resolvedNickname)
    
    console.log(`⚠️ Nickname conflict resolved: "${normalizedDesired}" -> "${resolution.resolvedNickname}"`)
    
    return {
      originalNickname: desiredNickname,
      resolvedNickname: resolution.resolvedNickname,
      conflictResolved: true,
      suggestions: resolution.suggestions
    }
  }

  // 닉네임 충돌 해결 로직
  private resolveNicknameConflict(checklistId: string, nickname: string): {
    resolvedNickname: string
    suggestions: string[]
  } {
    const roomNicknames = this.collaborationNicknames.get(checklistId)!
    const suggestions: string[] = []

    // 1. 숫자 접미사 방식 (김철수 -> 김철수2, 김철수3, ...)
    for (let i = 2; i <= 99; i++) {
      const candidate = `${nickname}${i}`
      suggestions.push(candidate)
      
      if (!roomNicknames.has(candidate)) {
        return {
          resolvedNickname: candidate,
          suggestions: suggestions.slice(0, 3) // 상위 3개만 반환
        }
      }
    }

    // 2. 이모지 접미사 방식
    const emojis = ['🎯', '⭐', '🚀', '🎨', '🎪', '🎭', '🎸', '🎲', '🎳', '🎺']
    for (const emoji of emojis) {
      const candidate = `${nickname}${emoji}`
      suggestions.push(candidate)
      
      if (!roomNicknames.has(candidate)) {
        return {
          resolvedNickname: candidate,
          suggestions: suggestions.slice(-5) // 최근 5개만 반환
        }
      }
    }

    // 3. 최후의 수단: 타임스탬프 접미사
    const timestamp = Date.now().toString().slice(-4)
    const finalCandidate = `${nickname}_${timestamp}`
    
    return {
      resolvedNickname: finalCandidate,
      suggestions: suggestions.slice(-3)
    }
  }

  // 협업방에서 닉네임 제거
  removeNicknameFromCollaboration(checklistId: string, nickname: string): void {
    const roomNicknames = this.collaborationNicknames.get(checklistId)
    if (roomNicknames) {
      roomNicknames.delete(nickname)
      console.log(`👋 Nickname "${nickname}" removed from collaboration ${checklistId}`)
      
      // 빈 방 정리
      if (roomNicknames.size === 0) {
        this.collaborationNicknames.delete(checklistId)
        console.log(`🧹 Empty collaboration room ${checklistId} cleaned up`)
      }
    }
  }

  // 협업방의 모든 닉네임 조회
  getCollaborationNicknames(checklistId: string): string[] {
    const roomNicknames = this.collaborationNicknames.get(checklistId)
    return roomNicknames ? Array.from(roomNicknames) : []
  }

  // 닉네임이 이미 사용 중인지 확인
  isNicknameTaken(checklistId: string, nickname: string): boolean {
    const roomNicknames = this.collaborationNicknames.get(checklistId)
    return roomNicknames ? roomNicknames.has(nickname.trim()) : false
  }

  // 닉네임 변경 (기존 닉네임 제거 후 새 닉네임 추가)
  changeNickname(
    checklistId: string, 
    userId: string, 
    oldNickname: string, 
    newNickname: string
  ): NicknameConflictResolution {
    // 기존 닉네임 제거
    this.removeNicknameFromCollaboration(checklistId, oldNickname)
    
    // 새 닉네임 추가 (충돌 해결 포함)
    return this.addNicknameToCollaboration(checklistId, userId, newNickname)
  }

  // 협업방 전체 정리 (협업 종료 시)
  clearCollaboration(checklistId: string): void {
    if (this.collaborationNicknames.has(checklistId)) {
      this.collaborationNicknames.delete(checklistId)
      console.log(`🗑️ Collaboration ${checklistId} completely cleared`)
    }
  }

  // 닉네임 유효성 검사
  validateNickname(nickname: string): {
    isValid: boolean
    error?: string
    sanitized?: string
  } {
    const trimmed = nickname.trim()
    
    if (!trimmed) {
      return {
        isValid: false,
        error: '닉네임을 입력해주세요'
      }
    }
    
    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: '닉네임은 2글자 이상이어야 합니다'
      }
    }
    
    if (trimmed.length > 20) {
      return {
        isValid: false,
        error: '닉네임은 20글자 이하여야 합니다'
      }
    }
    
    // 금지어 필터 (기본적인 욕설 및 부적절한 단어)
    const bannedWords = ['admin', 'system', 'bot', 'null', 'undefined']
    const lowerTrimmed = trimmed.toLowerCase()
    
    for (const banned of bannedWords) {
      if (lowerTrimmed.includes(banned)) {
        return {
          isValid: false,
          error: '사용할 수 없는 닉네임입니다'
        }
      }
    }
    
    return {
      isValid: true,
      sanitized: trimmed
    }
  }

  // 디버그용: 현재 상태 출력
  debugPrint(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 NicknameManager Current State:')
      for (const [checklistId, nicknames] of this.collaborationNicknames) {
        console.log(`  ${checklistId}: [${Array.from(nicknames).join(', ')}]`)
      }
    }
  }
}

// 전역 인스턴스 내보내기
export const nicknameManager = NicknameManager.getInstance()

// 타입 내보내기
export type { NicknameConflictResolution }