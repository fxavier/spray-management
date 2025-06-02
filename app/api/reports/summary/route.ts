import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/infrastructure/prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const provinceId = searchParams.get('provinceId')
    const districtId = searchParams.get('districtId')

    // Build where clause for filtering
    const whereClause: any = {
      sprayYear: year,
      isDeleted: false,
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.sprayDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Add geographical filters
    if (provinceId || districtId) {
      whereClause.community = {
        locality: {
          ...(districtId ? { districtId } : {}),
          ...(provinceId && !districtId ? { district: { provinceId } } : {}),
        },
      }
    }

    // Get all spray totals with related data
    const sprayTotals = await prisma.sprayTotals.findMany({
      where: whereClause,
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
            name: true,
            number: true,
          },
        },
        brigadeChief: {
          select: {
            name: true,
            number: true,
          },
        },
        sprayConfiguration: {
          select: {
            sprayTarget: true,
            description: true,
          },
        },
      },
      orderBy: {
        sprayDate: 'asc',
      },
    })

    // Calculate summary statistics
    const totalRecords = sprayTotals.length
    const totalStructuresFound = sprayTotals.reduce((sum, record) => sum + record.structuresFound, 0)
    const totalStructuresSprayed = sprayTotals.reduce((sum, record) => sum + record.structuresSprayed, 0)
    const totalStructuresNotSprayed = sprayTotals.reduce((sum, record) => sum + record.structuresNotSprayed, 0)
    const totalPopulation = sprayTotals.reduce((sum, record) => sum + record.numberOfPersons, 0)
    const totalChildrenUnder5 = sprayTotals.reduce((sum, record) => sum + record.childrenUnder5, 0)
    const totalPregnantWomen = sprayTotals.reduce((sum, record) => sum + record.pregnantWomen, 0)
    const totalCompartmentsSprayed = sprayTotals.reduce((sum, record) => sum + record.compartmentsSprayed, 0)

    const coveragePercentage = totalStructuresFound > 0 ? (totalStructuresSprayed / totalStructuresFound) * 100 : 0

    // Status distribution
    const statusDistribution = sprayTotals.reduce((acc, record) => {
      acc[record.sprayStatus] = (acc[record.sprayStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Type distribution
    const typeDistribution = sprayTotals.reduce((acc, record) => {
      acc[record.sprayType] = (acc[record.sprayType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Geographical distribution
    const provinceDistribution = sprayTotals.reduce((acc, record) => {
      const provinceName = record.community.locality?.district?.province?.name || 'Não especificado'
      if (!acc[provinceName]) {
        acc[provinceName] = {
          recordCount: 0,
          structuresFound: 0,
          structuresSprayed: 0,
          population: 0,
        }
      }
      acc[provinceName].recordCount += 1
      acc[provinceName].structuresFound += record.structuresFound
      acc[provinceName].structuresSprayed += record.structuresSprayed
      acc[provinceName].population += record.numberOfPersons
      return acc
    }, {} as Record<string, any>)

    // Monthly distribution
    const monthlyDistribution = sprayTotals.reduce((acc, record) => {
      const month = new Date(record.sprayDate).toISOString().slice(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = {
          recordCount: 0,
          structuresFound: 0,
          structuresSprayed: 0,
          population: 0,
        }
      }
      acc[month].recordCount += 1
      acc[month].structuresFound += record.structuresFound
      acc[month].structuresSprayed += record.structuresSprayed
      acc[month].population += record.numberOfPersons
      return acc
    }, {} as Record<string, any>)

    // Team performance
    const teamPerformance = sprayTotals.reduce((acc, record) => {
      const sprayerName = record.sprayer?.name || 'Não especificado'
      if (!acc[sprayerName]) {
        acc[sprayerName] = {
          recordCount: 0,
          structuresFound: 0,
          structuresSprayed: 0,
          avgStructuresPerDay: 0,
        }
      }
      acc[sprayerName].recordCount += 1
      acc[sprayerName].structuresFound += record.structuresFound
      acc[sprayerName].structuresSprayed += record.structuresSprayed
      return acc
    }, {} as Record<string, any>)

    // Calculate averages for team performance
    Object.keys(teamPerformance).forEach(sprayer => {
      const data = teamPerformance[sprayer]
      data.avgStructuresPerDay = data.recordCount > 0 ? data.structuresSprayed / data.recordCount : 0
    })

    // Get active spray configurations for targets
    const sprayConfigurations = await prisma.sprayConfiguration.findMany({
      where: {
        year,
        isActive: true,
        ...(provinceId && { provinceId }),
        ...(districtId && { districtId }),
      },
      select: {
        sprayTarget: true,
        description: true,
      },
    })

    const totalTarget = sprayConfigurations.reduce((sum, config) => sum + config.sprayTarget, 0)
    const targetProgress = totalTarget > 0 ? (totalStructuresSprayed / totalTarget) * 100 : 0

    const summary = {
      overview: {
        totalRecords,
        totalStructuresFound,
        totalStructuresSprayed,
        totalStructuresNotSprayed,
        totalPopulation,
        totalChildrenUnder5,
        totalPregnantWomen,
        totalCompartmentsSprayed,
        coveragePercentage,
        totalTarget,
        targetProgress,
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
        province: provinceDistribution,
        monthly: monthlyDistribution,
      },
      teamPerformance,
      filters: {
        year,
        startDate,
        endDate,
        provinceId,
        districtId,
      },
      generatedAt: new Date(),
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error generating summary report:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}