'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signInWithProvider } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await signIn(email, password)
    
    if (result.error) {
      setError(result.error)
    }
    
    setIsLoading(false)
  }

  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
    setIsLoading(true)
    setError('')
    
    const result = await signInWithProvider(provider)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>
          체크리스트 앱에 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 소셜 로그인 - 추후 커뮤니티 기능 추가 시 활성화 
        <div className="space-y-3 mb-6">
          <Button type="button" variant="outline" className="w-full bg-yellow-400 text-black hover:bg-yellow-500 border-yellow-400" onClick={() => handleSocialLogin('kakao')} disabled={isLoading}>
            카카오 로그인
          </Button>
          <Button type="button" variant="outline" className="w-full bg-green-500 text-white hover:bg-green-600 border-green-500" onClick={() => handleSocialLogin('naver')} disabled={isLoading}>
            네이버 로그인  
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
            Google 로그인
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">또는 이메일로 로그인</span>
          </div>
        </div>
        */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}