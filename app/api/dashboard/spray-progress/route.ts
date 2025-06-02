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
    const provinceId = searchParams.get('provinceId')
    const districtId = searchParams.get('districtId')

    // Get all active spray configurations for the year
    const sprayConfigs = await prisma.sprayConfiguration.findMany({
      where: {
        year,
        ...(provinceId && { provinceId }),
        ...(districtId && { districtId }),
        isActive: true,
      },
      select: {
        id: true,
        sprayTarget: true,
        year: true,
        description: true,
        startDate: true,
        endDate: true,
      },
    })

    // Calculate total target from all configurations
    const totalTarget = sprayConfigs.reduce((sum, config) => sum + (config.sprayTarget || 0), 0)

    if (totalTarget === 0) {
      return NextResponse.json({
        target: 0,
        totalSprayed: 0,
        percentageComplete: 0,
        remainingToSpray: 0,
        progress: [],
        configurations: [],
      })
    }

    // Get spray totals grouped by date with geographical filters
    const whereClause: any = {
      sprayYear: year,
      isDeleted: false,
      sprayStatus: {
        in: ['COMPLETED', 'IN_PROGRESS'], // Only count completed and in-progress
      },
    }

    if (provinceId || districtId) {
      whereClause.community = {
        locality: {
          ...(districtId ? { districtId } : {}),
          ...(provinceId && !districtId ? { district: { provinceId } } : {}),
        },
      }
    }

    const sprayTotals = await prisma.sprayTotals.groupBy({
      by: ['sprayDate'],
      where: whereClause,
      _sum: {
        structuresSprayed: true,
        structuresFound: true,
      },
      orderBy: {
        sprayDate: 'asc',
      },
    })

    // Generate progress data with cumulative totals
    let cumulativeTotal = 0
    let cumulativeFound = 0
    const progressData = sprayTotals.map(day => {
      const dailySprayed = day._sum.structuresSprayed || 0
      const dailyFound = day._sum.structuresFound || 0
      
      cumulativeTotal += dailySprayed
      cumulativeFound += dailyFound
      
      return {
        date: day.sprayDate,
        dailySprayed,
        cumulativeSprayed: cumulativeTotal,
        dailyFound,
        cumulativeFound,
        percentageComplete: totalTarget > 0 
          ? Math.min(100, (cumulativeTotal / totalTarget) * 100)
          : 0,
        coverageRate: cumulativeFound > 0 
          ? (cumulativeTotal / cumulativeFound) * 100
          : 0,
      }
    })

    const totalSprayed = cumulativeTotal
    const totalFound = cumulativeFound
    const percentageComplete = totalTarget > 0 
      ? Math.min(100, (totalSprayed / totalTarget) * 100)
      : 0
    const remainingToSpray = Math.max(0, totalTarget - totalSprayed)
    const coverageRate = totalFound > 0 ? (totalSprayed / totalFound) * 100 : 0

    // Get daily averages for trend analysis
    const activeDays = progressData.length
    const averageDailyProgress = activeDays > 0 ? totalSprayed / activeDays : 0
    
    // Estimate completion date based on current rate
    let estimatedCompletionDate = null
    if (averageDailyProgress > 0 && remainingToSpray > 0) {
      const daysToComplete = Math.ceil(remainingToSpray / averageDailyProgress)
      const lastDate = progressData.length > 0 
        ? new Date(progressData[progressData.length - 1].date)
        : new Date()
      estimatedCompletionDate = new Date(lastDate)
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysToComplete)
    }

    // Get configuration dates for reference
    const configDates = sprayConfigs.reduce((acc, config) => {
      if (config.startDate) acc.startDate = acc.startDate ? (new Date(config.startDate) < new Date(acc.startDate) ? config.startDate : acc.startDate) : config.startDate
      if (config.endDate) acc.endDate = acc.endDate ? (new Date(config.endDate) > new Date(acc.endDate) ? config.endDate : acc.endDate) : config.endDate
      return acc
    }, { startDate: null, endDate: null } as { startDate: Date | null, endDate: Date | null })

    return NextResponse.json({
      target: totalTarget,
      totalSprayed,
      totalFound,
      percentageComplete,
      remainingToSpray,
      coverageRate,
      averageDailyProgress,
      activeDays,
      estimatedCompletionDate,
      startDate: configDates.startDate,
      endDate: configDates.endDate,
      progress: progressData,
      configurations: sprayConfigs,
      lastUpdated: new Date(),
    })
  } catch (error) {
    console.error('Error fetching spray progress:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}