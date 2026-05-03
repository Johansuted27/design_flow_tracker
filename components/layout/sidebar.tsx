"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FolderKanban, FilePlus2, CheckSquare,
  Users, CalendarDays, ClipboardCheck, BarChart3,
  Archive, Plug, ShieldCheck, ChevronLeft, ChevronRight,
} from "lucide-react"
import { useState } from "react"
import type { UserRole } from "@prisma/client"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  roles: UserRole[]
  badge?: string
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["manager","spv","designer","brand"] },
  { href: "/projects", icon: FolderKanban, label: "Project List", roles: ["manager","spv","designer","brand"] },
  { href: "/brief", icon: FilePlus2, label: "Submit Brief", roles: ["manager","brand"] },
  { href: "/tasks", icon: CheckSquare, label: "My Tasks", roles: ["designer","spv"] },
  { href: "/workload", icon: Users, label: "Team Workload", roles: ["manager","spv"] },
  { href: "/calendar", icon: CalendarDays, label: "Calendar", roles: ["manager","spv","designer","brand"] },
  { href: "/review", icon: ClipboardCheck, label: "Review & Approval", roles: ["manager","spv","designer","brand"] },
  { href: "/kpi", icon: BarChart3, label: "KPI Report", roles: ["manager","spv"] },
  { href: "/assets", icon: Archive, label: "Asset Library", roles: ["manager","spv","designer","brand"] },
]

const adminItems: NavItem[] = [
  { href: "/integrations", icon: Plug, label: "Integrations", roles: ["manager"] },
  { href: "/settings", icon: ShieldCheck, label: "User & Roles", roles: ["manager"] },
]

interface SidebarProps {
  user: { name: string; email: string; image?: string; role: string }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const roleMap: Record<string, UserRole> = { manager: "manager", spv: "spv", designer: "designer", brand: "brand" }
  const userRole = roleMap[user.role] || "brand"

  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <div className={cn(
      "flex flex-col h-full bg-navy-800 transition-all duration-300 relative",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-navy-700", collapsed && "justify-center px-2")}>
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.9"/>
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.4"/>
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.4"/>
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="white"/>
          </svg>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-none">DesignFlow</div>
            <div className="text-navy-300 text-[10px] tracking-widest uppercase font-medium mt-0.5">Tracker</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-navy-800 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems
          .filter(item => item.roles.includes(userRole))
          .map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={active ? "text-brand-300" : ""} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

        {/* Admin section */}
        {adminItems.some(item => item.roles.includes(userRole)) && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] text-navy-400 uppercase tracking-widest font-semibold">Admin</p>
              </div>
            )}
            {collapsed && <div className="border-t border-navy-700 my-2" />}
            {adminItems
              .filter(item => item.roles.includes(userRole))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    collapsed && "justify-center px-2",
                    isActive(item.href)
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
          </>
        )}
      </nav>

      {/* User profile */}
      <div className={cn(
        "border-t border-navy-700 p-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-navy-600 flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-navy-400 text-[10px] capitalize">{user.role}</p>
          </div>
        )}
      </div>
    </div>
  )
}
