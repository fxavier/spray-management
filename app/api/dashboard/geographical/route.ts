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

    // Get geographical breakdown by province
    const provinceStats = await prisma.sprayTotals.groupBy({
      by: ['communityId'],
      where: {
        sprayYear: year,
        isDeleted: false,
      },
      _sum: {
        structuresSprayed: true,
        structuresFound: true,
        numberOfPersons: true,
      },
      _count: {
        id: true,
      },
    })

    // Get community details with geographical hierarchy
    const communityIds = provinceStats.map(stat => stat.communityId)
    const communities = await prisma.community.findMany({
      where: {
        id: {
          in: communityIds,
        },
      },
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
    })

    // Create a map for faster lookup
    const communityMap = communities.reduce((acc, community) => {
      acc[community.id] = community
      return acc
    }, {} as Record<string, typeof communities[0]>)

    // Aggregate by province
    const provinceAggregation: Record<string, {
      provinceId: string
      provinceName: string
      districts: Record<string, {
        districtId: string
        districtName: string
        communities: Array<{
          communityId: string
          communityName: string
          structuresSprayed: number
          structuresFound: number
          numberOfPersons: number
          recordCount: number
          coverageRate: number
        }>
        totals: {
          structuresSprayed: number
          structuresFound: number
          numberOfPersons: number
          recordCount: number
          coverageRate: number
        }
      }>
      totals: {
        structuresSprayed: number
        structuresFound: number
        numberOfPersons: number
        recordCount: number
        coverageRate: number
      }
    }> = {}

    provinceStats.forEach(stat => {
      const community = communityMap[stat.communityId]
      if (!community?.locality?.district?.province) return

      const province = community.locality.district.province
      const district = community.locality.district
      
      const structuresSprayed = stat._sum.structuresSprayed || 0
      const structuresFound = stat._sum.structuresFound || 0
      const numberOfPersons = stat._sum.numberOfPersons || 0
      const recordCount = stat._count.id || 0
      const coverageRate = structuresFound > 0 ? (structuresSprayed / structuresFound) * 100 : 0

      // Initialize province if not exists
      if (!provinceAggregation[province.id]) {
        provinceAggregation[province.id] = {
          provinceId: province.id,
          provinceName: province.name,
          districts: {},
          totals: {
            structuresSprayed: 0,
            structuresFound: 0,
            numberOfPersons: 0,
            recordCount: 0,
            coverageRate: 0,
          },
        }
      }

      // Initialize district if not exists
      if (!provinceAggregation[province.id].districts[district.id]) {
        provinceAggregation[province.id].districts[district.id] = {
          districtId: district.id,
          districtName: district.name,
          communities: [],
          totals: {
            structuresSprayed: 0,
            structuresFound: 0,
            numberOfPersons: 0,
            recordCount: 0,
            coverageRate: 0,
          },
        }
      }

      // Add community data
      provinceAggregation[province.id].districts[district.id].communities.push({
        communityId: community.id,
        communityName: community.name,
        structuresSprayed,
        structuresFound,
        numberOfPersons,
        recordCount,
        coverageRate,
      })

      // Update district totals
      const districtData = provinceAggregation[province.id].districts[district.id]
      districtData.totals.structuresSprayed += structuresSprayed
      districtData.totals.structuresFound += structuresFound
      districtData.totals.numberOfPersons += numberOfPersons
      districtData.totals.recordCount += recordCount

      // Update province totals
      const provinceData = provinceAggregation[province.id]
      provinceData.totals.structuresSprayed += structuresSprayed
      provinceData.totals.structuresFound += structuresFound
      provinceData.totals.numberOfPersons += numberOfPersons
      provinceData.totals.recordCount += recordCount
    })

    // Calculate coverage rates for aggregated data
    Object.values(provinceAggregation).forEach(province => {
      province.totals.coverageRate = province.totals.structuresFound > 0 
        ? (province.totals.structuresSprayed / province.totals.structuresFound) * 100 
        : 0

      Object.values(province.districts).forEach(district => {
        district.totals.coverageRate = district.totals.structuresFound > 0 
          ? (district.totals.structuresSprayed / district.totals.structuresFound) * 100 
          : 0
      })
    })

    // Convert to arrays for easier consumption
    const provinceData = Object.values(provinceAggregation).map(province => ({
      ...province,
      districts: Object.values(province.districts),
    }))

    // Calculate summary statistics
    const totalProvinces = provinceData.length
    const totalDistricts = provinceData.reduce((sum, p) => sum + p.districts.length, 0)
    const totalCommunities = provinceData.reduce((sum, p) => 
      sum + p.districts.reduce((distSum, d) => distSum + d.communities.length, 0), 0
    )

    const overallTotals = provinceData.reduce((acc, province) => {
      acc.structuresSprayed += province.totals.structuresSprayed
      acc.structuresFound += province.totals.structuresFound
      acc.numberOfPersons += province.totals.numberOfPersons
      acc.recordCount += province.totals.recordCount
      return acc
    }, {
      structuresSprayed: 0,
      structuresFound: 0,
      numberOfPersons: 0,
      recordCount: 0,
    })

    const overallCoverageRate = overallTotals.structuresFound > 0 
      ? (overallTotals.structuresSprayed / overallTotals.structuresFound) * 100 
      : 0

    return NextResponse.json({
      year,
      summary: {
        totalProvinces,
        totalDistricts,
        totalCommunities,
        overallTotals: {
          ...overallTotals,
          coverageRate: overallCoverageRate,
        },
      },
      provinces: provinceData,
      lastUpdated: new Date(),
    })
  } catch (error) {
    console.error('Error fetching geographical data:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}