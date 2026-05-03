import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { KPIClient } from "@/components/kpi/kpi-client"
import { redirect } from "next/navigation"

export const metadata = { title: "KPI Report" }
export const dynamic = "force-dynamic"

export default async function KPIPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === "brand") redirect("/dashboard")

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [kpiRecords, designers, mappings] = await Promise.all([
    prisma.kPI.findMany({
      where: {
        periodYear: currentYear,
        ...(session.user.role === "designer" ? { designerId: session.user.id } : {}),
      },
      include: {
        designer: { select: { id: true, name: true, image: true, email: true } },
      },
      orderBy: [{ periodMonth: "desc" }, { weightedKpiScore: "desc" }],
    }),
    prisma.user.findMany({
      where: { role: { in: ["designer", "spv"] }, activeStatus: true },
      select: { id: true, name: true, image: true },
    }),
    prisma.kPIMapping.findMany({ where: { active: true }, orderBy: { bobotScore: "desc" } }),
  ])

  return (
    <KPIClient
      kpiRecords={JSON.parse(JSON.stringify(kpiRecords))}
      designers={designers}
      mappings={JSON.parse(JSON.stringify(mappings))}
      userRole={session.user.role}
      currentMonth={currentMonth}
      currentYear={currentYear}
    />
  )
}
