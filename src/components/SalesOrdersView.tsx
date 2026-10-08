import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Trash2
} from 'lucide-react';
import { SalesOrder, Client, Product } from '../types';

interface SalesOrdersViewProps {
  orders: SalesOrder[];
  clients: Client[];
  products: Product[];
  onCreateOrder: (data: any) => Promise<void>;
  onGenerateOps: (orderId: number) => Promise<void>;
  onNavigateToOps: () => void;
}

export const SalesOrdersView: React.FC<SalesOrdersViewProps> = ({
  orders,
  clients,
  products,
  onCreateOrder,
  onGenerateOps,
  onNavigateToOps
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const filtered = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(term) ||
      (o.client_name && o.client_name.toLowerCase().includes(term)) ||
      (o.notes && o.notes.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Aguardando PCP</span>;
      case 'em_producao':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Em Produção</span>;
      case 'concluido':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Concluído</span>;
      case 'cancelado':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Cancelado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const handleGenerate = async (orderId: number) => {
    try {
      setGeneratingId(orderId);
      await onGenerateOps(orderId);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Pedidos de Venda & Carteira</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
              {orders.length} pedidos
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração de Ordens de Produção (OP) vinculadas aos pedidos dos clientes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Pedido de Venda</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por número do pedido, cliente ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Sales Orders Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
            Nenhum pedido de venda encontrado.
          </div>
        ) : (
          filtered.map((order) => {
            const hasOps = order.production_orders && order.production_orders.length > 0;
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900 text-base">
                      {order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Data do Pedido</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(order.order_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Prazo de Entrega</span>
                      <span className="font-bold text-rose-600">
                        {new Date(order.delivery_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Total</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        R$ {order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Client Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente Requisitante</span>
                    <h4 className="font-bold text-slate-900 text-sm">{order.client_name}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">{order.client_code} • {order.client_phone || 'Sem tel'}</p>
                    {order.notes && (
                      <p className="text-slate-600 text-[11px] pt-1 italic">Obs: {order.notes}</p>
                    )}
                  </div>

                  {/* Items Ordered */}
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Itens do Pedido</span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                            <th className="py-1.5 px-3">Código</th>
                            <th className="py-1.5 px-3">Produto</th>
                            <th className="py-1.5 px-3 text-center">Quantidade</th>
                            <th className="py-1.5 px-3 text-right">Preço Unit.</th>
                            <th className="py-1.5 px-3 text-right">Total Item</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {order.items?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{item.product_code}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{item.product_name}</td>
                              <td className="py-2 px-3 text-center font-bold text-blue-700">
                                {item.quantity} {item.product_unit || 'UN'}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-600">
                                R$ {item.unit_price.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                R$ {(item.quantity * item.unit_price).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Associated OPs */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        {hasOps ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">Ordens de Produção Geradas:</span>
                            {order.production_orders?.map((op) => (
                              <button
                                key={op.id}
                                onClick={onNavigateToOps}
                                className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-mono font-bold text-[11px] cursor-pointer"
                              >
                                {op.code} ({op.status})
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-amber-700 font-medium text-[11px] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Nenhuma Ordem de Produção gerada ainda.</span>
                          </span>
                        )}
                      </div>

                      {/* Botão de Geração de OP */}
                      {!hasOps && (
                        <button
                          onClick={() => handleGenerate(order.id)}
                          disabled={generatingId === order.id}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{generatingId === order.id ? 'Gerando...' : 'Gerar Ordens de Produção (OP)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Pedido de Venda */}
      {isModalOpen && (
        <NewSalesOrderModal
          clients={clients}
          products={products}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data) => {
            await onCreateOrder(data);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal for Creating Sales Orders
interface NewSalesOrderModalProps {
  clients: Client[];
  products: Product[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const NewSalesOrderModal: React.FC<NewSalesOrderModalProps> = ({
  clients,
  products,
  onClose,
  onSave
}) => {
  const [orderNumber, setOrderNumber] = useState(`PED-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [clientId, setClientId] = useState<number>(clients[0]?.id || 0);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  const defaultDelivery = new Date();
  defaultDelivery.setDate(defaultDelivery.getDate() + 14);
  const [deliveryDate, setDeliveryDate] = useState<string>(defaultDelivery.toISOString().slice(0, 10));

  const [notes, setNotes] = useState('');
  
  // Dynamic Items
  const [items, setItems] = useState<Array<{ product_id: number; quantity: number; unit_price: number }>>([
    {
      product_id: products[0]?.id || 0,
      quantity: 5,
      unit_price: products[0]?.selling_price || 0
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        product_id: products[0].id,
        quantity: 1,
        unit_price: products[0].selling_price || 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, pId: number) => {
    const prod = products.find((p) => p.id === pId);
    const newItems = [...items];
    newItems[index].product_id = pId;
    if (prod) {
      newItems[index].unit_price = prod.selling_price || 0;
    }
    setItems(newItems);
  };

  const totalAmount = items.reduce((acc, it) => acc + (it.quantity * it.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.length === 0) {
      setError('Selecione um cliente e pelo menos um item.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        order_number: orderNumber,
        client_id: Number(clientId),
        order_date: orderDate,
        delivery_date: deliveryDate,
        notes,
        items
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar pedido');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Novo Pedido de Venda
              </h3>
              <p className="text-xs text-slate-500">Registro comercial para planejamento da manufatura</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Número do Pedido *</label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cliente *</label>
              <select
                required
                value={clientId}
                onChange={(e) => setClientId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Data de Emissão</label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Prazo de Entrega Solicitado *</label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-rose-600"
              />
            </div>
          </div>

          {/* Dynamic Items list */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">Itens Fabricados Solicitados</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1 min-w-[200px]">
                    <select
                      value={it.product_id}
                      onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qtd"
                      value={it.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].quantity = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-bold text-center"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Preço Unit."
                      value={it.unit_price}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[idx].unit_price = Number(e.target.value);
                        setItems(newItems);
                      }}
                      className="w-full px-2 py-1.5 rounded-md border border-slate-300 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="w-24 text-right font-mono font-bold text-slate-900">
                    R$ {(it.quantity * it.unit_price).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end text-sm font-bold text-slate-900">
              <span>Total do Pedido: <strong className="font-mono text-blue-700 font-black">R$ {totalAmount.toFixed(2)}</strong></span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observações do Pedido</label>
            <input
              type="text"
              placeholder="Instruções de faturamento, entrega ou embalagem..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
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
              {loading ? 'Salvando...' : 'Salvar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
