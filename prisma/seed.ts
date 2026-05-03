const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  console.log('🌱 Seeding...')
  const manager = await prisma.user.upsert({ where: { email: 'rahmat@company.com' }, update: {}, create: { name: 'Rahmat Hidayat', email: 'rahmat@company.com', role: 'manager', department: 'Design Team' } })
  const lisa = await prisma.user.upsert({ where: { email: 'lisa@company.com' }, update: {}, create: { name: 'Lisa Santoso', email: 'lisa@company.com', role: 'brand', department: 'Marketing' } })
  const designer1 = await prisma.user.upsert({ where: { email: 'andi@company.com' }, update: {}, create: { name: 'Andi Sutrisno', email: 'andi@company.com', role: 'designer', department: 'Design Team' } })
  const now = new Date()
  const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)
  await prisma.project.upsert({ where: { id: 'DF-202506-0001' }, update: {}, create: { id: 'DF-202506-0001', requestDate: now, requesterId: lisa.id, brand: 'Indomilk', projectName: 'Packaging Rebranding Full Cream 1L', projectType: 'Packaging', objective: 'Redesign packaging Indomilk', deliverables: 'Mockup 3D, print-ready artwork', finalDeadline: addDays(now, 8), priority: 'high', brandPriority: 1, complexityLevel: 'major', complexityScore: 4, picDesignerId: designer1.id, currentStatus: 'in_progress', delayStatus: 'on_track', revisionRound: 0, workloadScore: 4 } })
  await prisma.approval.upsert({ where: { projectId: 'DF-202506-0001' }, update: {}, create: { projectId: 'DF-202506-0001', internalApprovalStatus: 'pending', brandApprovalStatus: 'pending', finalApprovalStatus: 'pending' } })
  console.log('🎉 Seeding complete!')
}
main().catch(console.error).finally(() => prisma.$disconnect())
