import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists, skipping seed...');
      return;
    }

    // Clean existing data (only if fresh database)
    console.log('Cleaning database...');
    await prisma.log.deleteMany();
    await prisma.flight.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });
    console.log('✓ Admin user created');

    // Create demo user
    const userPassword = await bcrypt.hash('user123', 10);
    const demoUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: userPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'USER',
      },
    });
    console.log('✓ Demo user created');

    // Create team
    const team = await prisma.team.create({
      data: {
        name: 'Flight Operations',
        description: 'Main flight operations team',
        userId: admin.id,
      },
    });
    console.log('✓ Team created');

    // Add team member
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        memberId: demoUser.id,
        role: 'MEMBER',
      },
    });
    console.log('✓ Team member added');

    // Create sample flights
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const flight1 = await prisma.flight.create({
      data: {
        flightNumber: 'FLY-001',
        departure: 'SGN',
        arrival: 'HAN',
        departureTime: tomorrow,
        arrivalTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        userId: demoUser.id,
      },
    });
    console.log('✓ Flight 1 created');

    const flight2 = await prisma.flight.create({
      data: {
        flightNumber: 'FLY-002',
        departure: 'HAN',
        arrival: 'DAD',
        departureTime: tomorrow,
        arrivalTime: new Date(tomorrow.getTime() + 1.5 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        userId: demoUser.id,
      },
    });
    console.log('✓ Flight 2 created');

    // Create sample logs
    await prisma.log.create({
      data: {
        action: 'LOGIN',
        description: 'User logged in successfully',
        userId: demoUser.id,
        metadata: {
          ip: '127.0.0.1',
          userAgent: 'Chrome',
        },
      },
    });
    console.log('✓ Sample log created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('  Admin:');
    console.log('    Email: admin@example.com');
    console.log('    Password: admin123');
    console.log('  User:');
    console.log('    Email: user@example.com');
    console.log('    Password: user123');
  } catch (error) {
    console.error('❌ Seed script failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

main()
  .then(async () => {
    console.log('✅ Disconnecting from database...');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Fatal error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
