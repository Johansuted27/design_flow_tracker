import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { StatusBadge, PriorityBadge } from "@/components/shared/badges"
import { formatDate } from "@/lib/utils"
import { ClipboardCheck } from "lucide-react"

export const metadata = { title: "Review & Approval" }
export const dynamic = "force-dynamic"

export default async function ReviewPage() {
  const session = await auth()
  if (!session) return null

  const where = session.user.role === "brand"
    ? { currentStatus: "waiting_brand_approval", requesterId: session.user.id }
    : { currentStatus: { in: ["internal_review", "waiting_brand_approval"] } }

  const projects = await prisma.project.findMany({
    where,
    include: {
      picDesigner: { select: { name: true, image: true } },
      requester: { select: { name: true } },
      approval: true,
      _count: { select: { feedback: true } },
    },
    orderBy: [{ priority: "asc" }, { finalDeadline: "asc" }],
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Review & Approval</h1>
        <p className="text-sm text-slate-500 mt-0.5">{projects.length} project menunggu review/approval</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <ClipboardCheck size={48} className="text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700">Tidak ada yang perlu di-review</p>
          <p className="text-sm text-slate-400 mt-1">Semua project sudah di-review atau belum siap untuk review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <Link key={p.id} href={`/projects/${p.id}#approval`}>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">{p.id}</span>
                      <PriorityBadge priority={p.priority} />
                    </div>
                    <h3 className="text-sm font-semibold text-navy-800">{p.projectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.brand} · deadline {formatDate(p.finalDeadline)}</p>
                  </div>
                  <StatusBadge status={p.currentStatus} />
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {p.picDesigner && (
                      <div className="flex items-center gap-1.5">
                        {p.picDesigner.image ? <img src={p.picDesigner.image} alt="" className="w-5 h-5 rounded-full" /> : null}
                        {p.picDesigner.name}
                      </div>
                    )}
                    <span>💬 {p._count.feedback} feedback</span>
                    <span>Rev {p.revisionRound}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={p.approval?.internalApprovalStatus === "approved" ? "text-emerald-600" : "text-slate-400"}>
                      {p.approval?.internalApprovalStatus === "approved" ? "✓" : "○"} Internal
                    </span>
                    <span className={p.approval?.brandApprovalStatus === "approved" ? "text-emerald-600" : "text-slate-400"}>
                      {p.approval?.brandApprovalStatus === "approved" ? "✓" : "○"} Brand
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
