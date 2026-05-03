"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts"
import {
  AlertCircle, TrendingUp, Clock, CheckCircle2, RotateCcw,
  Users, Zap, FileWarning, FolderOpen, Target, ArrowRight,
} from "lucide-react"
import { cn, formatDate, getDaysUntil, getWorkloadStatus, STATUS_CONFIG } from "@/lib/utils"
import { StatusBadge, PriorityBadge, DelayBadge, WorkloadBadge } from "@/components/shared/badges"
import Link from "next/link"

interface DashboardClientProps {
  stats: {
    total: number; urgent: number; inProgress: number; inReview: number
    revision: number; waitingApproval: number; overdue: number; atRisk: number
    briefReceived: number; completed: number; completedThisMonth: number
  }
  projects: any[]
  workloads: any[]
  statusDist: { name: string; value: number; color: string }[]
  priorityDist: { name: string; value: number; color: string }[]
  kpiRecords: any[]
  userRole: string
}

const card = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.35, ease: "easeOut" },
})

export function DashboardClient({ stats, projects, workloads, statusDist, priorityDist, kpiRecords, userRole }: DashboardClientProps) {
  const urgentProjects = projects.filter(p => p.priority === "urgent")
  const overdueProjects = projects.filter(p => p.delayStatus === "overdue")
  const atRiskProjects = projects.filter(p => p.delayStatus === "at_risk" && p.delayStatus !== "overdue")
  const waitingLong = projects.filter(p => p.currentStatus === "waiting_brand_approval")
  const overloadedDesigners = workloads.filter(w => w.score > 9)

  const statCards = [
    { label: "Total Project Aktif", value: stats.total - stats.completed, icon: FolderOpen, color: "text-navy-800", bg: "bg-navy-50", href: "/projects" },
    { label: "Proyek Overdue", value: stats.overdue, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", href: "/projects?overdue=1", alert: stats.overdue > 0 },
    { label: "Menunggu Approval", value: stats.waitingApproval, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/review" },
    { label: "Selesai Bulan Ini", value: stats.completedThisMonth, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", href: "/projects" },
  ]

  const statusCards = [
    { label: "Brief Diterima", value: stats.briefReceived, color: "bg-slate-500" },
    { label: "Sedang Dikerjakan", value: stats.inProgress, color: "bg-indigo-500" },
    { label: "Review Internal", value: stats.inReview, color: "bg-purple-500" },
    { label: "Revisi", value: stats.revision, color: "bg-amber-500" },
    { label: "Menunggu Approval", value: stats.waitingApproval, color: "bg-yellow-500" },
    { label: "Urgent", value: stats.urgent, color: "bg-red-500" },
    { label: "At Risk", value: stats.atRisk, color: "bg-orange-500" },
    { label: "Selesai", value: stats.completed, color: "bg-emerald-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div {...card(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pantau semua project design secara real-time</p>
        </div>
        <div className="flex gap-2">
          <Link href="/brief" className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-lg hover:bg-navy-700 transition-colors">
            <span>+ Ajukan Brief</span>
          </Link>
        </div>
      </motion.div>

      {/* Alert banners */}
      {(overloadedDesigners.length > 0 || urgentProjects.length > 0) && (
        <motion.div {...card(0.05)} className="space-y-2">
          {urgentProjects.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <Zap size={16} className="flex-shrink-0" />
              <span className="font-medium">{urgentProjects.length} project URGENT</span>
              <span className="text-red-500">—</span>
              <span>{urgentProjects.map(p => p.projectName).join(", ")}</span>
            </div>
          )}
          {overloadedDesigners.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="font-medium">{overloadedDesigners.length} designer overloaded:</span>
              <span>{overloadedDesigners.map(d => d.name).join(", ")}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((sc, i) => (
          <motion.div key={sc.label} {...card(0.1 + i * 0.05)}>
            <Link href={sc.href}>
              <div className={cn("bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer", sc.alert && "border-red-200")}>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", sc.bg)}>
                    <sc.icon size={20} className={sc.color} />
                  </div>
                  {sc.alert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <div className="text-3xl font-bold text-navy-800">{sc.value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{sc.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Status breakdown */}
      <motion.div {...card(0.25)} className="bg-white rounded-2xl border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Status Breakdown</h2>
        <div className="grid grid-cols-4 gap-3">
          {statusCards.map(sc => (
            <div key={sc.label} className="text-center">
              <div className="text-2xl font-bold text-navy-800">{sc.value}</div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className={cn("w-2 h-2 rounded-full", sc.color)} />
                <span className="text-[11px] text-slate-500">{sc.label}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status pie chart */}
        <motion.div {...card(0.3)} className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribusi Status</h2>
          {statusDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusDist.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} project`, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">Belum ada data</div>
          )}
          <div className="space-y-1.5 mt-2">
            {statusDist.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-slate-600">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority bar chart */}
        <motion.div {...card(0.35)} className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Distribusi Prioritas</h2>
          {priorityDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={priorityDist} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">Belum ada data</div>
          )}
        </motion.div>

        {/* Workload summary */}
        <motion.div {...card(0.4)} className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Workload Designer</h2>
            <Link href="/workload" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {workloads.slice(0, 4).map(w => {
              const ws = getWorkloadStatus(w.score)
              const pct = Math.min((w.score / 12) * 100, 100)
              return (
                <div key={w.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {w.image ? (
                        <img src={w.image} alt={w.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-navy-800 flex items-center justify-center text-white text-[10px] font-bold">
                          {w.name?.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-700">{w.name?.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">{w.score} pts</span>
                      <WorkloadBadge score={w.score} />
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", w.score > 9 ? "bg-red-500" : w.score > 6 ? "bg-amber-500" : w.score > 3 ? "bg-blue-500" : "bg-emerald-500")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Alerts + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Overdue & at risk */}
        <motion.div {...card(0.45)} className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Perlu Perhatian</h2>
            <Link href="/projects?overdue=1" className="text-xs text-brand-500 hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-2">
            {[...overdueProjects, ...atRiskProjects].slice(0, 5).map(p => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.projectName}</p>
                    <p className="text-xs text-slate-500">{p.brand} · {p.picDesigner?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <DelayBadge status={p.delayStatus} />
                    <span className="text-xs text-slate-400">{formatDate(p.finalDeadline)}</span>
                  </div>
                </div>
              </Link>
            ))}
            {overdueProjects.length === 0 && atRiskProjects.length === 0 && (
              <div className="flex items-center gap-3 py-4 text-sm text-slate-400">
                <CheckCircle2 size={16} className="text-emerald-500" />
                Semua project on track!
              </div>
            )}
          </div>
        </motion.div>

        {/* KPI Summary */}
        <motion.div {...card(0.5)} className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">KPI Score — Bulan Ini</h2>
            <Link href="/kpi" className="text-xs text-brand-500 hover:underline">Laporan lengkap</Link>
          </div>
          <div className="space-y-3">
            {kpiRecords.slice(0, 4).map(k => (
              <div key={k.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {k.designer?.image ? (
                    <img src={k.designer.image} alt={k.designer.name} className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                      {k.designer?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-slate-800">{k.designer?.name?.split(" ")[0]}</p>
                    <p className="text-[10px] text-slate-400">{k.totalCompleted} selesai</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", k.weightedKpiScore >= 80 ? "bg-emerald-500" : k.weightedKpiScore >= 60 ? "bg-amber-500" : "bg-red-500")}
                      style={{ width: `${Math.min(k.weightedKpiScore, 100)}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-bold w-10 text-right", k.weightedKpiScore >= 80 ? "text-emerald-600" : k.weightedKpiScore >= 60 ? "text-amber-600" : "text-red-600")}>
                    {k.weightedKpiScore?.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {kpiRecords.length === 0 && (
              <p className="text-sm text-slate-400 py-4">Belum ada data KPI bulan ini</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
