import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const approvalSchema = z.object({
  type: z.enum(["internal", "brand", "checklist"]),
  status: z.enum(["approved", "rejected", "pending"]).optional(),
  notes: z.string().optional(),
  checklist: z.object({
    checkBriefComplete: z.boolean().optional(),
    checkObjectiveMatch: z.boolean().optional(),
    checkMandatoryElements: z.boolean().optional(),
    checkSizeFormat: z.boolean().optional(),
    checkCopyChecked: z.boolean().optional(),
    checkBrandGuideline: z.boolean().optional(),
  }).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = approvalSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 })

  const { type, status, notes, checklist } = parsed.data

  // Permission check
  if (type === "internal" && !["manager", "spv"].includes(session.user.role)) {
    return NextResponse.json({ error: "Only Manager/SPV can approve internally" }, { status: 403 })
  }
  if (type === "brand" && !["brand", "manager"].includes(session.user.role)) {
    return NextResponse.json({ error: "Only Brand team can approve" }, { status: 403 })
  }

  let updateData: Record<string, unknown> = {}

  if (type === "internal" && status) {
    updateData = {
      internalApprovalStatus: status,
      internalApprovedBy: session.user.id,
      internalApprovedAt: new Date(),
      approvalNotes: notes,
    }
  } else if (type === "brand" && status) {
    updateData = {
      brandApprovalStatus: status,
      brandApprovedBy: session.user.id,
      brandApprovedAt: new Date(),
      approvalNotes: notes,
    }
  } else if (type === "checklist" && checklist) {
    updateData = checklist
  }

  const approval = await prisma.approval.upsert({
    where: { projectId: params.id },
    update: { ...updateData, updatedAt: new Date() },
    create: { projectId: params.id, ...updateData },
  })

  // Auto-set final approval if both approved
  const fresh = await prisma.approval.findUnique({ where: { projectId: params.id } })
  if (fresh?.internalApprovalStatus === "approved" && fresh?.brandApprovalStatus === "approved") {
    await prisma.approval.update({
      where: { projectId: params.id },
      data: { finalApprovalStatus: "approved" },
    })
    await prisma.project.update({
      where: { id: params.id },
      data: {
        approvalStatus: "approved",
        currentStatus: "approved",
        syncStatus: "pending",
      },
    })
  }

  // If brand rejected, set to revision
  if (type === "brand" && status === "rejected") {
    await prisma.project.update({
      where: { id: params.id },
      data: {
        currentStatus: "revision",
        revisionRound: { increment: 1 },
        syncStatus: "pending",
      },
    })
  }

  await prisma.activityLog.create({
    data: {
      projectId: params.id,
      userId: session.user.id,
      actionType: `${type}_approval_${status || "checklist_updated"}`,
      notes: notes || `Approval ${type} ${status}`,
    },
  })

  return NextResponse.json(approval)
}
