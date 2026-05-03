"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, RefreshCw, CheckCircle, XCircle, MessageCircle, Paperclip, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cn, formatDate, formatRelative, FEEDBACK_CATEGORIES, STATUS_CONFIG } from "@/lib/utils"
import { StatusBadge, PriorityBadge, DelayBadge } from "@/components/shared/badges"
import { useRouter } from "next/navigation"

interface ProjectDetailClientProps {
  project: any
  designers: any[]
  user: any
}

export function ProjectDetailClient({ project, designers, user }: ProjectDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [feedbackNote, setFeedbackNote] = useState("")
  const [feedbackCat, setFeedbackCat] = useState<"layout" | "copy" | "branding" | "image" | "technical" | "other">("layout")
  const [fileLinks, setFileLinks] = useState({
    workingFileLink: project.workingFileLink || "",
    previewFileLink: project.previewFileLink || "",
    finalArtworkLink: project.finalArtworkLink || "",
  })

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "timeline", label: "Timeline" },
    { id: "feedback", label: `Feedback (${project.feedback?.length || 0})` },
    { id: "files", label: "Files" },
    { id: "approval", label: "Approval" },
    { id: "activity", label: "Activity Log" },
  ]

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentStatus: newStatus }),
    })
    setLoading(false)
    router.refresh()
  }

  const updateFileLink = async (field: string, value: string) => {
    await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    router.refresh()
  }

  const submitFeedback = async (action: "feedback" | "reject") => {
    if (!feedbackNote.trim()) return
    setLoading(true)
    await fetch(`/api/projects/${project.id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: feedbackCat, note: feedbackNote, action }),
    })
    setFeedbackNote("")
    setLoading(false)
    router.refresh()
  }

  const updateApproval = async (type: string, status: string, notes?: string) => {
    setLoading(true)
    await fetch(`/api/projects/${project.id}/approval`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, status, notes }),
    })
    setLoading(false)
    router.refresh()
  }

  const availableStatuses = () => {
    const allStatuses = Object.keys(STATUS_CONFIG)
    if (user.role === "manager") return allStatuses
    if (user.role === "spv") return ["internal_review", "revision", "waiting_brand_approval", "approved", "final_artwork"]
    if (user.role === "designer") return ["in_progress", "internal_review", "final_artwork"]
    return []
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/projects" className="mt-1 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-400">{project.id}</span>
            <PriorityBadge priority={project.priority} />
            <DelayBadge status={project.delayStatus} />
          </div>
          <h1 className="text-xl font-bold text-navy-800 truncate">{project.projectName}</h1>
          <p className="text-sm text-slate-500">{project.brand} · {project.projectType}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {project.trelloCardUrl && (
            <a href={project.trelloCardUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
              <ExternalLink size={12} /> Trello
            </a>
          )}
          <StatusBadge status={project.currentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn("px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    activeTab === tab.id ? "border-navy-800 text-navy-800" : "border-transparent text-slate-500 hover:text-slate-700"
                  )}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Tujuan / Objective</p>
                      <p className="text-sm text-slate-700">{project.objective}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Deliverables</p>
                      <p className="text-sm text-slate-700">{project.deliverables}</p>
                    </div>
                  </div>
                  {project.keyMessage && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Key Message</p>
                      <p className="text-sm text-slate-700">{project.keyMessage}</p>
                    </div>
                  )}
                  {project.mandatoryElements && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Mandatory Elements</p>
                      <p className="text-sm text-slate-700">{project.mandatoryElements}</p>
                    </div>
                  )}
                  {project.sizeFormat && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Size / Format</p>
                      <p className="text-sm text-slate-700">{project.sizeFormat}</p>
                    </div>
                  )}
                  {project.notes && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-600 font-medium mb-1">⚠ Notes / Blocker</p>
                      <p className="text-sm text-amber-800">{project.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === "timeline" && (
                <div className="space-y-3">
                  {[
                    { label: "Tanggal Request", date: project.requestDate, done: true },
                    { label: "Mulai Dikerjakan", date: project.startDate, done: !!project.startDate },
                    { label: "First Draft Deadline", date: project.firstDraftDeadline, done: false },
                    { label: "Internal Review Deadline", date: project.internalReviewDeadline, done: false },
                    { label: "Brand Approval Deadline", date: project.brandApprovalDeadline, done: false },
                    { label: "Final Deadline", date: project.finalDeadline, done: project.currentStatus === "completed" },
                    { label: "Selesai", date: project.completedDate, done: !!project.completedDate },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full flex-shrink-0 border-2", item.done ? "bg-emerald-500 border-emerald-500" : item.date ? "border-navy-800 bg-white" : "border-slate-200 bg-white")} />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <span className={cn("text-sm", item.date ? "text-slate-800 font-medium" : "text-slate-400")}>{item.date ? formatDate(item.date) : "Belum ditetapkan"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback Tab */}
              {activeTab === "feedback" && (
                <div className="space-y-4">
                  {/* Add feedback form */}
                  {!["designer"].includes(user.role) || user.role === "brand" ? (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs font-medium text-slate-700">Tambah Feedback</p>
                      <select value={feedbackCat} onChange={e => setFeedbackCat(e.target.value as never)}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
                        {Object.entries(FEEDBACK_CATEGORIES).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <textarea
                        value={feedbackNote}
                        onChange={e => setFeedbackNote(e.target.value)}
                        placeholder="Tuliskan feedback detail di sini..."
                        rows={3}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => submitFeedback("feedback")} disabled={loading || !feedbackNote.trim()}
                          className="px-4 py-2 bg-navy-800 text-white text-sm rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors">
                          Kirim Feedback
                        </button>
                        {["manager", "spv", "brand"].includes(user.role) && (
                          <button onClick={() => submitFeedback("reject")} disabled={loading || !feedbackNote.trim()}
                            className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 border border-red-200 disabled:opacity-50 transition-colors">
                            Tolak & Minta Revisi
                          </button>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Feedback thread */}
                  <div className="space-y-3">
                    {project.feedback?.map((fb: any) => (
                      <div key={fb.id} className={cn("p-4 rounded-xl border", fb.feedbackRole === "brand" ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100")}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {fb.user?.image ? (
                              <img src={fb.user.image} alt={fb.user.name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-navy-800 flex items-center justify-center text-white text-[10px]">{fb.user?.name?.charAt(0)}</div>
                            )}
                            <span className="text-xs font-medium text-slate-800">{fb.user?.name}</span>
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", fb.feedbackRole === "brand" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>{fb.feedbackRole}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{FEEDBACK_CATEGORIES[fb.category as keyof typeof FEEDBACK_CATEGORIES]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">Rev {fb.revisionRound}</span>
                            <span className="text-[10px] text-slate-400">{formatRelative(fb.createdAt)}</span>
                            {fb.isResolved && <CheckCircle size={12} className="text-emerald-500" />}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{fb.note}</p>
                      </div>
                    ))}
                    {(!project.feedback || project.feedback.length === 0) && (
                      <div className="flex flex-col items-center py-8 text-slate-400">
                        <MessageCircle size={24} className="mb-2" />
                        <p className="text-sm">Belum ada feedback</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Files Tab */}
              {activeTab === "files" && (
                <div className="space-y-4">
                  {/* Quick link inputs */}
                  {["designer", "manager", "spv"].includes(user.role) && (
                    <div className="space-y-3">
                      {[
                        { field: "workingFileLink", label: "Working File Link", placeholder: "Link ke file desain (Figma/GDrive)..." },
                        { field: "previewFileLink", label: "Preview File Link", placeholder: "Link preview untuk review/approval..." },
                        { field: "finalArtworkLink", label: "Final Artwork Link", placeholder: "Link final artwork delivery..." },
                      ].map(({ field, label, placeholder }) => (
                        <div key={field}>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
                          <div className="flex gap-2">
                            <input
                              value={fileLinks[field as keyof typeof fileLinks]}
                              onChange={e => setFileLinks(prev => ({ ...prev, [field]: e.target.value }))}
                              placeholder={placeholder}
                              className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                            <button
                              onClick={() => updateFileLink(field, fileLinks[field as keyof typeof fileLinks])}
                              className="px-3 py-2 bg-navy-800 text-white text-sm rounded-lg hover:bg-navy-700 transition-colors"
                            >Simpan</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Existing file links */}
                  <div className="space-y-2">
                    {[
                      { url: project.briefLink, label: "Brief", color: "text-slate-600" },
                      { url: project.workingFileLink, label: "Working File", color: "text-blue-600" },
                      { url: project.previewFileLink, label: "Preview File", color: "text-purple-600" },
                      { url: project.finalArtworkLink, label: "Final Artwork", color: "text-emerald-600" },
                      { url: project.assetFolderLink, label: "Asset Folder", color: "text-amber-600" },
                      { url: project.driveFolderUrl, label: "Project Folder (Drive)", color: "text-orange-600" },
                    ].filter(f => f.url).map(f => (
                      <a key={f.label} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <Paperclip size={14} className={f.color} />
                        <span className="text-sm text-slate-700 flex-1 truncate">{f.label}</span>
                        <ExternalLink size={12} className="text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Tab */}
              {activeTab === "approval" && (
                <div className="space-y-5">
                  {/* Checklist */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-3">Approval Checklist</p>
                    <div className="space-y-2">
                      {[
                        { key: "checkBriefComplete", label: "Brief lengkap dan jelas" },
                        { key: "checkObjectiveMatch", label: "Desain sesuai objective" },
                        { key: "checkMandatoryElements", label: "Elemen wajib sudah ada" },
                        { key: "checkSizeFormat", label: "Ukuran dan format benar" },
                        { key: "checkCopyChecked", label: "Copy/teks sudah dicek" },
                        { key: "checkBrandGuideline", label: "Brand guideline diikuti" },
                      ].map(item => (
                        <div key={item.key} className="flex items-center gap-3">
                          <div className={cn("w-5 h-5 rounded flex items-center justify-center border-2",
                            project.approval?.[item.key] ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white")}>
                            {project.approval?.[item.key] && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className={cn("text-sm", project.approval?.[item.key] ? "text-slate-700" : "text-slate-500")}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approval status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">Internal Approval</p>
                      <div className={cn("flex items-center gap-2 text-sm font-medium",
                        project.approval?.internalApprovalStatus === "approved" ? "text-emerald-600" : "text-slate-500")}>
                        {project.approval?.internalApprovalStatus === "approved" ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {project.approval?.internalApprovalStatus === "approved" ? "Approved" : "Pending"}
                      </div>
                      {project.approval?.internalApprover && (
                        <p className="text-xs text-slate-400 mt-1">oleh {project.approval.internalApprover.name}</p>
                      )}
                      {["manager", "spv"].includes(user.role) && project.approval?.internalApprovalStatus !== "approved" && (
                        <button onClick={() => updateApproval("internal", "approved")}
                          className="mt-3 w-full px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors">
                          Approve Internal
                        </button>
                      )}
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">Brand Approval</p>
                      <div className={cn("flex items-center gap-2 text-sm font-medium",
                        project.approval?.brandApprovalStatus === "approved" ? "text-emerald-600" : "text-slate-500")}>
                        {project.approval?.brandApprovalStatus === "approved" ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {project.approval?.brandApprovalStatus === "approved" ? "Approved" : "Pending"}
                      </div>
                      {project.approval?.brandApprover && (
                        <p className="text-xs text-slate-400 mt-1">oleh {project.approval.brandApprover.name}</p>
                      )}
                      {["brand", "manager"].includes(user.role) && project.approval?.brandApprovalStatus !== "approved" && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => updateApproval("brand", "approved")}
                            className="flex-1 px-2 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => updateApproval("brand", "rejected")}
                            className="flex-1 px-2 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 border border-red-200 transition-colors">
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Log Tab */}
              {activeTab === "activity" && (
                <div className="space-y-2">
                  {project.activityLogs?.map((log: any) => (
                    <div key={log.id} className="flex gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      {log.user?.image ? (
                        <img src={log.user.image} alt={log.user.name} className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {log.user?.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700">{log.notes || log.actionType.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{log.user?.name} · {formatRelative(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {(!project.activityLogs || project.activityLogs.length === 0) && (
                    <p className="text-sm text-slate-400 py-4">Belum ada aktivitas</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Quick Actions</h3>

            {/* Status change */}
            {availableStatuses().length > 0 && (
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Ubah Status</label>
                <select
                  defaultValue={project.currentStatus}
                  onChange={e => updateStatus(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                >
                  {availableStatuses().map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.labelId || s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Mark complete button */}
            {user.role === "manager" && project.approval?.finalApprovalStatus === "approved" && project.finalArtworkLink && project.currentStatus !== "completed" && (
              <button onClick={() => updateStatus("completed")} disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                <CheckCircle size={16} />
                Tandai Selesai
              </button>
            )}
          </div>

          {/* Project meta */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">Detail Project</h3>
            {[
              { label: "PIC Designer", value: project.picDesigner?.name || "Belum di-assign" },
              { label: "Requester", value: project.requester?.name },
              { label: "Brand Priority", value: `P${project.brandPriority}` },
              { label: "Complexity", value: `${project.complexityLevel} (${project.complexityScore} pts)` },
              { label: "Revision Round", value: `Rev ${project.revisionRound}` },
              { label: "Request Date", value: formatDate(project.requestDate) },
              { label: "Final Deadline", value: formatDate(project.finalDeadline) },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-slate-400">{item.label}</span>
                <span className="text-slate-800 font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
