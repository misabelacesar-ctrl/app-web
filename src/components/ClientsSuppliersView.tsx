import React, { useState } from 'react';
import {
  Users2,
  Building,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Clock,
  X
} from 'lucide-react';
import { Client, Supplier } from '../types';

interface ClientsSuppliersViewProps {
  clients: Client[];
  suppliers: Supplier[];
  onSaveClient: (data: Partial<Client>, isEdit?: boolean, id?: number) => Promise<void>;
  onDeleteClient: (id: number) => Promise<void>;
  onSaveSupplier: (data: Partial<Supplier>, isEdit?: boolean, id?: number) => Promise<void>;
  onDeleteSupplier: (id: number) => Promise<void>;
}

export const ClientsSuppliersView: React.FC<ClientsSuppliersViewProps> = ({
  clients,
  suppliers,
  onSaveClient,
  onDeleteClient,
  onSaveSupplier,
  onDeleteSupplier
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Client modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Supplier modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      (c.contact_name && c.contact_name.toLowerCase().includes(term)) ||
      (c.document && c.document.toLowerCase().includes(term))
    );
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.code.toLowerCase().includes(term) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(term)) ||
      (s.products_supplied && s.products_supplied.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Parceiros Comerciais & Suprimentos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de clientes atendidos e fornecedores de insumos para manufatura
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'clients' ? (
            <button
              onClick={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Cliente</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingSupplier(null);
                setIsSupplierModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Novo Fornecedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('clients')}
          className={`py-3 px-4 border-b-2 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'clients'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Clientes ({clients.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`py-3 px-4 border-b-2 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Fornecedores ({suppliers.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'clients' ? "Pesquisar por cliente, contato, CNPJ..." : "Pesquisar por fornecedor, contato, insumos fornecidos..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Clients List */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-2 bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              Nenhum cliente cadastrado.
            </div>
          ) : (
            filteredClients.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-black text-blue-700">{c.code}</span>
                    <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                    {c.document && (
                      <span className="text-[11px] text-slate-500 font-mono">CNPJ/CPF: {c.document}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingClient(c);
                        setIsClientModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  {c.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Contato:</span>
                      <span>{c.contact_name}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.address} {c.city ? `- ${c.city}/${c.state}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Suppliers List */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.length === 0 ? (
            <div className="col-span-2 bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              Nenhum fornecedor cadastrado.
            </div>
          ) : (
            filteredSuppliers.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-black text-indigo-700">{s.code}</span>
                    <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                    {s.cnpj && (
                      <span className="text-[11px] text-slate-500 font-mono">CNPJ: {s.cnpj}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSupplier(s);
                        setIsSupplierModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSupplier(s.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {s.products_supplied && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">Produtos / Insumos Fornecidos: </strong>
                    {s.products_supplied}
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Prazo médio de entrega:</span>
                    </span>
                    <strong className="text-slate-900 font-bold">{s.lead_time_days} dias úteis</strong>
                  </div>
                  {s.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Contato:</span>
                      <span>{s.contact_name}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          client={editingClient}
          onClose={() => setIsClientModalOpen(false)}
          onSave={async (data: Partial<Client>) => {
            await onSaveClient(data, !!editingClient, editingClient?.id);
            setIsClientModalOpen(false);
          }}
        />
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => setIsSupplierModalOpen(false)}
          onSave={async (data: Partial<Supplier>) => {
            await onSaveSupplier(data, !!editingSupplier, editingSupplier?.id);
            setIsSupplierModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Client Modal
const ClientModal = ({ client, onClose, onSave }: any) => {
  const [code, setCode] = useState(client?.code || '');
  const [name, setName] = useState(client?.name || '');
  const [contactName, setContactName] = useState(client?.contact_name || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  const [document, setDocument] = useState(client?.document || '');
  const [address, setAddress] = useState(client?.address || '');
  const [city, setCity] = useState(client?.city || '');
  const [state, setState] = useState(client?.state || 'SP');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      code: code || `CLI-${Date.now().toString().slice(-4)}`,
      name,
      contact_name: contactName,
      phone,
      email,
      document,
      address,
      city,
      state
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Código</label>
              <input type="text" placeholder="CLI-005" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg uppercase font-mono" />
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1">Razão Social / Nome *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">CNPJ / CPF</label>
              <input type="text" value={document} onChange={(e) => setDocument(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-mono" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Pessoa de Contato</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">Telefone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label className="font-semibold block mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Endereço Completo</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">Cidade</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Estado (UF)</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg uppercase" />
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg">{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Supplier Modal
const SupplierModal = ({ supplier, onClose, onSave }: any) => {
  const [code, setCode] = useState(supplier?.code || '');
  const [name, setName] = useState(supplier?.name || '');
  const [contactName, setContactName] = useState(supplier?.contact_name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [email, setEmail] = useState(supplier?.email || '');
  const [cnpj, setCnpj] = useState(supplier?.cnpj || '');
  const [address, setAddress] = useState(supplier?.address || '');
  const [productsSupplied, setProductsSupplied] = useState(supplier?.products_supplied || '');
  const [leadTimeDays, setLeadTimeDays] = useState(supplier?.lead_time_days || 5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      code: code || `FORN-${Date.now().toString().slice(-4)}`,
      name,
      contact_name: contactName,
      phone,
      email,
      cnpj,
      address,
      products_supplied: productsSupplied,
      lead_time_days: Number(leadTimeDays)
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Código</label>
              <input type="text" placeholder="FORN-005" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg uppercase font-mono" />
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1">Nome do Fornecedor *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Insumos Fornecidos</label>
            <input type="text" placeholder="Ex: Aço laminado, parafusos, tintas..." value={productsSupplied} onChange={(e) => setProductsSupplied(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">CNPJ</label>
              <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-mono" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Prazo Médio Entrega (Dias)</label>
              <input type="number" min="1" value={leadTimeDays} onChange={(e) => setLeadTimeDays(Number(e.target.value))} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold block mb-1">Telefone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label className="font-semibold block mb-1">E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg">{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
