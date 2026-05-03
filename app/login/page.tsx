import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoginButton } from "@/components/auth/login-button"

export const metadata = { title: "Login" }

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 bg-[#F0F4F8]">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-navy-800/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A3C5E" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center shadow-xl">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="10" height="10" rx="2" fill="white" fillOpacity="0.9"/>
                <rect x="15" y="3" width="10" height="10" rx="2" fill="white" fillOpacity="0.5"/>
                <rect x="3" y="15" width="10" height="10" rx="2" fill="white" fillOpacity="0.5"/>
                <rect x="15" y="15" width="10" height="10" rx="2" fill="#2D7DD2"/>
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-navy-800 leading-none">DesignFlow</div>
              <div className="text-xs text-slate-500 font-medium tracking-widest uppercase">Tracker</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-navy-800/10 border border-slate-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-navy-800 via-brand-500 to-success-500" />
          
          <div className="p-8">
            <h1 className="text-2xl font-bold text-navy-800 mb-1">Selamat Datang</h1>
            <p className="text-slate-500 text-sm mb-8">
              Sistem manajemen project design tim internal FMCG
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                { icon: "📊", text: "Dashboard real-time semua project" },
                { icon: "🔗", text: "Terintegrasi Trello, Google Sheets & Drive" },
                { icon: "📈", text: "KPI tracking otomatis per designer" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="text-base">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>

            <LoginButton />

            <p className="text-center text-xs text-slate-400 mt-6">
              Gunakan akun Google Workspace perusahaan Anda
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          DesignFlow Tracker v1.0 · Internal Use Only
        </p>
      </div>
    </div>
  )
}
