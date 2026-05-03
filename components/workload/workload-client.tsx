"use client"
import { motion } from "framer-motion"
import { cn, formatDate, getDaysUntil, getWorkloadStatus, getWorkloadPercent } from "@/lib/utils"
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/shared/badges"
import { AlertTriangle, Users } from "lucide-react"
import Link from "next/link"

interface WorkloadClientProps {
  workloadData: any[]
}

export function WorkloadClient({ workloadData }: WorkloadClientProps) {
  const sorted = [...workloadData].sort((a, b) => b.totalScore - a.totalScore)
  const overloaded = sorted.filter(d => d.totalScore > 9)
  const totalProjects = workloadData.reduce((s, d) => s + d.projects.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Team Workload</h1>
        <p className="text-sm text-slate-500 mt-0.5">{workloadData.length} designer aktif · {totalProjects} project berjalan</p>
      </div>

      {overloaded.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <strong>{overloaded.length} designer overloaded:</strong>
          <span>{overloaded.map(d => d.name).join(", ")}</span>
        </div>
      )}

      {/* Workload overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sorted.map((d, i) => {
          const ws = getWorkloadStatus(d.totalScore)
          const pct = getWorkloadPercent(d.totalScore)
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-10 h-10 rounded-xl" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-white font-bold">{d.name?.charAt(0)}</div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.name?.split(" ")[0]}</p>
                  <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", ws.bg, ws.color)}>{ws.label}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{d.totalScore} complexity pts</span>
                  <span>{d.projects.length} projects</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", d.totalScore > 9 ? "bg-red-500" : d.totalScore > 6 ? "bg-amber-500" : d.totalScore > 3 ? "bg-blue-500" : "bg-emerald-500")}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-3 text-xs">
                  {d.urgentCount > 0 && <span className="text-red-600">⚡ {d.urgentCount} urgent</span>}
                  {d.overdueCount > 0 && <span className="text-red-500">⏰ {d.overdueCount} overdue</span>}
                  {d.atRiskCount > 0 && <span className="text-amber-600">⚠ {d.atRiskCount} at risk</span>}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Detailed project list per designer */}
      <div className="space-y-4">
        {sorted.map(d => (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-8 h-8 rounded-lg" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center text-white text-sm font-bold">{d.name?.charAt(0)}</div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{d.role} · {d.department || "Design Team"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{d.totalScore} pts total</span>
                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", getWorkloadStatus(d.totalScore).bg, getWorkloadStatus(d.totalScore).color)}>
                  {getWorkloadStatus(d.totalScore).label}
                </span>
              </div>
            </div>
            {d.projects.length > 0 ? (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Project</th>
                    <th className="text-left">Brand</th>
                    <th className="text-left">Prioritas</th>
                    <th className="text-left">Complexity</th>
                    <th className="text-left">Deadline</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {d.projects.map((p: any) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={`/projects/${p.id}`} className="text-sm font-medium text-navy-800 hover:text-brand-500 transition-colors line-clamp-1">
                          {p.projectName}
                        </Link>
                      </td>
                      <td className="text-sm text-slate-600">{p.brand}</td>
                      <td><PriorityBadge priority={p.priority} /></td>
                      <td><span className="text-xs text-slate-600 capitalize">{p.complexityLevel} ({p.complexityScore}pts)</span></td>
                      <td>
                        <span className={cn("text-sm", getDaysUntil(p.finalDeadline) < 0 ? "text-red-600 font-medium" : getDaysUntil(p.finalDeadline) <= 2 ? "text-amber-600" : "text-slate-700")}>
                          {formatDate(p.finalDeadline)}
                        </span>
                      </td>
                      <td><StatusBadge status={p.currentStatus} /></td>
                      <td><DelayBadge status={p.delayStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-400">
                <Users size={14} />
                Tidak ada project aktif — tersedia untuk assignment
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
