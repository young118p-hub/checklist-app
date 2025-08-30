'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklistStore } from '@/stores/checklist-store'
import { Navbar } from '@/components/layout/navbar'
import { ChecklistCard } from '@/components/checklist/checklist-card'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const { checklists, loading, fetchChecklists } = useChecklistStore()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchChecklists()
  }, [fetchChecklists])

  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewChecklist = (id: string) => {
    router.push(`/checklist/${id}`)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900">
              상황별 체크리스트 관리
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              캠핑, 여행, 면접 등 다양한 상황에 맞는 체크리스트를 만들고 공유하세요.
              인원 수에 따른 자동 계산으로 더욱 편리하게!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">시작하기</Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="lg">템플릿 둘러보기</Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">쉬운 리스트 생성</h3>
              <p className="text-gray-600">상황에 맞는 템플릿으로 빠르게 체크리스트를 만들어보세요</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">인원별 자동 계산</h3>
              <p className="text-gray-600">인원 수를 입력하면 개인 준비물이 자동으로 계산됩니다</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">공유 및 커뮤니티</h3>
              <p className="text-gray-600">다른 사람들과 리스트를 공유하고 리뷰를 남겨보세요</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 체크리스트</h1>
            <p className="text-gray-600 mt-1">나만의 체크리스트를 만들고 관리해보세요</p>
          </div>
          <Link href="/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 리스트 만들기
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="체크리스트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">체크리스트를 불러오는 중...</p>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 결과가 없습니다.' : '아직 체크리스트가 없습니다.'}
            </p>
            <Link href="/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 체크리스트 만들기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onView={handleViewChecklist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
