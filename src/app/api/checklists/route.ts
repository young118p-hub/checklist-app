import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const checklists = await prisma.checklist.findMany({
      include: {
        user: true,
        category: true,
        items: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            likes: true,
            reviews: true,
            comments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(checklists)
  } catch (error) {
    console.error('Error fetching checklists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authorization.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, isTemplate, isPublic, peopleCount, categoryId, items } = body

    const checklist = await prisma.checklist.create({
      data: {
        title,
        description,
        isTemplate: isTemplate || false,
        isPublic: isPublic || false,
        peopleCount,
        userId: user.id,
        categoryId,
        items: {
          create: items.map((item: { title: string; description?: string; quantity?: number; unit?: string; isCompleted?: boolean; order?: number }, index: number) => ({
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            isCompleted: item.isCompleted || false,
            order: item.order || index,
          }))
        }
      },
      include: {
        user: true,
        category: true,
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error('Error creating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to create checklist' },
      { status: 500 }
    )
  }
}