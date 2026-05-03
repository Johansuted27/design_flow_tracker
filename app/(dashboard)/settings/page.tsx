import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { formatDate, formatRelative } from "@/lib/utils"

export const metadata = { title: "User & Roles" }
export const dynamic = "force-dynamic"

const ROLE_COLORS: Record<string, string> = {
  manager: "bg-navy-100 text-navy-800 border-navy-200",
  spv: "bg-purple-100 text-purple-700 border-purple-200",
  designer: "bg-blue-100 text-blue-700 border-blue-200",
  brand: "bg-green-100 text-green-700 border-green-200",
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session || session.user.role !== "manager") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          projectsAsPIC: { where: { currentStatus: { notIn: ["completed", "cancelled"] } } },
        },
      },
    },
  })

  const roleLabels: Record<string, string> = {
    manager: "Manager",
    spv: "Supervisor",
    designer: "Designer",
    brand: "Brand Team",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-800">User & Roles</h1>
        <p className="text-sm text-slate-500 mt-0.5">{users.length} pengguna terdaftar · Role dikelola oleh Manager</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        ℹ️ <strong>Cara menambah pengguna:</strong> User yang login dengan Google Workspace akan otomatis terdaftar dengan role <em>brand</em>. Manager dapat mengubah role via database atau Prisma Studio.
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Daftar Pengguna</h3>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              <th className="text-left">Nama</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-left">Department</th>
              <th className="text-center">Project Aktif</th>
              <th className="text-left">Last Login</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    {u.image ? (
                      <img src={u.image} alt={u.name} className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">{u.name?.charAt(0)}</div>
                    )}
                    <span className="text-sm font-medium text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="text-xs text-slate-500">{u.email}</td>
                <td>
                  <span className={`badge ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {roleLabels[u.role] || u.role}
                  </span>
                </td>
                <td className="text-xs text-slate-500">{u.department || "—"}</td>
                <td className="text-center text-sm text-slate-700">{u._count.projectsAsPIC}</td>
                <td className="text-xs text-slate-400">{u.lastLoginAt ? formatRelative(u.lastLoginAt) : "Belum pernah"}</td>
                <td className="text-center">
                  <span className={`badge text-xs ${u.activeStatus ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {u.activeStatus ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Role & Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pr-4 text-slate-500 font-medium">Aksi</th>
                <th className="text-center px-3 py-2 text-navy-800 font-semibold">Manager</th>
                <th className="text-center px-3 py-2 text-purple-700 font-semibold">SPV</th>
                <th className="text-center px-3 py-2 text-blue-700 font-semibold">Designer</th>
                <th className="text-center px-3 py-2 text-green-700 font-semibold">Brand</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Lihat semua project", "✓", "✓", "Hanya miliknya", "Hanya miliknya"],
                ["Submit brief baru", "✓", "—", "—", "✓"],
                ["Assign designer ke project", "✓", "✓", "—", "—"],
                ["Ubah status project", "✓ (semua)", "✓ (sebagian)", "✓ (terbatas)", "—"],
                ["Approve internal", "✓", "✓", "—", "—"],
                ["Approve brand", "✓", "—", "—", "✓"],
                ["Lihat KPI Report", "✓", "✓", "Hanya miliknya", "—"],
                ["Lihat Team Workload", "✓", "✓", "—", "—"],
                ["Kelola Integrasi", "✓", "—", "—", "—"],
                ["Kelola User & Role", "✓", "—", "—", "—"],
              ].map(([action, ...roles], i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2 pr-4 text-slate-700">{action}</td>
                  {roles.map((r, j) => (
                    <td key={j} className={`text-center px-3 py-2 ${r === "—" ? "text-slate-300" : r === "✓" ? "text-emerald-600 font-semibold" : "text-amber-600"}`}>{r}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
