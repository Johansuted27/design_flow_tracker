"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts"
import { cn } from "@/lib/utils"
import { Target, TrendingUp, Award } from "lucide-react"

interface KPIClientProps {
  kpiRecords: any[]
  designers: any[]
  mappings: any[]
  userRole: string
  currentMonth: number
  currentYear: number
}

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

export function KPIClient({ kpiRecords, designers, mappings, userRole, currentMonth, currentYear }: KPIClientProps) {
  const [selectedDesigner, setSelectedDesigner] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  const filtered = kpiRecords.filter(r => {
    if (selectedDesigner && r.designerId !== selectedDesigner) return false
    return true
  })

  // Monthly trend for line chart
  const trendData = MONTHS.slice(0, currentMonth).map((m, i) => {
    const monthRecords = kpiRecords.filter(r => r.periodMonth === i + 1)
    const avg = monthRecords.length ? monthRecords.reduce((s, r) => s + r.weightedKpiScore, 0) / monthRecords.length : null
    return { month: m, avg: avg ? +avg.toFixed(1) : null, target: 80 }
  })

  // Current month summary
  const currentRecords = kpiRecords.filter(r => r.periodMonth === currentMonth)
  const avgScore = currentRecords.length
    ? (currentRecords.reduce((s, r) => s + r.weightedKpiScore, 0) / currentRecords.length).toFixed(1)
    : "—"
  const topPerformer = currentRecords.sort((a, b) => b.weightedKpiScore - a.weightedKpiScore)[0]
  const achievedTarget = currentRecords.filter(r => r.weightedKpiScore >= r.kpiTarget).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">KPI Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tahun {currentYear}</p>
        </div>
        <div className="flex gap-2">
          {userRole !== "designer" && (
            <select value={selectedDesigner} onChange={e => setSelectedDesigner(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none bg-white">
              <option value="">Semua Designer</option>
              {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg KPI Score Bulan Ini", value: avgScore, icon: Target, color: "text-navy-800", bg: "bg-navy-50", sub: `Target: 80` },
          { label: "Designer Capai Target", value: `${achievedTarget}/${currentRecords.length}`, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50", sub: "bulan ini" },
          { label: "Top Performer", value: topPerformer?.designer?.name?.split(" ")[0] || "—", icon: TrendingUp, color: "text-brand-500", bg: "bg-blue-50", sub: topPerformer ? `${topPerformer.weightedKpiScore?.toFixed(1)} pts` : "belum ada data" },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", c.bg)}>
              <c.icon size={20} className={c.color} />
            </div>
            <div className="text-2xl font-bold text-navy-800">{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trend line */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Tren KPI Bulanan {currentYear}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg" stroke="#2D7DD2" strokeWidth={2} name="Avg Score" dot={{ r: 4 }} connectNulls />
              <Line type="monotone" dataKey="target" stroke="#E9C46A" strokeDasharray="5 5" strokeWidth={1.5} name="Target (80)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart per designer current month */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Score per Designer — {MONTHS[currentMonth - 1]}</h3>
          {currentRecords.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={currentRecords.map(r => ({ name: r.designer?.name?.split(" ")[0], score: +r.weightedKpiScore?.toFixed(1), target: r.kpiTarget }))} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" name="KPI Score" fill="#2D7DD2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="#E9C46A" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Belum ada data bulan ini</div>
          )}
        </div>
      </div>

      {/* KPI Mappings / Bobot */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Mapping KPI — Indikator & Bobot</h3>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Indikator</th>
              <th className="text-center">Bobot</th>
              <th className="text-left">Satuan</th>
              <th className="text-center">Target</th>
              <th className="text-left">Cara Ukur</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(m => (
              <tr key={m.id}>
                <td className="font-medium text-slate-800">{m.indicatorName}</td>
                <td className="text-center">
                  <span className="font-mono text-sm text-brand-500">{m.bobotScore}%</span>
                </td>
                <td className="text-slate-500">{m.unit || "—"}</td>
                <td className="text-center text-slate-700">{m.targetValue ?? "—"} {m.unit}</td>
                <td className="text-xs text-slate-500 max-w-xs truncate" title={m.measurementRule}>{m.measurementRule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail per designer */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Detail KPI per Designer</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Designer</th>
                <th className="text-center">Bulan</th>
                <th className="text-center">Selesai</th>
                <th className="text-center">On-Time %</th>
                <th className="text-center">Avg Revisi</th>
                <th className="text-center">Complexity Pts</th>
                <th className="text-center">KPI Score</th>
                <th className="text-center">vs Target</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      {r.designer?.image ? (
                        <img src={r.designer.image} alt={r.designer.name} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{r.designer?.name?.charAt(0)}</div>
                      )}
                      <span className="text-sm font-medium">{r.designer?.name}</span>
                    </div>
                  </td>
                  <td className="text-center text-sm">{MONTHS[r.periodMonth - 1]} {r.periodYear}</td>
                  <td className="text-center text-sm">{r.totalCompleted}</td>
                  <td className="text-center">
                    <span className={cn("text-sm font-medium", r.onTimeRate >= 85 ? "text-emerald-600" : r.onTimeRate >= 70 ? "text-amber-600" : "text-red-600")}>
                      {r.onTimeRate?.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center text-sm">{r.avgRevisionRound?.toFixed(1)}</td>
                  <td className="text-center text-sm">{r.complexityPoints}</td>
                  <td className="text-center">
                    <span className={cn("font-bold", r.weightedKpiScore >= 80 ? "text-emerald-600" : r.weightedKpiScore >= 60 ? "text-amber-600" : "text-red-600")}>
                      {r.weightedKpiScore?.toFixed(1)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", r.weightedKpiScore >= r.kpiTarget ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                      {r.weightedKpiScore >= r.kpiTarget ? "✓ Achieved" : `−${(r.kpiTarget - r.weightedKpiScore).toFixed(1)}`}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">Belum ada data KPI</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
