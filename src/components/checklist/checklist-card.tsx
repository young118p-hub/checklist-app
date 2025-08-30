'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Star, Users } from 'lucide-react'
import { Checklist } from '@/types'

interface ChecklistCardProps {
  checklist: Checklist
  onView: (id: string) => void
  onLike?: (id: string) => void
  showActions?: boolean
}

export function ChecklistCard({ 
  checklist, 
  onView, 
  onLike, 
  showActions = true 
}: ChecklistCardProps) {
  const completedItems = checklist.items.filter(item => item.isCompleted).length
  const totalItems = checklist.items.length
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{checklist.title}</CardTitle>
            {checklist.description && (
              <CardDescription className="mt-1">
                {checklist.description}
              </CardDescription>
            )}
          </div>
          {checklist.isTemplate && (
            <Badge variant="secondary">템플릿</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>by {checklist.user.name || checklist.user.email}</span>
          {checklist.category && (
            <>
              <span>•</span>
              <span>{checklist.category.name}</span>
            </>
          )}
          {checklist.peopleCount && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{checklist.peopleCount}명</span>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>진행률</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {completedItems}/{totalItems} 항목 완료
          </div>

          {showActions && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{checklist._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{checklist._count?.reviews || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{checklist._count?.comments || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {onLike && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onLike(checklist.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={() => onView(checklist.id)}
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