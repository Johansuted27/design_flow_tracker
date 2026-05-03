import { cn, STATUS_CONFIG, PRIORITY_CONFIG, DELAY_CONFIG } from "@/lib/utils"
import { AlertCircle, ArrowUp, Minus, ArrowDown, CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, CheckCheck, Square } from "lucide-react"

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
  if (!config) return <span className="badge bg-gray-100 text-gray-600 border-gray-200">{status}</span>
  return (
    <span className={cn("badge", config.color)}>
      {config.labelId}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]
  if (!config) return <span className="badge bg-gray-100 text-gray-600 border-gray-200">{priority}</span>

  const icons = {
    urgent: <AlertCircle size={10} />,
    high: <ArrowUp size={10} />,
    medium: <Minus size={10} />,
    low: <ArrowDown size={10} />,
  }

  return (
    <span className={cn("badge", config.color)}>
      {icons[priority as keyof typeof icons]}
      {config.label}
    </span>
  )
}

export function DelayBadge({ status }: { status: string }) {
  const config = DELAY_CONFIG[status as keyof typeof DELAY_CONFIG]
  if (!config) return null

  const icons = {
    on_track: <CheckCircle size={10} />,
    at_risk: <AlertTriangle size={10} />,
    overdue: <XCircle size={10} />,
  }

  return (
    <span className={cn("badge", config.color)}>
      {icons[status as keyof typeof icons]}
      {config.label}
    </span>
  )
}

export function SyncBadge({ status }: { status: string }) {
  const configs = {
    synced: { label: "Synced", color: "bg-green-50 text-green-700 border-green-200", icon: <CheckCheck size={10} /> },
    pending: { label: "Pending", color: "bg-slate-50 text-slate-600 border-slate-200", icon: <Clock size={10} /> },
    failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200", icon: <XCircle size={10} /> },
    conflict: { label: "Conflict", color: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertTriangle size={10} /> },
  }
  const config = configs[status as keyof typeof configs]
  if (!config) return null
  return <span className={cn("badge", config.color)}>{config.icon}{config.label}</span>
}

export function WorkloadBadge({ score }: { score: number }) {
  const statuses = [
    { max: 3, label: "Available", color: "bg-green-50 text-green-700 border-green-200" },
    { max: 6, label: "Normal", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { max: 9, label: "Full", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { max: Infinity, label: "Overloaded", color: "bg-red-50 text-red-700 border-red-200" },
  ]
  const st = statuses.find(s => score <= s.max) || statuses[3]
  return <span className={cn("badge", st.color)}>{st.label}</span>
}
