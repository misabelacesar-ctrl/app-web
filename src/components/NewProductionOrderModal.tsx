import React, { useState, useEffect } from 'react';
import { Layers, X, Calendar, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Product, CompanySettings, ProductionOrderPriority } from '../types';

interface NewProductionOrderModalProps {
  products: Product[];
  company: CompanySettings | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const NewProductionOrderModal: React.FC<NewProductionOrderModalProps> = ({
  products,
  company,
  onClose,
  onSubmit
}) => {
  const [productId, setProductId] = useState<number>(products[0]?.id || 0);
  const [quantity, setQuantity] = useState<number>(10);
  const [priority, setPriority] = useState<ProductionOrderPriority>('normal');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Entrega padrão + 7 dias
  const defaultDelivery = new Date();
  defaultDelivery.setDate(defaultDelivery.getDate() + 7);
  const [endDate, setEndDate] = useState<string>(defaultDelivery.toISOString().slice(0, 10));
  
  const [notes, setNotes] = useState<string>('');
  const [lotNumber, setLotNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === Number(productId)) || products[0];

  useEffect(() => {
    if (selectedProduct) {
      const year = new Date().getFullYear().toString().slice(-2);
      const rand = Math.floor(100 + Math.random() * 900);
      setLotNumber(`LOT-${selectedProduct.code}-${year}${rand}`);
    }
  }, [productId, selectedProduct]);

  // Tempo estimado em horas com base na quantidade e lead time
  const leadMinutes = selectedProduct?.total_process_minutes || selectedProduct?.lead_time_minutes || 60;
  const estimatedHours = Number(((leadMinutes * quantity) / 60).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) {
      setError('Selecione um produto e uma quantidade válida.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        product_id: Number(productId),
        quantity_planned: Number(quantity),
        priority,
        scheduled_start_date: startDate,
        scheduled_end_date: endDate,
        lot_number: lotNumber,
        notes: notes || `Ordem de produção para ${selectedProduct?.name}`
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar Ordem de Produção');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Nova Ordem de Produção (OP)
              </h3>
              <p className="text-xs text-slate-500">
                Programação no módulo de Planejamento e Controle de Produção
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Seleção do Produto */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Produto Acabado (Ficha Técnica) *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.unit})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedProduct.description} • Tempo unitário: {leadMinutes} min • Estoque atual: {selectedProduct.current_stock} {selectedProduct.unit}
              </p>
            )}
          </div>

          {/* Quantidade e Lote */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Quantidade Programada *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Identificação do Lote (Rastreabilidade)
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 text-sm"
              />
            </div>
          </div>

          {/* Prioridade & Estimativa */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Prioridade da Ordem
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProductionOrderPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente (Linha Crítica)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Carga / Tempo Estimado
              </label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-slate-800 font-bold">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{estimatedHours} horas</span>
                <span className="text-[10px] text-slate-600 font-normal">({quantity} un x {leadMinutes}m)</span>
              </div>
            </div>
          </div>

          {/* Prazos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Início Programado *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Prazo Final de Entrega *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold text-rose-700"
              />
            </div>
          </div>

          {/* Responsável Técnico Aviso */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold">Responsável Técnico Vinculado: </span>
              <span>{company?.technical_lead_name || 'Maria Isabela Cesar'} ({company?.technical_lead_reg || 'CREA-SP'})</span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Instruções Adicionais de Produção
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="Ex: Utilizar gabarito reforçado; verificar tolerâncias com paquímetro..."
            />
          </div>

          {/* Botões */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>{loading ? 'Gerando OP...' : 'Emitir Ordem de Produção'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
