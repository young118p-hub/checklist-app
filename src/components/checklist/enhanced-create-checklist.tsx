'use client'

import { useState } from 'react'
import { CreateChecklistForm } from './create-checklist-form'
import { CollaborationSetup } from './collaboration-setup'
import { CreateChecklistData } from '@/types'

interface Friend {
  id: string
  name: string
  nickname: string
  avatar?: string
  isOnline: boolean
}

interface EnhancedCreateChecklistProps {
  onSubmit: (data: CreateChecklistData & { collaborationType?: 'friends' | 'link', invitedFriends?: string[], inviteMessage?: string }) => void
  onCancel: () => void
  isLoading?: boolean
  friends: Friend[]
}

type Step = 'create' | 'collaborate'

export function EnhancedCreateChecklist({
  onSubmit,
  onCancel,
  isLoading = false,
  friends
}: EnhancedCreateChecklistProps) {
  const [currentStep, setCurrentStep] = useState<Step>('create')
  const [checklistData, setChecklistData] = useState<CreateChecklistData | null>(null)

  const handleChecklistCreate = (data: CreateChecklistData) => {
    if (data.isPublic) {
      // 협업이 선택되면 협업 설정 단계로
      setChecklistData(data)
      setCurrentStep('collaborate')
    } else {
      // 개인 체크리스트면 바로 생성
      onSubmit(data)
    }
  }

  const handleFriendsInvite = (friendIds: string[], message?: string) => {
    if (!checklistData) return
    
    onSubmit({
      ...checklistData,
      collaborationType: 'friends',
      invitedFriends: friendIds,
      inviteMessage: message
    })
  }

  const handleLinkGenerate = () => {
    if (!checklistData) return
    
    onSubmit({
      ...checklistData,
      collaborationType: 'link'
    })
  }

  const handleCollaborationCancel = () => {
    if (!checklistData) return
    
    // 협업 없이 개인 체크리스트로 생성
    onSubmit({
      ...checklistData,
      isPublic: false
    })
  }

  if (currentStep === 'collaborate' && checklistData) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <CollaborationSetup
          checklistTitle={checklistData.title}
          onInviteFriends={handleFriendsInvite}
          onGenerateLink={handleLinkGenerate}
          onCancel={handleCollaborationCancel}
          friends={friends}
          isLoading={isLoading}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <CreateChecklistForm
        onSubmit={handleChecklistCreate}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  )
}