'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { ChecklistItem as ChecklistItemType } from '@/types'

interface ChecklistItemProps {
  item: ChecklistItemType
  onToggle: (id: string) => void
  onUpdate: (id: string, data: Partial<ChecklistItemType>) => void
  onDelete: (id: string) => void
  isEditable?: boolean
}

export function ChecklistItem({ 
  item, 
  onToggle, 
  onUpdate, 
  onDelete,
  isEditable = false
}: ChecklistItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [editDescription, setEditDescription] = useState(item.description || '')
  const [editQuantity, setEditQuantity] = useState(item.quantity?.toString() || '')
  const [editUnit, setEditUnit] = useState(item.unit || '')

  const handleSave = () => {
    onUpdate(item.id, {
      title: editTitle,
      description: editDescription || undefined,
      quantity: editQuantity ? parseInt(editQuantity) : undefined,
      unit: editUnit || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(item.title)
    setEditDescription(item.description || '')
    setEditQuantity(item.quantity?.toString() || '')
    setEditUnit(item.unit || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <Checkbox disabled />
        <div className="flex-1 space-y-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="항목 제목"
          />
          <Textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="설명 (선택사항)"
            rows={2}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(e.target.value)}
              placeholder="수량"
              className="w-20"
            />
            <Input
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              placeholder="단위"
              className="w-20"
            />
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={handleSave}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <Checkbox
        checked={item.isCompleted}
        onCheckedChange={() => onToggle(item.id)}
        className="mt-0.5"
      />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : ''}`}>
            {item.title}
          </h4>
          {(item.quantity || item.unit) && (
            <span className="text-sm text-gray-500">
              {item.quantity}{item.unit}
            </span>
          )}
        </div>
        {item.description && (
          <p className={`text-sm mt-1 ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
            {item.description}
          </p>
        )}
      </div>

      {isEditable && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}