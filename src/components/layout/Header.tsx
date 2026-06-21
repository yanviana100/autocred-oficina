"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getSupabase, getWorkshopId } from "@/lib/db";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

interface PlateResult { id: string; plate: string; brand: string; model: string; year: number; customerName: string; }

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const initials = (user?.user_metadata?.owner_name ?? user?.email ?? "A").charAt(0).toUpperCase();
  const [plateQuery, setPlateQuery] = useState("");
  const [results, setResults] = useState<PlateResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (val: string) => {
    setPlateQuery(val);
    if (val.length < 3) { setResults([]); setShowResults(false); return; }
    setSearching(true);
    const workshopId = await getWorkshopId();
    if (!workshopId) { setSearching(false); return; }
    const supabase = getSupabase();
    const { data } = await supabase
      .from("vehicles")
      .select("id, plate, brand, model, year, customers(name)")
      .eq("workshop_id", workshopId)
      .ilike("plate", `%${val}%`)
      .limit(5);
    setResults((data ?? []).map((r) => ({
      id: r.id,
      plate: r.plate,
      brand: r.brand,
      model: r.model,
      year: r.year,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customerName: (r as any).customers?.name ?? "",
    })));
    setShowResults(true);
    setSearching(false);
  };

  const handleSelect = (id: string) => {
    setPlateQuery("");
    setShowResults(false);
    router.push(`/veiculos/${id}`);
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-slate-100 flex-shrink-0">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Busca por placa */}
        <div ref={containerRef} className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="w-36 md:w-48 h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            placeholder="Buscar placa..."
            value={plateQuery}
            onChange={(e) => handleSearch(e.target.value.toUpperCase())}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {searching && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
          )}
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b last:border-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{r.plate}</span>
                    <span className="text-xs text-slate-500">{r.brand} {r.model} {r.year}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{r.customerName}</p>
                </button>
              ))}
            </div>
          )}
          {showResults && results.length === 0 && plateQuery.length >= 3 && !searching && (
            <div className="absolute top-full mt-1 left-0 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 text-xs text-slate-500">
              Nenhum veículo encontrado.
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" className="relative w-8 h-8">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2 border-l pl-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium leading-none">{user?.user_metadata?.owner_name ?? "Usuário"}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
