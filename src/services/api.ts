import {
  CompanySettings,
  Workcenter,
  Supplier,
  RawMaterial,
  Product,
  Client,
  SalesOrder,
  ProductionOrder,
  DashboardData,
  ProductionOrderStatus,
  ProductionOrderPriority
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!res.ok) {
    let errorMsg = `Erro ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Configurações
  getCompanySettings: () => fetchJson<CompanySettings>('/company-settings'),
  updateCompanySettings: (data: Partial<CompanySettings>) =>
    fetchJson<CompanySettings>('/company-settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Matérias-Primas
  getMaterials: () => fetchJson<RawMaterial[]>('/materials'),
  createMaterial: (data: Partial<RawMaterial>) =>
    fetchJson<RawMaterial>('/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateMaterial: (id: number, data: Partial<RawMaterial>) =>
    fetchJson<RawMaterial>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteMaterial: (id: number) =>
    fetchJson<{ success: boolean }>(`/materials/${id}`, { method: 'DELETE' }),
  adjustMaterialStock: (id: number, data: { quantity: number; type: 'entrada' | 'saida' | 'ajuste'; notes?: string }) =>
    fetchJson<RawMaterial>(`/materials/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Produtos & Ficha Técnica
  getProducts: () => fetchJson<Product[]>('/products'),
  getProduct: (id: number) => fetchJson<Product>(`/products/${id}`),
  createProduct: (data: any) =>
    fetchJson<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProduct: (id: number, data: any) =>
    fetchJson<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteProduct: (id: number) =>
    fetchJson<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  // Fornecedores
  getSuppliers: () => fetchJson<Supplier[]>('/suppliers'),
  createSupplier: (data: Partial<Supplier>) =>
    fetchJson<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSupplier: (id: number, data: Partial<Supplier>) =>
    fetchJson<Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSupplier: (id: number) =>
    fetchJson<{ success: boolean }>(`/suppliers/${id}`, { method: 'DELETE' }),

  // Clientes
  getClients: () => fetchJson<Client[]>('/clients'),
  createClient: (data: Partial<Client>) =>
    fetchJson<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateClient: (id: number, data: Partial<Client>) =>
    fetchJson<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteClient: (id: number) =>
    fetchJson<{ success: boolean }>(`/clients/${id}`, { method: 'DELETE' }),

  // Postos de Trabalho & Capacidade
  getWorkcenters: () => fetchJson<Workcenter[]>('/workcenters'),
  createWorkcenter: (data: Partial<Workcenter>) =>
    fetchJson<Workcenter>('/workcenters', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateWorkcenter: (id: number, data: Partial<Workcenter>) =>
    fetchJson<Workcenter>(`/workcenters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Pedidos de Venda
  getOrders: () => fetchJson<SalesOrder[]>('/orders'),
  createOrder: (data: any) =>
    fetchJson<SalesOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateOrder: (id: number, data: any) =>
    fetchJson<SalesOrder>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  generateOpsFromOrder: (orderId: number) =>
    fetchJson<{ success: boolean; count: number; orders: ProductionOrder[] }>(
      `/orders/${orderId}/generate-op`,
      { method: 'POST' }
    ),

  // Ordens de Produção
  getProductionOrders: (params?: { status?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<ProductionOrder[]>(`/production-orders${qs}`);
  },
  getProductionOrder: (id: number) =>
    fetchJson<ProductionOrder>(`/production-orders/${id}`),
  createProductionOrder: (data: Partial<ProductionOrder>) =>
    fetchJson<ProductionOrder>('/production-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProductionOrderStatus: (
    id: number,
    data: { status: ProductionOrderStatus; user_name?: string; notes?: string; actual_hours?: number }
  ) =>
    fetchJson<ProductionOrder>(`/production-orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  addProductionLog: (
    id: number,
    data: { user_name: string; action: string; notes?: string; quantity_produced_add?: number; actual_hours_add?: number }
  ) =>
    fetchJson<ProductionOrder>(`/production-orders/${id}/logs`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  completeProductionOrder: (
    id: number,
    data: {
      quantity_produced: number;
      quantity_scrapped?: number;
      actual_hours?: number;
      user_name?: string;
      notes?: string;
      deduct_materials?: boolean;
      increment_product_stock?: boolean;
    }
  ) =>
    fetchJson<{ success: boolean; order: ProductionOrder }>(
      `/production-orders/${id}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),

  // Relatórios & Dashboard
  getDashboardData: () => fetchJson<DashboardData>('/reports/dashboard'),
  resetDemoData: () => fetchJson<{ success: boolean }>('/reset-demo', { method: 'POST' })
};
