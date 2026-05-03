import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      picDesigner: true,
      supportDesigner: true,
      requester: true,
      approval: { include: { internalApprover: true, brandApprover: true } },
      feedback: { include: { user: true }, orderBy: { createdAt: "desc" } },
      files: { include: { uploader: true }, orderBy: { uploadedAt: "desc" } },
      activityLogs: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 30 },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Access check
  if (session.user.role === "designer" && project.picDesignerId !== session.user.id && project.supportDesignerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (session.user.role === "brand" && project.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(project)
}

const updateSchema = z.object({
  currentStatus: z.string().optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  picDesignerId: z.string().optional().nullable(),
  supportDesignerId: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  firstDraftDeadline: z.string().optional().nullable(),
  finalDeadline: z.string().optional(),
  notes: z.string().optional(),
  workingFileLink: z.string().optional().nullable(),
  previewFileLink: z.string().optional().nullable(),
  finalArtworkLink: z.string().optional().nullable(),
  assetFolderLink: z.string().optional().nullable(),
  trelloCardId: z.string().optional(),
  trelloCardUrl: z.string().optional(),
  driveFolderUrl: z.string().optional(),
}).passthrough()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 })

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    lastUpdatedById: session.user.id,
    syncStatus: "pending",
    updatedAt: new Date(),
  }

  // Handle date fields
  if (parsed.data.finalDeadline) updateData.finalDeadline = new Date(parsed.data.finalDeadline)
  if (parsed.data.firstDraftDeadline) updateData.firstDraftDeadline = new Date(parsed.data.firstDraftDeadline)
  if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate)

  // Auto-set completed date
  if (parsed.data.currentStatus === "completed" && !project.completedDate) {
    updateData.completedDate = new Date()
  }

  // Auto-compute delay status
  if (parsed.data.finalDeadline || parsed.data.currentStatus) {
    const deadline = parsed.data.finalDeadline ? new Date(parsed.data.finalDeadline) : project.finalDeadline
    const status = (parsed.data.currentStatus || project.currentStatus) as string
    const terminal = ["completed", "cancelled", "approved", "final_artwork"]
    if (!terminal.includes(status)) {
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / 86400000)
      updateData.delayStatus = daysUntil < 0 ? "overdue" : daysUntil <= 2 ? "at_risk" : "on_track"
    } else {
      updateData.delayStatus = "on_track"
    }
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: updateData as never,
  })

  // Log activity
  const changedFields = Object.keys(parsed.data).filter(k => (parsed.data as Record<string, unknown>)[k] !== undefined)
  if (changedFields.length > 0) {
    await prisma.activityLog.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        actionType: "project_updated",
        notes: `Field diupdate: ${changedFields.join(", ")}`,
      },
    })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "manager") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await prisma.project.update({
    where: { id: params.id },
    data: { currentStatus: "cancelled" },
  })

  await prisma.activityLog.create({
    data: {
      projectId: params.id,
      userId: session.user.id,
      actionType: "project_cancelled",
      notes: "Project dibatalkan oleh Manager",
    },
  })

  return NextResponse.json({ success: true })
}
