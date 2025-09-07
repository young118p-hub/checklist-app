'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Star, Users, Trash2 } from 'lucide-react'
import { Checklist } from '@/types'

interface ChecklistCardProps {
  checklist: Checklist
  onView: (id: string) => void
  onLike?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  showDelete?: boolean
}

export function ChecklistCard({ 
  checklist, 
  onView, 
  onLike,
  onDelete,
  showActions = true,
  showDelete = false 
}: ChecklistCardProps) {
  const completedItems = checklist.items.filter(item => item.isCompleted).length
  const totalItems = checklist.items.length
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <Card className="hover:shadow-md transition-shadow bg-white border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm font-bold text-gray-900 leading-tight">{checklist.title}</CardTitle>
              {checklist.isTemplate && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5">템플릿</Badge>
              )}
            </div>
            {checklist.description && (
              <CardDescription className="text-xs text-gray-600 leading-tight">
                {checklist.description}
              </CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">by {checklist.user.name || checklist.user.email}</span>
          {checklist.category && (
            <span className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">{checklist.category.name}</span>
          )}
          {checklist.peopleCount && (
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>{checklist.peopleCount}명</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">진행률</span>
            <span className="font-medium text-gray-900">{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div 
              className="bg-red-600 h-2 rounded transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {completedItems}/{totalItems} 항목 완료
          </div>

          {showActions && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{checklist._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{checklist._count?.reviews || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{checklist._count?.comments || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-1">
                {onLike && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onLike(checklist.id)}
                    className="h-7 px-2 text-xs"
                  >
                    <Heart className="w-3 h-3" />
                  </Button>
                )}
                {showDelete && onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (confirm('정말 이 체크리스트를 삭제하시겠습니까?')) {
                        onDelete(checklist.id)
                      }
                    }}
                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={() => onView(checklist.id)}
                  className="bg-red-600 hover:bg-red-700 text-white h-7 px-3 text-xs"
                >
                  보기
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}