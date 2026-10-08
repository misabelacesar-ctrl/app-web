import { Router } from 'express';
import { getDb, persistDb } from './db.js';

export const apiRouter = Router();

// Helper to execute query returning array of objects
function queryAll(sql: string, params: any[] = []): any[] {
  // getDb is initialized in server startup, but let's obtain db instance
  // Since db is synchronous once initialized, we store cached instance
  const stmt = currentDb.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql: string, params: any[] = []): any | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function execute(sql: string, params: any[] = []): void {
  currentDb.run(sql, params);
  persistDb();
}

let currentDb: any;

export async function initApi() {
  currentDb = await getDb();
}

// =================== COMPANY SETTINGS ===================
apiRouter.get('/company-settings', async (_req, res) => {
  try {
    const settings = queryOne('SELECT * FROM company_settings WHERE id = 1');
    res.json(settings || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/company-settings', async (req, res) => {
  try {
    const {
      company_name, trade_name, cnpj, phone, email, address,
      technical_lead_name, technical_lead_role, technical_lead_reg,
      daily_capacity_hours, days_per_week
    } = req.body;

    execute(`
      UPDATE company_settings SET
        company_name = ?, trade_name = ?, cnpj = ?, phone = ?, email = ?, address = ?,
        technical_lead_name = ?, technical_lead_role = ?, technical_lead_reg = ?,
        daily_capacity_hours = ?, days_per_week = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      company_name || 'Indústria & Manufatura Ltda.',
      trade_name || '',
      cnpj || '',
      phone || '',
      email || '',
      address || '',
      technical_lead_name || 'Responsável Técnico',
      technical_lead_role || 'Engenheiro de Produção',
      technical_lead_reg || '',
      Number(daily_capacity_hours) || 16.0,
      Number(days_per_week) || 5
    ]);

    const updated = queryOne('SELECT * FROM company_settings WHERE id = 1');
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== SUPPLIERS ===================
apiRouter.get('/suppliers', async (_req, res) => {
  try {
    const suppliers = queryAll('SELECT * FROM suppliers ORDER BY id DESC');
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/suppliers', async (req, res) => {
  try {
    const { code, name, contact_name, phone, email, cnpj, address, products_supplied, lead_time_days } = req.body;
    const finalCode = code || `FORN-${Date.now().toString().slice(-4)}`;
    
    execute(`
      INSERT INTO suppliers (code, name, contact_name, phone, email, cnpj, address, products_supplied, lead_time_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalCode, name, contact_name || '', phone || '', email || '', cnpj || '', address || '', products_supplied || '', Number(lead_time_days) || 5]);

    const created = queryOne('SELECT * FROM suppliers WHERE code = ?', [finalCode]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/suppliers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, contact_name, phone, email, cnpj, address, products_supplied, lead_time_days, active } = req.body;

    execute(`
      UPDATE suppliers SET
        name = ?, contact_name = ?, phone = ?, email = ?, cnpj = ?, address = ?,
        products_supplied = ?, lead_time_days = ?, active = ?
      WHERE id = ?
    `, [name, contact_name || '', phone || '', email || '', cnpj || '', address || '', products_supplied || '', Number(lead_time_days) || 5, active !== undefined ? (active ? 1 : 0) : 1, id]);

    const updated = queryOne('SELECT * FROM suppliers WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/suppliers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const used = queryOne('SELECT id FROM raw_materials WHERE supplier_id = ? LIMIT 1', [id]);
    if (used) {
      return res.status(400).json({ error: 'Fornecedor possui matérias-primas vinculadas e não pode ser excluído.' });
    }
    execute('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== CLIENTS ===================
apiRouter.get('/clients', async (_req, res) => {
  try {
    const clients = queryAll('SELECT * FROM clients ORDER BY id DESC');
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/clients', async (req, res) => {
  try {
    const { code, name, contact_name, phone, email, document, address, city, state } = req.body;
    const finalCode = code || `CLI-${Date.now().toString().slice(-4)}`;

    execute(`
      INSERT INTO clients (code, name, contact_name, phone, email, document, address, city, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalCode, name, contact_name || '', phone || '', email || '', document || '', address || '', city || '', state || '']);

    const created = queryOne('SELECT * FROM clients WHERE code = ?', [finalCode]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/clients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, contact_name, phone, email, document, address, city, state, active } = req.body;

    execute(`
      UPDATE clients SET
        name = ?, contact_name = ?, phone = ?, email = ?, document = ?, address = ?,
        city = ?, state = ?, active = ?
      WHERE id = ?
    `, [name, contact_name || '', phone || '', email || '', document || '', address || '', city || '', state || '', active !== undefined ? (active ? 1 : 0) : 1, id]);

    const updated = queryOne('SELECT * FROM clients WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/clients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const used = queryOne('SELECT id FROM sales_orders WHERE client_id = ? LIMIT 1', [id]);
    if (used) {
      return res.status(400).json({ error: 'Cliente possui pedidos vinculados e não pode ser excluído.' });
    }
    execute('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== RAW MATERIALS ===================
apiRouter.get('/materials', async (_req, res) => {
  try {
    const materials = queryAll(`
      SELECT rm.*, s.name as supplier_name
      FROM raw_materials rm
      LEFT JOIN suppliers s ON rm.supplier_id = s.id
      ORDER BY rm.id DESC
    `);
    res.json(materials);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/materials', async (req, res) => {
  try {
    const { code, name, description, unit, unit_cost, current_stock, minimum_stock, supplier_id, location } = req.body;
    const finalCode = code || `MP-${Date.now().toString().slice(-4)}`;

    execute(`
      INSERT INTO raw_materials (code, name, description, unit, unit_cost, current_stock, minimum_stock, supplier_id, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalCode,
      name,
      description || '',
      unit || 'UN',
      Number(unit_cost) || 0.0,
      Number(current_stock) || 0.0,
      Number(minimum_stock) || 0.0,
      supplier_id ? Number(supplier_id) : null,
      location || ''
    ]);

    const created = queryOne('SELECT * FROM raw_materials WHERE code = ?', [finalCode]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/materials/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, unit, unit_cost, current_stock, minimum_stock, supplier_id, location, active } = req.body;

    execute(`
      UPDATE raw_materials SET
        name = ?, description = ?, unit = ?, unit_cost = ?, current_stock = ?,
        minimum_stock = ?, supplier_id = ?, location = ?, active = ?
      WHERE id = ?
    `, [
      name,
      description || '',
      unit || 'UN',
      Number(unit_cost) || 0.0,
      Number(current_stock) || 0.0,
      Number(minimum_stock) || 0.0,
      supplier_id ? Number(supplier_id) : null,
      location || '',
      active !== undefined ? (active ? 1 : 0) : 1,
      id
    ]);

    const updated = queryOne('SELECT * FROM raw_materials WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/materials/:id/adjust-stock', async (req, res) => {
  try {
    const id = req.params.id;
    const { quantity, type, notes } = req.body; // type: 'entrada' | 'saida' | 'ajuste'
    const mat = queryOne('SELECT * FROM raw_materials WHERE id = ?', [id]);
    if (!mat) return res.status(404).json({ error: 'Matéria-prima não encontrada' });

    let newStock = mat.current_stock;
    const qty = Number(quantity) || 0;

    if (type === 'entrada') {
      newStock += qty;
    } else if (type === 'saida') {
      newStock = Math.max(0, newStock - qty);
    } else if (type === 'ajuste') {
      newStock = qty;
    }

    execute('UPDATE raw_materials SET current_stock = ? WHERE id = ?', [newStock, id]);
    execute(`
      INSERT INTO stock_movements (type, raw_material_id, quantity, notes)
      VALUES (?, ?, ?, ?)
    `, [type || 'ajuste', id, qty, notes || 'Ajuste manual de estoque']);

    const updated = queryOne('SELECT * FROM raw_materials WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/materials/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const used = queryOne('SELECT id FROM product_materials WHERE raw_material_id = ? LIMIT 1', [id]);
    if (used) {
      return res.status(400).json({ error: 'Matéria-prima está em uso na ficha técnica de produtos e não pode ser excluída.' });
    }
    execute('DELETE FROM raw_materials WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== WORKCENTERS (POSTOS DE TRABALHO) ===================
apiRouter.get('/workcenters', async (_req, res) => {
  try {
    const centers = queryAll('SELECT * FROM workcenters ORDER BY id ASC');
    res.json(centers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/workcenters', async (req, res) => {
  try {
    const { code, name, description, capacity_hours_per_day, operators_count, efficiency_rate } = req.body;
    const finalCode = code || `CTR-${Date.now().toString().slice(-4)}`;

    execute(`
      INSERT INTO workcenters (code, name, description, capacity_hours_per_day, operators_count, efficiency_rate)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      finalCode,
      name,
      description || '',
      Number(capacity_hours_per_day) || 8.0,
      Number(operators_count) || 1,
      Number(efficiency_rate) || 0.85
    ]);

    const created = queryOne('SELECT * FROM workcenters WHERE code = ?', [finalCode]);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/workcenters/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, capacity_hours_per_day, operators_count, efficiency_rate, active } = req.body;

    execute(`
      UPDATE workcenters SET
        name = ?, description = ?, capacity_hours_per_day = ?, operators_count = ?,
        efficiency_rate = ?, active = ?
      WHERE id = ?
    `, [
      name,
      description || '',
      Number(capacity_hours_per_day) || 8.0,
      Number(operators_count) || 1,
      Number(efficiency_rate) || 0.85,
      active !== undefined ? (active ? 1 : 0) : 1,
      id
    ]);

    const updated = queryOne('SELECT * FROM workcenters WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== PRODUCTS & FICHA TÉCNICA (BOM) ===================
apiRouter.get('/products', async (_req, res) => {
  try {
    const products = queryAll('SELECT * FROM products ORDER BY id DESC');
    
    // Enrich with calculated BOM cost and materials count
    const enriched = products.map((p: any) => {
      const materials = queryAll(`
        SELECT pm.*, rm.name as material_name, rm.unit as material_unit, rm.unit_cost
        FROM product_materials pm
        JOIN raw_materials rm ON pm.raw_material_id = rm.id
        WHERE pm.product_id = ?
      `, [p.id]);

      const operations = queryAll(`
        SELECT po.*, wc.name as workcenter_name
        FROM product_operations po
        LEFT JOIN workcenters wc ON po.workcenter_id = wc.id
        WHERE po.product_id = ?
        ORDER BY po.step_order ASC
      `, [p.id]);

      const bom_cost = materials.reduce((acc: number, m: any) => acc + (m.quantity * (m.unit_cost || 0)), 0);
      const total_process_minutes = operations.reduce((acc: number, o: any) => acc + (o.setup_time_minutes + o.run_time_minutes), 0) || p.lead_time_minutes;

      return {
        ...p,
        bom_cost,
        materials_count: materials.length,
        operations_count: operations.length,
        total_process_minutes,
        materials,
        operations
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const materials = queryAll(`
      SELECT pm.*, rm.code as material_code, rm.name as material_name, rm.unit as material_unit, rm.unit_cost, rm.current_stock
      FROM product_materials pm
      JOIN raw_materials rm ON pm.raw_material_id = rm.id
      WHERE pm.product_id = ?
    `, [id]);

    const operations = queryAll(`
      SELECT po.*, wc.name as workcenter_name, wc.code as workcenter_code
      FROM product_operations po
      LEFT JOIN workcenters wc ON po.workcenter_id = wc.id
      WHERE po.product_id = ?
      ORDER BY po.step_order ASC
    `, [id]);

    const bom_cost = materials.reduce((acc: number, m: any) => acc + (m.quantity * (m.unit_cost || 0)), 0);
    const total_process_minutes = operations.reduce((acc: number, o: any) => acc + (o.setup_time_minutes + o.run_time_minutes), 0) || product.lead_time_minutes;

    res.json({
      ...product,
      bom_cost,
      total_process_minutes,
      materials,
      operations
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/products', async (req, res) => {
  try {
    const {
      code, name, description, category, unit, lead_time_minutes,
      selling_price, technical_spec, current_stock, minimum_stock,
      materials = [], operations = []
    } = req.body;

    const finalCode = code || `PRD-${Date.now().toString().slice(-4)}`;

    execute(`
      INSERT INTO products (code, name, description, category, unit, lead_time_minutes, selling_price, technical_spec, current_stock, minimum_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalCode,
      name,
      description || '',
      category || 'Geral',
      unit || 'UN',
      Number(lead_time_minutes) || 60,
      Number(selling_price) || 0.0,
      technical_spec || '',
      Number(current_stock) || 0.0,
      Number(minimum_stock) || 0.0
    ]);

    const created = queryOne('SELECT * FROM products WHERE code = ?', [finalCode]);
    const productId = created.id;

    // Inserir BOM (materiais)
    for (const mat of materials) {
      if (mat.raw_material_id && Number(mat.quantity) > 0) {
        execute(`
          INSERT INTO product_materials (product_id, raw_material_id, quantity, notes)
          VALUES (?, ?, ?, ?)
        `, [productId, Number(mat.raw_material_id), Number(mat.quantity), mat.notes || '']);
      }
    }

    // Inserir Roteiro (operações)
    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      if (op.operation_name) {
        execute(`
          INSERT INTO product_operations (product_id, step_order, operation_name, workcenter_id, setup_time_minutes, run_time_minutes, instructions)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          productId,
          i + 1,
          op.operation_name,
          op.workcenter_id ? Number(op.workcenter_id) : null,
          Number(op.setup_time_minutes) || 0,
          Number(op.run_time_minutes) || 30,
          op.instructions || ''
        ]);
      }
    }

    res.status(201).json({ id: productId, ...created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name, description, category, unit, lead_time_minutes,
      selling_price, technical_spec, current_stock, minimum_stock, active,
      materials, operations
    } = req.body;

    execute(`
      UPDATE products SET
        name = ?, description = ?, category = ?, unit = ?, lead_time_minutes = ?,
        selling_price = ?, technical_spec = ?, current_stock = ?, minimum_stock = ?, active = ?
      WHERE id = ?
    `, [
      name,
      description || '',
      category || 'Geral',
      unit || 'UN',
      Number(lead_time_minutes) || 60,
      Number(selling_price) || 0.0,
      technical_spec || '',
      Number(current_stock) || 0.0,
      Number(minimum_stock) || 0.0,
      active !== undefined ? (active ? 1 : 0) : 1,
      id
    ]);

    // Atualizar BOM se fornecido
    if (Array.isArray(materials)) {
      execute('DELETE FROM product_materials WHERE product_id = ?', [id]);
      for (const mat of materials) {
        if (mat.raw_material_id && Number(mat.quantity) > 0) {
          execute(`
            INSERT INTO product_materials (product_id, raw_material_id, quantity, notes)
            VALUES (?, ?, ?, ?)
          `, [id, Number(mat.raw_material_id), Number(mat.quantity), mat.notes || '']);
        }
      }
    }

    // Atualizar Operações se fornecido
    if (Array.isArray(operations)) {
      execute('DELETE FROM product_operations WHERE product_id = ?', [id]);
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i];
        if (op.operation_name) {
          execute(`
            INSERT INTO product_operations (product_id, step_order, operation_name, workcenter_id, setup_time_minutes, run_time_minutes, instructions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            id,
            i + 1,
            op.operation_name,
            op.workcenter_id ? Number(op.workcenter_id) : null,
            Number(op.setup_time_minutes) || 0,
            Number(op.run_time_minutes) || 30,
            op.instructions || ''
          ]);
        }
      }
    }

    const updated = queryOne('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const used = queryOne('SELECT id FROM production_orders WHERE product_id = ? LIMIT 1', [id]);
    if (used) {
      return res.status(400).json({ error: 'Produto possui ordens de produção vinculadas e não pode ser excluído.' });
    }
    execute('DELETE FROM product_materials WHERE product_id = ?', [id]);
    execute('DELETE FROM product_operations WHERE product_id = ?', [id]);
    execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== SALES ORDERS (PEDIDOS DE VENDA) ===================
apiRouter.get('/orders', async (_req, res) => {
  try {
    const orders = queryAll(`
      SELECT so.*, c.name as client_name, c.code as client_code, c.phone as client_phone
      FROM sales_orders so
      JOIN clients c ON so.client_id = c.id
      ORDER BY so.id DESC
    `);

    const enriched = orders.map((o: any) => {
      const items = queryAll(`
        SELECT soi.*, p.code as product_code, p.name as product_name, p.unit as product_unit
        FROM sales_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.sales_order_id = ?
      `, [o.id]);

      const production_orders = queryAll(`
        SELECT id, code, status, quantity_planned, quantity_produced
        FROM production_orders
        WHERE sales_order_id = ?
      `, [o.id]);

      return {
        ...o,
        items,
        production_orders
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/orders', async (req, res) => {
  try {
    const { order_number, client_id, order_date, delivery_date, notes, items = [] } = req.body;
    const finalNumber = order_number || `PED-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unit_price || 0)), 0);

    execute(`
      INSERT INTO sales_orders (order_number, client_id, order_date, delivery_date, status, total_amount, notes)
      VALUES (?, ?, ?, ?, 'pendente', ?, ?)
    `, [
      finalNumber,
      Number(client_id),
      order_date || new Date().toISOString().slice(0, 10),
      delivery_date || new Date().toISOString().slice(0, 10),
      totalAmount,
      notes || ''
    ]);

    const created = queryOne('SELECT * FROM sales_orders WHERE order_number = ?', [finalNumber]);
    const orderId = created.id;

    for (const item of items) {
      if (item.product_id && Number(item.quantity) > 0) {
        execute(`
          INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `, [orderId, Number(item.product_id), Number(item.quantity), Number(item.unit_price) || 0]);
      }
    }

    res.status(201).json({ id: orderId, ...created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, delivery_date, notes } = req.body;

    execute(`
      UPDATE sales_orders SET
        status = COALESCE(?, status),
        delivery_date = COALESCE(?, delivery_date),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [status, delivery_date, notes, id]);

    const updated = queryOne('SELECT * FROM sales_orders WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gerar Ordens de Produção a partir de um Pedido de Venda
apiRouter.post('/orders/:id/generate-op', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = queryOne('SELECT * FROM sales_orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    const items = queryAll('SELECT * FROM sales_order_items WHERE sales_order_id = ?', [orderId]);
    if (items.length === 0) return res.status(400).json({ error: 'Pedido não contém itens' });

    const settings = queryOne('SELECT technical_lead_name FROM company_settings WHERE id = 1');
    const techLead = settings?.technical_lead_name || 'Responsável Técnico';

    const createdOps: any[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = queryOne('SELECT * FROM products WHERE id = ?', [item.product_id]);
      
      const opCount = queryOne('SELECT COUNT(*) as cnt FROM production_orders')?.cnt || 0;
      const opCode = `OP-${new Date().getFullYear()}-${String(opCount + 1 + i).padStart(3, '0')}`;
      const lotNumber = `LOT-${product?.code || 'PRD'}-${new Date().getFullYear().toString().slice(-2)}${String(opCount + 1 + i).padStart(2, '0')}`;

      // Calcular tempo estimado de processo em horas
      const operations = queryAll('SELECT setup_time_minutes, run_time_minutes FROM product_operations WHERE product_id = ?', [item.product_id]);
      const totalMinutesPerUnit = operations.reduce((acc: number, o: any) => acc + (o.setup_time_minutes + o.run_time_minutes), 0) || product?.lead_time_minutes || 60;
      const estimatedHours = Number(((totalMinutesPerUnit * item.quantity) / 60).toFixed(1));

      const today = new Date().toISOString().slice(0, 10);
      const delivery = order.delivery_date || today;

      execute(`
        INSERT INTO production_orders (
          code, sales_order_id, product_id, quantity_planned, quantity_produced, quantity_scrapped,
          status, priority, scheduled_start_date, scheduled_end_date, estimated_hours,
          technical_lead_name, lot_number, notes
        ) VALUES (?, ?, ?, ?, 0, 0, 'planejada', 'normal', ?, ?, ?, ?, ?, ?)
      `, [
        opCode,
        orderId,
        item.product_id,
        item.quantity,
        today,
        delivery,
        estimatedHours,
        techLead,
        lotNumber,
        `Gerada a partir do pedido ${order.order_number}`
      ]);

      const newOp = queryOne('SELECT * FROM production_orders WHERE code = ?', [opCode]);
      execute(`
        INSERT INTO production_logs (production_order_id, user_name, action, notes)
        VALUES (?, ?, 'Geração de OP', ?)
      `, [newOp.id, techLead, `Ordem de Produção criada a partir do Pedido ${order.order_number}`]);

      createdOps.push(newOp);
    }

    // Atualiza status do pedido para 'em_producao'
    execute("UPDATE sales_orders SET status = 'em_producao' WHERE id = ?", [orderId]);

    res.status(201).json({ success: true, count: createdOps.length, orders: createdOps });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== PRODUCTION ORDERS (PCP & ORDENS DE PRODUÇÃO) ===================
apiRouter.get('/production-orders', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let sql = `
      SELECT po.*, p.code as product_code, p.name as product_name, p.unit as product_unit,
             so.order_number, c.name as client_name
      FROM production_orders po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN sales_orders so ON po.sales_order_id = so.id
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND po.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND po.priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY po.id DESC';

    const orders = queryAll(sql, params);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/production-orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const op = queryOne(`
      SELECT po.*, p.code as product_code, p.name as product_name, p.unit as product_unit,
             p.description as product_description, p.technical_spec,
             so.order_number, so.delivery_date as sales_delivery_date,
             c.name as client_name, c.contact_name as client_contact, c.document as client_doc
      FROM production_orders po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN sales_orders so ON po.sales_order_id = so.id
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE po.id = ?
    `, [id]);

    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    // Buscar matérias-primas necessárias com base na quantidade planejada (BOM Explosion)
    const materials = queryAll(`
      SELECT pm.*, rm.code as material_code, rm.name as material_name, rm.unit as material_unit,
             rm.current_stock, (pm.quantity * ?) as total_required
      FROM product_materials pm
      JOIN raw_materials rm ON pm.raw_material_id = rm.id
      WHERE pm.product_id = ?
    `, [op.quantity_planned, op.product_id]);

    // Roteiro de produção do produto com postos de trabalho
    const operations = queryAll(`
      SELECT po.*, wc.code as workcenter_code, wc.name as workcenter_name
      FROM product_operations po
      LEFT JOIN workcenters wc ON po.workcenter_id = wc.id
      WHERE po.product_id = ?
      ORDER BY po.step_order ASC
    `, [op.product_id]);

    // Histórico de apontamentos
    const logs = queryAll(`
      SELECT * FROM production_logs WHERE production_order_id = ? ORDER BY id DESC
    `, [id]);

    // Configurações da empresa para documento impresso
    const company = queryOne('SELECT * FROM company_settings WHERE id = 1');

    res.json({
      ...op,
      materials,
      operations,
      logs,
      company
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/production-orders', async (req, res) => {
  try {
    const {
      product_id, quantity_planned, priority = 'normal',
      scheduled_start_date, scheduled_end_date, sales_order_id,
      notes, lot_number
    } = req.body;

    const product = queryOne('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const settings = queryOne('SELECT technical_lead_name FROM company_settings WHERE id = 1');
    const techLead = settings?.technical_lead_name || 'Responsável Técnico';

    const opCount = queryOne('SELECT COUNT(*) as cnt FROM production_orders')?.cnt || 0;
    const opCode = `OP-${new Date().getFullYear()}-${String(opCount + 1).padStart(3, '0')}`;
    const generatedLot = lot_number || `LOT-${product.code}-${new Date().getFullYear().toString().slice(-2)}${String(opCount + 1).padStart(2, '0')}`;

    // Calcular tempo estimado de processo em horas
    const operations = queryAll('SELECT setup_time_minutes, run_time_minutes FROM product_operations WHERE product_id = ?', [product_id]);
    const totalMinutesPerUnit = operations.reduce((acc: number, o: any) => acc + (o.setup_time_minutes + o.run_time_minutes), 0) || product.lead_time_minutes || 60;
    const estimatedHours = Number(((totalMinutesPerUnit * Number(quantity_planned)) / 60).toFixed(1));

    execute(`
      INSERT INTO production_orders (
        code, sales_order_id, product_id, quantity_planned, quantity_produced, quantity_scrapped,
        status, priority, scheduled_start_date, scheduled_end_date, estimated_hours,
        technical_lead_name, lot_number, notes
      ) VALUES (?, ?, ?, ?, 0, 0, 'planejada', ?, ?, ?, ?, ?, ?, ?)
    `, [
      opCode,
      sales_order_id ? Number(sales_order_id) : null,
      Number(product_id),
      Number(quantity_planned),
      priority,
      scheduled_start_date || new Date().toISOString().slice(0, 10),
      scheduled_end_date || new Date().toISOString().slice(0, 10),
      estimatedHours,
      techLead,
      generatedLot,
      notes || ''
    ]);

    const created = queryOne('SELECT * FROM production_orders WHERE code = ?', [opCode]);

    execute(`
      INSERT INTO production_logs (production_order_id, user_name, action, notes)
      VALUES (?, ?, 'Criação Manual', ?)
    `, [created.id, techLead, 'Ordem de Produção criada diretamente no módulo PCP']);

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status da OP
apiRouter.put('/production-orders/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { status, user_name, notes, actual_hours } = req.body;
    const op = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let startUpdate = '';
    let endUpdate = '';

    if (status === 'em_andamento' && !op.actual_start_date) {
      startUpdate = `, actual_start_date = '${now}'`;
    }
    if (status === 'concluida' && !op.actual_end_date) {
      endUpdate = `, actual_end_date = '${now}'`;
    }

    const hoursClause = actual_hours !== undefined ? `, actual_hours = ${Number(actual_hours)}` : '';

    execute(`
      UPDATE production_orders SET
        status = ? ${startUpdate} ${endUpdate} ${hoursClause}
      WHERE id = ?
    `, [status, id]);

    execute(`
      INSERT INTO production_logs (production_order_id, user_name, action, notes)
      VALUES (?, ?, ?, ?)
    `, [id, user_name || op.technical_lead_name || 'Operador', `Mudança de status para ${status.toUpperCase()}`, notes || '']);

    const updated = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Adicionar apontamento de produção
apiRouter.post('/production-orders/:id/logs', async (req, res) => {
  try {
    const id = req.params.id;
    const { user_name, action, notes, quantity_produced_add, actual_hours_add } = req.body;
    const op = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    if (quantity_produced_add) {
      const newProduced = (op.quantity_produced || 0) + Number(quantity_produced_add);
      execute('UPDATE production_orders SET quantity_produced = ? WHERE id = ?', [newProduced, id]);
    }

    if (actual_hours_add) {
      const newHours = (op.actual_hours || 0) + Number(actual_hours_add);
      execute('UPDATE production_orders SET actual_hours = ? WHERE id = ?', [newHours, id]);
    }

    execute(`
      INSERT INTO production_logs (production_order_id, user_name, action, notes)
      VALUES (?, ?, ?, ?)
    `, [id, user_name || 'Operador', action || 'Apontamento de Produção', notes || '']);

    const updated = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Baixa e Conclusão de Ordem de Produção
apiRouter.post('/production-orders/:id/complete', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      quantity_produced,
      quantity_scrapped = 0,
      actual_hours,
      user_name,
      notes,
      deduct_materials = true,
      increment_product_stock = true
    } = req.body;

    const op = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    if (!op) return res.status(404).json({ error: 'Ordem de Produção não encontrada' });

    const finalProduced = Number(quantity_produced ?? op.quantity_planned);
    const finalScrapped = Number(quantity_scrapped || 0);
    const finalHours = actual_hours ? Number(actual_hours) : (op.actual_hours || op.estimated_hours);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // 1. Atualizar a Ordem de Produção
    execute(`
      UPDATE production_orders SET
        status = 'concluida',
        quantity_produced = ?,
        quantity_scrapped = ?,
        actual_hours = ?,
        actual_end_date = ?,
        notes = COALESCE(notes || ' | ', '') || ?
      WHERE id = ?
    `, [
      finalProduced,
      finalScrapped,
      finalHours,
      now,
      `Conclusão baixada: ${finalProduced} un produzidas, ${finalScrapped} refugo. ${notes || ''}`,
      id
    ]);

    // 2. Se habilitado: Baixa de estoque de matérias-primas proporcional ao total produzido + refugo
    const totalProcessed = finalProduced + finalScrapped;
    if (deduct_materials && totalProcessed > 0) {
      const bomItems = queryAll('SELECT raw_material_id, quantity FROM product_materials WHERE product_id = ?', [op.product_id]);
      
      for (const item of bomItems) {
        const consumed = Number((item.quantity * totalProcessed).toFixed(3));
        execute(`
          UPDATE raw_materials SET
            current_stock = MAX(0, current_stock - ?)
          WHERE id = ?
        `, [consumed, item.raw_material_id]);

        execute(`
          INSERT INTO stock_movements (type, raw_material_id, quantity, production_order_id, notes)
          VALUES ('saida_producao', ?, ?, ?, ?)
        `, [item.raw_material_id, consumed, id, `Consumo p/ OP ${op.code} (${totalProcessed} un)`]);
      }
    }

    // 3. Se habilitado: Entrada no estoque do produto acabado
    if (increment_product_stock && finalProduced > 0) {
      execute(`
        UPDATE products SET
          current_stock = current_stock + ?
        WHERE id = ?
      `, [finalProduced, op.product_id]);

      execute(`
        INSERT INTO stock_movements (type, product_id, quantity, production_order_id, notes)
        VALUES ('entrada', ?, ?, ?, ?)
      `, [op.product_id, finalProduced, id, `Produção finalizada OP ${op.code}`]);
    }

    // 4. Se tiver pedido vinculado, verificar se concluiu
    if (op.sales_order_id) {
      const remainingOps = queryOne(`
        SELECT COUNT(*) as count FROM production_orders
        WHERE sales_order_id = ? AND status != 'concluida' AND status != 'cancelada'
      `, [op.sales_order_id]);

      if (remainingOps && remainingOps.count === 0) {
        execute("UPDATE sales_orders SET status = 'concluido' WHERE id = ?", [op.sales_order_id]);
      }
    }

    // 5. Log do evento de baixa
    const operator = user_name || op.technical_lead_name || 'Responsável Técnico';
    execute(`
      INSERT INTO production_logs (production_order_id, user_name, action, notes)
      VALUES (?, ?, 'Baixa e Conclusão', ?)
    `, [id, operator, `Produção concluída. ${finalProduced} un aprovadas, ${finalScrapped} refugo. Baixa no estoque efetuada.`]);

    const updated = queryOne('SELECT * FROM production_orders WHERE id = ?', [id]);
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =================== RELATÓRIOS & DASHBOARD PCP ===================
apiRouter.get('/reports/dashboard', async (_req, res) => {
  try {
    const totalOps = queryOne('SELECT COUNT(*) as cnt FROM production_orders')?.cnt || 0;
    const activeOps = queryOne("SELECT COUNT(*) as cnt FROM production_orders WHERE status IN ('planejada', 'liberada', 'em_andamento', 'inspecao')")?.cnt || 0;
    const completedOps = queryOne("SELECT COUNT(*) as cnt FROM production_orders WHERE status = 'concluida'")?.cnt || 0;
    const inProgressOps = queryOne("SELECT COUNT(*) as cnt FROM production_orders WHERE status = 'em_andamento'")?.cnt || 0;

    // Horas planejadas vs reais
    const hoursData = queryOne("SELECT SUM(estimated_hours) as planned_hours, SUM(actual_hours) as executed_hours FROM production_orders WHERE status != 'cancelada'");

    // Itens com estoque crítico (current_stock <= minimum_stock)
    const lowStockMaterials = queryAll(`
      SELECT id, code, name, unit, current_stock, minimum_stock,
             (minimum_stock - current_stock) as deficit
      FROM raw_materials
      WHERE current_stock <= minimum_stock AND active = 1
      ORDER BY deficit DESC
    `);

    // Status distribuição das OPs
    const statusDistribution = queryAll(`
      SELECT status, COUNT(*) as count FROM production_orders GROUP BY status
    `);

    // Capacidade da fábrica vs Carga Alocada
    const company = queryOne('SELECT daily_capacity_hours, days_per_week FROM company_settings WHERE id = 1');
    const weeklyAvailableHours = (company?.daily_capacity_hours || 16) * (company?.days_per_week || 5);
    const activeAllocatedHours = queryOne("SELECT SUM(estimated_hours) as total FROM production_orders WHERE status IN ('planejada', 'liberada', 'em_andamento')")?.total || 0;
    const capacityUtilization = weeklyAvailableHours > 0 ? Number(((activeAllocatedHours / weeklyAvailableHours) * 100).toFixed(1)) : 0;

    // Próximas entregas / Ordens prioritárias
    const upcomingOrders = queryAll(`
      SELECT po.id, po.code, po.status, po.priority, po.scheduled_end_date, po.quantity_planned, po.quantity_produced,
             p.name as product_name, p.code as product_code,
             c.name as client_name
      FROM production_orders po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN sales_orders so ON po.sales_order_id = so.id
      LEFT JOIN clients c ON so.client_id = c.id
      WHERE po.status != 'concluida' AND po.status != 'cancelada'
      ORDER BY po.scheduled_end_date ASC
      LIMIT 8
    `);

    res.json({
      metrics: {
        totalOps,
        activeOps,
        completedOps,
        inProgressOps,
        plannedHours: hoursData?.planned_hours || 0,
        executedHours: hoursData?.executed_hours || 0,
        weeklyAvailableHours,
        activeAllocatedHours,
        capacityUtilization,
        criticalStockCount: lowStockMaterials.length
      },
      lowStockMaterials,
      statusDistribution,
      upcomingOrders
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset para dados de demonstração
apiRouter.post('/reset-demo', async (_req, res) => {
  try {
    const db = await getDb();
    // Drop and reseed
    db.run(`
      DROP TABLE IF EXISTS company_settings;
      DROP TABLE IF EXISTS workcenters;
      DROP TABLE IF EXISTS suppliers;
      DROP TABLE IF EXISTS raw_materials;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS product_materials;
      DROP TABLE IF EXISTS product_operations;
      DROP TABLE IF EXISTS clients;
      DROP TABLE IF EXISTS sales_orders;
      DROP TABLE IF EXISTS sales_order_items;
      DROP TABLE IF EXISTS production_orders;
      DROP TABLE IF EXISTS production_logs;
      DROP TABLE IF EXISTS stock_movements;
    `);

    // Reload schema and data
    const fs = await import('fs');
    const path = await import('path');
    const dbPath = path.resolve(process.cwd(), 'data', 'pcp.sqlite');
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    // Reinit by forcing reload
    process.exit(0); // dev server restarts with fresh seed
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
