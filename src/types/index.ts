export interface CompanySettings {
  id: number;
  company_name: string;
  trade_name?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  technical_lead_name: string;
  technical_lead_role: string;
  technical_lead_reg?: string;
  daily_capacity_hours: number;
  days_per_week: number;
  updated_at?: string;
}

export interface Workcenter {
  id: number;
  code: string;
  name: string;
  description?: string;
  capacity_hours_per_day: number;
  operators_count: number;
  efficiency_rate: number;
  active: number;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  cnpj?: string;
  address?: string;
  products_supplied?: string;
  lead_time_days: number;
  active: number;
}

export interface RawMaterial {
  id: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  unit_cost: number;
  current_stock: number;
  minimum_stock: number;
  supplier_id?: number;
  supplier_name?: string;
  location?: string;
  active: number;
}

export interface ProductMaterial {
  id?: number;
  product_id?: number;
  raw_material_id: number;
  material_code?: string;
  material_name?: string;
  material_unit?: string;
  unit_cost?: number;
  current_stock?: number;
  quantity: number;
  notes?: string;
}

export interface ProductOperation {
  id?: number;
  product_id?: number;
  step_order: number;
  operation_name: string;
  workcenter_id?: number;
  workcenter_name?: string;
  workcenter_code?: string;
  setup_time_minutes: number;
  run_time_minutes: number;
  instructions?: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  lead_time_minutes: number;
  selling_price: number;
  technical_spec?: string;
  current_stock: number;
  minimum_stock: number;
  active: number;
  bom_cost?: number;
  materials_count?: number;
  operations_count?: number;
  total_process_minutes?: number;
  materials?: ProductMaterial[];
  operations?: ProductOperation[];
}

export interface Client {
  id: number;
  code: string;
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  active: number;
}

export interface SalesOrderItem {
  id?: number;
  sales_order_id?: number;
  product_id: number;
  product_code?: string;
  product_name?: string;
  product_unit?: string;
  quantity: number;
  unit_price: number;
}

export interface SalesOrder {
  id: number;
  order_number: string;
  client_id: number;
  client_name?: string;
  client_code?: string;
  client_phone?: string;
  order_date: string;
  delivery_date: string;
  status: 'pendente' | 'em_producao' | 'concluido' | 'cancelado';
  total_amount: number;
  notes?: string;
  items?: SalesOrderItem[];
  production_orders?: Array<{
    id: number;
    code: string;
    status: string;
    quantity_planned: number;
    quantity_produced: number;
  }>;
}

export type ProductionOrderStatus =
  | 'planejada'
  | 'liberada'
  | 'em_andamento'
  | 'inspecao'
  | 'concluida'
  | 'cancelada';

export type ProductionOrderPriority = 'baixa' | 'normal' | 'alta' | 'urgente';

export interface ProductionOrder {
  id: number;
  code: string;
  sales_order_id?: number;
  order_number?: string;
  client_name?: string;
  product_id: number;
  product_code?: string;
  product_name?: string;
  product_unit?: string;
  product_description?: string;
  technical_spec?: string;
  quantity_planned: number;
  quantity_produced: number;
  quantity_scrapped: number;
  status: ProductionOrderStatus;
  priority: ProductionOrderPriority;
  scheduled_start_date: string;
  scheduled_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  estimated_hours: number;
  actual_hours: number;
  technical_lead_name?: string;
  lot_number?: string;
  notes?: string;
  created_at?: string;
  materials?: Array<ProductMaterial & { total_required: number }>;
  operations?: ProductOperation[];
  logs?: ProductionLog[];
  company?: CompanySettings;
}

export interface ProductionLog {
  id: number;
  production_order_id: number;
  timestamp: string;
  user_name: string;
  action: string;
  notes?: string;
}

export interface DashboardData {
  metrics: {
    totalOps: number;
    activeOps: number;
    completedOps: number;
    inProgressOps: number;
    plannedHours: number;
    executedHours: number;
    weeklyAvailableHours: number;
    activeAllocatedHours: number;
    capacityUtilization: number;
    criticalStockCount: number;
  };
  lowStockMaterials: Array<{
    id: number;
    code: string;
    name: string;
    unit: string;
    current_stock: number;
    minimum_stock: number;
    deficit: number;
  }>;
  statusDistribution: Array<{
    status: ProductionOrderStatus;
    count: number;
  }>;
  upcomingOrders: Array<{
    id: number;
    code: string;
    status: ProductionOrderStatus;
    priority: ProductionOrderPriority;
    scheduled_end_date: string;
    quantity_planned: number;
    quantity_produced: number;
    product_name: string;
    product_code: string;
    client_name?: string;
  }>;
}
