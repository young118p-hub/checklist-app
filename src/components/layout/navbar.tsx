'use client'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { CheckSquare, User, Plus, LogOut } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const { user, signOut } = useAuthStore()

  return (
    <nav className="bg-red-500 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <CheckSquare className="w-7 h-7 text-white" />
            <span className="text-xl font-bold text-white">아맞다이거!</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/my">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-red-600 hover:text-white">
                    내 리스트
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-red-500">
                    <Plus className="w-4 h-4 mr-1" />
                    새 리스트
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-red-600" onClick={signOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-red-500">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-white text-red-500 hover:bg-red-50 shadow-sm">
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