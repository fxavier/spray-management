import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUsers() {
  try {
    console.log('🔄 Creating admin users...')

    // Hash passwords
    const saltRounds = 12
    const adminPassword = await bcrypt.hash('admin123', saltRounds)
    const supervisorPassword = await bcrypt.hash('supervisor123', saltRounds)
    const sprayerPassword = await bcrypt.hash('sprayer123', saltRounds)

    // Get or create actor types
    let sprayerActorType = await prisma.actorType.findFirst({
      where: { name: 'Sprayer' }
    })

    if (!sprayerActorType) {
      sprayerActorType = await prisma.actorType.create({
        data: {
          name: 'Sprayer',
          isActive: true
        }
      })
    }

    let brigadeChiefActorType = await prisma.actorType.findFirst({
      where: { name: 'Brigade Chief' }
    })

    if (!brigadeChiefActorType) {
      brigadeChiefActorType = await prisma.actorType.create({
        data: {
          name: 'Brigade Chief',
          isActive: true
        }
      })
    }

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@spray.pt' },
      update: {
        password: adminPassword,
        role: 'admin',
        isActive: true
      },
      create: {
        name: 'Administrador Sistema',
        email: 'admin@spray.pt',
        password: adminPassword,
        role: 'admin',
        isActive: true,
      }
    })

    console.log('✅ Admin user created/updated:', adminUser.email)

    // Create supervisor user
    const supervisorUser = await prisma.user.upsert({
      where: { email: 'supervisor@spray.pt' },
      update: {
        password: supervisorPassword,
        role: 'supervisor',
        isActive: true
      },
      create: {
        name: 'Supervisor Geral',
        email: 'supervisor@spray.pt',
        password: supervisorPassword,
        role: 'supervisor',
        isActive: true,
        number: 'SUP-001',
        actorTypeId: brigadeChiefActorType.id
      }
    })

    console.log('✅ Supervisor user created/updated:', supervisorUser.email)

    // Create sprayer user
    const sprayerUser = await prisma.user.upsert({
      where: { email: 'sprayer@spray.pt' },
      update: {
        password: sprayerPassword,
        role: 'sprayer',
        isActive: true
      },
      create: {
        name: 'Pulverizador Teste',
        email: 'sprayer@spray.pt',
        password: sprayerPassword,
        role: 'sprayer',
        isActive: true,
        number: 'SPR-001',
        actorTypeId: sprayerActorType.id
      }
    })

    console.log('✅ Sprayer user created/updated:', sprayerUser.email)

    console.log('\n🎉 All admin users created successfully!')
    console.log('\n📋 Login credentials:')
    console.log('👤 Admin: admin@spray.pt / admin123')
    console.log('👤 Supervisor: supervisor@spray.pt / supervisor123') 
    console.log('👤 Sprayer: sprayer@spray.pt / sprayer123')

  } catch (error) {
    console.error('❌ Error creating admin users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUsers()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })