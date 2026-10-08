import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { ProductionOrder, CompanySettings, RawMaterial } from '../types';

interface ReportsViewProps {
  orders: ProductionOrder[];
  materials: RawMaterial[];
  company: CompanySettings | null;
  onPrintOrder: (order: ProductionOrder) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  materials,
  company,
  onPrintOrder
}) => {
  const [reportType, setReportType] = useState<'production_status' | 'inventory_critical' | 'efficiency'>('production_status');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    return statusFilter === 'all' || o.status === statusFilter;
  });

  const criticalMaterials = materials.filter((m) => m.current_stock <= m.minimum_stock);

  const handleExportCsv = () => {
    if (reportType === 'production_status') {
      const headers = ['Codigo OP', 'Produto', 'Cliente', 'Qtd Planejada', 'Qtd Produzida', 'Status', 'Prioridade', 'Inicio', 'Prazo Final', 'Horas Estimadas', 'Horas Reais'];
      const rows = filteredOrders.map((o) => [
        o.code,
        `"${o.product_name}"`,
        `"${o.client_name || 'Estoque'}"`,
        o.quantity_planned,
        o.quantity_produced,
        o.status,
        o.priority,
        o.scheduled_start_date,
        o.scheduled_end_date,
        o.estimated_hours,
        o.actual_hours || 0
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `relatorio_pcp_ordens_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Codigo', 'Descricao', 'Unidade', 'Estoque Atual', 'Estoque Minimo', 'Deficit', 'Custo Unitario'];
      const rows = criticalMaterials.map((m) => [
        m.code,
        `"${m.name}"`,
        m.unit,
        m.current_stock,
        m.minimum_stock,
        (m.minimum_stock - m.current_stock).toFixed(2),
        m.unit_cost.toFixed(2)
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `relatorio_insumos_criticos_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Relatórios Gerenciais & Acompanhamento</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de relatórios analíticos com visto e responsabilidade técnica
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Tabs / Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('production_status')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              reportType === 'production_status'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Acompanhamento de Ordens (PCP)
          </button>
          <button
            onClick={() => setReportType('inventory_critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              reportType === 'inventory_critical'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Insumos & Reposição ({criticalMaterials.length})
          </button>
        </div>

        {reportType === 'production_status' && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filtro de Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
            >
              <option value="all">Todas as Ordens</option>
              <option value="planejada">Planejada</option>
              <option value="liberada">Liberada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="inspecao">Inspeção CQ</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
        )}
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase">
              {company?.company_name || 'ManufacPro Industrial'}
            </h1>
            <p className="text-xs text-slate-600">
              Departamento de Planejamento e Controle de Produção (PCP)
            </p>
            <p className="text-[11px] text-slate-500">
              CNPJ: {company?.cnpj || '-'} • Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 block">
              {reportType === 'production_status' ? 'RELATÓRIO DE STATUS DE PRODUÇÃO' : 'RELATÓRIO DE RUPTURA DE MATÉRIA-PRIMA'}
            </span>
            <span className="text-[11px] text-slate-500">
              Responsável Técnico: <strong className="text-slate-900">{company?.technical_lead_name || 'Maria Isabela Cesar'}</strong>
            </span>
          </div>
        </div>

        {/* Content: Production Status Report */}
        {reportType === 'production_status' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Código OP</th>
                  <th className="py-2.5 px-3">Produto Fabricado</th>
                  <th className="py-2.5 px-3">Cliente / Destino</th>
                  <th className="py-2.5 px-3 text-center">Planejado</th>
                  <th className="py-2.5 px-3 text-center">Produzido</th>
                  <th className="py-2.5 px-3 text-center">Refugo</th>
                  <th className="py-2.5 px-3 text-center">Horas Real/Prev</th>
                  <th className="py-2.5 px-3">Prazo Entrega</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right print:hidden">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      Nenhuma ordem encontrada para exibição.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{o.code}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{o.product_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{o.product_code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{o.client_name || 'Estoque Geral'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{o.quantity_planned}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{o.quantity_produced}</td>
                      <td className="py-2.5 px-3 text-center text-rose-600 font-bold">{o.quantity_scrapped || 0}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        {o.actual_hours || 0}h / {o.estimated_hours}h
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {new Date(o.scheduled_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold capitalize">
                        {o.status.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right print:hidden">
                        <button
                          onClick={() => onPrintOrder(o)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] cursor-pointer"
                        >
                          Emitir OP
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Content: Critical Inventory Report */}
        {reportType === 'inventory_critical' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Descrição da Matéria-Prima</th>
                  <th className="py-2.5 px-3 text-center">Unidade</th>
                  <th className="py-2.5 px-3 text-right">Estoque Físico</th>
                  <th className="py-2.5 px-3 text-right">Ponto de Reposição (Mínimo)</th>
                  <th className="py-2.5 px-3 text-right">Déficit Imediato</th>
                  <th className="py-2.5 px-3 text-right">Custo Estimado Reposição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {criticalMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-emerald-700 font-semibold">
                      Excelente! Todas as matérias-primas estão com estoque acima do ponto de segurança.
                    </td>
                  </tr>
                ) : (
                  criticalMaterials.map((m) => {
                    const deficit = Math.max(0, m.minimum_stock - m.current_stock);
                    const costToReplenish = deficit * m.unit_cost;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{m.name}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-600">{m.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-rose-600">{m.current_stock}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800">{m.minimum_stock}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          -{deficit.toFixed(2)} {m.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          R$ {costToReplenish.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Sign-Off Footer */}
        <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">
              Documento oficial de acompanhamento e auditoria de manufatura.
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Hash de controle: PCP-2026-REPORT-{Date.now().toString().slice(-6)}
            </span>
          </div>

          <div className="text-center sm:text-right">
            <div className="border-b border-slate-700 w-56 mb-1 mx-auto sm:ml-auto" />
            <div className="font-bold text-slate-900">
              {company?.technical_lead_name || 'Maria Isabela Cesar'}
            </div>
            <div className="text-[11px] text-slate-600">
              {company?.technical_lead_role || 'Engenheira de Produção'} • {company?.technical_lead_reg || 'CREA-SP 50698741-2'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
