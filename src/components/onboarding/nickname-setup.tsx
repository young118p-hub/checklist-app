'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface NicknameSetupProps {
  onComplete: (nickname: string) => void
  isLoading?: boolean
}

export function NicknameSetup({ onComplete, isLoading = false }: NicknameSetupProps) {
  const [nickname, setNickname] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const checkNicknameAvailability = async (value: string) => {
    if (value.length < 2) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError('')

    try {
      // API 호출로 닉네임 사용 가능 여부 확인
      const response = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(value)}`)
      const data = await response.json()
      
      if (data.available) {
        setIsAvailable(true)
      } else {
        setIsAvailable(false)
        setError(`"${value}"는 이미 사용 중입니다. 다른 닉네임을 시도해보세요.`)
      }
    } catch (err) {
      setError('닉네임 확인 중 오류가 발생했습니다.')
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleNicknameChange = (value: string) => {
    // 닉네임 규칙: 2-20자, 한글/영문/숫자만
    const filtered = value.replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 20)
    setNickname(filtered)
    
    if (filtered.length >= 2) {
      // 500ms 딜레이 후 중복 확인
      const timeoutId = setTimeout(() => {
        checkNicknameAvailability(filtered)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setIsAvailable(null)
      setError('')
    }
  }

  const handleSubmit = () => {
    if (!nickname || nickname.length < 2) {
      setError('닉네임은 2글자 이상 입력해주세요.')
      return
    }
    
    if (!isAvailable) {
      setError('사용 가능한 닉네임을 입력해주세요.')
      return
    }

    onComplete(nickname)
  }

  const getSuggestions = () => {
    if (!nickname || isAvailable !== false) return []
    
    return [
      `${nickname}123`,
      `${nickname}_2024`,
      `멋진${nickname}`,
      `${nickname}님`,
      `${nickname}짱`
    ]
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <CardTitle>환영합니다!</CardTitle>
          <CardDescription>
            체크리스트 앱에서 사용할 닉네임을 설정해주세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">닉네임</label>
            <div className="relative">
              <Input
                placeholder="예: 철수, 영희, 김철수"
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                className={`pr-10 ${
                  isAvailable === true ? 'border-green-500 focus:ring-green-500' :
                  isAvailable === false ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              
              {isChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
              
              {!isChecking && isAvailable === true && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              
              {!isChecking && isAvailable === false && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              • 2-20자 • 한글, 영문, 숫자만 사용 가능
            </div>
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isAvailable === true && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                "{nickname}"을(를) 사용할 수 있습니다! 🎉
              </AlertDescription>
            </Alert>
          )}

          {/* 닉네임 추천 */}
          {getSuggestions().length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">추천 닉네임:</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestions().slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleNicknameChange(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!nickname || nickname.length < 2 || isAvailable !== true || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? '설정 중...' : '시작하기'}
          </Button>

          <div className="text-center text-xs text-gray-500">
            <p>나중에 휴대폰 인증시 더 많은 기능을 이용할 수 있어요</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}