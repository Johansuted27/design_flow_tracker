import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { formatDate, cn, PRIORITY_CONFIG } from "@/lib/utils"
import { CalendarDays } from "lucide-react"
import Link from "next/link"

export const metadata = { title: "Calendar" }
export const dynamic = "force-dynamic"

export default async function CalendarPage() {
  const session = await auth()
  if (!session) return null

  const where = session.user.role === "designer"
    ? { OR: [{ picDesignerId: session.user.id }, { supportDesignerId: session.user.id }] }
    : session.user.role === "brand" ? { requesterId: session.user.id } : {}

  const projects = await prisma.project.findMany({
    where: { ...where, currentStatus: { notIn: ["completed", "cancelled"] } },
    orderBy: { finalDeadline: "asc" },
    include: { picDesigner: { select: { name: true } } },
  })

  const now = new Date()
  const grouped: Record<string, typeof projects> = {}

  projects.forEach(p => {
    const key = formatDate(p.finalDeadline)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Calendar</h1>
        <p className="text-sm text-slate-500 mt-0.5">Deadline timeline semua project aktif</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <CalendarDays size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500">Tidak ada deadline mendatang</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, ps]) => {
            const d = new Date(ps[0].finalDeadline)
            const isPast = d < now
            const isToday = formatDate(now) === date
            return (
              <div key={date}>
                <div className={cn("flex items-center gap-3 mb-2", isPast && "opacity-60")}>
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", isToday ? "bg-red-500 animate-pulse" : isPast ? "bg-slate-300" : "bg-navy-800")} />
                  <span className={cn("text-sm font-semibold", isToday ? "text-red-600" : "text-slate-700")}>
                    {isToday ? "🔴 " : ""}{date}
                    {isToday && " — HARI INI"}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid gap-2 pl-5">
                  {ps.map(p => {
                    const pc = PRIORITY_CONFIG[p.priority as keyof typeof PRIORITY_CONFIG]
                    return (
                      <Link key={p.id} href={`/projects/${p.id}`}>
                        <div className={cn("flex items-center gap-4 p-3 rounded-xl border hover:shadow-sm transition-all bg-white", isPast ? "border-red-100 bg-red-50/50" : "border-slate-100")}>
                          <div className={cn("w-1.5 h-8 rounded-full flex-shrink-0", pc?.dot)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{p.projectName}</p>
                            <p className="text-xs text-slate-500">{p.brand} · {p.projectType}</p>
                          </div>
                          {p.picDesigner && <span className="text-xs text-slate-400 flex-shrink-0">{p.picDesigner.name?.split(" ")[0]}</span>}
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", pc?.color)}>{pc?.label}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
