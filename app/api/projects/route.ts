import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { generateProjectId } from "@/lib/utils"

const createProjectSchema = z.object({
  requesterName: z.string().min(1),
  requesterEmail: z.string().email(),
  brand: z.string().min(1),
  projectName: z.string().min(1).max(200),
  projectType: z.string().min(1),
  objective: z.string().min(1),
  deliverables: z.string().min(1),
  sizeFormat: z.string().optional(),
  keyMessage: z.string().optional(),
  mandatoryElements: z.string().optional(),
  referenceLink: z.string().url().optional().or(z.literal("")),
  attachmentLink: z.string().url().optional().or(z.literal("")),
  firstDraftDeadline: z.string().optional(),
  finalDeadline: z.string(),
  priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
  brandPriority: z.number().min(1).max(5).default(3),
  approvalPIC: z.string().optional(),
  additionalNotes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const designer = searchParams.get("designer")
  const brand = searchParams.get("brand")

  const where: Record<string, unknown> = {}

  if (session.user.role === "designer") {
    where.OR = [{ picDesignerId: session.user.id }, { supportDesignerId: session.user.id }]
  } else if (session.user.role === "brand") {
    where.requesterId = session.user.id
  }

  if (status) where.currentStatus = status
  if (priority) where.priority = priority
  if (designer) where.picDesignerId = designer
  if (brand) where.brand = brand

  const projects = await prisma.project.findMany({
    where,
    include: {
      picDesigner: { select: { id: true, name: true, image: true } },
      requester: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: "asc" }, { finalDeadline: "asc" }],
  })

  return NextResponse.json(projects)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!["manager", "brand"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data

  // Check required fields for brief completeness
  const requiredFields = [data.brand, data.projectName, data.projectType, data.objective, data.deliverables, data.finalDeadline]
  const isComplete = requiredFields.every(f => f && f.trim().length > 0)

  // Generate project ID
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const prefix = `DF-${year}${String(month).padStart(2, "0")}`

  const lastProject = await prisma.project.findFirst({
    where: { id: { startsWith: prefix } },
    orderBy: { id: "desc" },
  })

  let seq = 1
  if (lastProject) {
    const parts = lastProject.id.split("-")
    seq = parseInt(parts[2]) + 1
  }

  const projectId = generateProjectId(month, year, seq)

  // Determine complexity from project type
  const complexityMap: Record<string, { level: string; score: number }> = {
    "Packaging": { level: "major", score: 4 },
    "Key Visual": { level: "complex", score: 3 },
    "TVC/Video": { level: "major", score: 4 },
    "Animation/Motion": { level: "complex", score: 3 },
    "Annual Report": { level: "major", score: 4 },
    "Brochure/Catalog": { level: "complex", score: 3 },
    "Social Media Post": { level: "simple", score: 1 },
    "Flyer/Leaflet": { level: "simple", score: 1 },
    "Banner Digital": { level: "medium", score: 2 },
    "Label": { level: "medium", score: 2 },
    "POSM": { level: "medium", score: 2 },
  }
  const complexity = complexityMap[data.projectType] || { level: "medium", score: 2 }

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } })

  const project = await prisma.project.create({
    data: {
      id: projectId,
      requestDate: now,
      requesterId: session.user.id,
      brand: data.brand,
      projectName: data.projectName,
      projectType: data.projectType,
      objective: data.objective,
      deliverables: data.deliverables,
      sizeFormat: data.sizeFormat || null,
      keyMessage: data.keyMessage || null,
      mandatoryElements: data.mandatoryElements || null,
      referenceLink: data.referenceLink || null,
      attachmentLink: data.attachmentLink || null,
      firstDraftDeadline: data.firstDraftDeadline ? new Date(data.firstDraftDeadline) : null,
      finalDeadline: new Date(data.finalDeadline),
      priority: data.priority as never,
      brandPriority: data.brandPriority,
      complexityLevel: complexity.level as never,
      complexityScore: complexity.score,
      workloadScore: complexity.score,
      currentStatus: isComplete ? "brief_received" : "need_brief_completion",
      notes: data.additionalNotes || null,
      lastUpdatedById: session.user.id,
      syncStatus: "pending",
    },
  })

  // Create approval record
  await prisma.approval.create({
    data: {
      projectId: project.id,
      checkBriefComplete: isComplete,
    },
  })

  // Log activity
  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      actionType: "brief_submitted",
      notes: `Brief diajukan oleh ${requester?.name || session.user.name}`,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
