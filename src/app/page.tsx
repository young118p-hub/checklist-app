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
import { SITUATION_TEMPLATES, calculateQuantity } from '@/lib/templates'
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
  
  // 한국 특화
  csat_exam: GraduationCap,
  job_interview_korea: Briefcase,
  korean_festival: Heart,
  korean_hiking_mountain: MapPin,
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
        quantity: calculateQuantity(item, template.peopleMultiplier ? 1 : 1),
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 헤더 섹션 - Everytime Style */}
        <div className="bg-red-600 text-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'system-ui, -apple-system' }}>
              아맞다이거! 🤦‍♂️
            </h1>
            <p className="text-red-100 text-sm max-w-2xl mx-auto mb-4">
              깜빡할 뻔한 모든 것들을 한 번에! 로그인 없이 바로 사용하세요
            </p>
            <div className="flex justify-center gap-2">
              <span className="bg-white/20 rounded-md px-3 py-1 text-xs font-medium">
                ✨ 인원별 자동 계산
              </span>
              <span className="bg-white/20 rounded-md px-3 py-1 text-xs font-medium">
                🇰🇷 한국 상황 특화
              </span>
            </div>
          </div>
        </div>

        {/* 검색바 */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="어떤 준비를 하시나요? (예: 출근, 헬스장, 동남아 여행...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-2 text-sm border-gray-300 rounded-lg"
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-xs text-gray-500 text-center">
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
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200 rounded-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">{template.name}</h3>
                            <p className="text-xs text-gray-600 mt-1 leading-tight">{template.description}</p>
                          </div>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                          {template.items.length}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <Users className="w-3 h-3" />
                          <span>기본 1인 기준</span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2">
                          {template.items.slice(0, 3).map(item => item.title).join(', ')}
                          {template.items.length > 3 && ` 외 ${template.items.length - 3}개`}
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 font-medium"
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
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 bg-gray-50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2">직접 만들기</h3>
                      <p className="text-xs text-gray-600 mb-4">
                        나만의 체크리스트를 처음부터 만들어보세요
                      </p>
                      
                      <div className="space-y-1 mb-4 text-left">
                        <div className="text-xs text-gray-600">• 원하는 항목 자유롭게 추가</div>
                        <div className="text-xs text-gray-600">• 인원수별 수량 자동 계산</div>
                        <div className="text-xs text-gray-600">• 카테고리 및 설명 추가</div>
                      </div>

                      <Link href="/create">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-100 text-sm py-2">
                          <Plus className="w-4 h-4 mr-2" />
                          새로 만들기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* 추가 기능 안내 - Everytime Style */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="text-center mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="text-sm font-bold text-gray-900 mt-2">아맞다이거! 팁</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">💾</span>
              <div>
                <div className="font-medium text-sm text-gray-900">자동 저장</div>
                <p className="text-xs text-gray-600">
                  체크리스트는 브라우저에 자동으로 저장됩니다
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">🔄</span>
              <div>
                <div className="font-medium text-sm text-gray-900">계정 연동</div>
                <p className="text-xs text-gray-600">
                  나중에 계정을 만들면 모든 기기에서 동기화
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InstallButton />
    </div>
  )
}