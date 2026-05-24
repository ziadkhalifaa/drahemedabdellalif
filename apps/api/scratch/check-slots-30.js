const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dateStr = '2026-05-30';
  const clinicId = 'clinic-october'; // 6th of October Clinic
  
  console.log(`=== CHECKING SLOTS FOR ${clinicId} ON ${dateStr} ===`);
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  console.log(`Day of week (UTC): ${dayOfWeek} (0=Sun, 6=Sat)`);

  // 1. Working Hours
  const workingHours = await prisma.clinicWorkingHours.findUnique({
    where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } }
  });
  console.log('Working hours:', JSON.stringify(workingHours, null, 2));

  if (!workingHours) {
    console.log('❌ No working hours defined for this day!');
  } else if (!workingHours.isActive) {
    console.log('❌ Working hours are inactive for this day!');
  }

  // 2. Booked Appointments
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
  console.log(`Query range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ['rejected', 'cancelled'] },
    }
  });
  console.log(`Booked appointments (${bookedAppointments.length}):`, JSON.stringify(bookedAppointments, null, 2));

  // 3. Blocked Slots
  const blockedSlots = await prisma.clinicBlockedSlot.findMany({
    where: {
      clinicId,
      date: { gte: startOfDay, lte: endOfDay }
    }
  });
  console.log(`Blocked slots (${blockedSlots.length}):`, JSON.stringify(blockedSlots, null, 2));

  // 4. Let's see if there are any appointments at all in the system to verify connection
  const totalApps = await prisma.appointment.count();
  console.log(`Total appointments in DB: ${totalApps}`);

  // 5. Let's also check if there are appointments on other dates or general clinics list
  const clinics = await prisma.clinic.findMany();
  console.log('Clinics list in DB:', clinics.map(c => c.id));

  await prisma.$disconnect();
}

main().catch(console.error);
