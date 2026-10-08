import React from 'react';
import {
  LayoutDashboard,
  KanbanSquare,
  ShoppingCart,
  FileSpreadsheet,
  Boxes,
  Users2,
  Gauge,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'production_orders'
  | 'sales_orders'
  | 'products'
  | 'materials'
  | 'clients_suppliers'
  | 'capacity'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  criticalStockCount: number;
  activeOpsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onChangeTab,
  criticalStockCount,
  activeOpsCount
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Painel Geral PCP',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'production_orders' as NavTab,
      label: 'Ordens de Produção',
      icon: KanbanSquare,
      badge: activeOpsCount > 0 ? activeOpsCount : null,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'sales_orders' as NavTab,
      label: 'Pedidos de Venda',
      icon: ShoppingCart,
      badge: null
    },
    {
      id: 'products' as NavTab,
      label: 'Fichas Técnicas (BOM)',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'materials' as NavTab,
      label: 'Matéria-Prima & Estoque',
      icon: Boxes,
      badge: criticalStockCount > 0 ? `${criticalStockCount} crítico` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'capacity' as NavTab,
      label: 'Postos & Capacidade',
      icon: Gauge,
      badge: null
    },
    {
      id: 'clients_suppliers' as NavTab,
      label: 'Clientes & Fornecedores',
      icon: Users2,
      badge: null
    },
    {
      id: 'reports' as NavTab,
      label: 'Relatórios & Emissões',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings' as NavTab,
      label: 'Configurações Empresa',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 print:hidden select-none">
      {/* Sidebar navigation */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Módulos Operacionais
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer warning / info box */}
      {criticalStockCount > 0 && (
        <div className="p-4 m-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs">
          <div className="flex items-center gap-2 font-semibold mb-1 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Alerta de Reposição</span>
          </div>
          <p className="text-[11px] text-amber-200/80 leading-relaxed">
            {criticalStockCount} matéria(s)-prima(s) atingiram o estoque de segurança.
          </p>
          <button
            onClick={() => onChangeTab('materials')}
            className="mt-2 text-[11px] font-semibold text-amber-300 hover:text-white underline cursor-pointer"
          >
            Ver almoxarifado &rarr;
          </button>
        </div>
      )}

      {/* Bottom system status */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center justify-between text-[11px]">
          <span>Banco de Dados:</span>
          <span className="text-emerald-400 font-mono font-medium">SQLite (Relacional)</span>
        </div>
        <div className="flex items-center justify-between text-[11px] mt-1">
          <span>Modo:</span>
          <span className="text-blue-400 font-mono font-medium">PCP Full-Stack</span>
        </div>
      </div>
    </aside>
  );
};
