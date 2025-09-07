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

export default function MyChecklists() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const { checklists, loading, fetchChecklists, deleteChecklist } = useChecklistStore()
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

  const handleDeleteChecklist = async (id: string) => {
    await deleteChecklist(id)
    // 목록 다시 불러오기
    fetchChecklists()
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">내 체크리스트</h1>
            <p className="text-gray-600 mt-1">나만의 체크리스트를 관리해보세요</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              홈으로 돌아가기
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
            <Link href="/">
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
                onDelete={handleDeleteChecklist}
                showDelete={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}