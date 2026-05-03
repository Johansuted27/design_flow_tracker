import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { computeDelayStatus } from "@/lib/utils"

export const metadata = { title: "Dashboard" }
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const user = session.user
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Role-based project filter
  const projectWhere =
    user.role === "designer"
      ? { OR: [{ picDesignerId: user.id }, { supportDesignerId: user.id }] }
      : user.role === "brand"
      ? { requesterId: user.id }
      : {}

  const [
    projects,
    designerWorkloads,
    completedThisMonth,
    kpiRecords,
  ] = await Promise.all([
    prisma.project.findMany({
      where: projectWhere,
      include: {
        picDesigner: { select: { id: true, name: true, image: true } },
        requester: { select: { id: true, name: true } },
      },
      orderBy: [
        { priority: "asc" },
        { finalDeadline: "asc" },
      ],
    }),

    // Workload per designer
    prisma.user.findMany({
      where: { role: { in: ["designer", "spv"] }, activeStatus: true },
      include: {
        projectsAsPIC: {
          where: { currentStatus: { notIn: ["completed", "cancelled", "on_hold"] } },
          select: { complexityScore: true, priority: true, currentStatus: true },
        },
      },
    }),

    // Completed this month
    prisma.project.count({
      where: {
        ...projectWhere,
        currentStatus: "completed",
        completedDate: { gte: startOfMonth },
      },
    }),

    // KPI for current month
    user.role !== "brand"
      ? prisma.kPI.findMany({
          where: {
            periodMonth: now.getMonth() + 1,
            periodYear: now.getFullYear(),
            ...(user.role === "designer" ? { designerId: user.id } : {}),
          },
          include: { designer: { select: { name: true, image: true } } },
        })
      : [],
  ])

  // Update delay status for active projects
  const stats = {
    total: projects.length,
    urgent: projects.filter(p => p.priority === "urgent").length,
    inProgress: projects.filter(p => p.currentStatus === "in_progress").length,
    inReview: projects.filter(p => p.currentStatus === "internal_review").length,
    revision: projects.filter(p => p.currentStatus === "revision").length,
    waitingApproval: projects.filter(p => p.currentStatus === "waiting_brand_approval").length,
    overdue: projects.filter(p => computeDelayStatus(p.finalDeadline, p.currentStatus) === "overdue").length,
    atRisk: projects.filter(p => computeDelayStatus(p.finalDeadline, p.currentStatus) === "at_risk").length,
    briefReceived: projects.filter(p => p.currentStatus === "brief_received" || p.currentStatus === "need_brief_completion").length,
    completed: projects.filter(p => p.currentStatus === "completed").length,
    completedThisMonth,
  }

  const workloads = designerWorkloads.map(d => ({
    id: d.id,
    name: d.name,
    image: d.image,
    role: d.role,
    score: d.projectsAsPIC.reduce((sum, p) => sum + p.complexityScore, 0),
    activeCount: d.projectsAsPIC.length,
    urgentCount: d.projectsAsPIC.filter(p => p.priority === "urgent").length,
  }))

  // Status distribution for chart
  const statusDist = [
    { name: "Brief Received", value: stats.briefReceived, color: "#94A3B8" },
    { name: "In Progress", value: stats.inProgress, color: "#4F46E5" },
    { name: "Review", value: stats.inReview, color: "#7C3AED" },
    { name: "Revision", value: stats.revision, color: "#F59E0B" },
    { name: "Waiting", value: stats.waitingApproval, color: "#EAB308" },
    { name: "Completed", value: stats.completed, color: "#10B981" },
  ].filter(s => s.value > 0)

  // Priority distribution
  const priorityDist = [
    { name: "Urgent", value: projects.filter(p => p.priority === "urgent").length, color: "#EF4444" },
    { name: "High", value: projects.filter(p => p.priority === "high").length, color: "#F97316" },
    { name: "Medium", value: projects.filter(p => p.priority === "medium").length, color: "#3B82F6" },
    { name: "Low", value: projects.filter(p => p.priority === "low").length, color: "#6B7280" },
  ].filter(p => p.value > 0)

  return (
    <DashboardClient
      stats={stats}
      projects={JSON.parse(JSON.stringify(projects))}
      workloads={workloads}
      statusDist={statusDist}
      priorityDist={priorityDist}
      kpiRecords={JSON.parse(JSON.stringify(kpiRecords))}
      userRole={user.role}
    />
  )
}
