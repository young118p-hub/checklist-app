'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, X } from 'lucide-react'
import { CreateChecklistData, CreateChecklistItemData } from '@/types'

interface CreateChecklistFormProps {
  onSubmit: (data: CreateChecklistData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CreateChecklistForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CreateChecklistFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [peopleCount, setPeopleCount] = useState('')
  const [items, setItems] = useState<CreateChecklistItemData[]>([
    { title: '', description: '', quantity: undefined, unit: '', order: 0 }
  ])

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { title: '', description: '', quantity: undefined, unit: '', order: prev.length }
    ])
  }

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof CreateChecklistItemData, value: string | number | undefined) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validItems = items.filter(item => item.title.trim())
    if (validItems.length === 0) {
      alert('최소 하나의 항목을 추가해주세요.')
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
      peopleCount: peopleCount ? parseInt(peopleCount) : undefined,
      items: validItems.map((item, index) => ({
        ...item,
        quantity: item.quantity || undefined,
        order: index,
      }))
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>새 체크리스트 만들기</CardTitle>
        <CardDescription>
          새로운 체크리스트를 만들어 할 일을 정리해보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 캠핑 준비물"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="체크리스트에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="collaborative"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="collaborative">친구들과 실시간 협업</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="peopleCount">인원 수</Label>
            <Input
              id="peopleCount"
              type="number"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              placeholder="예: 4"
              min="1"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>체크리스트 항목 *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                항목 추가
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(index, 'title', e.target.value)}
                      placeholder="항목 제목"
                    />
                    <Input
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="설명 (선택사항)"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={item.quantity?.toString() || ''}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="수량"
                        className="w-20"
                      />
                      <Input
                        value={item.unit || ''}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        placeholder="단위"
                        className="w-20"
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="self-start"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '생성 중...' : '체크리스트 만들기'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}