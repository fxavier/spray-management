import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data in correct order (due to foreign key constraints)
  await prisma.sprayTotals.deleteMany()
  await prisma.sprayConfiguration.deleteMany()
  await prisma.districtTarget.deleteMany()
  await prisma.provinceTarget.deleteMany()
  await prisma.community.deleteMany()
  await prisma.locality.deleteMany()
  await prisma.district.deleteMany()
  await prisma.province.deleteMany()
  await prisma.actorType.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Cleared existing data')

  // Create users first (they're now required for spray totals)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const supervisorUser = await prisma.user.create({
    data: {
      name: 'Supervisor User', 
      email: 'supervisor@example.com',
      role: 'SUPERVISOR',
      isActive: true,
    },
  })

  const fieldUser = await prisma.user.create({
    data: {
      name: 'Field Worker',
      email: 'field@example.com',
      role: 'SPRAYER',
      isActive: true,
    },
  })

  console.log('✅ Created users')

  // Create actor types
  const sprayerType = await prisma.actorType.create({
    data: {
      name: 'Sprayer',
      isActive: true,
    },
  })

  const brigadeChiefType = await prisma.actorType.create({
    data: {
      name: 'Brigade Chief',
      isActive: true,
    },
  })

  console.log('✅ Created actor types')

  // Create user actors
  const sprayer1 = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      role: 'SPRAYER',
      description: 'Experienced sprayer',
      number: 'SP001',
      actorTypeId: sprayerType.id,
      isActive: true,
    },
  })

  const sprayer2 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      role: 'SPRAYER',
      description: 'Senior sprayer',
      number: 'SP002',
      actorTypeId: sprayerType.id,
      isActive: true,
    },
  })

  const brigadeChief1 = await prisma.user.create({
    data: {
      name: 'Carlos Mendes',
      email: 'carlos.mendes@example.com',
      role: 'SUPERVISOR',
      description: 'Brigade leader',
      number: 'BC001',
      actorTypeId: brigadeChiefType.id,
      isActive: true,
    },
  })

  console.log('✅ Created actors')

  // Create geographical hierarchy
  const province = await prisma.province.create({
    data: {
      name: 'Maputo',
      code: 'MP',
    },
  })

  const district = await prisma.district.create({
    data: {
      name: 'Maputo Cidade',
      code: 'MPC',
      provinceId: province.id,
    },
  })

  const locality = await prisma.locality.create({
    data: {
      name: 'KaMpfumo',
      districtId: district.id,
    },
  })

  const community1 = await prisma.community.create({
    data: {
      name: 'Baixa',
      localityId: locality.id,
    },
  })

  const community2 = await prisma.community.create({
    data: {
      name: 'Polana',
      localityId: locality.id,
    },
  })

  console.log('✅ Created geographical hierarchy')

  // Create targets
  await prisma.provinceTarget.create({
    data: {
      year: 2024,
      provinceId: province.id,
      target: 10000,
    },
  })

  await prisma.districtTarget.create({
    data: {
      year: 2024,
      districtId: district.id,
      target: 5000,
    },
  })

  console.log('✅ Created targets')

  // Create spray configuration
  const sprayConfig = await prisma.sprayConfiguration.create({
    data: {
      year: 2024,
      provinceId: province.id,
      districtId: district.id,
      proposedSprayDays: 30,
      sprayTarget: 15000, // Target de 15000 estruturas
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-11-30'),
      sprayRounds: 2,
      daysBetweenRounds: 21,
      description: '2024 Indoor Residual Spraying Campaign',
      isActive: true,
      createdBy: adminUser.id, // Now required
    },
  })

  console.log('✅ Created spray configuration')

  // Create spray totals (now with required createdBy field)
  await prisma.sprayTotals.create({
    data: {
      createdBy: fieldUser.id, // Required field
      sprayerId: sprayer1.id,
      brigadeChiefId: brigadeChief1.id,
      communityId: community1.id,
      sprayConfigurationId: sprayConfig.id,
      sprayType: 'PRINCIPAL',
      sprayDate: new Date('2024-10-15'),
      sprayYear: 2024,
      sprayRound: 1,
      sprayStatus: 'COMPLETED',
      insecticideUsed: 'Deltamethrin',
      structuresFound: 25,
      structuresSprayed: 23,
      structuresNotSprayed: 2,
      compartmentsSprayed: 45,
      wallsType: 'MATOPE',
      roofsType: 'ZINCO',
      numberOfPersons: 120,
      childrenUnder5: 18,
      pregnantWomen: 3,
      reasonNotSprayed: 'RECUSA',
    },
  })

  await prisma.sprayTotals.create({
    data: {
      createdBy: fieldUser.id, // Required field
      sprayerId: sprayer2.id,
      brigadeChiefId: brigadeChief1.id,
      communityId: community2.id,
      sprayConfigurationId: sprayConfig.id,
      sprayType: 'PRINCIPAL',
      sprayDate: new Date('2024-10-16'),
      sprayYear: 2024,
      sprayRound: 1,
      sprayStatus: 'COMPLETED',
      insecticideUsed: 'Deltamethrin',
      structuresFound: 30,
      structuresSprayed: 28,
      structuresNotSprayed: 2,
      compartmentsSprayed: 55,
      wallsType: 'CIMENTO',
      roofsType: 'ZINCO',
      numberOfPersons: 150,
      childrenUnder5: 22,
      pregnantWomen: 4,
      reasonNotSprayed: 'FECHADA',
    },
  })

  await prisma.sprayTotals.create({
    data: {
      createdBy: adminUser.id, // Different user creating this record
      sprayerId: sprayer1.id,
      brigadeChiefId: brigadeChief1.id,
      communityId: community1.id,
      sprayConfigurationId: sprayConfig.id,
      sprayType: 'SECUNDARIA',
      sprayDate: new Date('2024-11-05'),
      sprayYear: 2024,
      sprayRound: 2,
      sprayStatus: 'PLANNED',
      insecticideUsed: 'Deltamethrin',
      structuresFound: 25,
      structuresSprayed: 0,
      structuresNotSprayed: 0,
      compartmentsSprayed: 0,
      wallsType: 'MATOPE',
      roofsType: 'ZINCO',
      numberOfPersons: 120,
      childrenUnder5: 18,
      pregnantWomen: 3,
    },
  })

  console.log('✅ Created spray totals')

  // Display summary
  const totalUsers = await prisma.user.count()
  const totalActorTypes = await prisma.actorType.count()
  const totalSprayTotals = await prisma.sprayTotals.count()
  const totalCommunities = await prisma.community.count()

  console.log('\n📊 Seed Summary:')
  console.log(`👥 Users: ${totalUsers}`)
  console.log(`🎭 Actor Types: ${totalActorTypes}`)
  console.log(`🏘️  Communities: ${totalCommunities}`)
  console.log(`💨 Spray Totals: ${totalSprayTotals}`)
  
  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })