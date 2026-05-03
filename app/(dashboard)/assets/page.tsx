import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ExternalLink, FolderOpen, Archive } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const metadata = { title: "Asset Library" }
export const dynamic = "force-dynamic"

export default async function AssetsPage() {
  const session = await auth()
  if (!session) return null

  const where = session.user.role === "brand"
    ? { requesterId: session.user.id }
    : session.user.role === "designer"
    ? { OR: [{ picDesignerId: session.user.id }, { supportDesignerId: session.user.id }] }
    : {}

  const completedProjects = await prisma.project.findMany({
    where: {
      ...where,
      currentStatus: { in: ["completed", "approved", "final_artwork"] },
      finalArtworkLink: { not: null },
    },
    select: {
      id: true, projectName: true, brand: true, projectType: true,
      finalDeadline: true, completedDate: true, finalArtworkLink: true,
      driveFolderUrl: true, assetFolderLink: true,
      picDesigner: { select: { name: true } },
    },
    orderBy: { completedDate: "desc" },
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">Asset Library</h1>
        <p className="text-sm text-slate-500 mt-0.5">{completedProjects.length} project dengan final artwork tersimpan</p>
      </div>

      {completedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100">
          <Archive size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500">Belum ada asset tersimpan</p>
          <p className="text-xs text-slate-400 mt-1">Project yang selesai dengan final artwork link akan muncul di sini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {completedProjects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="font-mono text-xs text-slate-400">{p.id}</span>
                  <h3 className="text-sm font-semibold text-navy-800 mt-0.5">{p.projectName}</h3>
                  <p className="text-xs text-slate-500">{p.brand} · {p.projectType}</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Selesai</span>
              </div>
              <div className="space-y-2">
                {p.finalArtworkLink && (
                  <a href={p.finalArtworkLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors text-xs text-emerald-700">
                    <FolderOpen size={13} />
                    <span className="flex-1 truncate">Final Artwork</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {p.driveFolderUrl && (
                  <a href={p.driveFolderUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-orange-50 transition-colors text-xs text-orange-700">
                    <FolderOpen size={13} />
                    <span className="flex-1 truncate">Project Folder (Drive)</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400">
                <span>PIC: {p.picDesigner?.name || "—"}</span>
                <span>Selesai: {formatDate(p.completedDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
