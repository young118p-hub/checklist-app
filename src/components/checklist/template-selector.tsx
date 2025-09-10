'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SITUATION_TEMPLATES, generateChecklistFromTemplate } from '@/lib/templates'
import { SmartRecommendationEngine, getSmartRecommendations, UserContext } from '@/lib/recommendations'
import { SituationTemplate } from '@/types'

interface TemplateSelectorProps {
  onSelectTemplate: (templateData: unknown) => void
  onCancel: () => void
}

export function TemplateSelector({ onSelectTemplate, onCancel }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SituationTemplate | null>(null)
  const [peopleCount, setPeopleCount] = useState('1')
  const [smartRecommendations, setSmartRecommendations] = useState<{
    templates: SituationTemplate[]
    additionalItems: any[]
    reasoning: string
  }>({ templates: [], additionalItems: [], reasoning: '' })

  // 스마트 추천 시스템 초기화
  useEffect(() => {
    const loadSmartRecommendations = async () => {
      try {
        // 현재 컨텍스트 생성
        const now = new Date()
        const hour = now.getHours()
        const dayOfWeek = now.getDay()
        
        const context: UserContext = {
          time: {
            timeOfDay: hour < 6 ? 'dawn' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night',
            dayOfWeek: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday'
          },
          weather: {
            condition: 'sunny', // 실제로는 날씨 API 연동
            season: getCurrentSeason()
          }
        }
        
        const recommendations = await getSmartRecommendations(context)
        setSmartRecommendations(recommendations)
      } catch (error) {
        console.error('추천 로딩 실패:', error)
      }
    }
    
    loadSmartRecommendations()
  }, [])

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1
    if (month >= 3 && month <= 5) return 'spring'
    if (month >= 6 && month <= 8) return 'summer'
    if (month >= 9 && month <= 11) return 'fall'
    return 'winter'
  }

  const handleUseTemplate = () => {
    if (!selectedTemplate) return

    const templateData = generateChecklistFromTemplate(
      selectedTemplate.id,
      parseInt(peopleCount) || 1
    )

    if (templateData) {
      // 날씨 기반 추가 항목이 있으면 포함
      const additionalItems = smartRecommendations.additionalItems
        .filter(item => shouldIncludeItem(selectedTemplate, item))
        .map(item => ({
          title: item.title,
          description: item.description,
          baseQuantity: 1,
          unit: '개',
          isCompleted: false
        }))

      onSelectTemplate({
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        peopleCount: selectedTemplate.peopleMultiplier ? parseInt(peopleCount) || 1 : undefined,
        isPublic: false,
        items: [...templateData.items, ...additionalItems]
      })
    }
  }

  // 템플릿에 추가 항목을 포함할지 판단
  const shouldIncludeItem = (template: SituationTemplate, item: any) => {
    const outdoorTemplates = ['camping', 'hiking', 'southeast_asia', 'europe', 'japan_travel']
    const workTemplates = ['morning_work', 'interview', 'business_trip']
    
    if (outdoorTemplates.includes(template.id)) {
      return ['선크림', '우산', '방수'].some(keyword => item.title.includes(keyword))
    }
    
    if (workTemplates.includes(template.id)) {
      return ['우산', '핸드크림', '마스크'].some(keyword => item.title.includes(keyword))
    }
    
    return false
  }

  const categories = Array.from(new Set(SITUATION_TEMPLATES.map(t => t.category)))

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">템플릿 선택</h2>
        <p className="text-gray-600">상황에 맞는 템플릿을 선택해보세요</p>
      </div>

      {/* 스마트 추천 섹션 */}
      {smartRecommendations.templates.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="text-lg font-semibold text-blue-800">AI 추천</h3>
            <Badge className="bg-blue-100 text-blue-800">NEW</Badge>
          </div>
          <p className="text-sm text-blue-700 mb-4">{smartRecommendations.reasoning}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {smartRecommendations.templates.map(template => (
              <Card 
                key={`smart-${template.id}`}
                className="cursor-pointer transition-all hover:shadow-lg border-blue-200 bg-white hover:bg-blue-50"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-1">
                      <span className="text-lg">🔥</span>
                      {template.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">{template.items.length}개</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          {smartRecommendations.additionalItems.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">오늘 날씨/상황 기반 추가 추천:</h4>
              <div className="flex flex-wrap gap-2">
                {smartRecommendations.additionalItems.slice(0, 3).map((item, idx) => (
                  <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-xs">
                    {item.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SITUATION_TEMPLATES
              .filter(template => template.category === category)
              .map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="secondary">{template.items.length}개</Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-500">
                      포함 항목: {template.items.slice(0, 3).map(item => item.title).join(', ')}
                      {template.items.length > 3 && ` 외 ${template.items.length - 3}개`}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {selectedTemplate && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">{selectedTemplate.name} 템플릿</CardTitle>
            <CardDescription>{selectedTemplate.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTemplate.peopleMultiplier && (
              <div className="space-y-2">
                <Label htmlFor="peopleCount">인원 수</Label>
                <Input
                  id="peopleCount"
                  type="number"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  min="1"
                  max="20"
                  className="w-32"
                />
                <p className="text-sm text-gray-600">
                  인원 수에 따라 개인 준비물 수량이 자동으로 조정됩니다
                </p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium">포함된 항목들:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {selectedTemplate.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.title}</span>
                    <span className="text-gray-500">
                      {item.baseQuantity}{item.unit}
                      {selectedTemplate.peopleMultiplier && item.multiplier && ' (인당)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleUseTemplate}>
                이 템플릿 사용하기
              </Button>
              <Button variant="outline" onClick={onCancel}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}