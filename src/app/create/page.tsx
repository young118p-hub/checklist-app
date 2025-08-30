'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklistStore } from '@/stores/checklist-store'
import { Navbar } from '@/components/layout/navbar'
import { CreateChecklistForm } from '@/components/checklist/create-checklist-form'
import { TemplateSelector } from '@/components/checklist/template-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Sparkles } from 'lucide-react'

type CreationMode = 'choose' | 'template' | 'custom'

export default function CreatePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { createChecklist, loading } = useChecklistStore()
  const [mode, setMode] = useState<CreationMode>('choose')

  if (!user) {
    router.push('/login')
    return null
  }

  const handleCreateChecklist = async (data: any) => {
    await createChecklist(data)
    router.push('/')
  }

  const handleTemplateSelect = (templateData: any) => {
    setMode('custom')
    // 템플릿 데이터를 폼에 전달하는 로직이 필요합니다
    // 실제 구현에서는 상태 관리를 통해 템플릿 데이터를 전달해야 합니다
  }

  if (mode === 'template') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <TemplateSelector
            onSelectTemplate={handleTemplateSelect}
            onCancel={() => setMode('choose')}
          />
        </div>
      </div>
    )
  }

  if (mode === 'custom') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <CreateChecklistForm
            onSubmit={handleCreateChecklist}
            onCancel={() => setMode('choose')}
            isLoading={loading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              새 체크리스트 만들기
            </h1>
            <p className="text-gray-600">
              템플릿을 사용하거나 직접 만들어보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setMode('template')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>템플릿 사용</CardTitle>
                <CardDescription>
                  미리 준비된 상황별 템플릿으로 빠르게 시작하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 캠핑, 여행, 면접 등 다양한 상황</div>
                  <div>• 인원 수별 자동 계산</div>
                  <div>• 검증된 체크리스트</div>
                </div>
                <Button className="w-full mt-4" onClick={() => setMode('template')}>
                  템플릿 선택하기
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setMode('custom')}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>직접 만들기</CardTitle>
                <CardDescription>
                  나만의 체크리스트를 처음부터 만들어보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• 완전한 자유도</div>
                  <div>• 개인 맞춤 항목</div>
                  <div>• 나만의 카테고리</div>
                </div>
                <Button className="w-full mt-4" variant="outline" onClick={() => setMode('custom')}>
                  직접 만들기
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-gray-500 mb-4">
              언제든 나중에 체크리스트를 수정하고 개선할 수 있습니다
            </p>
            <Button variant="ghost" onClick={() => router.back()}>
              취소하고 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}