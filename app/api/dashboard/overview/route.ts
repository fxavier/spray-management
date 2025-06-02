import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/infrastructure/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Get all spray totals for the year
    const sprayTotals = await prisma.sprayTotals.findMany({
      where: {
        sprayYear: year,
        isDeleted: false,
      },
      include: {
        community: {
          include: {
            locality: {
              include: {
                district: {
                  include: {
                    province: true,
                  },
                },
              },
            },
          },
        },
        sprayer: {
          select: {
            id: true,
            name: true,
          },
        },
        sprayConfiguration: {
          select: {
            id: true,
            sprayTarget: true,
            year: true,
          },
        },
      },
      orderBy: {
        sprayDate: 'asc',
      },
    })

    // Get active spray configurations for the year
    const sprayConfigurations = await prisma.sprayConfiguration.findMany({
      where: {
        year,
        isActive: true,
      },
      select: {
        id: true,
        sprayTarget: true,
        year: true,
        description: true,
      },
    })

    // Calculate total targets from configurations
    const totalSprayTarget = sprayConfigurations.reduce(
      (sum, config) => sum + (config.sprayTarget || 0),
      0
    )

    // Calculate basic statistics
    const totalStructuresFound = sprayTotals.reduce(
      (sum, record) => sum + record.structuresFound,
      0
    )

    const totalStructuresSprayed = sprayTotals.reduce(
      (sum, record) => sum + record.structuresSprayed,
      0
    )

    const totalStructuresNotSprayed = sprayTotals.reduce(
      (sum, record) => sum + record.structuresNotSprayed,
      0
    )

    const totalPopulation = sprayTotals.reduce(
      (sum, record) => sum + record.numberOfPersons,
      0
    )

    const totalChildrenUnder5 = sprayTotals.reduce(
      (sum, record) => sum + record.childrenUnder5,
      0
    )

    const totalPregnantWomen = sprayTotals.reduce(
      (sum, record) => sum + record.pregnantWomen,
      0
    )

    // Calculate status statistics
    const statusStats = sprayTotals.reduce((acc, record) => {
      acc[record.sprayStatus] = (acc[record.sprayStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate type statistics
    const typeStats = sprayTotals.reduce((acc, record) => {
      acc[record.sprayType] = (acc[record.sprayType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate geographical coverage
    const uniqueProvinces = new Set(
      sprayTotals
        .map(record => record.community.locality?.district?.province?.id)
        .filter(Boolean)
    ).size

    const uniqueDistricts = new Set(
      sprayTotals
        .map(record => record.community.locality?.district?.id)
        .filter(Boolean)
    ).size

    const uniqueCommunities = new Set(
      sprayTotals.map(record => record.community.id)
    ).size

    // Calculate active teams
    const activeSprayersThisMonth = new Set(
      sprayTotals
        .filter(record => {
          const recordDate = new Date(record.sprayDate)
          const now = new Date()
          return recordDate.getMonth() === now.getMonth() && 
                 recordDate.getFullYear() === now.getFullYear()
        })
        .map(record => record.sprayerId)
    ).size

    // Calculate coverage percentage
    const coveragePercentage = totalStructuresFound > 0 
      ? (totalStructuresSprayed / totalStructuresFound) * 100 
      : 0

    // Calculate target progress
    const targetProgress = totalSprayTarget > 0
      ? (totalStructuresSprayed / totalSprayTarget) * 100
      : 0

    // Calculate average structures per day
    const recordsWithStructures = sprayTotals.filter(record => record.structuresSprayed > 0)
    const averageStructuresPerDay = recordsWithStructures.length > 0
      ? totalStructuresSprayed / recordsWithStructures.length
      : 0

    // Get activity timeline (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await prisma.sprayTotals.findMany({
      where: {
        sprayYear: year,
        isDeleted: false,
        sprayDate: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        sprayDate: true,
        structuresSprayed: true,
        structuresFound: true,
        sprayStatus: true,
      },
      orderBy: {
        sprayDate: 'desc',
      },
      take: 10,
    })

    const dashboardData = {
      overview: {
        totalStructuresFound,
        totalStructuresSprayed,
        totalStructuresNotSprayed,
        totalSprayTarget,
        coveragePercentage,
        targetProgress,
        totalPopulation,
        totalChildrenUnder5,
        totalPregnantWomen,
        averageStructuresPerDay,
      },
      geography: {
        uniqueProvinces,
        uniqueDistricts,
        uniqueCommunities,
      },
      teams: {
        activeSprayersThisMonth,
        totalRecords: sprayTotals.length,
        completedRecords: sprayTotals.filter(r => r.sprayStatus === 'COMPLETED').length,
      },
      statistics: {
        statusDistribution: statusStats,
        typeDistribution: typeStats,
      },
      recentActivity,
      year,
      lastUpdated: new Date(),
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard overview:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}