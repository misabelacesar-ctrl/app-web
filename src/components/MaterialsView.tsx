import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  PackagePlus,
  Building,
  MapPin,
  X
} from 'lucide-react';
import { RawMaterial, Supplier } from '../types';

interface MaterialsViewProps {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onSaveMaterial: (data: Partial<RawMaterial>, isEdit?: boolean, id?: number) => Promise<void>;
  onDeleteMaterial: (id: number) => Promise<void>;
  onAdjustStock: (id: number, data: { quantity: number; type: 'entrada' | 'saida' | 'ajuste'; notes?: string }) => Promise<void>;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  suppliers,
  onSaveMaterial,
  onDeleteMaterial,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Stock adjust modal
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);

  const filtered = materials.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(term) ||
      m.code.toLowerCase().includes(term) ||
      (m.supplier_name && m.supplier_name.toLowerCase().includes(term));

    const isCritical = m.current_stock <= m.minimum_stock;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'critical' && isCritical);

    return matchSearch && matchStatus;
  });

  const criticalCount = materials.filter((m) => m.current_stock <= m.minimum_stock).length;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Matérias-Primas & Almoxarifado</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {materials.length} itens
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle de estoque de insumos, ponto de reposição e fornecedores
          </p>
        </div>

        <button
          onClick={() => {
            setEditingMaterial(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Matéria-Prima</span>
        </button>
      </div>

      {/* Warning Banner if low stock */}
      {criticalCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900">
                Atenção ao Ponto de Pedido: {criticalCount} insumo(s) em nível crítico
              </span>
              <p className="text-amber-800/80 mt-0.5 text-[11px]">
                O saldo atual é menor ou igual ao estoque de segurança. É recomendado emitir pedidos de compra aos fornecedores.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === 'critical' ? 'all' : 'critical')}
            className="px-3 py-1.5 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            {statusFilter === 'critical' ? 'Ver Todos' : 'Filtrar Críticos'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por código da matéria-prima, nome ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({materials.length})
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              statusFilter === 'critical'
                ? 'bg-amber-500 text-white font-bold'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Abaixo do Mínimo ({criticalCount})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição da Matéria-Prima</th>
                <th className="py-3 px-4 text-center">Unid.</th>
                <th className="py-3 px-4 text-right">Custo Unitário</th>
                <th className="py-3 px-4 text-right">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Fornecedor Principal</th>
                <th className="py-3 px-4">Localização</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Nenhuma matéria-prima encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isCritical = m.current_stock <= m.minimum_stock;
                  const ratio = m.minimum_stock > 0 ? (m.current_stock / m.minimum_stock) : 1;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {m.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-500">{m.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                        {m.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        R$ {m.unit_cost.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-sm">
                        <span className={isCritical ? 'text-rose-600' : 'text-slate-900'}>
                          {m.current_stock}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {m.minimum_stock}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Crítico
                          </span>
                        ) : ratio < 1.5 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Atenção
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {m.supplier_name ? (
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.supplier_name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Não vinculado</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {m.location ? (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{m.location}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAdjustingMaterial(m)}
                            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors cursor-pointer text-[11px]"
                            title="Entrada / Saída / Balanço de Estoque"
                          >
                            Ajustar
                          </button>
                          <button
                            onClick={() => {
                              setEditingMaterial(m);
                              setIsModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar Dados"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteMaterial(m.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Nova / Editar Matéria-Prima */}
      {isModalOpen && (
        <MaterialModal
          material={editingMaterial}
          suppliers={suppliers}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            await onSaveMaterial(data, !!editingMaterial, editingMaterial?.id);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Modal Ajuste Rápido de Estoque */}
      {adjustingMaterial && (
        <AdjustStockModal
          material={adjustingMaterial}
          onClose={() => setAdjustingMaterial(null)}
          onConfirm={async (data) => {
            await onAdjustStock(adjustingMaterial.id, data);
            setAdjustingMaterial(null);
          }}
        />
      )}
    </div>
  );
};

// Material Creation/Edit Modal
interface MaterialModalProps {
  material: RawMaterial | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSave: (data: Partial<RawMaterial>) => Promise<void>;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ material, suppliers, onClose, onSave }) => {
  const [code, setCode] = useState(material?.code || '');
  const [name, setName] = useState(material?.name || '');
  const [description, setDescription] = useState(material?.description || '');
  const [unit, setUnit] = useState(material?.unit || 'UN');
  const [unitCost, setUnitCost] = useState(material?.unit_cost || 0);
  const [currentStock, setCurrentStock] = useState(material?.current_stock || 0);
  const [minimumStock, setMinimumStock] = useState(material?.minimum_stock || 0);
  const [supplierId, setSupplierId] = useState<number | ''>(material?.supplier_id || '');
  const [location, setLocation] = useState(material?.location || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Nome da matéria-prima é obrigatório.');
      return;
    }
    try {
      setLoading(true);
      await onSave({
        code: code || `MP-${Date.now().toString().slice(-4)}`,
        name,
        description,
        unit,
        unit_cost: Number(unitCost),
        current_stock: Number(currentStock),
        minimum_stock: Number(minimumStock),
        supplier_id: supplierId ? Number(supplierId) : undefined,
        location
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar matéria-prima');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {material ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
              </h3>
              <p className="text-xs text-slate-500">Cadastrar no almoxarifado geral</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Código</label>
              <input
                type="text"
                placeholder="Ex: MP-009"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono uppercase"
              />
            </div>
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Nome da Matéria-Prima *</label>
              <input
                type="text"
                required
                placeholder="Ex: Chapa de Aço Inox 304"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Descrição Detalhada</label>
            <input
              type="text"
              placeholder="Ex: Espessura 2mm, dimensões 1000x2000mm..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unidade de Medida *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              >
                <option value="UN">UN - Unidade</option>
                <option value="KG">KG - Quilograma</option>
                <option value="M">M - Metro</option>
                <option value="M2">M² - Metro Quadrado</option>
                <option value="L">L - Litro</option>
                <option value="CHAPA">CHAPA - Chapa</option>
                <option value="BARRA">BARRA - Barra</option>
                <option value="CENTO">CENTO - Cento (100 un)</option>
                <option value="ROLO">ROLO - Rolo</option>
                <option value="BOBINA">BOBINA - Bobina</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estoque Atual</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estoque Mínimo (Ponto Pedido)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fornecedor Principal</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="">Nenhum vinculado</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Localização no Almoxarifado</label>
              <input
                type="text"
                placeholder="Ex: Galpão A - Prateleira B3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Salvar Matéria-Prima'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quick Stock Adjustment Modal
interface AdjustStockModalProps {
  material: RawMaterial;
  onClose: () => void;
  onConfirm: (data: { quantity: number; type: 'entrada' | 'saida' | 'ajuste'; notes?: string }) => Promise<void>;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ material, onClose, onConfirm }) => {
  const [type, setType] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('Entrada de nota fiscal de compra');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onConfirm({ quantity: Number(quantity), type, notes });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Movimentação de Estoque
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {material.code} - {material.name}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <span className="text-slate-600 font-medium">Estoque Atual:</span>
            <span className="font-mono font-black text-slate-900 text-sm">
              {material.current_stock} {material.unit}
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tipo de Operação</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('entrada')}
                className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                  type === 'entrada' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                + Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('saida')}
                className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                  type === 'saida' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                - Saída
              </button>
              <button
                type="button"
                onClick={() => setType('ajuste')}
                className={`py-2 rounded-lg font-bold border transition-colors cursor-pointer ${
                  type === 'ajuste' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                = Inventário
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              {type === 'ajuste' ? 'Novo Saldo Real Contado' : 'Quantidade da Movimentação'} ({material.unit}) *
            </label>
            <input
              type="number"
              min="0.001"
              step="0.001"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-base"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Motivo / Documento</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
              placeholder="Ex: NF 12345, Perda almoxarifado, Balanço..."
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              {loading ? 'Atualizando...' : 'Confirmar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
