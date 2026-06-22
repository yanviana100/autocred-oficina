"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  CreditCard,
  GitBranch,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Calculator,
  Building2,
  Store,
  TrendingUp,
  ClipboardList,
  BarChart2,
  Receipt,
} from "lucide-react";
import { cn, planLabel } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/db";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; amber?: boolean };

const creditItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fluxo", label: "Fluxo de Crédito", icon: GitBranch },
  { href: "/pipeline", label: "Pipeline", icon: LayoutGrid },
  { href: "/financiamento", label: "Solicitações", icon: CreditCard },
  { href: "/simulador", label: "Simulador", icon: Calculator },
];

const gestaoItems: NavItem[] = [
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/veiculos", label: "Veículos", icon: Car },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/relatorios", label: "Relatórios", icon: BarChart2 },
];

const plataformaItems: NavItem[] = [
  { href: "/billing", label: "Plano & Cobrança", icon: Receipt },
  { href: "/parceiros", label: "Parceiros", icon: Building2 },
  { href: "/perfil", label: "Minha Oficina", icon: Store },
  { href: "/admin", label: "Admin", icon: Shield },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [workshopName, setWorkshopName] = useState<string>("");
  const [workshopPlan, setWorkshopPlan] = useState<string>("starter");

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    supabase.from("workshops").select("name, plan").eq("id", user.id).single().then(({ data }) => {
      if (data) { setWorkshopName(data.name); setWorkshopPlan(data.plan); }
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="pt-4 first:pt-0">
      {!collapsed && (
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : item.amber
                    ? "text-amber-400 hover:bg-slate-700 hover:text-amber-300"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-slate-900 text-white transition-all duration-300 min-h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-slate-700", collapsed && "justify-center px-2")}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 flex-shrink-0">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-sm leading-tight">AutoCred</p>
            <p className="text-xs text-blue-400 leading-tight">Crédito Automotivo</p>
          </div>
        )}
      </div>

      {/* Workshop info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Oficina</p>
          <p className="text-sm font-medium truncate">
            {workshopName || user?.user_metadata?.workshop_name || "Minha Oficina"}
          </p>
          <span className="inline-block mt-1 text-xs bg-blue-600/30 text-blue-300 rounded px-2 py-0.5">
            Plano {planLabel[workshopPlan as keyof typeof planLabel] ?? "Starter"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {renderSection("Crédito", creditItems)}
        {renderSection("Gestão", gestaoItems)}
        {renderSection("Plataforma", plataformaItems)}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-700 space-y-1">
        <button
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-white hover:bg-slate-600 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
