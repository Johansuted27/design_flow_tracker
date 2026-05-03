"use client"
import { signOut } from "next-auth/react"
import { Bell, Search, LogOut, ChevronDown } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useState } from "react"

interface TopBarProps {
  user: { name: string; email: string; image?: string; role: string }
}

export function TopBar({ user }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const today = new Date()

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari project, brand, designer..."
            className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">{formatDate(today)}</span>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {user.image ? (
              <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center text-white text-xs font-bold">
                {user.name?.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-medium text-slate-800 leading-none">{user.name?.split(" ")[0]}</p>
              <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
            </div>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-medium text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
