import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Trash2,
  Edit2,
  Boxes,
  Clock,
  Layers,
  DollarSign,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Product, RawMaterial, Workcenter } from '../types';

interface ProductsViewProps {
  products: Product[];
  materials: RawMaterial[];
  workcenters: Workcenter[];
  onSaveProduct: (productData: any, isEdit?: boolean, id?: number) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  materials,
  workcenters,
  onSaveProduct,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setSelectedProduct(p);
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Fichas Técnicas & Produtos (BOM)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {products.length} itens cadastrados
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Estrutura de materiais (Bill of Materials), tempos padrão e roteiros de produção
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Ficha Técnica</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por código do produto, nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Product Cards Grid / Table */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
            Nenhum produto cadastrado com os critérios de busca.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isExpanded = expandedId === p.id;
            const bomCost = p.bom_cost || 0;
            const leadMinutes = p.total_process_minutes || p.lead_time_minutes || 60;
            const hours = (leadMinutes / 60).toFixed(1);

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
              >
                {/* Product Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-blue-700 text-sm">{p.code}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {p.category || 'Geral'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">Unid: {p.unit}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{p.name}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{p.description}</p>
                  </div>

                  {/* Operational stats */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Tempo Processo</span>
                      <span className="font-extrabold text-slate-800 flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {leadMinutes} min ({hours}h)
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Custo Insumos (BOM)</span>
                      <span className="font-mono font-bold text-slate-900">
                        R$ {bomCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Preço de Venda</span>
                      <span className="font-mono font-black text-emerald-700">
                        R$ {(p.selling_price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Estoque Acabado</span>
                      <span className="font-extrabold text-slate-900">
                        {p.current_stock} {p.unit}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ficha Técnica</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Editar Produto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Ficha Técnica Details */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-5 border-t border-slate-200 space-y-4 text-xs">
                    {/* Technical spec */}
                    {p.technical_spec && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700">
                        <strong className="text-slate-900">Especificações Técnicas de Engenharia: </strong>
                        {p.technical_spec}
                      </div>
                    )}

                    {/* Materials (BOM) Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Boxes className="w-4 h-4 text-blue-600" />
                          <span>Lista de Matérias-Primas por Unidade (BOM)</span>
                        </span>
                        <span className="text-slate-600 font-mono text-[11px]">
                          Custo Total Insumos: R$ {bomCost.toFixed(2)}
                        </span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="py-2 px-3">Matéria-Prima</th>
                            <th className="py-2 px-3 text-right">Qtd por Unidade</th>
                            <th className="py-2 px-3 text-center">Unid.</th>
                            <th className="py-2 px-3 text-right">Custo Unitário</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                            <th className="py-2 px-3">Observação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!p.materials || p.materials.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                                Nenhuma matéria-prima vinculada nesta ficha técnica.
                              </td>
                            </tr>
                          ) : (
                            p.materials.map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  {m.material_name}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                  {m.quantity}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600">
                                  {m.material_unit}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-600">
                                  R$ {(m.unit_cost || 0).toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">
                                  R$ {(m.quantity * (m.unit_cost || 0)).toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-slate-500 text-[11px]">
                                  {m.notes || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Operations Routing Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>Roteiro de Operações & Tempos de Processo</span>
                        </span>
                        <span className="text-slate-600 text-[11px]">
                          Tempo Total: {leadMinutes} minutos
                        </span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                            <th className="py-2 px-3 w-12 text-center">Etapa</th>
                            <th className="py-2 px-3">Operação</th>
                            <th className="py-2 px-3">Posto de Trabalho</th>
                            <th className="py-2 px-3 text-center">Tempo Setup</th>
                            <th className="py-2 px-3 text-center">Tempo Execução</th>
                            <th className="py-2 px-3">Instruções</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(!p.operations || p.operations.length === 0) ? (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                                Nenhuma etapa de produção detalhada cadastrada.
                              </td>
                            </tr>
                          ) : (
                            p.operations.map((op, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/60">
                                <td className="py-2 px-3 text-center font-bold text-slate-600">
                                  #{op.step_order || idx + 1}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-800">
                                  {op.operation_name}
                                </td>
                                <td className="py-2 px-3 text-slate-700">
                                  {op.workcenter_name || 'Bancada Geral'}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600">
                                  {op.setup_time_minutes} min
                                </td>
                                <td className="py-2 px-3 text-center text-slate-600 font-bold">
                                  {op.run_time_minutes} min/un
                                </td>
                                <td className="py-2 px-3 text-slate-500 text-[11px]">
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
              </div>
            );
          })
        )}
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <ProductFormModal
          product={selectedProduct}
          materials={materials}
          workcenters={workcenters}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            await onSaveProduct(data, !!editingId, editingId || undefined);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal for Creating & Editing Products with dynamic BOM and operations
interface ProductFormModalProps {
  product: Product | null;
  materials: RawMaterial[];
  workcenters: Workcenter[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  materials,
  workcenters,
  onClose,
  onSave
}) => {
  const [code, setCode] = useState(product?.code || '');
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'Mobiliário Industrial');
  const [unit, setUnit] = useState(product?.unit || 'UN');
  const [sellingPrice, setSellingPrice] = useState(product?.selling_price || 0);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState(product?.lead_time_minutes || 60);
  const [technicalSpec, setTechnicalSpec] = useState(product?.technical_spec || '');
  const [currentStock, setCurrentStock] = useState(product?.current_stock || 0);
  const [minimumStock, setMinimumStock] = useState(product?.minimum_stock || 0);

  // Dynamic BOM Items
  const [bomItems, setBomItems] = useState<Array<{ raw_material_id: number; quantity: number; notes: string }>>(
    product?.materials?.map((m) => ({
      raw_material_id: m.raw_material_id,
      quantity: m.quantity,
      notes: m.notes || ''
    })) || []
  );

  // Dynamic Routing Operations
  const [operations, setOperations] = useState<Array<{
    operation_name: string;
    workcenter_id: number | null;
    setup_time_minutes: number;
    run_time_minutes: number;
    instructions: string;
  }>>(
    product?.operations?.map((o) => ({
      operation_name: o.operation_name,
      workcenter_id: o.workcenter_id || null,
      setup_time_minutes: o.setup_time_minutes,
      run_time_minutes: o.run_time_minutes,
      instructions: o.instructions || ''
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddBomItem = () => {
    if (materials.length === 0) return;
    setBomItems([...bomItems, { raw_material_id: materials[0].id, quantity: 1, notes: '' }]);
  };

  const handleRemoveBomItem = (index: number) => {
    setBomItems(bomItems.filter((_, i) => i !== index));
  };

  const handleAddOperation = () => {
    setOperations([
      ...operations,
      {
        operation_name: `Etapa ${operations.length + 1}`,
        workcenter_id: workcenters[0]?.id || null,
        setup_time_minutes: 10,
        run_time_minutes: 30,
        instructions: ''
      }
    ]);
  };

  const handleRemoveOperation = (index: number) => {
    setOperations(operations.filter((_, i) => i !== index));
  };

  // Calculate total BOM cost dynamically
  const calculatedCost = bomItems.reduce((acc, item) => {
    const mat = materials.find((m) => m.id === Number(item.raw_material_id));
    return acc + (item.quantity * (mat?.unit_cost || 0));
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Nome do produto é obrigatório.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        code: code || `PRD-${Date.now().toString().slice(-4)}`,
        name,
        description,
        category,
        unit,
        selling_price: Number(sellingPrice),
        lead_time_minutes: Number(leadTimeMinutes),
        technical_spec: technicalSpec,
        current_stock: Number(currentStock),
        minimum_stock: Number(minimumStock),
        materials: bomItems,
        operations
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {product ? 'Editar Ficha Técnica de Produto' : 'Nova Ficha Técnica de Produto'}
              </h3>
              <p className="text-xs text-slate-500">
                Cadastre as especificações, composição de matérias-primas (BOM) e roteiro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Dados Gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Código do Produto</label>
              <input
                type="text"
                placeholder="Ex: PRD-105"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm uppercase"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Nome do Produto *</label>
              <input
                type="text"
                required
                placeholder="Ex: Mesa de Trabalho Industrial Especial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unidade de Medida</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preço de Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tempo Padrão (Minutos)</label>
              <input
                type="number"
                min="1"
                value={leadTimeMinutes}
                onChange={(e) => setLeadTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Descrição Comercial</label>
            <input
              type="text"
              placeholder="Descrição breve do produto acabado..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Especificações Técnicas de Engenharia</label>
            <textarea
              rows={2}
              placeholder="Dimensões, normas técnicas, tolerâncias, pintura, acabamento..."
              value={technicalSpec}
              onChange={(e) => setTechnicalSpec(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
            />
          </div>

          {/* Estoques */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estoque Atual Acabado</label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estoque Mínimo de Segurança</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          {/* SEÇÃO DINÂMICA: MATÉRIAS-PRIMAS (BOM) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>Composição de Matérias-Primas (BOM por Unidade)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Custo acumulado dos insumos: <strong className="text-blue-700 font-mono">R$ {calculatedCost.toFixed(2)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBomItem}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Insumo</span>
              </button>
            </div>

            {bomItems.length === 0 ? (
              <p className="text-slate-500 italic py-2">
                Nenhuma matéria-prima incluída. Clique acima para adicionar insumos necessários.
              </p>
            ) : (
              <div className="space-y-2">
                {bomItems.map((item, idx) => {
                  const currentMat = materials.find((m) => m.id === Number(item.raw_material_id));
                  return (
                    <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-[200px]">
                        <select
                          value={item.raw_material_id}
                          onChange={(e) => {
                            const newItems = [...bomItems];
                            newItems[idx].raw_material_id = Number(e.target.value);
                            setBomItems(newItems);
                          }}
                          className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.code} - {m.name} ({m.unit}) - R$ {m.unit_cost.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          placeholder="Qtd"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...bomItems];
                            newItems[idx].quantity = Number(e.target.value);
                            setBomItems(newItems);
                          }}
                          className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="w-14 text-center font-semibold text-slate-500">
                        {currentMat?.unit || 'UN'}
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <input
                          type="text"
                          placeholder="Obs (ex: para o tampo superior)"
                          value={item.notes}
                          onChange={(e) => {
                            const newItems = [...bomItems];
                            newItems[idx].notes = e.target.value;
                            setBomItems(newItems);
                          }}
                          className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveBomItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SEÇÃO DINÂMICA: ROTEIRO DE OPERAÇÕES */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Roteiro de Produção & Postos de Trabalho</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Defina as etapas sequenciais e tempos de máquina para balanceamento
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddOperation}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Etapa</span>
              </button>
            </div>

            {operations.length === 0 ? (
              <p className="text-slate-500 italic py-2">
                Nenhum roteiro detalhado cadastrado. Clique acima para cadastrar etapas.
              </p>
            ) : (
              <div className="space-y-2">
                {operations.map((op, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-500 text-xs w-6">#{idx + 1}</span>

                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        placeholder="Nome da Operação (ex: Corte CNC)"
                        value={op.operation_name}
                        onChange={(e) => {
                          const newOps = [...operations];
                          newOps[idx].operation_name = e.target.value;
                          setOperations(newOps);
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-semibold"
                      />
                    </div>

                    <div className="w-44">
                      <select
                        value={op.workcenter_id || ''}
                        onChange={(e) => {
                          const newOps = [...operations];
                          newOps[idx].workcenter_id = e.target.value ? Number(e.target.value) : null;
                          setOperations(newOps);
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs"
                      >
                        {workcenters.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        placeholder="Setup"
                        title="Tempo de Setup (minutos)"
                        value={op.setup_time_minutes}
                        onChange={(e) => {
                          const newOps = [...operations];
                          newOps[idx].setup_time_minutes = Number(e.target.value);
                          setOperations(newOps);
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Tempo Un"
                        title="Tempo de Execução por Unidade (minutos)"
                        value={op.run_time_minutes}
                        onChange={(e) => {
                          const newOps = [...operations];
                          newOps[idx].run_time_minutes = Number(e.target.value);
                          setOperations(newOps);
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-mono font-bold text-blue-700"
                      />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        placeholder="Instrução do posto..."
                        value={op.instructions}
                        onChange={(e) => {
                          const newOps = [...operations];
                          newOps[idx].instructions = e.target.value;
                          setOperations(newOps);
                        }}
                        className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOperation(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Salvar Ficha Técnica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
