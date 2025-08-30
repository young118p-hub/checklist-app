import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'

interface Params {
  params: { id: string }
}

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const checklist = await prisma.checklist.findUnique({
      where: { id: params.id }
    })

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    if (checklist.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, quantity, unit, order } = body

    const item = await prisma.checklistItem.create({
      data: {
        title,
        description,
        quantity,
        unit,
        order: order || 0,
        isCompleted: false,
        checklistId: params.id,
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating checklist item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}