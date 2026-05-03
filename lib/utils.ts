import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-"
  return format(new Date(date), "dd MMM yyyy", { locale: idLocale })
}

export function formatDateShort(date: Date | string | null): string {
  if (!date) return "-"
  return format(new Date(date), "dd/MM/yy")
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return "-"
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale })
}

export function getDaysUntil(date: Date | string | null): number {
  if (!date) return 999
  return differenceInDays(new Date(date), new Date())
}

export function generateProjectId(month: number, year: number, seq: number): string {
  const mm = String(month).padStart(2, "0")
  const xxxx = String(seq).padStart(4, "0")
  return `DF-${year}${mm}-${xxxx}`
}

// ── STATUS CONFIGS ─────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  brief_received: { label: "Brief Received", labelId: "Brief Diterima", color: "bg-slate-100 text-slate-700 border-slate-200" },
  need_brief_completion: { label: "Need Brief Completion", labelId: "Brief Belum Lengkap", color: "bg-orange-50 text-orange-700 border-orange-200" },
  in_queue: { label: "In Queue", labelId: "Dalam Antrian", color: "bg-slate-100 text-slate-600 border-slate-200" },
  assigned: { label: "Assigned", labelId: "Sudah Di-assign", color: "bg-blue-50 text-blue-700 border-blue-200" },
  in_progress: { label: "In Progress", labelId: "Sedang Dikerjakan", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  internal_review: { label: "Internal Review", labelId: "Review Internal", color: "bg-purple-50 text-purple-700 border-purple-200" },
  revision: { label: "Revision", labelId: "Revisi", color: "bg-amber-50 text-amber-700 border-amber-200" },
  waiting_brand_approval: { label: "Waiting Approval", labelId: "Menunggu Approval Brand", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  approved: { label: "Approved", labelId: "Disetujui", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  final_artwork: { label: "Final Artwork", labelId: "Final Artwork", color: "bg-teal-50 text-teal-700 border-teal-200" },
  completed: { label: "Completed", labelId: "Selesai", color: "bg-green-50 text-green-800 border-green-200" },
  on_hold: { label: "On Hold", labelId: "Ditunda", color: "bg-gray-100 text-gray-600 border-gray-200" },
  cancelled: { label: "Cancelled", labelId: "Dibatalkan", color: "bg-red-50 text-red-600 border-red-200" },
} as const

export const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", labelId: "Urgent", color: "bg-red-100 text-red-700 border-red-300", dot: "bg-red-500" },
  high: { label: "High", labelId: "Tinggi", color: "bg-orange-100 text-orange-700 border-orange-300", dot: "bg-orange-500" },
  medium: { label: "Medium", labelId: "Sedang", color: "bg-blue-100 text-blue-700 border-blue-300", dot: "bg-blue-500" },
  low: { label: "Low", labelId: "Rendah", color: "bg-gray-100 text-gray-600 border-gray-300", dot: "bg-gray-400" },
} as const

export const DELAY_CONFIG = {
  on_track: { label: "On Track", color: "bg-green-100 text-green-700 border-green-200" },
  at_risk: { label: "At Risk", color: "bg-amber-100 text-amber-700 border-amber-200" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700 border-red-200" },
} as const

export const COMPLEXITY_CONFIG = {
  simple: { label: "Simple", score: 1, color: "text-green-600" },
  medium: { label: "Medium", score: 2, color: "text-blue-600" },
  complex: { label: "Complex", score: 3, color: "text-orange-600" },
  major: { label: "Major", score: 4, color: "text-red-600" },
} as const

export const PROJECT_TYPES = [
  "Packaging", "Key Visual", "Social Media Post", "Banner Digital", "OOH/Billboard",
  "Flyer/Leaflet", "Brochure/Catalog", "Label", "POSM", "TVC/Video", "Animation/Motion",
  "Annual Report", "Storyboard", "Other",
]

export const BRANDS = [
  "Indomilk", "IndoFresh", "Chitato", "Pop Mie", "Indomie", "Supermi", "Sarimi",
  "Chiki", "Cheetos", "Lays", "Other",
]

export const FEEDBACK_CATEGORIES = {
  layout: "Layout & Komposisi",
  copy: "Copy & Teks",
  branding: "Branding & Visual Identity",
  image: "Gambar & Visual Produk",
  technical: "Teknis Ukuran/Format",
  other: "Lainnya",
}

// Workload helpers
export function getWorkloadStatus(score: number): { label: string; color: string; bg: string } {
  if (score <= 3) return { label: "Available", color: "text-green-700", bg: "bg-green-100" }
  if (score <= 6) return { label: "Normal", color: "text-blue-700", bg: "bg-blue-100" }
  if (score <= 9) return { label: "Full", color: "text-amber-700", bg: "bg-amber-100" }
  return { label: "Overloaded", color: "text-red-700", bg: "bg-red-100" }
}

export function getWorkloadPercent(score: number): number {
  return Math.min((score / 12) * 100, 100)
}

// Date helpers for automation
export function computeDelayStatus(finalDeadline: Date, status: string): "on_track" | "at_risk" | "overdue" {
  const terminal = ["completed", "cancelled", "approved", "final_artwork"]
  if (terminal.includes(status)) return "on_track"
  const days = getDaysUntil(finalDeadline)
  if (days < 0) return "overdue"
  if (days <= 2) return "at_risk"
  return "on_track"
}
