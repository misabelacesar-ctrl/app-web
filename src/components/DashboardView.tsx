import React from 'react';
import {
  Layers,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  ArrowRight,
  TrendingUp,
  Package,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DashboardData, CompanySettings, ProductionOrder } from '../types';

interface DashboardViewProps {
  data: DashboardData | null;
  company: CompanySettings | null;
  onNavigateTab: (tab: any) => void;
  onOpenOrder: (orderId: number) => void;
  onNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  company,
  onNavigateTab,
  onOpenOrder,
  onNewOrder
}) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, lowStockMaterials, statusDistribution, upcomingOrders } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Planejada</span>;
      case 'liberada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Liberada</span>;
      case 'em_andamento':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">Em Andamento</span>;
      case 'inspecao':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Em Inspeção</span>;
      case 'concluida':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Concluída</span>;
      case 'cancelada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Cancelada</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">Alta</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">Normal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              Painel de Controle de Produção (PCP)
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Gestão Operacional da Manufatura
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Acompanhamento em tempo real de ordens de produção, carga de trabalho dos postos de trabalho e controle de matéria-prima.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('production_orders')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/10 cursor-pointer"
          >
            Quadro Kanban
          </button>
          <button
            onClick={onNewOrder}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-2"
          >
            <span>+ Nova Ordem (OP)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ordens Ativas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ordens em Produção
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.activeOps}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              de {metrics.totalOps} total
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
            <span>{metrics.inProgressOps} no chão de fábrica agora</span>
          </div>
        </div>

        {/* Card 2: Horas Executadas vs Planejadas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Horas de Produção
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.executedHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {metrics.plannedHours.toFixed(1)}h prev.
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            Tempo real vs projetado na ficha técnica
          </div>
        </div>

        {/* Card 3: Utilização da Capacidade */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Carga da Fábrica
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {metrics.capacityUtilization}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ocupação semanal
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                metrics.capacityUtilization > 95
                  ? 'bg-rose-500'
                  : metrics.capacityUtilization > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.capacityUtilization)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Alertas de Matéria-Prima */}
        <div
          onClick={() => onNavigateTab('materials')}
          className={`bg-white p-5 rounded-xl border shadow-2xs hover:shadow-xs transition-shadow cursor-pointer ${
            metrics.criticalStockCount > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estoque Crítico (Insumos)
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              metrics.criticalStockCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${metrics.criticalStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.criticalStockCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              abaixo do estoque mínimo
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            <span>Verificar almoxarifado</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Status Distribution & Next Priority Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Próximas Entregas / Ordens Prioritárias */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Ordens de Produção Prioritárias & Prazos
              </h3>
              <p className="text-xs text-slate-500">
                Ordens com entrega mais próxima ou alta prioridade
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('production_orders')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Código OP</th>
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3 text-center">Progresso</th>
                  <th className="py-2.5 px-3">Prazo Entrega</th>
                  <th className="py-2.5 px-3 text-center">Prioridade</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upcomingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-600 text-sm">
                      Nenhuma ordem de produção ativa no momento.
                    </td>
                  </tr>
                ) : (
                  upcomingOrders.map((op) => {
                    const percent = Math.min(100, Math.round((op.quantity_produced / (op.quantity_planned || 1)) * 100));
                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">
                          {op.code}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {op.product_name}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            {op.product_code}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]">
                          {op.client_name || 'Estoque da Fábrica'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="font-bold text-slate-800">
                            {op.quantity_produced} / {op.quantity_planned}
                          </div>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {new Date(op.scheduled_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {getPriorityBadge(op.priority)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(op.status)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onOpenOrder(op.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                          >
                            Abrir OP
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Status Distribution & Technical Lead info */}
        <div className="space-y-6">
          {/* Status distribution card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Status das Ordens
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribuição por estágio do processo
            </p>

            <div className="space-y-2.5">
              {[
                { key: 'planejada', label: 'Planejada', color: 'bg-slate-400' },
                { key: 'liberada', label: 'Liberada / Insumos OK', color: 'bg-sky-500' },
                { key: 'em_andamento', label: 'Em Andamento', color: 'bg-blue-600' },
                { key: 'inspecao', label: 'Controle de Qualidade', color: 'bg-purple-600' },
                { key: 'concluida', label: 'Concluída / Baixada', color: 'bg-emerald-600' }
              ].map((item) => {
                const found = statusDistribution.find((s) => s.status === item.key);
                const count = found ? found.count : 0;
                const total = metrics.totalOps || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {count} <span className="text-[10px] text-slate-600 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Lead & Compliance Card */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 rounded-xl border border-emerald-200/80 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Responsabilidade Técnica
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  {company?.technical_lead_name || 'Maria Isabela Cesar'}
                </h4>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              {company?.technical_lead_role || 'Engenheira de Produção'} • {company?.technical_lead_reg || 'CREA-SP'}
            </p>
            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-emerald-100">
              Assinatura e visto técnico constam em todas as ordens de produção emitidas, laudos de qualidade e roteiros de fabricação.
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="mt-3 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Configurar Dados do Responsável
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
