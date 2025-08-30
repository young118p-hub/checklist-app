'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklistStore } from '@/stores/checklist-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Tent, 
  Plane, 
  Home, 
  Briefcase, 
  Baby,
  GraduationCap,
  Plus,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { SITUATION_TEMPLATES } from '@/lib/templates'

const templateIcons = {
  camping: Tent,
  travel: Plane,
  moving: Home,
  interview: Briefcase,
  baby: Baby,
  study: GraduationCap,
}

export default function Home() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { createChecklist, loading } = useChecklistStore()

  const handleUseTemplate = async (templateId: string) => {
    if (!user) {
      router.push('/login')
      return
    }

    const template = SITUATION_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    // 기본 인원수 1명으로 템플릿 생성
    const checklistData = {
      title: template.name,
      description: template.description,
      isTemplate: false,
      isPublic: false,
      peopleCount: 1,
      categoryId: undefined,
      items: template.items.map((item, index) => ({
        title: item.title,
        description: item.description || '',
        quantity: item.baseQuantity || 1,
        unit: item.unit || '',
        isCompleted: false,
        order: index
      }))
    }

    try {
      await createChecklist(checklistData)
      router.push('/') // 생성 후 목록으로 이동
    } catch (error) {
      console.error('체크리스트 생성 실패:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            상황별 체크리스트
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            원하는 템플릿을 선택해서 바로 사용하거나, 나만의 체크리스트를 만들어보세요
          </p>
        </div>

        {/* 템플릿 카드 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {SITUATION_TEMPLATES.map((template) => {
            const IconComponent = templateIcons[template.id as keyof typeof templateIcons] || Tent
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                    <Badge variant="secondary" className="text-xs">
                      {template.items.length}개 항목
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>기본 1인 기준</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      주요 항목: {template.items.slice(0, 3).map(item => item.title).join(', ')}
                      {template.items.length > 3 && '...'}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? '생성 중...' : '바로 사용하기'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}

          {/* 직접 만들기 카드 */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Plus className="w-8 h-8 text-gray-400" />
                <Badge variant="outline" className="text-xs">
                  커스텀
                </Badge>
              </div>
              <CardTitle className="text-lg text-gray-700">직접 만들기</CardTitle>
              <CardDescription className="text-sm">
                나만의 체크리스트를 처음부터 만들어보세요
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  • 원하는 항목 자유롭게 추가
                </div>
                <div className="text-sm text-gray-600">
                  • 인원수별 수량 자동 계산
                </div>
                <div className="text-sm text-gray-600">
                  • 카테고리 및 설명 추가
                </div>
              </div>
              <Link href="/create">
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  새로 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 로그인하지 않은 사용자를 위한 안내 */}
        {!user && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">체크리스트를 저장하고 관리하려면</h3>
            <p className="text-gray-600 mb-4">로그인하여 더 많은 기능을 이용해보세요</p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button>로그인</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">회원가입</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}