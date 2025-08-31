'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklistStore } from '@/stores/checklist-store'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Tent, 
  Plane, 
  Home as HomeIcon, 
  Briefcase, 
  Baby,
  GraduationCap,
  Plus,
  Users,
  Coffee,
  Dumbbell,
  Moon,
  MapPin,
  Heart,
  Package,
  Search
} from 'lucide-react'
import Link from 'next/link'
import { SITUATION_TEMPLATES } from '@/lib/templates'
import { InstallButton } from '@/components/pwa/install-button'

const templateIcons = {
  // 일상 루틴
  morning_work: Coffee,
  gym_prep: Dumbbell,
  before_sleep: Moon,
  
  // 기존
  camping: Tent,
  travel: Plane,
  interview: Briefcase,
  baby: Baby,
  study: GraduationCap,
  running: Users,
  pension: HomeIcon,
  hiking: MapPin,
  
  // 해외여행
  southeast_asia: Plane,
  europe: Plane,
  japan_travel: Plane,
  
  // 라이프 이벤트
  moving_prep: Package,
  wedding_prep: Heart,
}

export default function Home() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { createChecklist, loading } = useChecklistStore()
  const [searchTerm, setSearchTerm] = useState('')

  const handleUseTemplate = async (templateId: string) => {
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
      router.push('/my') // 생성 후 내 리스트 페이지로 이동
    } catch (error) {
      console.error('체크리스트 생성 실패:', error)
    }
  }

  const filteredTemplates = SITUATION_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.items.some(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            아맞다이거! 🤦‍♂️
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            깜빡할 뻔한 모든 것들을 한 번에! 로그인 없이 바로 사용하세요
          </p>
        </div>

        {/* 검색바 */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              placeholder="어떤 준비를 하시나요? (예: 출근, 헬스장, 동남아 여행...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500 text-center">
              "{searchTerm}" 검색 결과: {filteredTemplates.length}개 템플릿
            </p>
          )}
        </div>

        {/* 템플릿 카드 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredTemplates.length === 0 && searchTerm ? (
            <div className="col-span-full text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                "{searchTerm}" 검색 결과가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                다른 키워드로 검색해보시거나 직접 만들어보세요
              </p>
              <Link href="/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새로 만들기
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {filteredTemplates.map((template) => {
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

              {/* 직접 만들기 카드 - 검색어가 없을 때만 표시 */}
              {!searchTerm && (
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
              )}
            </>
          )}
        </div>

        {/* 추가 기능 안내 */}
        <div className="text-center py-8 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">💡 아맞다이거! 팁</h3>
          <p className="text-gray-600 mb-4">
            체크리스트는 자동으로 저장됩니다. 
            <span className="block text-sm text-gray-500 mt-1">
              나중에 계정을 만들면 모든 기기에서 동기화할 수 있어요!
            </span>
          </p>
        </div>
      </div>
      <InstallButton />
    </div>
  )
}