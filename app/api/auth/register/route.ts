import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/infrastructure/prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').max(100),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'supervisor', 'sprayer', 'user']).default('user'),
  actorTypeId: z.string().optional(),
  number: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      return NextResponse.json({ 
        error: 'Dados de entrada inválidos', 
        details: errors 
      }, { status: 400 })
    }

    const { name, email, password, role, actorTypeId, number } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      )
    }

    // Check if number is provided and already exists
    if (number) {
      const existingUserWithNumber = await prisma.user.findUnique({
        where: { number }
      })

      if (existingUserWithNumber) {
        return NextResponse.json(
          { error: 'Número já está em uso' },
          { status: 409 }
        )
      }
    }

    // Validate actor type if provided
    if (actorTypeId) {
      const actorType = await prisma.actorType.findUnique({
        where: { id: actorTypeId, isActive: true }
      })

      if (!actorType) {
        return NextResponse.json(
          { error: 'Tipo de ator inválido' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        actorTypeId,
        number,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        number: true,
        actorType: {
          select: {
            id: true,
            name: true
          }
        },
        createdAt: true
      }
    })

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed on the fields: (`email`)')) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        )
      }
      if (error.message.includes('Unique constraint failed on the fields: (`number`)')) {
        return NextResponse.json(
          { error: 'Número já está em uso' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Get actor types for registration form
export async function GET() {
  try {
    const actorTypes = await prisma.actorType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(actorTypes)
  } catch (error) {
    console.error('Error fetching actor types:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tipos de ator' },
      { status: 500 }
    )
  }
}