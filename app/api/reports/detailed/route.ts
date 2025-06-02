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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const provinceId = searchParams.get('provinceId')
    const districtId = searchParams.get('districtId')
    const sprayStatus = searchParams.get('sprayStatus')
    const sprayType = searchParams.get('sprayType')

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

    // Add status filter
    if (sprayStatus && sprayStatus !== 'all') {
      whereClause.sprayStatus = sprayStatus
    }

    // Add type filter
    if (sprayType && sprayType !== 'all') {
      whereClause.sprayType = sprayType
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

    // Get detailed spray totals with all related data
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
            id: true,
            name: true,
            number: true,
            actorType: {
              select: {
                name: true,
              },
            },
          },
        },
        brigadeChief: {
          select: {
            id: true,
            name: true,
            number: true,
            actorType: {
              select: {
                name: true,
              },
            },
          },
        },
        sprayConfiguration: {
          select: {
            id: true,
            sprayTarget: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
        updatedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { sprayDate: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    // Transform data for detailed report
    const detailedRecords = sprayTotals.map(record => ({
      id: record.id,
      sprayDate: record.sprayDate,
      sprayYear: record.sprayYear,
      sprayRound: record.sprayRound,
      sprayType: record.sprayType,
      sprayStatus: record.sprayStatus,
      insecticideUsed: record.insecticideUsed,
      
      // Location data
      province: record.community.locality?.district?.province?.name || '',
      district: record.community.locality?.district?.name || '',
      locality: record.community.locality?.name || '',
      community: record.community.name,
      
      // Structure data
      structuresFound: record.structuresFound,
      structuresSprayed: record.structuresSprayed,
      structuresNotSprayed: record.structuresNotSprayed,
      compartmentsSprayed: record.compartmentsSprayed,
      wallsType: record.wallsType,
      roofsType: record.roofsType,
      reasonNotSprayed: record.reasonNotSprayed || '',
      
      // Population data
      numberOfPersons: record.numberOfPersons,
      childrenUnder5: record.childrenUnder5,
      pregnantWomen: record.pregnantWomen,
      
      // Team data
      sprayerName: record.sprayer?.name || '',
      sprayerNumber: record.sprayer?.number || '',
      brigadeChiefName: record.brigadeChief?.name || '',
      brigadeChiefNumber: record.brigadeChief?.number || '',
      
      // Configuration data
      sprayTarget: record.sprayConfiguration?.sprayTarget || 0,
      configurationDescription: record.sprayConfiguration?.description || '',
      
      // Calculated fields
      coveragePercentage: record.structuresFound > 0 ? 
        ((record.structuresSprayed / record.structuresFound) * 100) : 0,
      
      // Audit data
      createdBy: record.createdByUser?.name || '',
      updatedBy: record.updatedByUser?.name || '',
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }))

    // Calculate summary for the filtered data
    const summary = {
      totalRecords: detailedRecords.length,
      totalStructuresFound: detailedRecords.reduce((sum, r) => sum + r.structuresFound, 0),
      totalStructuresSprayed: detailedRecords.reduce((sum, r) => sum + r.structuresSprayed, 0),
      totalPopulation: detailedRecords.reduce((sum, r) => sum + r.numberOfPersons, 0),
      averageCoverage: detailedRecords.length > 0 ? 
        detailedRecords.reduce((sum, r) => sum + r.coveragePercentage, 0) / detailedRecords.length : 0,
    }

    return NextResponse.json({
      summary,
      records: detailedRecords,
      filters: {
        year,
        startDate,
        endDate,
        provinceId,
        districtId,
        sprayStatus,
        sprayType,
      },
      generatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error generating detailed report:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}