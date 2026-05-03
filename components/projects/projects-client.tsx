"use client"
import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Filter, Plus, ExternalLink, AlertCircle } from "lucide-react"
import { cn, formatDate, getDaysUntil, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils"
import { StatusBadge, PriorityBadge, DelayBadge, SyncBadge } from "@/components/shared/badges"

interface ProjectsClientProps {
  projects: any[]
  designers: any[]
  brands: string[]
  userRole: string
  userId: string
}

export function ProjectsClient({ projects, designers, brands, userRole, userId }: ProjectsClientProps) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterPriority, setFilterPriority] = useState("")
  const [filterDesigner, setFilterDesigner] = useState("")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterDelay, setFilterDelay] = useState("")

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (search && !p.projectName.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase()) &&
          !p.id.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus && p.currentStatus !== filterStatus) return false
      if (filterPriority && p.priority !== filterPriority) return false
      if (filterDesigner && p.picDesignerId !== filterDesigner) return false
      if (filterBrand && p.brand !== filterBrand) return false
      if (filterDelay && p.delayStatus !== filterDelay) return false
      return true
    })
  }, [projects, search, filterStatus, filterPriority, filterDesigner, filterBrand, filterDelay])

  const clearFilters = () => {
    setFilterStatus(""); setFilterPriority(""); setFilterDesigner(""); setFilterBrand(""); setFilterDelay("")
  }
  const hasFilters = filterStatus || filterPriority || filterDesigner || filterBrand || filterDelay

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">Project List</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} project ditampilkan</p>
        </div>
        {["manager", "brand"].includes(userRole) && (
          <Link href="/brief" className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors">
            <Plus size={16} />
            Ajukan Brief Baru
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari project, brand, ID..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
            <option value="">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.labelId}</option>
            ))}
          </select>

          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
            <option value="">Semua Prioritas</option>
            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {userRole !== "designer" && (
            <select value={filterDesigner} onChange={e => setFilterDesigner(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
              <option value="">Semua Designer</option>
              {designers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}

          <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
            <option value="">Semua Brand</option>
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select value={filterDelay} onChange={e => setFilterDelay(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
            <option value="">Semua Delay Status</option>
            <option value="overdue">Overdue</option>
            <option value="at_risk">At Risk</option>
            <option value="on_track">On Track</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2 text-sm text-slate-500 hover:text-navy-800 transition-colors">
              Reset filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Project ID</th>
                <th className="text-left">Project</th>
                <th className="text-left">Brand</th>
                <th className="text-left">Prioritas</th>
                <th className="text-left">PIC Designer</th>
                <th className="text-left">Deadline</th>
                <th className="text-left">Status</th>
                <th className="text-left">Delay</th>
                <th className="text-left">Rev</th>
                <th className="text-left">Sync</th>
                <th className="text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const days = getDaysUntil(p.finalDeadline)
                const isUrgent = p.priority === "urgent"
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={cn(isUrgent && "bg-red-50/30")}
                  >
                    <td>
                      <span className="font-mono text-xs text-slate-500">{p.id}</span>
                    </td>
                    <td>
                      <div>
                        <Link href={`/projects/${p.id}`} className="text-sm font-medium text-navy-800 hover:text-brand-500 transition-colors line-clamp-1">
                          {p.projectName}
                        </Link>
                        <span className="text-xs text-slate-400">{p.projectType}</span>
                      </div>
                    </td>
                    <td><span className="text-sm text-slate-600">{p.brand}</span></td>
                    <td><PriorityBadge priority={p.priority} /></td>
                    <td>
                      {p.picDesigner ? (
                        <div className="flex items-center gap-2">
                          {p.picDesigner.image ? (
                            <img src={p.picDesigner.image} alt={p.picDesigner.name} className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                              {p.picDesigner.name?.charAt(0)}
                            </div>
                          )}
                          <span className="text-sm text-slate-700">{p.picDesigner.name?.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum di-assign</span>
                      )}
                    </td>
                    <td>
                      <div>
                        <span className={cn("text-sm font-medium", days < 0 ? "text-red-600" : days <= 2 ? "text-amber-600" : "text-slate-700")}>
                          {formatDate(p.finalDeadline)}
                        </span>
                        {days < 0 && <p className="text-xs text-red-500">{Math.abs(days)} hari lewat</p>}
                        {days >= 0 && days <= 7 && <p className="text-xs text-amber-500">{days} hari lagi</p>}
                      </div>
                    </td>
                    <td><StatusBadge status={p.currentStatus} /></td>
                    <td><DelayBadge status={p.delayStatus} /></td>
                    <td>
                      <span className="text-sm text-slate-600">Rev {p.revisionRound}</span>
                    </td>
                    <td><SyncBadge status={p.syncStatus} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link href={`/projects/${p.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-navy-800 transition-colors">
                          <ExternalLink size={13} />
                        </Link>
                        {p.trelloCardUrl && (
                          <a href={p.trelloCardUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zM10.4 17.4H5.2c-.9 0-1.6-.7-1.6-1.6V6.3c0-.9.7-1.6 1.6-1.6h5.2c.9 0 1.6.7 1.6 1.6v9.5c0 .9-.7 1.6-1.6 1.6zm9-5.7h-5.2c-.9 0-1.6-.7-1.6-1.6V6.3c0-.9.7-1.6 1.6-1.6h5.2c.9 0 1.6.7 1.6 1.6v3.8c0 .9-.7 1.6-1.6 1.6z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Search size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">Tidak ada project ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba ubah filter atau kata pencarian</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
