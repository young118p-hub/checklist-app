import { createHash, randomBytes } from 'crypto'

// 안전한 친구 코드 생성기
export class FriendCodeGenerator {
  private static readonly CODE_LENGTH = 8
  private static readonly CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동하기 쉬운 문자 제외
  private static readonly SALT_LENGTH = 16

  // 암호학적으로 안전한 친구 코드 생성
  static generateSecureFriendCode(userId: string): string {
    try {
      // 1. 랜덤 솔트 생성
      const salt = randomBytes(this.SALT_LENGTH).toString('hex')
      
      // 2. 현재 시간과 userId, 솔트를 조합하여 해시 생성
      const timestamp = Date.now().toString()
      const input = `${userId}-${timestamp}-${salt}`
      const hash = createHash('sha256').update(input).digest('hex')
      
      // 3. 해시를 안전한 문자셋으로 변환
      let friendCode = ''
      for (let i = 0; i < this.CODE_LENGTH; i++) {
        const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16)
        friendCode += this.CHARSET[byte % this.CHARSET.length]
      }
      
      return friendCode
    } catch (error) {
      console.error('Friend code generation error:', error)
      // 폴백: 완전 랜덤 코드
      return this.generateRandomCode()
    }
  }

  // 완전 랜덤 코드 생성 (폴백용)
  private static generateRandomCode(): string {
    let code = ''
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARSET.length)
      code += this.CHARSET[randomIndex]
    }
    return code
  }

  // 친구 코드 유효성 검증
  static isValidFriendCode(code: string): boolean {
    if (!code || code.length !== this.CODE_LENGTH) {
      return false
    }
    
    // 허용된 문자만 포함하는지 확인
    return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(code)
  }

  // 친구 코드 충돌 체크 및 재생성
  static async generateUniqueFriendCode(
    userId: string, 
    existsChecker: (code: string) => Promise<boolean>
  ): Promise<string> {
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const code = this.generateSecureFriendCode(userId)
      
      // 기존 코드와 중복 확인
      const exists = await existsChecker(code)
      if (!exists) {
        return code
      }
      
      attempts++
    }
    
    // 최대 시도 횟수 초과 시 타임스탬프 포함하여 강제 생성
    const timestamp = Date.now().toString().slice(-4)
    const baseCode = this.generateSecureFriendCode(userId).slice(0, 4)
    return baseCode + timestamp
  }
}

// Rate limiting을 위한 IP 기반 요청 추적
export class SecurityRateLimiter {
  private static requests = new Map<string, { count: number, resetTime: number }>()
  
  static checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 300000): boolean {
    const now = Date.now()
    const requestInfo = this.requests.get(identifier)
    
    // 윈도우 초기화 또는 첫 요청
    if (!requestInfo || now > requestInfo.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    // 제한 확인
    if (requestInfo.count >= maxRequests) {
      return false
    }
    
    // 카운트 증가
    requestInfo.count++
    return true
  }
  
  // 정리 함수 (메모리 누수 방지)
  static cleanup() {
    const now = Date.now()
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key)
      }
    }
  }
}

// 주기적 정리 (5분마다)
setInterval(() => {
  SecurityRateLimiter.cleanup()
}, 5 * 60 * 1000)