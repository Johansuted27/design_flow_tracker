"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, ChevronRight, Loader2 } from "lucide-react"
import { PROJECT_TYPES, BRANDS, cn } from "@/lib/utils"

interface SubmitBriefClientProps {
  user: any
  managers: any[]
}

const STEPS = ["Requester", "Project Info", "Referensi & Timeline", "Kirim"]

export function SubmitBriefClient({ user, managers }: SubmitBriefClientProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [form, setForm] = useState({
    requesterName: user.name || "",
    requesterEmail: user.email || "",
    brand: "",
    projectName: "",
    projectType: "",
    objective: "",
    deliverables: "",
    sizeFormat: "",
    keyMessage: "",
    mandatoryElements: "",
    referenceLink: "",
    attachmentLink: "",
    firstDraftDeadline: "",
    finalDeadline: "",
    priority: "medium",
    brandPriority: 3,
    approvalPIC: "",
    additionalNotes: "",
  })

  const update = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }))

  const requiredFields = ["brand", "projectName", "projectType", "objective", "deliverables", "finalDeadline"]
  const missingFields = requiredFields.filter(f => !form[f as keyof typeof form])
  const isComplete = missingFields.length === 0

  const submit = async () => {
    setLoading(true)
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(data.id)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-800">Brief Berhasil Diajukan!</h2>
            <p className="text-slate-500 mt-2">Project ID Anda:</p>
            <p className="text-2xl font-mono font-bold text-navy-800 mt-1">{submitted}</p>
          </div>
          <p className="text-sm text-slate-500">Design Manager akan mereview brief Anda dan menghubungi jika ada informasi yang kurang.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/projects/${submitted}`)}
              className="px-6 py-2.5 bg-navy-800 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors">
              Lihat Project
            </button>
            <button onClick={() => { setSubmitted(null); setStep(0); setForm(prev => ({ ...prev, brand: "", projectName: "", objective: "", deliverables: "", finalDeadline: "" })) }}
              className="px-6 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
              Submit Lagi
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Ajukan Brief Design</h1>
        <p className="text-sm text-slate-500 mt-0.5">Isi form berikut dengan lengkap dan detail</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors",
              i < step ? "bg-emerald-500 text-white" : i === step ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-400")}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-navy-800" : "text-slate-400")}>{s}</span>
            {i < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 rounded-full mx-2", i < step ? "bg-emerald-500" : "bg-slate-200")} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        {/* Step 0: Requester */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Informasi Requester</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nama Requester *</label>
                <input value={form.requesterName} onChange={e => update("requesterName", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Email *</label>
                <input value={form.requesterEmail} onChange={e => update("requesterEmail", e.target.value)} type="email"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Brand / Department *</label>
                <select value={form.brand} onChange={e => update("brand", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
                  <option value="">Pilih brand...</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Approval PIC</label>
                <input value={form.approvalPIC} onChange={e => update("approvalPIC", e.target.value)}
                  placeholder="Nama dan email approver" className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Project Info */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Informasi Project</h2>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Nama Project *</label>
              <input value={form.projectName} onChange={e => update("projectName", e.target.value)}
                placeholder="contoh: Packaging Rebranding Indomilk Full Cream 1L"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Tipe Project *</label>
                <select value={form.projectType} onChange={e => update("projectType", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
                  <option value="">Pilih tipe...</option>
                  {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Prioritas</label>
                <select value={form.priority} onChange={e => update("priority", e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent ⚡</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Objective / Tujuan Design *</label>
              <textarea value={form.objective} onChange={e => update("objective", e.target.value)} rows={3}
                placeholder="Jelaskan tujuan design ini, untuk campaign apa, target audience, dll."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deliverables / Output yang Dibutuhkan *</label>
              <textarea value={form.deliverables} onChange={e => update("deliverables", e.target.value)} rows={3}
                placeholder="Sebutkan file apa saja yang dibutuhkan, ukuran, format, jumlah..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Key Message</label>
                <textarea value={form.keyMessage} onChange={e => update("keyMessage", e.target.value)} rows={2}
                  placeholder="Pesan utama yang ingin disampaikan"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Mandatory Elements</label>
                <textarea value={form.mandatoryElements} onChange={e => update("mandatoryElements", e.target.value)} rows={2}
                  placeholder="Logo, klaim, legal text, dll yang WAJIB ada"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: References & Timeline */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Referensi & Timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Link Referensi Design</label>
                <input value={form.referenceLink} onChange={e => update("referenceLink", e.target.value)} type="url"
                  placeholder="https://..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Link Attachment Brief</label>
                <input value={form.attachmentLink} onChange={e => update("attachmentLink", e.target.value)} type="url"
                  placeholder="Link GDrive / Figma..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Ukuran / Format (jika ada)</label>
              <input value={form.sizeFormat} onChange={e => update("sizeFormat", e.target.value)}
                placeholder="contoh: A4 portrait, CMYK 300dpi, print-ready PDF"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deadline First Draft</label>
                <input value={form.firstDraftDeadline} onChange={e => update("firstDraftDeadline", e.target.value)} type="date"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Deadline Final Artwork *</label>
                <input value={form.finalDeadline} onChange={e => update("finalDeadline", e.target.value)} type="date"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Catatan Tambahan</label>
              <textarea value={form.additionalNotes} onChange={e => update("additionalNotes", e.target.value)} rows={3}
                placeholder="Informasi lain yang perlu diketahui tim design..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none" />
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Review & Kirim Brief</h2>
            {!isComplete && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Brief belum lengkap</p>
                  <p className="text-xs text-amber-700 mt-0.5">Field berikut belum diisi: {missingFields.join(", ")}. Project akan disimpan dengan status "Need Brief Completion".</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Brand", value: form.brand },
                { label: "Project", value: form.projectName },
                { label: "Tipe", value: form.projectType },
                { label: "Prioritas", value: form.priority },
                { label: "Final Deadline", value: form.finalDeadline },
                { label: "First Draft", value: form.firstDraftDeadline || "-" },
              ].map(item => (
                <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-slate-800 font-medium mt-0.5 truncate">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setStep(prev => Math.max(0, prev - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            Kembali
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-2 px-5 py-2 bg-navy-800 text-white text-sm font-medium rounded-xl hover:bg-navy-700 transition-colors"
            >
              Lanjut <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {loading ? "Mengirim..." : "Kirim Brief"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
