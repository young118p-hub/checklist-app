import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase/client'

interface Params {
  params: { id: string }
}

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const checklist = await prisma.checklist.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        category: true,
        items: {
          orderBy: { order: 'asc' }
        },
        likes: true,
        reviews: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true,
            reviews: true,
            comments: true,
          }
        }
      }
    })

    if (!checklist) {
      return NextResponse.json(
        { error: 'Checklist not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(checklist)
  } catch (error) {
    console.error('Error fetching checklist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const updatedChecklist = await prisma.checklist.update({
      where: { id: params.id },
      data: body,
      include: {
        user: true,
        category: true,
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedChecklist)
  } catch (error) {
    console.error('Error updating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to update checklist' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.checklist.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Checklist deleted successfully' })
  } catch (error) {
    console.error('Error deleting checklist:', error)
    return NextResponse.json(
      { error: 'Failed to delete checklist' },
      { status: 500 }
    )
  }
}