'use client'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { CheckSquare, User, Plus, LogOut } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const { user, signOut } = useAuthStore()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">체크리스트</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/create">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    새 리스트
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}