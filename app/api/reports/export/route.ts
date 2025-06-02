import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { reportType, filters } = await request.json()

    // Fetch the appropriate report data
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const searchParams = new URLSearchParams()
    
    // Add filters to search params
    if (filters.year) searchParams.append('year', filters.year.toString())
    if (filters.startDate) searchParams.append('startDate', filters.startDate)
    if (filters.endDate) searchParams.append('endDate', filters.endDate)
    if (filters.provinceId) searchParams.append('provinceId', filters.provinceId)
    if (filters.districtId) searchParams.append('districtId', filters.districtId)
    if (filters.sprayStatus) searchParams.append('sprayStatus', filters.sprayStatus)
    if (filters.sprayType) searchParams.append('sprayType', filters.sprayType)

    let reportData: any
    let fileName: string

    if (reportType === 'summary') {
      const response = await fetch(`${baseUrl}/api/reports/summary?${searchParams.toString()}`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })
      reportData = await response.json()
      fileName = `relatorio-resumo-${filters.year || new Date().getFullYear()}.xlsx`
    } else if (reportType === 'detailed') {
      const response = await fetch(`${baseUrl}/api/reports/detailed?${searchParams.toString()}`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })
      reportData = await response.json()
      fileName = `relatorio-detalhado-${filters.year || new Date().getFullYear()}.xlsx`
    } else {
      return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new()

    if (reportType === 'summary') {
      // Summary sheet
      const summaryData = [
        ['RELATÓRIO RESUMO DE PULVERIZAÇÃO'],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['VISÃO GERAL'],
        ['Total de Registros', reportData.overview.totalRecords],
        ['Estruturas Encontradas', reportData.overview.totalStructuresFound],
        ['Estruturas Pulverizadas', reportData.overview.totalStructuresSprayed],
        ['Estruturas Não Pulverizadas', reportData.overview.totalStructuresNotSprayed],
        ['Taxa de Cobertura (%)', Number(reportData.overview.coveragePercentage).toFixed(2)],
        ['População Total', reportData.overview.totalPopulation],
        ['Crianças <5 anos', reportData.overview.totalChildrenUnder5],
        ['Mulheres Grávidas', reportData.overview.totalPregnantWomen],
        ['Meta Total', reportData.overview.totalTarget],
        ['Progresso da Meta (%)', Number(reportData.overview.targetProgress).toFixed(2)],
        [''],
        ['DISTRIBUIÇÃO POR STATUS'],
        ['Status', 'Quantidade'],
      ]

      // Add status distribution
      Object.entries(reportData.distributions.status).forEach(([status, count]) => {
        const statusText = status === 'COMPLETED' ? 'Completo' :
                          status === 'IN_PROGRESS' ? 'Em Progresso' :
                          status === 'PLANNED' ? 'Planeado' : 'Cancelado'
        summaryData.push([statusText, count])
      })

      summaryData.push([''])
      summaryData.push(['DISTRIBUIÇÃO POR TIPO'])
      summaryData.push(['Tipo', 'Quantidade'])

      // Add type distribution
      Object.entries(reportData.distributions.type).forEach(([type, count]) => {
        const typeText = type === 'PRINCIPAL' ? 'Principal' : 'Secundária'
        summaryData.push([typeText, count])
      })

      summaryData.push([''])
      summaryData.push(['DISTRIBUIÇÃO POR PROVÍNCIA'])
      summaryData.push(['Província', 'Registros', 'Estruturas Encontradas', 'Estruturas Pulverizadas', 'População'])

      // Add province distribution
      Object.entries(reportData.distributions.province).forEach(([province, data]: [string, any]) => {
        summaryData.push([
          province,
          data.recordCount,
          data.structuresFound,
          data.structuresSprayed,
          data.population
        ])
      })

      summaryData.push([''])
      summaryData.push(['PERFORMANCE DAS EQUIPES'])
      summaryData.push(['Pulverizador', 'Registros', 'Estruturas Encontradas', 'Estruturas Pulverizadas', 'Média por Dia'])

      // Add team performance
      Object.entries(reportData.teamPerformance).forEach(([sprayer, data]: [string, any]) => {
        summaryData.push([
          sprayer,
          data.recordCount,
          data.structuresFound,
          data.structuresSprayed,
          Number(data.avgStructuresPerDay).toFixed(1)
        ])
      })

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')

    } else if (reportType === 'detailed') {
      // Detailed records sheet
      const headers = [
        'ID',
        'Data de Pulverização',
        'Ano',
        'Ronda',
        'Tipo',
        'Status',
        'Inseticida',
        'Província',
        'Distrito',
        'Localidade',
        'Comunidade',
        'Estruturas Encontradas',
        'Estruturas Pulverizadas',
        'Estruturas Não Pulverizadas',
        'Compartimentos Pulverizados',
        'Tipo de Paredes',
        'Tipo de Telhados',
        'Motivo Não Pulverizado',
        'Número de Pessoas',
        'Crianças <5 anos',
        'Mulheres Grávidas',
        'Pulverizador',
        'Número Pulverizador',
        'Chefe de Brigada',
        'Número Chefe',
        'Meta',
        'Descrição Configuração',
        'Taxa de Cobertura (%)',
        'Criado Por',
        'Atualizado Por',
        'Data de Criação',
        'Data de Atualização'
      ]

      const detailedData = [headers]

      // Add data rows
      reportData.records.forEach((record: any) => {
        detailedData.push([
          record.id,
          new Date(record.sprayDate).toLocaleDateString('pt-BR'),
          record.sprayYear,
          record.sprayRound,
          record.sprayType === 'PRINCIPAL' ? 'Principal' : 'Secundária',
          record.sprayStatus === 'COMPLETED' ? 'Completo' :
          record.sprayStatus === 'IN_PROGRESS' ? 'Em Progresso' :
          record.sprayStatus === 'PLANNED' ? 'Planeado' : 'Cancelado',
          record.insecticideUsed,
          record.province,
          record.district,
          record.locality,
          record.community,
          record.structuresFound,
          record.structuresSprayed,
          record.structuresNotSprayed,
          record.compartmentsSprayed,
          record.wallsType,
          record.roofsType,
          record.reasonNotSprayed,
          record.numberOfPersons,
          record.childrenUnder5,
          record.pregnantWomen,
          record.sprayerName,
          record.sprayerNumber,
          record.brigadeChiefName,
          record.brigadeChiefNumber,
          record.sprayTarget,
          record.configurationDescription,
          Number(record.coveragePercentage).toFixed(2),
          record.createdBy,
          record.updatedBy,
          new Date(record.createdAt).toLocaleString('pt-BR'),
          new Date(record.updatedAt).toLocaleString('pt-BR')
        ])
      })

      const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData)
      
      // Auto-size columns
      const colWidths = headers.map((_, i) => {
        const maxLength = Math.max(
          headers[i].length,
          ...detailedData.slice(1).map(row => String(row[i] || '').length)
        )
        return { width: Math.min(maxLength + 2, 50) }
      })
      detailedSheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Registros Detalhados')

      // Summary sheet for detailed report
      const summaryData = [
        ['RESUMO DO RELATÓRIO DETALHADO'],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [''],
        ['Total de Registros', reportData.summary.totalRecords],
        ['Estruturas Encontradas', reportData.summary.totalStructuresFound],
        ['Estruturas Pulverizadas', reportData.summary.totalStructuresSprayed],
        ['População Total', reportData.summary.totalPopulation],
        ['Cobertura Média (%)', Number(reportData.summary.averageCoverage).toFixed(2)],
      ]

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo')
    }

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar relatório' },
      { status: 500 }
    )
  }
}