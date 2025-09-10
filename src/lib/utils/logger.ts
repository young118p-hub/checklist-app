// 보안이 강화된 로깅 시스템

export enum LogLevel {
  ERROR = 0,
  WARN = 1, 
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  ip?: string
  userAgent?: string
}

class SecureLogger {
  private isProduction = process.env.NODE_ENV === 'production'
  private logLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG
  
  // 민감한 정보 필터링
  private sanitizeContext(context?: Record<string, any>): Record<string, any> {
    if (!context) return {}
    
    const sanitized = { ...context }
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'auth', 'credential', 'private'
    ]
    
    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase()
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      } else if (typeof value === 'string' && value.length > 100) {
        // 긴 문자열은 잘라서 로깅 (PII 방지)
        sanitized[key] = value.substring(0, 100) + '...[TRUNCATED]'
      }
    }
    
    return sanitized
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      userId: userId ? userId.substring(0, 8) + '...' : undefined, // 부분적으로만 로깅
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private writeLog(logEntry: LogEntry) {
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    const levelName = levelNames[logEntry.level]
    
    if (this.isProduction) {
      // 프로덕션: 구조화된 JSON 로깅
      console.log(JSON.stringify({
        ...logEntry,
        level: levelName,
        environment: 'production'
      }))
    } else {
      // 개발환경: 가독성 좋은 로깅
      console.log(
        `[${logEntry.timestamp}] ${levelName}: ${logEntry.message}`,
        logEntry.context ? logEntry.context : ''
      )
    }
  }

  error(message: string, context?: Record<string, any>, userId?: string) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    this.writeLog(this.formatLog(LogLevel.ERROR, message, context, userId))
  }

  warn(message: string, context?: Record<string, any>, userId?: string) {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    this.writeLog(this.formatLog(LogLevel.WARN, message, context, userId))
  }

  info(message: string, context?: Record<string, any>, userId?: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    this.writeLog(this.formatLog(LogLevel.INFO, message, context, userId))
  }

  debug(message: string, context?: Record<string, any>, userId?: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    this.writeLog(this.formatLog(LogLevel.DEBUG, message, context, userId))
  }

  // 보안 이벤트 전용 로깅
  security(event: string, context: Record<string, any>, userId?: string, ip?: string) {
    const securityLog = {
      ...this.formatLog(LogLevel.ERROR, `SECURITY: ${event}`, context, userId),
      ip: ip ? ip.replace(/\.\d+$/, '.xxx') : undefined, // IP 마스킹
      userAgent: context.userAgent ? '[LOGGED_SEPARATELY]' : undefined
    }
    
    // 보안 이벤트는 항상 로깅
    console.log(JSON.stringify({
      ...securityLog,
      level: 'SECURITY',
      environment: process.env.NODE_ENV
    }))
  }

  // API 요청/응답 로깅
  apiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    if (this.isProduction && statusCode < 400) {
      // 프로덕션에서는 에러만 로깅
      return
    }

    this.info(`API ${method} ${path} - ${statusCode} (${duration}ms)`, {
      method,
      path: path.replace(/\/[a-f0-9-]{20,}/g, '/[ID]'), // ID 파라미터 마스킹
      statusCode,
      duration
    }, userId)
  }
}

// 싱글톤 인스턴스
export const logger = new SecureLogger()

// 기존 console.log 래핑 (점진적 마이그레이션용)
export const devLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, ...args)
  }
}

export const prodWarn = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context)
}

export const prodError = (message: string, context?: Record<string, any>) => {
  logger.error(message, context)
}