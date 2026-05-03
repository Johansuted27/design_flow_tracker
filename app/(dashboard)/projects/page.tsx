import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { ProjectsClient } from "@/components/projects/projects-client"

export const metadata = { title: "Project List" }
export const dynamic = "force-dynamic"

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string; priority?: string; designer?: string; brand?: string; overdue?: string }
}) {
  const session = await auth()
  if (!session) return null
  const user = session.user

  const where: Record<string, unknown> = {}

  if (user.role === "designer") {
    where.OR = [{ picDesignerId: user.id }, { supportDesignerId: user.id }]
  } else if (user.role === "brand") {
    where.requesterId = user.id
  }

  if (searchParams.status) where.currentStatus = searchParams.status
  if (searchParams.priority) where.priority = searchParams.priority
  if (searchParams.designer) where.picDesignerId = searchParams.designer
  if (searchParams.brand) where.brand = searchParams.brand
  if (searchParams.overdue === "1") where.delayStatus = "overdue"

  const [projects, designers, allBrands] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        picDesigner: { select: { id: true, name: true, image: true, role: true } },
        supportDesigner: { select: { id: true, name: true } },
        requester: { select: { id: true, name: true } },
        _count: { select: { feedback: true } },
      },
      orderBy: [
        { priority: "asc" },
        { delayStatus: "asc" },
        { finalDeadline: "asc" },
      ],
    }),
    prisma.user.findMany({
      where: { role: { in: ["designer", "spv"] }, activeStatus: true },
      select: { id: true, name: true, image: true },
    }),
    prisma.project.findMany({
      select: { brand: true },
      distinct: ["brand"],
    }),
  ])

  return (
    <ProjectsClient
      projects={JSON.parse(JSON.stringify(projects))}
      designers={designers}
      brands={allBrands.map(b => b.brand)}
      userRole={user.role}
      userId={user.id}
    />
  )
}
