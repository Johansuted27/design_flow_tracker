import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const feedbackSchema = z.object({
  category: z.enum(["layout", "copy", "branding", "image", "technical", "other"]),
  note: z.string().min(1),
  action: z.enum(["feedback", "reject"]).default("feedback"),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 })

  const feedback = await prisma.feedback.create({
    data: {
      projectId: params.id,
      feedbackBy: session.user.id,
      feedbackRole: session.user.role,
      category: parsed.data.category,
      note: parsed.data.note,
      revisionRound: project.revisionRound,
    },
  })

  // If action is reject, increment revision round and change status
  if (parsed.data.action === "reject") {
    await prisma.project.update({
      where: { id: params.id },
      data: {
        revisionRound: { increment: 1 },
        currentStatus: "revision",
        lastUpdatedById: session.user.id,
        syncStatus: "pending",
      },
    })

    await prisma.activityLog.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        actionType: "revision_requested",
        notes: `Revisi diminta: ${parsed.data.note.substring(0, 100)}`,
      },
    })
  } else {
    await prisma.activityLog.create({
      data: {
        projectId: params.id,
        userId: session.user.id,
        actionType: "feedback_added",
        notes: `Feedback [${parsed.data.category}]: ${parsed.data.note.substring(0, 100)}`,
      },
    })
  }

  return NextResponse.json(feedback, { status: 201 })
}
