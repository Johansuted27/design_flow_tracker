import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay())

  const where = session.user.role === "designer"
    ? { OR: [{ picDesignerId: session.user.id }, { supportDesignerId: session.user.id }] }
    : session.user.role === "brand"
    ? { requesterId: session.user.id }
    : {}

  const [total, byStatus, overdue, atRisk, completedMonth, completedWeek] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.groupBy({ by: ["currentStatus"], where, _count: true }),
    prisma.project.count({ where: { ...where, delayStatus: "overdue" } }),
    prisma.project.count({ where: { ...where, delayStatus: "at_risk" } }),
    prisma.project.count({ where: { ...where, currentStatus: "completed", completedDate: { gte: startOfMonth } } }),
    prisma.project.count({ where: { ...where, currentStatus: "completed", completedDate: { gte: startOfWeek } } }),
  ])

  return NextResponse.json({
    total, overdue, atRisk, completedMonth, completedWeek,
    byStatus: Object.fromEntries(byStatus.map(s => [s.currentStatus, s._count])),
  })
}
