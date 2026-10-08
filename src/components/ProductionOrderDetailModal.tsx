import React, { useState } from 'react';
import {
  Printer,
  X,
  PlayCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  Boxes,
  Activity,
  UserCheck,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ProductionOrder, ProductionOrderStatus } from '../types';

interface ProductionOrderDetailModalProps {
  order: ProductionOrder;
  onClose: () => void;
  onPrint: () => void;
  onComplete: () => void;
  onUpdateStatus: (status: ProductionOrderStatus) => Promise<void>;
  onAddLog: (logData: { action: string; notes?: string; quantity_produced_add?: number; actual_hours_add?: number }) => Promise<void>;
}

export const ProductionOrderDetailModal: React.FC<ProductionOrderDetailModalProps> = ({
  order,
  onClose,
  onPrint,
  onComplete,
  onUpdateStatus,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'operations' | 'logs'>('overview');
  
  // Apontamento rápido
  const [logAction, setLogAction] = useState('Apontamento de Turno');
  const [logNotes, setLogNotes] = useState('');
  const [logQtyAdd, setLogQtyAdd] = useState(0);
  const [logHoursAdd, setLogHoursAdd] = useState(0);
  const [submittingLog, setSubmittingLog] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planejada':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">Planejada</span>;
      case 'liberada':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">Liberada / Pronta</span>;
      case 'em_andamento':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">Em Andamento</span>;
      case 'inspecao':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">Em Inspeção (CQ)</span>;
      case 'concluida':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Concluída / Baixada</span>;
      case 'cancelada':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Cancelada</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const handleQuickAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingLog(true);
      await onAddLog({
        action: logAction,
        notes: logNotes,
        quantity_produced_add: Number(logQtyAdd) || 0,
        actual_hours_add: Number(logHoursAdd) || 0
      });
      setLogNotes('');
      setLogQtyAdd(0);
      setLogHoursAdd(0);
    } finally {
      setSubmittingLog(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((order.quantity_produced / (order.quantity_planned || 1)) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-blue-700 tracking-tight">
                {order.code}
              </span>
              {getStatusBadge(order.status)}
              <span className="text-xs px-2 py-0.5 rounded uppercase font-bold bg-slate-200 text-slate-700">
                Prioridade: {order.priority}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              {order.product_code} - {order.product_name}
            </h2>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <span>Lote: <strong className="text-slate-700 font-mono">{order.lot_number || '-'}</strong></span>
              <span>•</span>
              <span>Cliente: <strong className="text-slate-700">{order.client_name || 'Estoque da Fábrica'}</strong></span>
              <span>•</span>
              <span>Prazo: <strong className="text-rose-600 font-bold">{new Date(order.scheduled_end_date + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimir A4</span>
            </button>
            {order.status !== 'concluida' && order.status !== 'cancelada' && (
              <button
                onClick={onComplete}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Dar Baixa (Concluir)</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="border-b border-slate-200 px-5 flex gap-4 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Visão Geral & Avanço</span>
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'materials'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Matérias-Primas Requisitadas ({order.materials?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'operations'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Roteiro de Fabricação ({order.operations?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Apontamentos & Chão de Fábrica ({order.logs?.length || 0})</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Progress cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Peças Produzidas</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{order.quantity_produced}</span>
                    <span className="text-xs text-slate-500">de {order.quantity_planned} {order.product_unit || 'UN'}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block text-right font-bold">{progressPercent}% Concluído</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Horas Trabalhadas</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{order.actual_hours || 0}h</span>
                    <span className="text-xs text-slate-500">/ {order.estimated_hours}h planejadas</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-3">
                    Início: {order.actual_start_date ? new Date(order.actual_start_date).toLocaleString('pt-BR') : 'Ainda não iniciado'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Controle de Refugo</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${order.quantity_scrapped > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {order.quantity_scrapped}
                    </span>
                    <span className="text-xs text-slate-500">peças refugadas</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-3">
                    Taxa de perda: {order.quantity_planned > 0 ? ((order.quantity_scrapped / order.quantity_planned) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              {/* Status progression stepper */}
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 text-xs block mb-3">
                  Avanço de Estágio da Ordem (Workflow PCP)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'planejada', label: '1. Planejada' },
                    { key: 'liberada', label: '2. Liberar Materiais' },
                    { key: 'em_andamento', label: '3. Iniciar Produção' },
                    { key: 'inspecao', label: '4. Inspeção / CQ' },
                    { key: 'concluida', label: '5. Concluir & Baixar' }
                  ].map((step) => {
                    const isCurrent = order.status === step.key;
                    return (
                      <button
                        key={step.key}
                        onClick={() => {
                          if (step.key === 'concluida') {
                            onComplete();
                          } else {
                            onUpdateStatus(step.key as ProductionOrderStatus);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical lead & Responsável */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Responsável Técnico Designado</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {order.technical_lead_name || 'Maria Isabela Cesar'}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Todas as operações auditadas conforme norma técnica interna.</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <span className="font-bold">Observações Técnicas: </span>
                  {order.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATERIAIS / BOM EXPLOSION */}
          {activeTab === 'materials' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-600">
                  Explosão de materiais calculada para <strong>{order.quantity_planned} unidade(s)</strong> do produto:
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Código</th>
                      <th className="py-2.5 px-3">Descrição Matéria-Prima</th>
                      <th className="py-2.5 px-3 text-right">Consumo Unitário</th>
                      <th className="py-2.5 px-3 text-right">Total Necessário</th>
                      <th className="py-2.5 px-3 text-center">Unidade</th>
                      <th className="py-2.5 px-3 text-right">Estoque Atual</th>
                      <th className="py-2.5 px-3 text-center">Disponibilidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!order.materials || order.materials.length === 0) ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          Nenhuma matéria-prima cadastrada na ficha técnica deste produto.
                        </td>
                      </tr>
                    ) : (
                      order.materials.map((m, idx) => {
                        const totalReq = m.quantity * order.quantity_planned;
                        const stockAvailable = (m.current_stock || 0) >= totalReq;
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {m.material_code || `MP-00${m.raw_material_id}`}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {m.material_name}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {m.quantity}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                              {totalReq.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-600">
                              {m.material_unit}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {m.current_stock ?? '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {stockAvailable ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Estoque Suficiente
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  Déficit Estoque
                                </span>
                              )}
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

          {/* TAB 3: OPERAÇÕES / ROTEIRO */}
          {activeTab === 'operations' && (
            <div>
              <p className="text-slate-600 mb-3">
                Sequenciamento de operações e postos de trabalho para fabricação:
              </p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3 w-12 text-center">Passo</th>
                      <th className="py-2.5 px-3">Operação</th>
                      <th className="py-2.5 px-3">Posto de Trabalho</th>
                      <th className="py-2.5 px-3 text-center">Setup</th>
                      <th className="py-2.5 px-3 text-center">Tempo Execução</th>
                      <th className="py-2.5 px-3">Instruções Operacionais</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!order.operations || order.operations.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500">
                          Nenhum roteiro detalhado cadastrado.
                        </td>
                      </tr>
                    ) : (
                      order.operations.map((op, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                            #{op.step_order || idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {op.operation_name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium">
                            {op.workcenter_name || 'Geral'}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {op.setup_time_minutes} min
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {op.run_time_minutes} min/un
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {op.instructions || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: APONTAMENTOS & LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-5">
              {/* Formulário de Apontamento Rápido */}
              <form onSubmit={handleQuickAddLog} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  + Registrar Novo Apontamento de Chão de Fábrica
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Ação</label>
                    <select
                      value={logAction}
                      onChange={(e) => setLogAction(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Apontamento de Turno">Apontamento de Turno</option>
                      <option value="Início de Operação">Início de Operação</option>
                      <option value="Troca de Ferramenta">Troca de Ferramenta / Setup</option>
                      <option value="Inspeção de Qualidade">Inspeção de Qualidade</option>
                      <option value="Parada de Máquina">Parada de Máquina</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">+ Peças Aprovadas</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={logQtyAdd}
                      onChange={(e) => setLogQtyAdd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">+ Horas Trabalhadas</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={logHoursAdd}
                      onChange={(e) => setLogHoursAdd(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ação</label>
                    <button
                      type="submit"
                      disabled={submittingLog}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
                    >
                      {submittingLog ? 'Gravando...' : 'Salvar Apontamento'}
                    </button>
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Observações do operador (ex: 5 peças finalizadas no posto de solda sem desvios)..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </form>

              {/* Lista de Logs */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 text-xs block">
                  Histórico de Eventos Registrados
                </span>
                {(!order.logs || order.logs.length === 0) ? (
                  <p className="text-slate-500 italic py-4">Nenhum evento registrado ainda.</p>
                ) : (
                  order.logs.map((lg) => (
                    <div key={lg.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{lg.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(lg.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {lg.notes && (
                          <p className="text-slate-600 mt-1 text-xs">{lg.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {lg.user_name}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
