/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
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
  ProductionOrderStatus
} from './types';

import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductionOrdersView } from './components/ProductionOrdersView';
import { ProductionOrderDetailModal } from './components/ProductionOrderDetailModal';
import { PrintProductionOrderModal } from './components/PrintProductionOrderModal';
import { CompleteOrderModal } from './components/CompleteOrderModal';
import { NewProductionOrderModal } from './components/NewProductionOrderModal';
import { ProductsView } from './components/ProductsView';
import { MaterialsView } from './components/MaterialsView';
import { SalesOrdersView } from './components/SalesOrdersView';
import { ClientsSuppliersView } from './components/ClientsSuppliersView';
import { CapacityWorkcentersView } from './components/CapacityWorkcentersView';
import { ReportsView } from './components/ReportsView';
import { CompanySettingsView } from './components/CompanySettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Domain data states
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workcenters, setWorkcenters] = useState<Workcenter[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Modals state
  const [printingOrder, setPrintingOrder] = useState<ProductionOrder | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);
  const [detailOrder, setDetailOrder] = useState<ProductionOrder | null>(null);
  const [completingOrder, setCompletingOrder] = useState<ProductionOrder | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [
        companyRes,
        materialsRes,
        productsRes,
        suppliersRes,
        clientsRes,
        workcentersRes,
        ordersRes,
        prodOrdersRes,
        dashRes
      ] = await Promise.all([
        api.getCompanySettings(),
        api.getMaterials(),
        api.getProducts(),
        api.getSuppliers(),
        api.getClients(),
        api.getWorkcenters(),
        api.getOrders(),
        api.getProductionOrders(),
        api.getDashboardData()
      ]);

      setCompany(companyRes);
      setMaterials(materialsRes);
      setProducts(productsRes);
      setSuppliers(suppliersRes);
      setClients(clientsRes);
      setWorkcenters(workcentersRes);
      setSalesOrders(ordersRes);
      setProductionOrders(prodOrdersRes);
      setDashboardData(dashRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle opening OP details
  const handleOpenOrderDetail = async (orderId: number) => {
    try {
      const op = await api.getProductionOrder(orderId);
      setDetailOrder(op);
      setDetailOrderId(orderId);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar dados da ordem');
    }
  };

  // Handle printing OP
  const handlePrintOrder = async (order: ProductionOrder) => {
    try {
      const op = await api.getProductionOrder(order.id);
      setPrintingOrder(op);
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar dados para impressão');
    }
  };

  // Status update
  const handleUpdateStatus = async (orderId: number, status: ProductionOrderStatus) => {
    try {
      await api.updateProductionOrderStatus(orderId, {
        status,
        user_name: company?.technical_lead_name || 'Operador PCP'
      });
      showToast(`Status da ordem atualizado para ${status.toUpperCase()}`);
      await loadData();
      if (detailOrderId === orderId) {
        const updated = await api.getProductionOrder(orderId);
        setDetailOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  // Add Log
  const handleAddLog = async (logData: any) => {
    if (!detailOrderId) return;
    try {
      await api.addProductionLog(detailOrderId, {
        ...logData,
        user_name: company?.technical_lead_name || 'Operador Chão de Fábrica'
      });
      showToast('Apontamento de produção registrado com sucesso!');
      await loadData();
      const updated = await api.getProductionOrder(detailOrderId);
      setDetailOrder(updated);
    } catch (err: any) {
      alert(err.message || 'Erro ao gravar apontamento');
    }
  };

  // Complete Order
  const handleConfirmCompleteOrder = async (completionData: any) => {
    if (!completingOrder) return;
    await api.completeProductionOrder(completingOrder.id, completionData);
    showToast(`Ordem ${completingOrder.code} concluída! Estoque atualizado automaticamente.`);
    setCompletingOrder(null);
    if (detailOrderId === completingOrder.id) {
      setDetailOrder(null);
      setDetailOrderId(null);
    }
    await loadData();
  };

  // Create new OP
  const handleCreateNewOrder = async (data: any) => {
    const created = await api.createProductionOrder(data);
    showToast(`Ordem de Produção ${created.code} gerada com sucesso!`);
    await loadData();
  };

  // Generate OPs from Sales Order
  const handleGenerateOpsFromSalesOrder = async (orderId: number) => {
    const result = await api.generateOpsFromOrder(orderId);
    showToast(`${result.count} Ordem(ns) de Produção gerada(s) para o pedido!`);
    await loadData();
  };

  // Active OPs count
  const activeOpsCount = productionOrders.filter(
    (o) => o.status !== 'concluida' && o.status !== 'cancelada'
  ).length;

  const criticalStockCount = materials.filter(
    (m) => m.current_stock <= m.minimum_stock
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">Carregando ManufacPro PCP...</h2>
        <p className="text-xs text-slate-400 mt-1">Conectando ao banco de dados relacional SQLite</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-70 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs flex items-center gap-3 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        company={company}
        activeOpsCount={activeOpsCount}
        onOpenSettings={() => setCurrentTab('settings')}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          criticalStockCount={criticalStockCount}
          activeOpsCount={activeOpsCount}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                data={dashboardData}
                company={company}
                onNavigateTab={setCurrentTab}
                onOpenOrder={handleOpenOrderDetail}
                onNewOrder={() => setIsNewOrderModalOpen(true)}
              />
            )}

            {currentTab === 'production_orders' && (
              <ProductionOrdersView
                orders={productionOrders}
                products={products}
                company={company}
                onOpenOrder={handleOpenOrderDetail}
                onPrintOrder={handlePrintOrder}
                onCompleteOrder={(op) => setCompletingOrder(op)}
                onNewOrder={() => setIsNewOrderModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {currentTab === 'sales_orders' && (
              <SalesOrdersView
                orders={salesOrders}
                clients={clients}
                products={products}
                onCreateOrder={async (data) => {
                  await api.createOrder(data);
                  showToast('Pedido de venda registrado!');
                  await loadData();
                }}
                onGenerateOps={handleGenerateOpsFromSalesOrder}
                onNavigateToOps={() => setCurrentTab('production_orders')}
              />
            )}

            {currentTab === 'products' && (
              <ProductsView
                products={products}
                materials={materials}
                workcenters={workcenters}
                onSaveProduct={async (data, isEdit, id) => {
                  if (isEdit && id) {
                    await api.updateProduct(id, data);
                    showToast('Ficha técnica atualizada!');
                  } else {
                    await api.createProduct(data);
                    showToast('Novo produto cadastrado com sucesso!');
                  }
                  await loadData();
                }}
                onDeleteProduct={async (id) => {
                  if (window.confirm('Excluir este produto?')) {
                    try {
                      await api.deleteProduct(id);
                      showToast('Produto excluído!');
                      await loadData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                }}
              />
            )}

            {currentTab === 'materials' && (
              <MaterialsView
                materials={materials}
                suppliers={suppliers}
                onSaveMaterial={async (data, isEdit, id) => {
                  if (isEdit && id) {
                    await api.updateMaterial(id, data);
                    showToast('Matéria-prima atualizada!');
                  } else {
                    await api.createMaterial(data);
                    showToast('Nova matéria-prima cadastrada!');
                  }
                  await loadData();
                }}
                onDeleteMaterial={async (id) => {
                  if (window.confirm('Excluir esta matéria-prima?')) {
                    try {
                      await api.deleteMaterial(id);
                      showToast('Matéria-prima removida!');
                      await loadData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                }}
                onAdjustStock={async (id, data) => {
                  await api.adjustMaterialStock(id, data);
                  showToast('Movimentação de estoque lançada!');
                  await loadData();
                }}
              />
            )}

            {currentTab === 'clients_suppliers' && (
              <ClientsSuppliersView
                clients={clients}
                suppliers={suppliers}
                onSaveClient={async (data, isEdit, id) => {
                  if (isEdit && id) {
                    await api.updateClient(id, data);
                    showToast('Cliente atualizado!');
                  } else {
                    await api.createClient(data);
                    showToast('Cliente cadastrado!');
                  }
                  await loadData();
                }}
                onDeleteClient={async (id) => {
                  if (window.confirm('Excluir cliente?')) {
                    try {
                      await api.deleteClient(id);
                      showToast('Cliente excluído!');
                      await loadData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                }}
                onSaveSupplier={async (data, isEdit, id) => {
                  if (isEdit && id) {
                    await api.updateSupplier(id, data);
                    showToast('Fornecedor atualizado!');
                  } else {
                    await api.createSupplier(data);
                    showToast('Fornecedor cadastrado!');
                  }
                  await loadData();
                }}
                onDeleteSupplier={async (id) => {
                  if (window.confirm('Excluir fornecedor?')) {
                    try {
                      await api.deleteSupplier(id);
                      showToast('Fornecedor excluído!');
                      await loadData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }
                }}
              />
            )}

            {currentTab === 'capacity' && (
              <CapacityWorkcentersView
                workcenters={workcenters}
                company={company}
                onSaveWorkcenter={async (data, isEdit, id) => {
                  if (isEdit && id) {
                    await api.updateWorkcenter(id, data);
                    showToast('Posto de trabalho atualizado!');
                  } else {
                    await api.createWorkcenter(data);
                    showToast('Novo posto cadastrado!');
                  }
                  await loadData();
                }}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                orders={productionOrders}
                materials={materials}
                company={company}
                onPrintOrder={handlePrintOrder}
              />
            )}

            {currentTab === 'settings' && (
              <CompanySettingsView
                company={company}
                onSave={async (data) => {
                  const updated = await api.updateCompanySettings(data);
                  setCompany(updated);
                  showToast('Dados corporativos e Responsável Técnico atualizados!');
                  await loadData();
                }}
                onResetDemo={async () => {
                  await api.resetDemoData();
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}

      {/* Modal Detalhes & Apontamentos da OP */}
      {detailOrder && (
        <ProductionOrderDetailModal
          order={detailOrder}
          onClose={() => {
            setDetailOrder(null);
            setDetailOrderId(null);
          }}
          onPrint={() => {
            setPrintingOrder(detailOrder);
          }}
          onComplete={() => {
            setCompletingOrder(detailOrder);
          }}
          onUpdateStatus={async (status) => {
            await handleUpdateStatus(detailOrder.id, status);
          }}
          onAddLog={handleAddLog}
        />
      )}

      {/* Modal Impressão A4 Ordem de Produção Oficial */}
      {printingOrder && (
        <PrintProductionOrderModal
          order={printingOrder}
          company={company}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Modal Baixa e Conclusão de OP */}
      {completingOrder && (
        <CompleteOrderModal
          order={completingOrder}
          onClose={() => setCompletingOrder(null)}
          onConfirm={handleConfirmCompleteOrder}
        />
      )}

      {/* Modal Nova Ordem de Produção */}
      {isNewOrderModalOpen && (
        <NewProductionOrderModal
          products={products}
          company={company}
          onClose={() => setIsNewOrderModalOpen(false)}
          onSubmit={handleCreateNewOrder}
        />
      )}
    </div>
  );
}
