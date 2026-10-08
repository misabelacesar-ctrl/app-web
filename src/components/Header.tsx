import React from 'react';
import {
  Factory,
  ShieldCheck,
  Clock,
  Printer,
  Sparkles,
  Building2
} from 'lucide-react';
import { CompanySettings } from '../types';

interface HeaderProps {
  company: CompanySettings | null;
  activeOpsCount: number;
  onOpenSettings: () => void;
  onQuickPrintLatest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  activeOpsCount,
  onOpenSettings,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs print:hidden">
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Factory info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                {company?.company_name || 'ManufacPro Industrial'}
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200/60">
                PCP & ERP
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{company?.trade_name || 'Planejamento e Controle de Produção'}</span>
              <span>•</span>
              <span className="capitalize">{todayFormatted}</span>
            </p>
          </div>
        </div>

        {/* Technical Lead Badge & Factory Stats */}
        <div className="flex items-center gap-3">
          {/* Active Orders indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Em Produção:</span>
            <span className="font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-slate-200">
              {activeOpsCount} OPs Ativas
            </span>
          </div>

          {/* Technical Lead card */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/60 transition-colors text-left group cursor-pointer"
            title="Clique para editar dados do Responsável Técnico"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800 flex items-center gap-1">
                <span>Responsável Técnico</span>
                <span className="text-[10px] text-emerald-600 group-hover:underline">alterar</span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate max-w-[160px] sm:max-w-[200px]">
                {company?.technical_lead_name || 'Maria Isabela Cesar'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
