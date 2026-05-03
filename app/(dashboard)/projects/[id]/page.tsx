import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { ProjectDetailClient } from "@/components/projects/project-detail-client"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { projectName: true, brand: true },
  })
  return { title: project ? `${project.projectName} — ${project.brand}` : "Project Detail" }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return null
  const user = session.user

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      picDesigner: { select: { id: true, name: true, email: true, image: true, role: true } },
      supportDesigner: { select: { id: true, name: true, image: true } },
      requester: { select: { id: true, name: true, email: true, image: true } },
      lastUpdatedBy: { select: { id: true, name: true } },
      approval: {
        include: {
          internalApprover: { select: { name: true } },
          brandApprover: { select: { name: true } },
        },
      },
      feedback: {
        include: { user: { select: { name: true, image: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
      files: {
        include: { uploader: { select: { name: true } } },
        orderBy: { uploadedAt: "desc" },
      },
      activityLogs: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      syncLogs: {
        orderBy: { syncedAt: "desc" },
        take: 10,
      },
    },
  })

  if (!project) notFound()

  // Access check for designer/brand roles
  if (user.role === "designer") {
    if (project.picDesignerId !== user.id && project.supportDesignerId !== user.id) {
      notFound()
    }
  }
  if (user.role === "brand" && project.requesterId !== user.id) {
    notFound()
  }

  const designers = await prisma.user.findMany({
    where: { role: { in: ["designer", "spv"] }, activeStatus: true },
    select: { id: true, name: true, image: true },
  })

  return (
    <ProjectDetailClient
      project={JSON.parse(JSON.stringify(project))}
      designers={designers}
      user={user}
    />
  )
}
