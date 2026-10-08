import React, { useState } from 'react';
import {
  KanbanSquare,
  List,
  Search,
  Filter,
  Plus,
  Printer,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MoreVertical,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ProductionOrder, ProductionOrderStatus, ProductionOrderPriority, Product, CompanySettings } from '../types';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  products: Product[];
  company: CompanySettings | null;
  onOpenOrder: (id: number) => void;
  onPrintOrder: (order: ProductionOrder) => void;
  onCompleteOrder: (order: ProductionOrder) => void;
  onNewOrder: () => void;
  onUpdateStatus: (id: number, status: ProductionOrderStatus) => Promise<void>;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  products,
  company,
  onOpenOrder,
  onPrintOrder,
  onCompleteOrder,
  onNewOrder,
  onUpdateStatus
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter orders
  const filteredOrders = orders.filter((op) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      op.code.toLowerCase().includes(term) ||
      (op.product_name && op.product_name.toLowerCase().includes(term)) ||
      (op.client_name && op.client_name.toLowerCase().includes(term)) ||
      (op.lot_number && op.lot_number.toLowerCase().includes(term)) ||
      (op.order_number && op.order_number.toLowerCase().includes(term));

    const matchStatus = statusFilter === 'all' || op.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || op.priority === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgente':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white uppercase tracking-wider">Urgente</span>;
      case 'alta':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">Alta</span>;
      case 'baixa':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">Baixa</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">Normal</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Planejada</span>;
      case 'liberada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Liberada</span>;
      case 'em_andamento':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">Em Andamento</span>;
      case 'inspecao':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Inspeção CQ</span>;
      case 'concluida':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Concluída</span>;
      case 'cancelada':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Cancelada</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const kanbanColumns: Array<{ id: ProductionOrderStatus; title: string; color: string; border: string }> = [
    { id: 'planejada', title: 'Planejadas (PCP)', color: 'bg-slate-100', border: 'border-slate-300' },
    { id: 'liberada', title: 'Liberadas / Almoxarifado', color: 'bg-sky-50', border: 'border-sky-300' },
    { id: 'em_andamento', title: 'Em Andamento (Chão)', color: 'bg-blue-50', border: 'border-blue-300' },
    { id: 'inspecao', title: 'Controle de Qualidade', color: 'bg-purple-50', border: 'border-purple-300' },
    { id: 'concluida', title: 'Concluídas / Baixadas', color: 'bg-emerald-50', border: 'border-emerald-300' }
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Ordens de Produção (PCP)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {filteredOrders.length} ordens
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Programação e acompanhamento em tempo real de chão de fábrica
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle View */}
          <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              <span>Quadro Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Lista / Tabela</span>
            </button>
          </div>

          <button
            onClick={onNewOrder}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova OP</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por código OP, produto, cliente, lote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">Todos os Status</option>
              <option value="planejada">Planejada</option>
              <option value="liberada">Liberada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="inspecao">Inspeção CQ</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Prioridade:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="urgente">Urgente</option>
              <option value="alta">Alta</option>
              <option value="normal">Normal</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((op) => op.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-xl border ${col.border} ${col.color} p-3 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800">
                    {col.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 font-bold text-[11px] shadow-2xs border border-slate-200">
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders in column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      Vazio
                    </div>
                  ) : (
                    colOrders.map((op) => {
                      const percent = Math.min(100, Math.round((op.quantity_produced / (op.quantity_planned || 1)) * 100));
                      return (
                        <div
                          key={op.id}
                          className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-2.5 group"
                        >
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <span
                              onClick={() => onOpenOrder(op.id)}
                              className="font-mono font-black text-blue-700 hover:underline cursor-pointer text-xs"
                            >
                              {op.code}
                            </span>
                            {getPriorityBadge(op.priority)}
                          </div>

                          {/* Product info */}
                          <div
                            onClick={() => onOpenOrder(op.id)}
                            className="cursor-pointer"
                          >
                            <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                              {op.product_name}
                            </h4>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {op.product_code} • Lote: {op.lot_number || '-'}
                            </div>
                          </div>

                          {/* Quantities & Progress */}
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                              <span>Produção:</span>
                              <span className="font-bold text-slate-800">
                                {op.quantity_produced} / {op.quantity_planned} {op.product_unit || 'UN'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Dates & Client */}
                          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                            <span className="truncate max-w-[110px]" title={op.client_name || 'Estoque'}>
                              {op.client_name || 'Estoque da Fábrica'}
                            </span>
                            <span className="font-semibold text-rose-600">
                              Entrega: {new Date(op.scheduled_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                            <button
                              onClick={() => onPrintOrder(op)}
                              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Imprimir Ordem (A4)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Status quick transitions */}
                            <div className="flex items-center gap-1">
                              {op.status === 'planejada' && (
                                <button
                                  onClick={() => onUpdateStatus(op.id, 'liberada')}
                                  className="px-2 py-1 rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold transition-colors cursor-pointer text-[10px]"
                                >
                                  Liberar &rarr;
                                </button>
                              )}
                              {op.status === 'liberada' && (
                                <button
                                  onClick={() => onUpdateStatus(op.id, 'em_andamento')}
                                  className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold transition-colors cursor-pointer text-[10px]"
                                >
                                  Iniciar &rarr;
                                </button>
                              )}
                              {op.status === 'em_andamento' && (
                                <button
                                  onClick={() => onUpdateStatus(op.id, 'inspecao')}
                                  className="px-2 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold transition-colors cursor-pointer text-[10px]"
                                >
                                  CQ &rarr;
                                </button>
                              )}
                              {op.status !== 'concluida' && (
                                <button
                                  onClick={() => onCompleteOrder(op)}
                                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer text-[10px]"
                                >
                                  Baixar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Código OP</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Cliente / Pedido</th>
                  <th className="py-3 px-4 text-center">Programado</th>
                  <th className="py-3 px-4 text-center">Progresso</th>
                  <th className="py-3 px-4">Início / Fim</th>
                  <th className="py-3 px-4 text-center">Horas</th>
                  <th className="py-3 px-4 text-center">Prioridade</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      Nenhuma ordem de produção encontrada com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((op) => {
                    const percent = Math.min(100, Math.round((op.quantity_produced / (op.quantity_planned || 1)) * 100));
                    return (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {op.code}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{op.product_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {op.product_code} • Lote: {op.lot_number || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>{op.client_name || 'Estoque Fábrica'}</div>
                          {op.order_number && (
                            <div className="text-[10px] text-slate-500 font-mono">{op.order_number}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {op.quantity_planned} {op.product_unit || 'UN'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-bold text-slate-900">{percent}% ({op.quantity_produced} un)</div>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div>{new Date(op.scheduled_start_date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                          <div className="text-rose-600 font-bold">{new Date(op.scheduled_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700">
                          {op.actual_hours || 0}h / {op.estimated_hours}h
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getPriorityBadge(op.priority)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(op.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onPrintOrder(op)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Imprimir Ordem de Produção (A4)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenOrder(op.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
                            >
                              Detalhes
                            </button>
                            {op.status !== 'concluida' && op.status !== 'cancelada' && (
                              <button
                                onClick={() => onCompleteOrder(op)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
                              >
                                Baixar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
