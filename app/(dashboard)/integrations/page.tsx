import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatRelative } from "@/lib/utils"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export const metadata = { title: "Integrations" }
export const dynamic = "force-dynamic"

const integrations = [
  {
    id: "trello",
    name: "Trello",
    description: "Sync project status ke Trello board BD Design Request. Card otomatis dibuat & diupdate sesuai status.",
    icon: "🗂️",
    color: "bg-blue-50 border-blue-200",
    docUrl: "https://trello.com/app-key",
    features: ["Auto-create card saat brief diterima", "Sync status ke Trello list", "Update deadline & assignee"],
  },
  {
    id: "google_sheets",
    name: "Google Sheets Tracker",
    description: "Sync data project ke Google Sheets master tracker. Update otomatis setiap kali status berubah.",
    icon: "📊",
    color: "bg-green-50 border-green-200",
    docUrl: "https://console.cloud.google.com",
    features: ["Append row baru saat project dibuat", "Update status & tanggal realtime", "Formula KPI terhitung otomatis"],
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Auto-create folder project di Drive dengan struktur standar dan permission yang sesuai.",
    icon: "📁",
    color: "bg-yellow-50 border-yellow-200",
    docUrl: "https://console.cloud.google.com",
    features: ["Auto-buat folder per project", "Subfolder: Brief, Working, Final, Asset", "Link folder tersimpan di project"],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Tambah deadline project ke Google Calendar tim design secara otomatis.",
    icon: "📅",
    color: "bg-red-50 border-red-200",
    docUrl: "https://console.cloud.google.com",
    features: ["Event deadline final", "Event first draft", "Reminder H-2 otomatis"],
  },
]

export default async function IntegrationsPage() {
  const session = await auth()
  if (!session || session.user.role !== "manager") redirect("/dashboard")

  const tokens = await prisma.integrationToken.findMany({
    where: { userId: session.user.id },
  })

  const tokenMap = Object.fromEntries(tokens.map(t => [t.provider, t]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Integrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Hubungkan DesignFlow ke tools yang sudah digunakan tim</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map(int => {
          const token = tokenMap[int.id as keyof typeof tokenMap]
          const connected = token?.connectedStatus

          return (
            <div key={int.id} className={`bg-white rounded-2xl border p-6 ${int.color}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{int.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{int.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {connected ? (
                        <><CheckCircle size={11} className="text-emerald-500" /><span className="text-xs text-emerald-600">Terhubung</span></>
                      ) : (
                        <><XCircle size={11} className="text-slate-400" /><span className="text-xs text-slate-400">Belum terhubung</span></>
                      )}
                    </div>
                  </div>
                </div>
                <a href={int.docUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-500 hover:underline">Panduan setup →</a>
              </div>
              <p className="text-xs text-slate-600 mb-4">{int.description}</p>
              <ul className="space-y-1 mb-4">
                {int.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              {token?.lastSyncAt && (
                <p className="text-xs text-slate-400 mb-3">
                  <Clock size={10} className="inline mr-1" />
                  Sync terakhir: {formatRelative(token.lastSyncAt)}
                </p>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                ⚙️ Setup via <code className="font-mono">.env.local</code> — lihat <code>.env.example</code> untuk konfigurasi API key & token
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-navy-800 rounded-2xl p-6 text-white">
        <h3 className="text-base font-semibold mb-2">Cara Setup Integrasi</h3>
        <ol className="space-y-2 text-sm text-navy-200 list-decimal list-inside">
          <li>Copy <code className="font-mono text-white">.env.example</code> ke <code className="font-mono text-white">.env.local</code></li>
          <li>Buat project di Google Cloud Console, aktifkan Drive, Sheets, Calendar API</li>
          <li>Download credentials JSON, set GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET</li>
          <li>Buat Trello API Key di <a href="https://trello.com/app-key" className="text-brand-300 hover:underline">trello.com/app-key</a></li>
          <li>Set semua environment variables di Vercel Dashboard → Settings → Environment Variables</li>
          <li>Redeploy dan integrasi akan aktif otomatis</li>
        </ol>
      </div>
    </div>
  )
}
