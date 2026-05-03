import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/shared/badges"
import { formatDate, getDaysUntil, cn } from "@/lib/utils"
import { CheckSquare } from "lucide-react"

export const metadata = { title: "My Tasks" }
export const dynamic = "force-dynamic"

export default async function TasksPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role === "brand") redirect("/dashboard")

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ picDesignerId: session.user.id }, { supportDesignerId: session.user.id }],
      currentStatus: { notIn: ["completed", "cancelled"] },
    },
    include: {
      requester: { select: { name: true } },
      _count: { select: { feedback: true } },
    },
    orderBy: [{ priority: "asc" }, { finalDeadline: "asc" }],
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">My Tasks</h1>
        <p className="text-sm text-slate-500 mt-0.5">{projects.length} project aktif yang ditugaskan ke Anda</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <CheckSquare size={48} className="text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-slate-700">Semua task selesai!</p>
          <p className="text-sm text-slate-400 mt-1">Tidak ada project aktif yang ditugaskan ke Anda saat ini.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map(p => {
            const days = getDaysUntil(p.finalDeadline)
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-slate-400">{p.id}</span>
                        <PriorityBadge priority={p.priority} />
                      </div>
                      <h3 className="text-sm font-semibold text-navy-800 truncate">{p.projectName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{p.brand} · {p.projectType} · dari {p.requester?.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <StatusBadge status={p.currentStatus} />
                      <DelayBadge status={p.delayStatus} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Rev {p.revisionRound}</span>
                      {p._count.feedback > 0 && <span>💬 {p._count.feedback} feedback</span>}
                    </div>
                    <span className={cn("text-xs font-medium", days < 0 ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-slate-500")}>
                      Deadline: {formatDate(p.finalDeadline)} {days < 0 ? `(${Math.abs(days)} hari lewat)` : days <= 7 ? `(${days} hari lagi)` : ""}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
