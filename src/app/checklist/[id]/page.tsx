'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useChecklistStore } from '@/stores/checklist-store'
import { Navbar } from '@/components/layout/navbar'
import { ChecklistItem } from '@/components/checklist/checklist-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, Calendar, Heart, MessageCircle, Star, Plus } from 'lucide-react'

export default function ChecklistPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const { 
    currentChecklist, 
    loading, 
    fetchChecklist, 
    toggleItemComplete,
    addItem,
    updateItem,
    deleteItem
  } = useChecklistStore()

  const checklistId = params.id as string
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemTitle, setNewItemTitle] = useState('')

  useEffect(() => {
    if (checklistId) {
      fetchChecklist(checklistId)
    }
  }, [checklistId, fetchChecklist])

  const handleToggleItem = async (itemId: string) => {
    toggleItemComplete(itemId)
    const item = currentChecklist?.items.find(i => i.id === itemId)
    if (item) {
      await updateItem(itemId, { isCompleted: !item.isCompleted })
    }
  }

  const handleUpdateItem = async (itemId: string, data: { title?: string; description?: string; quantity?: number; unit?: string; isCompleted?: boolean }) => {
    await updateItem(itemId, data)
  }

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId)
  }

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !currentChecklist) return
    
    const newOrder = Math.max(...currentChecklist.items.map(item => item.order || 0), 0) + 1
    
    await addItem(checklistId, {
      title: newItemTitle.trim(),
      description: '',
      quantity: 1,
      unit: '',
      isCompleted: false,
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    setNewItemTitle('')
    setIsAddingItem(false)
  }

  if (loading || !currentChecklist) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = !user || user?.id === currentChecklist.userId
  const completedItems = currentChecklist.items.filter(item => item.isCompleted).length
  const totalItems = currentChecklist.items.length
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{currentChecklist.title}</h1>
                {currentChecklist.isTemplate && (
                  <Badge variant="secondary">템플릿</Badge>
                )}
                {currentChecklist.isPublic && (
                  <Badge variant="outline">공개</Badge>
                )}
              </div>
              
              {currentChecklist.description && (
                <p className="text-gray-600 mb-4">{currentChecklist.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>작성자: {currentChecklist.user.name || currentChecklist.user.email}</span>
                {currentChecklist.category && (
                  <>
                    <span>•</span>
                    <span>{currentChecklist.category.name}</span>
                  </>
                )}
                {currentChecklist.peopleCount && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{currentChecklist.peopleCount}명</span>
                    </div>
                  </>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentChecklist.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{currentChecklist._count?.likes || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{currentChecklist._count?.reviews || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{currentChecklist._count?.comments || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>완료된 항목</span>
                  <span>{completedItems}/{totalItems}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-600">
                  {Math.round(completionRate)}% 완료
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>체크리스트 항목</CardTitle>
            <CardDescription>
              항목을 클릭하여 완료 표시를 하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentChecklist.items
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div key={item.id} className="group">
                    <ChecklistItem
                      item={item}
                      onToggle={handleToggleItem}
                      onUpdate={handleUpdateItem}
                      onDelete={handleDeleteItem}
                      isEditable={isOwner}
                    />
                  </div>
                ))}

              {currentChecklist.items.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  아직 항목이 없습니다.
                </div>
              )}

              {/* 항목 추가 섹션 */}
              {isOwner && (
                <div className="mt-6 pt-6 border-t">
                  {isAddingItem ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="새 항목 제목을 입력하세요"
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem()
                          } else if (e.key === 'Escape') {
                            setIsAddingItem(false)
                            setNewItemTitle('')
                          }
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button onClick={handleAddItem} disabled={!newItemTitle.trim()}>
                        추가
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAddingItem(false)
                          setNewItemTitle('')
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingItem(true)}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      새 항목 추가
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {currentChecklist.isPublic && (
          <div className="mt-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>리뷰</CardTitle>
              </CardHeader>
              <CardContent>
                {currentChecklist.reviews.length === 0 ? (
                  <p className="text-gray-500">아직 리뷰가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {currentChecklist.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{review.user.name || review.user.email}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.content && (
                          <p className="text-gray-700">{review.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>댓글</CardTitle>
              </CardHeader>
              <CardContent>
                {currentChecklist.comments.length === 0 ? (
                  <p className="text-gray-500">아직 댓글이 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {currentChecklist.comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comment.user.name || comment.user.email}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}