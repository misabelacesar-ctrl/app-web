import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'pcp.sqlite');

let db: Database;

export async function getDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    initSchema(db);
    seedInitialData(db);
    persistDb();
  }

  return db;
}

export function persistDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function initSchema(database: Database) {
  database.run(`
    -- Configurações da Empresa e Responsável Técnico
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      company_name TEXT NOT NULL,
      trade_name TEXT,
      cnpj TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      technical_lead_name TEXT NOT NULL,
      technical_lead_role TEXT NOT NULL,
      technical_lead_reg TEXT,
      daily_capacity_hours REAL DEFAULT 16.0,
      days_per_week INTEGER DEFAULT 5,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Postos de Trabalho / Centro de Custos / Capacidade
    CREATE TABLE IF NOT EXISTS workcenters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      capacity_hours_per_day REAL DEFAULT 8.0,
      operators_count INTEGER DEFAULT 2,
      efficiency_rate REAL DEFAULT 0.85,
      active INTEGER DEFAULT 1
    );

    -- Fornecedores
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      cnpj TEXT,
      address TEXT,
      products_supplied TEXT,
      lead_time_days INTEGER DEFAULT 5,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Matéria-Prima / Insumos
    CREATE TABLE IF NOT EXISTS raw_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      unit TEXT NOT NULL,
      unit_cost REAL NOT NULL DEFAULT 0.0,
      current_stock REAL NOT NULL DEFAULT 0.0,
      minimum_stock REAL NOT NULL DEFAULT 0.0,
      supplier_id INTEGER,
      location TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- Produtos Acabados / Ficha Técnica (BOM)
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      unit TEXT NOT NULL DEFAULT 'UN',
      lead_time_minutes INTEGER NOT NULL DEFAULT 60,
      selling_price REAL DEFAULT 0.0,
      technical_spec TEXT,
      current_stock REAL DEFAULT 0.0,
      minimum_stock REAL DEFAULT 0.0,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Lista de Materiais da Ficha Técnica (BOM)
    CREATE TABLE IF NOT EXISTS product_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      raw_material_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
    );

    -- Roteiro de Fabricação / Etapas do Produto
    CREATE TABLE IF NOT EXISTS product_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      step_order INTEGER NOT NULL,
      operation_name TEXT NOT NULL,
      workcenter_id INTEGER,
      setup_time_minutes INTEGER DEFAULT 10,
      run_time_minutes INTEGER NOT NULL DEFAULT 30,
      instructions TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (workcenter_id) REFERENCES workcenters(id)
    );

    -- Clientes
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      document TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Pedidos de Venda
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_producao, concluido, cancelado
      total_amount REAL DEFAULT 0.0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    -- Itens do Pedido de Venda
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Ordens de Produção (OP)
    CREATE TABLE IF NOT EXISTS production_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      sales_order_id INTEGER,
      product_id INTEGER NOT NULL,
      quantity_planned REAL NOT NULL,
      quantity_produced REAL DEFAULT 0.0,
      quantity_scrapped REAL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'planejada', -- planejada, liberada, em_andamento, inspecao, concluida, cancelada
      priority TEXT NOT NULL DEFAULT 'normal', -- baixa, normal, alta, urgente
      scheduled_start_date TEXT NOT NULL,
      scheduled_end_date TEXT NOT NULL,
      actual_start_date TEXT,
      actual_end_date TEXT,
      estimated_hours REAL NOT NULL DEFAULT 1.0,
      actual_hours REAL DEFAULT 0.0,
      technical_lead_name TEXT,
      lot_number TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Histórico e Apontamento de Produção
    CREATE TABLE IF NOT EXISTS production_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      production_order_id INTEGER NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE
    );

    -- Movimentações de Estoque
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- entrada, saida_producao, ajuste
      raw_material_id INTEGER,
      product_id INTEGER,
      quantity REAL NOT NULL,
      production_order_id INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData(database: Database) {
  // Configuração inicial
  database.run(`
    INSERT INTO company_settings (
      id, company_name, trade_name, cnpj, phone, email, address,
      technical_lead_name, technical_lead_role, technical_lead_reg,
      daily_capacity_hours, days_per_week
    ) VALUES (
      1,
      'Indústria & Manufatura Progresso Ltda.',
      'Progresso Metalmecânica & Montagens',
      '12.345.678/0001-90',
      '(11) 4002-8922',
      'pcp@progressoindustria.com.br',
      'Av. Industrial das Nações, 1500 - Distrito Industrial, SP',
      'Maria Isabela Cesar',
      'Engenheira de Produção - Responsável Técnica',
      'CREA-SP 50698741-2',
      16.0,
      5
    );
  `);

  // Postos de trabalho
  database.run(`
    INSERT INTO workcenters (code, name, description, capacity_hours_per_day, operators_count, efficiency_rate) VALUES
    ('CTR-CORTE', 'Corte e Usinagem CNC', 'Puncionadeiras, guilhotinas e fresas CNC', 16.0, 3, 0.90),
    ('CTR-SOLDA', 'Soldagem e Caldeiraria', 'Cabines de solda MIG/TIG e pontamento', 16.0, 2, 0.85),
    ('CTR-PINT', 'Pintura Eletrostática', 'Linha de pintura a pó e estufa de polimerização', 12.0, 2, 0.92),
    ('CTR-MONT', 'Linha de Montagem Final', 'Bancadas com parafusadeiras pneumáticas e teste funcional', 16.0, 4, 0.88),
    ('CTR-QUAL', 'Controle de Qualidade e Embalagem', 'Bancada metrológica, inspeção visual e paletização', 14.0, 2, 0.95);
  `);

  // Fornecedores
  database.run(`
    INSERT INTO suppliers (code, name, contact_name, phone, email, cnpj, address, products_supplied, lead_time_days) VALUES
    ('FORN-001', 'Aço & Chapas Gerdau Sul', 'Roberto Martins', '(11) 3211-4455', 'vendas@acosul.com.br', '45.123.890/0001-11', 'Rodovia dos Bandeirantes km 42 - Campinas, SP', 'Chapas de Aço SAE 1020, Tubos Quadrados 40x40', 4),
    ('FORN-002', 'Tintas & Pigmentos Industriais Polilack', 'Carla Silveira', '(19) 3888-2100', 'comercial@polilack.com.br', '23.456.789/0001-22', 'Rua Química Fina, 210 - Paulínia, SP', 'Tinta Pó Eletrostática Epóxi Preto Fosco e Cinza', 3),
    ('FORN-003', 'Parafusos & Fixadores Central Fix', 'Marcos Duarte', '(11) 2999-7744', 'contato@centralfix.com.br', '67.890.123/0001-33', 'Av. Rangel Pestana, 850 - São Paulo, SP', 'Parafusos Allen M8x30, Porcas Travantes, Arruelas', 2),
    ('FORN-004', 'Componentes e Borrachas Vulcatec', 'Aline Vieira', '(11) 4555-1234', 'pedidos@vulcatec.com.br', '34.567.890/0001-44', 'Rua dos Borrachoeiros, 45 - Guarulhos, SP', 'Pés de Borracha NBR, Perfis de Vedação', 5);
  `);

  // Matérias-Primas
  database.run(`
    INSERT INTO raw_materials (code, name, description, unit, unit_cost, current_stock, minimum_stock, supplier_id, location) VALUES
    ('MP-001', 'Chapa de Aço 1020 (1.5mm x 1200 x 2400)', 'Chapa fina laminada a frio p/ conformação', 'CHAPA', 145.00, 38.0, 15.0, 1, 'Galpão A - Prateleira A1'),
    ('MP-002', 'Tubo Estrutural Aço 40x40x2mm (barra 6m)', 'Perfil tubular quadrado soldado', 'BARRA', 78.50, 65.0, 20.0, 1, 'Galpão A - Tubulão B2'),
    ('MP-003', 'Tinta Epóxi a Pó Preto Fosco Ral 9005', 'Revestimento anticorrosivo polimerizável', 'KG', 34.00, 120.0, 30.0, 2, 'Almoxarifado Químico - Q1'),
    ('MP-004', 'Parafuso Cabeça Cilíndrica M8x25mm Aço 8.8', 'Fixador galvanizado trivalente', 'CENTO', 42.00, 25.0, 10.0, 3, 'Almoxarifado Central - Gaveta C4'),
    ('MP-005', 'Porca Sextavada Auto-Travante M8', 'Porca com anel de nylon M8 DIN 985', 'CENTO', 28.00, 30.0, 10.0, 3, 'Almoxarifado Central - Gaveta C5'),
    ('MP-006', 'Pé Nivelador de Borracha Antivibração M10', 'Borracha vulcanizada com rosca metálica', 'UN', 6.50, 180.0, 50.0, 4, 'Almoxarifado Central - Gaveta D1'),
    ('MP-007', 'Arame de Solda MIG ER70S-6 (Rolo 15kg)', 'Consumível para soldagem estrutural', 'ROLO', 185.00, 8.0, 4.0, 1, 'Área de Solda - Suporte 1'),
    ('MP-008', 'Filme Stretch para Paletização (500mm)', 'Embalagem de proteção final para expedição', 'BOBINA', 48.00, 22.0, 8.0, 3, 'Expedição - Palete E1');
  `);

  // Produtos Acabados
  database.run(`
    INSERT INTO products (code, name, description, category, unit, lead_time_minutes, selling_price, technical_spec, current_stock, minimum_stock) VALUES
    ('PRD-101', 'Mesa de Trabalho Industrial Reforçada (1800x800)', 'Bancada ergonômica para oficinas e laboratórios industriais', 'Mobiliário Industrial', 'UN', 150, 1480.00, 'Dimensões: 1800x800x900mm. Carga estática máx: 450kg. Tampo estruturado em chapa 1.5mm dobrada. Pintura eletrostática a pó com cura em 200°C.', 5.0, 2.0),
    ('PRD-102', 'Armário de Ferramentas com 4 Prateleiras', 'Gabinete reforçado com portas duplas e fecho cremona', 'Armazenamento', 'UN', 180, 1850.00, 'Dimensões: 1000x500x1900mm. Chapa 1.5mm. Capacidade por prateleira: 100kg distribuídos. Fechadura com chave cilíndrica.', 3.0, 2.0),
    ('PRD-103', 'Carrinho de Transporte de Peças 3 Níveis', 'Carrinho móvel com 4 rodízios e bandejas estampadas', 'Logística Interna', 'UN', 90, 890.00, 'Dimensões: 900x500x850mm. Tubo 40x40. 2 rodízios fixos e 2 giratórios com freio. Carga máx: 250kg.', 8.0, 4.0),
    ('PRD-104', 'Suporte Painel Perfurado para Ferramentas 1200x800', 'Painel organizador modular com furação padrão 25mm', 'Acessórios', 'UN', 60, 420.00, 'Dimensões: 1200x800x25mm. Chapa de aço perfurada CNC 1.2mm. Furação quadrada 10x10mm espaçamento 25mm.', 12.0, 5.0);
  `);

  // BOM (Ficha Técnica: Insumos por Produto)
  database.run(`
    -- Mesa PRD-101
    INSERT INTO product_materials (product_id, raw_material_id, quantity, notes) VALUES
    (1, 1, 1.2, '1.2 chapa para o tampo e reforços inferiores'),
    (1, 2, 1.5, '1.5 barra para os pés e travessas estruturais'),
    (1, 3, 1.8, '1.8 kg de tinta pó preto Ral 9005'),
    (1, 4, 0.16, '16 parafusos M8x25'),
    (1, 5, 0.16, '16 porcas travantes M8'),
    (1, 6, 4.0, '4 pés de nivelamento'),
    (1, 7, 0.08, 'Consumo aproximado de arame MIG'),
    (1, 8, 0.25, 'Filme stretch para proteção na entrega');

    -- Armário PRD-102
    INSERT INTO product_materials (product_id, raw_material_id, quantity, notes) VALUES
    (2, 1, 2.5, '2.5 chapas para corpo, portas e 4 prateleiras'),
    (2, 3, 3.2, '3.2 kg de tinta epóxi preto fosco'),
    (2, 4, 0.24, '24 parafusos para fixação interna'),
    (2, 5, 0.24, '24 porcas M8'),
    (2, 6, 4.0, '4 sapatas niveladoras'),
    (2, 7, 0.12, 'Arame MIG para junção da carcaça'),
    (2, 8, 0.35, 'Embalagem paletizada');

    -- Carrinho PRD-103
    INSERT INTO product_materials (product_id, raw_material_id, quantity, notes) VALUES
    (3, 1, 0.8, '0.8 chapa para 3 bandejas estampadas'),
    (3, 2, 1.0, '1 barra de tubo 40x40 para colunas verticais'),
    (3, 3, 1.2, '1.2 kg de tinta pó'),
    (3, 4, 0.12, '12 parafusos de união'),
    (3, 7, 0.06, 'Soldagem da estrutura principal');

    -- Painel PRD-104
    INSERT INTO product_materials (product_id, raw_material_id, quantity, notes) VALUES
    (4, 1, 0.45, '0.45 chapa perfurada e dobrada'),
    (4, 3, 0.6, '0.6 kg tinta epóxi'),
    (4, 8, 0.15, 'Embalagem unitária stretch');
  `);

  // Operações de Produção / Roteiro
  database.run(`
    -- Mesa PRD-101
    INSERT INTO product_operations (product_id, step_order, operation_name, workcenter_id, setup_time_minutes, run_time_minutes, instructions) VALUES
    (1, 1, 'Corte e Dobra de Chapas e Tubos', 1, 15, 35, 'Cortar chapa 1.5mm conforme gabarito G-101. Cortar tubos 40x40 em esquadro 90°.'),
    (1, 2, 'Soldagem Estrutural MIG do Chassi', 2, 10, 40, 'Montar gabarito de solda, pontear estrutura, verificar esquadro diagonal e soldar cordão contínuo.'),
    (1, 3, 'Pintura Eletrostática a Pó', 3, 15, 30, 'Desengraxe químico, fosfatização rápida, aplicação pó Ral 9005 e estufa a 200°C por 18 min.'),
    (1, 4, 'Montagem Final e Acessórios', 4, 10, 25, 'Parafusar tampo ao chassi com parafusos M8, rosquear pés niveladores com contra-porca.'),
    (1, 5, 'Inspeção Dimensional e Embalagem', 5, 5, 20, 'Verificar tolerância planar de ±1mm, aderência de pintura e aplicar filme stretch com etiqueta.');

    -- Armário PRD-102
    INSERT INTO product_operations (product_id, step_order, operation_name, workcenter_id, setup_time_minutes, run_time_minutes, instructions) VALUES
    (2, 1, 'Puncionamento CNC e Dobra CNC', 1, 20, 45, 'Estampar furações de prateleiras nas laterais e dobrar corpo em prensa dobradeira CNC.'),
    (2, 2, 'Ponteamento e Soldagem de Dobradiças', 2, 10, 35, 'Soldar dobradiças reforçadas e reforços internos em ômega.'),
    (2, 3, 'Tratamento de Superfície e Pintura', 3, 15, 45, 'Linha eletrostática pó com camada de 80 micras.'),
    (2, 4, 'Instalação de Fecho Cremona e Portas', 4, 10, 35, 'Montar maçaneta escamoteável, cremona trifásica e regular alinhamento de portas.'),
    (2, 5, 'Inspeção de Fechamento e Embalagem', 5, 5, 20, 'Testar trava, chave reserva e envolver em cantoneiras de papelão e stretch.');
  `);

  // Clientes
  database.run(`
    INSERT INTO clients (code, name, contact_name, phone, email, document, address, city, state) VALUES
    ('CLI-001', 'AutoPeças & Manufatura Brasil S/A', 'Carlos Eduardo Lima', '(11) 3456-7890', 'compras@autopecasbrasil.com.br', '01.234.567/0001-89', 'Av. das Indústrias, 4500 - Bloco B', 'São Bernardo do Campo', 'SP'),
    ('CLI-002', 'TecnoLog Soluções de Automação', 'Fernanda Prado', '(19) 3999-1122', 'suprimentos@tecnolog.com.br', '12.987.654/0001-32', 'Rua Engenheiro Agrônomo, 120', 'Campinas', 'SP'),
    ('CLI-003', 'Metalúrgica Aliança Equipamentos', 'Renato Sampaio', '(11) 4789-6321', 'renato@metalurgicaalianca.ind.br', '87.654.321/0001-99', 'Rua Projetada Cinco, 88', 'Guarulhos', 'SP'),
    ('CLI-004', 'Distribuidora Oficina & Cia Ltda.', 'Mariana Castro', '(31) 3333-8899', 'financeiro@oficinaecia.com.br', '54.321.987/0001-45', 'Av. Amazonas, 3200', 'Belo Horizonte', 'MG');
  `);

  // Pedidos de Venda
  database.run(`
    INSERT INTO sales_orders (order_number, client_id, order_date, delivery_date, status, total_amount, notes) VALUES
    ('PED-2026-001', 1, '2026-10-01', '2026-10-15', 'em_producao', 14800.00, 'Lote urgente para nova linha de montagem da fábrica.'),
    ('PED-2026-002', 2, '2026-10-03', '2026-10-20', 'em_producao', 7400.00, 'Cliente solicita entrega paletizada com laudo de qualidade.'),
    ('PED-2026-003', 3, '2026-10-05', '2026-10-25', 'pendente', 8900.00, 'Pedido regular com previsão de faturamento no dia 24.'),
    ('PED-2026-004', 4, '2026-09-20', '2026-10-02', 'concluido', 12600.00, 'Pedido entregue com sucesso e NF emitida.');
  `);

  // Itens dos Pedidos
  database.run(`
    INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 10.0, 1480.00),
    (2, 2, 4.0, 1850.00),
    (3, 3, 10.0, 890.00),
    (4, 1, 5.0, 1480.00),
    (4, 4, 12.0, 420.00);
  `);

  // Ordens de Produção (OPs)
  database.run(`
    INSERT INTO production_orders (
      code, sales_order_id, product_id, quantity_planned, quantity_produced, quantity_scrapped,
      status, priority, scheduled_start_date, scheduled_end_date, actual_start_date, actual_end_date,
      estimated_hours, actual_hours, technical_lead_name, lot_number, notes
    ) VALUES
    ('OP-2026-001', 1, 1, 10.0, 6.0, 0.0, 'em_andamento', 'alta', '2026-10-06', '2026-10-14', '2026-10-06 08:00', NULL, 25.0, 15.5, 'Maria Isabela Cesar', 'LOT-M101-2601', 'Mesa Industrial Reforçada - 6 un já no setor de pintura.'),
    ('OP-2026-002', 2, 2, 4.0, 0.0, 0.0, 'liberada', 'urgente', '2026-10-09', '2026-10-17', NULL, NULL, 12.0, 0.0, 'Maria Isabela Cesar', 'LOT-ARM-2602', 'Materiais separados no almoxarifado. Aguarda liberação do posto de dobra.'),
    ('OP-2026-003', 3, 3, 10.0, 0.0, 0.0, 'planejada', 'normal', '2026-10-12', '2026-10-22', NULL, NULL, 15.0, 0.0, 'Maria Isabela Cesar', 'LOT-CAR-2603', 'Carrinhos de transporte - Planejada no PCP para início na próxima semana.'),
    ('OP-2026-004', 4, 1, 5.0, 5.0, 0.0, 'concluida', 'normal', '2026-09-22', '2026-09-30', '2026-09-22 08:30', '2026-09-29 17:00', 12.5, 12.0, 'Maria Isabela Cesar', 'LOT-M101-2599', 'Produção finalizada 100% conforme especificação. Baixa de estoque efetuada.');
  `);

  // Logs de produção
  database.run(`
    INSERT INTO production_logs (production_order_id, user_name, action, notes) VALUES
    (1, 'Maria Isabela Cesar', 'Criação da OP', 'Ordem gerada a partir do pedido PED-2026-001'),
    (1, 'Almoxarifado', 'Liberação de Materiais', 'Todas as matérias-primas conferidas e reservadas'),
    (1, 'Supervisor Produção', 'Início de Produção', 'Posto de corte e usinagem CNC iniciado'),
    (1, 'Operador Solda', 'Apontamento Parcial', '10 chassis soldados e 6 peças enviadas à pintura'),
    (2, 'Maria Isabela Cesar', 'Liberação de OP', 'Materiais alocados e programação confirmada'),
    (4, 'Maria Isabela Cesar', 'Baixa e Conclusão', 'Produção concluída e 5 unidades incorporadas ao estoque');
  `);
}
