import React from 'react';
import { Printer, X, ShieldCheck, Factory, CheckSquare, Calendar, User, Clock, AlertCircle } from 'lucide-react';
import { ProductionOrder, CompanySettings } from '../types';

interface PrintProductionOrderModalProps {
  order: ProductionOrder | null;
  company: CompanySettings | null;
  onClose: () => void;
}

export const PrintProductionOrderModal: React.FC<PrintProductionOrderModalProps> = ({
  order,
  company,
  onClose
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR');
  };

  const techLead = order.technical_lead_name || company?.technical_lead_name || 'Maria Isabela Cesar';
  const techRole = company?.technical_lead_role || 'Engenheira de Produção - Responsável Técnica';
  const techReg = company?.technical_lead_reg || 'CREA-SP 50698741-2';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Controls Bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-60 flex items-center gap-2 print:hidden bg-white/95 p-2 rounded-xl shadow-xl border border-slate-200">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Ordem (A4)</span>
        </button>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fechar visualização"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet (Standard A4 layout) */}
      <div className="bg-white text-slate-900 w-full max-w-[850px] min-h-[1100px] p-8 sm:p-12 shadow-2xl rounded-lg my-8 print:m-0 print:p-6 print:shadow-none print:w-full print:rounded-none">
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                <Factory className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  {company?.company_name || 'Indústria & Manufatura Progresso Ltda.'}
                </h1>
                <p className="text-xs text-slate-600">
                  {company?.trade_name || 'Departamento de Planejamento e Controle de Produção (PCP)'}
                </p>
                <p className="text-[11px] text-slate-500">
                  CNPJ: {company?.cnpj || '12.345.678/0001-90'} • {company?.phone || '(11) 4002-8922'} • {company?.address || 'São Paulo - SP'}
                </p>
              </div>
            </div>

            {/* Document Title & Order Code Box */}
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-sm mb-1">
                ORDEM DE PRODUÇÃO
              </div>
              <div className="text-2xl font-mono font-black text-slate-900 tracking-tight">
                {order.code}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Lote: <span className="font-bold text-slate-900">{order.lot_number || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Simulator & Meta Info Bar */}
        <div className="bg-slate-50 border border-slate-300 rounded-sm p-3 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Data Emissão / PCP</span>
            <span className="font-semibold text-slate-900">{formattedDate(order.created_at || order.scheduled_start_date)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Início Previsto</span>
            <span className="font-semibold text-slate-900">{formattedDate(order.scheduled_start_date)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Prazo de Entrega (Fatal)</span>
            <span className="font-bold text-red-600">{formattedDate(order.scheduled_end_date)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Prioridade</span>
            <span className="font-black uppercase tracking-wider text-slate-900">
              {order.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Product & Sales Order Details */}
        <div className="border border-slate-300 rounded-sm mb-6 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              1. Identificação do Produto & Destinação
            </span>
            <span className="text-xs font-mono font-semibold text-slate-600">
              {order.order_number ? `Pedido: ${order.order_number}` : 'Fabricação p/ Estoque'}
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="md:col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Item Fabricado</div>
              <div className="text-base font-black text-slate-900">
                {order.product_code} - {order.product_name}
              </div>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                {order.product_description || 'Produto industrial conforme especificações técnicas de engenharia.'}
              </p>
              {order.technical_spec && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                  <span className="font-bold">Especificação Técnica:</span> {order.technical_spec}
                </div>
              )}
            </div>

            <div className="border-l border-slate-200 pl-4 space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Quantidade Programada</span>
                <span className="text-2xl font-black text-slate-900">
                  {order.quantity_planned} <span className="text-xs font-normal text-slate-600">{order.product_unit || 'UN'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente / Requisitante</span>
                <span className="font-semibold text-slate-800">{order.client_name || 'Almoxarifado Geral (Estoque Próprio)'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Tempo Previsto de Máquina/Processo</span>
                <span className="font-semibold text-slate-800">{order.estimated_hours} horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill of Materials (BOM) - Warehouse Requisition */}
        <div className="border border-slate-300 rounded-sm mb-6 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              2. Ficha Técnica - Requisição de Matérias-Primas (Almoxarifado)
            </span>
            <span className="text-[11px] text-slate-500">
              Conferir e rubricar separação
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2 px-3 w-8 text-center">Visto</th>
                <th className="py-2 px-3">Código Insumo</th>
                <th className="py-2 px-3">Descrição da Matéria-Prima</th>
                <th className="py-2 px-3 text-right">Qtd Unitária</th>
                <th className="py-2 px-3 text-right">Qtd Total Necessária</th>
                <th className="py-2 px-3 text-center">Unid.</th>
                <th className="py-2 px-3">Almoxarifado / Posição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(!order.materials || order.materials.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500 italic">
                    Nenhum insumo cadastrado na BOM deste produto.
                  </td>
                </tr>
              ) : (
                order.materials.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center">
                      <div className="w-4 h-4 border border-slate-400 rounded-xs inline-block" />
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{m.material_code || `MP-00${m.raw_material_id}`}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{m.material_name}</td>
                    <td className="py-2 px-3 text-right font-mono">{m.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {(m.quantity * order.quantity_planned).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">{m.material_unit || 'UN'}</td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{m.notes || 'Separado p/ Produção'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Manufacturing Operations / Routing */}
        <div className="border border-slate-300 rounded-sm mb-6 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              3. Roteiro de Fabricação & Postos de Trabalho (PCP)
            </span>
            <span className="text-[11px] text-slate-500">
              Checklist de Operações
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2 px-3 w-12 text-center">Passo</th>
                <th className="py-2 px-3">Operação / Processo</th>
                <th className="py-2 px-3">Posto de Trabalho</th>
                <th className="py-2 px-3 text-center">Tempo Setup</th>
                <th className="py-2 px-3 text-center">Tempo Operação</th>
                <th className="py-2 px-3">Instruções de Fabricação</th>
                <th className="py-2 px-3 text-center w-20">Rubrica Op.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(!order.operations || order.operations.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-500 italic">
                    Nenhum roteiro detalhado cadastrado. Seguir instrução padrão da fábrica.
                  </td>
                </tr>
              ) : (
                order.operations.map((op, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center font-bold text-slate-700">#{op.step_order || idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{op.operation_name}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{op.workcenter_name || 'Bancada Geral'}</td>
                    <td className="py-2 px-3 text-center text-slate-600">{op.setup_time_minutes} min</td>
                    <td className="py-2 px-3 text-center text-slate-600">{op.run_time_minutes} min/un</td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{op.instructions || 'Executar conforme desenho.'}</td>
                    <td className="py-2 px-3 text-center">
                      <div className="w-14 border-b border-slate-400 h-5" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Floor Control Sheet (Apontamentos de Chão de Fábrica) */}
        <div className="border border-slate-300 rounded-sm mb-6 overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              4. Controle de Apontamento de Chão de Fábrica (Preenchimento pelo Operador)
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2 px-3 w-24">Data</th>
                <th className="py-2 px-3 w-20">Início</th>
                <th className="py-2 px-3 w-20">Término</th>
                <th className="py-2 px-3 w-24 text-center">Qtd Produzida</th>
                <th className="py-2 px-3 w-24 text-center">Qtd Refugo</th>
                <th className="py-2 px-3">Nome / Matrícula do Operador</th>
                <th className="py-2 px-3 w-24 text-center">Visto Inspetor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[1, 2, 3].map((row) => (
                <tr key={row} className="h-8">
                  <td className="py-2 px-3 border-r border-slate-100">___/___/2026</td>
                  <td className="py-2 px-3 border-r border-slate-100">___:___</td>
                  <td className="py-2 px-3 border-r border-slate-100">___:___</td>
                  <td className="py-2 px-3 border-r border-slate-100 text-center">__________</td>
                  <td className="py-2 px-3 border-r border-slate-100 text-center">__________</td>
                  <td className="py-2 px-3 border-r border-slate-100">__________________________</td>
                  <td className="py-2 px-3 text-center">__________</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Observations and Engineering Notes */}
        {order.notes && (
          <div className="mb-6 p-3 bg-amber-50/60 border border-amber-200 rounded-sm text-xs text-amber-900">
            <span className="font-bold">Observações do PCP: </span>
            {order.notes}
          </div>
        )}

        {/* Signatures & Official Validation Footer */}
        <div className="mt-8 pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
          {/* Operator signature */}
          <div className="text-center">
            <div className="border-b border-slate-400 h-10 mb-2" />
            <div className="font-bold text-slate-900">Assinatura do Líder / Operador da Célula</div>
            <div className="text-[11px] text-slate-500">Apontamento de chão de fábrica conferido</div>
          </div>

          {/* Technical Lead Official Sign-Off (Maria Isabela Cesar) */}
          <div className="text-center bg-slate-50 p-4 border border-slate-300 rounded-sm">
            <div className="border-b-2 border-slate-800 h-8 mb-2 flex items-center justify-center">
              <span className="font-serif italic text-sm text-slate-800 tracking-wider">
                {techLead}
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {techLead}
            </div>
            <div className="text-xs font-semibold text-emerald-800">
              {techRole}
            </div>
            <div className="text-[11px] text-slate-600 font-mono">
              {techReg}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Documento emitido pelo Sistema ManufacPro PCP • Autenticidade Registrada
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
