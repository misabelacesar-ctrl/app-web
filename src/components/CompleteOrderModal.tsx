import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Boxes, Clock, UserCheck } from 'lucide-react';
import { ProductionOrder } from '../types';

interface CompleteOrderModalProps {
  order: ProductionOrder;
  onClose: () => void;
  onConfirm: (data: {
    quantity_produced: number;
    quantity_scrapped: number;
    actual_hours: number;
    user_name: string;
    notes: string;
    deduct_materials: boolean;
    increment_product_stock: boolean;
  }) => Promise<void>;
}

export const CompleteOrderModal: React.FC<CompleteOrderModalProps> = ({
  order,
  onClose,
  onConfirm
}) => {
  const [produced, setProduced] = useState<number>(order.quantity_planned);
  const [scrapped, setScrapped] = useState<number>(0);
  const [actualHours, setActualHours] = useState<number>(order.actual_hours || order.estimated_hours);
  const [userName, setUserName] = useState<string>(order.technical_lead_name || 'Maria Isabela Cesar');
  const [notes, setNotes] = useState<string>('Produção finalizada em conformidade com o padrão técnico.');
  const [deductMaterials, setDeductMaterials] = useState<boolean>(true);
  const [incrementStock, setIncrementStock] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (produced < 0) {
      setError('Quantidade produzida não pode ser negativa.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onConfirm({
        quantity_produced: Number(produced),
        quantity_scrapped: Number(scrapped),
        actual_hours: Number(actualHours),
        user_name: userName,
        notes,
        deduct_materials: deductMaterials,
        increment_product_stock: incrementStock
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar baixa da ordem');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Baixa e Conclusão de Ordem
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {order.code} • {order.product_name}
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
          {/* Quantidades */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Quantidade Aprovada (UN) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={produced}
                onChange={(e) => setProduced(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 text-sm"
              />
              <span className="text-[10px] text-slate-400">
                Previsto na OP: {order.quantity_planned}
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Refugo / Sucata (UN)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={scrapped}
                onChange={(e) => setScrapped(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
              />
              <span className="text-[10px] text-slate-400">
                Peças não conformes
              </span>
            </div>
          </div>

          {/* Horas reais & Operador */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Horas Reais de Produção *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={actualHours}
                  onChange={(e) => setActualHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-xs">horas</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Previsto: {order.estimated_hours}h
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Responsável pelo Apontamento *
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
              />
              <span className="text-[10px] text-slate-400">
                Responsável técnico ou supervisor
              </span>
            </div>
          </div>

          {/* Opções de Estoque Integrado */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-blue-600" />
              <span>Integração Automática com Estoque</span>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={deductMaterials}
                onChange={(e) => setDeductMaterials(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 text-xs">
                <strong>Baixar matérias-primas do estoque:</strong> Deduz automaticamente do almoxarifado as quantidades consumidas conforme a ficha técnica (BOM) x {produced + scrapped} un.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={incrementStock}
                onChange={(e) => setIncrementStock(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 text-xs">
                <strong>Entrada de Produto Acabado:</strong> Adiciona {produced} unidade(s) ao estoque de produtos prontos para expedição.
              </span>
            </label>
          </div>

          {/* Observações */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Observações / Laudo de Baixa
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs"
              placeholder="Ex: Todas as peças inspecionadas e aprovadas pelo controle de qualidade..."
            />
          </div>

          {/* Ações */}
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Processando...' : 'Confirmar Conclusão & Baixa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
