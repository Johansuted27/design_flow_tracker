import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { WorkloadClient } from "@/components/workload/workload-client"
import { redirect } from "next/navigation"

export const metadata = { title: "Team Workload" }
export const dynamic = "force-dynamic"

export default async function WorkloadPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === "brand" || session.user.role === "designer") redirect("/dashboard")

  const designers = await prisma.user.findMany({
    where: { role: { in: ["designer", "spv"] }, activeStatus: true },
    include: {
      projectsAsPIC: {
        where: { currentStatus: { notIn: ["completed", "cancelled", "on_hold"] } },
        select: {
          id: true, projectName: true, brand: true, priority: true,
          complexityLevel: true, complexityScore: true, finalDeadline: true,
          currentStatus: true, delayStatus: true,
        },
        orderBy: [{ priority: "asc" }, { finalDeadline: "asc" }],
      },
    },
  })

  const workloadData = designers.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    image: d.image,
    role: d.role,
    department: d.department,
    projects: d.projectsAsPIC,
    totalScore: d.projectsAsPIC.reduce((s, p) => s + p.complexityScore, 0),
    urgentCount: d.projectsAsPIC.filter(p => p.priority === "urgent").length,
    overdueCount: d.projectsAsPIC.filter(p => p.delayStatus === "overdue").length,
    atRiskCount: d.projectsAsPIC.filter(p => p.delayStatus === "at_risk").length,
  }))

  return <WorkloadClient workloadData={JSON.parse(JSON.stringify(workloadData))} />
}
