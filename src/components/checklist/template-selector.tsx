'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SITUATION_TEMPLATES, generateChecklistFromTemplate } from '@/lib/templates'
import { SituationTemplate } from '@/types'

interface TemplateSelectorProps {
  onSelectTemplate: (templateData: unknown) => void
  onCancel: () => void
}

export function TemplateSelector({ onSelectTemplate, onCancel }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<SituationTemplate | null>(null)
  const [peopleCount, setPeopleCount] = useState('1')

  const handleUseTemplate = () => {
    if (!selectedTemplate) return

    const templateData = generateChecklistFromTemplate(
      selectedTemplate.id,
      parseInt(peopleCount) || 1
    )

    if (templateData) {
      onSelectTemplate({
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        peopleCount: selectedTemplate.peopleMultiplier ? parseInt(peopleCount) || 1 : undefined,
        isPublic: false,
        items: templateData.items
      })
    }
  }

  const categories = Array.from(new Set(SITUATION_TEMPLATES.map(t => t.category)))

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">템플릿 선택</h2>
        <p className="text-gray-600">상황에 맞는 템플릿을 선택해보세요</p>
      </div>

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