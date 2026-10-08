import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Save,
  RotateCcw,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CompanySettings } from '../types';

interface CompanySettingsViewProps {
  company: CompanySettings | null;
  onSave: (data: Partial<CompanySettings>) => Promise<void>;
  onResetDemo: () => Promise<void>;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  company,
  onSave,
  onResetDemo
}) => {
  const [companyName, setCompanyName] = useState(company?.company_name || 'Indústria & Manufatura Progresso Ltda.');
  const [tradeName, setTradeName] = useState(company?.trade_name || 'Progresso Metalmecânica & Montagens');
  const [cnpj, setCnpj] = useState(company?.cnpj || '12.345.678/0001-90');
  const [phone, setPhone] = useState(company?.phone || '(11) 4002-8922');
  const [email, setEmail] = useState(company?.email || 'pcp@progressoindustria.com.br');
  const [address, setAddress] = useState(company?.address || 'Av. Industrial das Nações, 1500 - Distrito Industrial, SP');
  
  // Technical Lead (Responsável Técnico)
  const [techLeadName, setTechLeadName] = useState(company?.technical_lead_name || 'Maria Isabela Cesar');
  const [techLeadRole, setTechLeadRole] = useState(company?.technical_lead_role || 'Engenheira de Produção - Responsável Técnica');
  const [techLeadReg, setTechLeadReg] = useState(company?.technical_lead_reg || 'CREA-SP 50698741-2');

  // Factory capacity
  const [dailyCapacityHours, setDailyCapacityHours] = useState(company?.daily_capacity_hours || 16.0);
  const [daysPerWeek, setDaysPerWeek] = useState(company?.days_per_week || 5);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onSave({
        company_name: companyName,
        trade_name: tradeName,
        cnpj,
        phone,
        email,
        address,
        technical_lead_name: techLeadName,
        technical_lead_role: techLeadRole,
        technical_lead_reg: techLeadReg,
        daily_capacity_hours: Number(dailyCapacityHours),
        days_per_week: Number(daysPerWeek)
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Deseja recarregar a base de dados de demonstração da fábrica?')) {
      try {
        setResetting(true);
        await onResetDemo();
        window.location.reload();
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Configurações da Empresa & Responsabilidade Técnica</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina os dados corporativos e o profissional responsável técnico exibido em todas as Ordens de Produção e laudos
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configurações atualizadas com sucesso! Os dados já estão ativos em todos os relatórios e documentos emitidos.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        
        {/* Bloco 1: Responsável Técnico em Documentos (Destaque Principal) */}
        <div className="bg-gradient-to-br from-emerald-50/60 to-white p-5 rounded-2xl border-2 border-emerald-300 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Responsável Técnico Oficial (CREA / CRQ / CFQ)
              </h3>
              <p className="text-slate-600 text-xs">
                O nome informado aqui é impresso automaticamente nas Ordens de Produção (OP), fichas técnicas e relatórios de acompanhamento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Nome do Responsável Técnico *
              </label>
              <input
                type="text"
                required
                value={techLeadName}
                onChange={(e) => setTechLeadName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Cargo / Especialidade Técnica *
              </label>
              <input
                type="text"
                required
                value={techLeadRole}
                onChange={(e) => setTechLeadRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Registro Profissional (Ex: CREA)
              </label>
              <input
                type="text"
                value={techLeadReg}
                onChange={(e) => setTechLeadReg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados da Manufatura / Razão Social */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Dados Cadastrais da Empresa
              </h3>
              <p className="text-slate-500 text-[11px]">
                Cabeçalho impresso nos formulários da fábrica
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Razão Social *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Telefone / Ramal</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">E-mail PCP</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Endereço da Planta Fabril</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Bloco 3: Capacidade Padrão da Fábrica */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Regime de Turnos & Capacidade Global
              </h3>
              <p className="text-slate-500 text-[11px]">
                Parâmetros para cálculo de sobrecarga no painel do PCP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Horas de Operação por Dia (Turnos)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={dailyCapacityHours}
                onChange={(e) => setDailyCapacityHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Ex: 8.0h (1 turno), 16.0h (2 turnos), 24.0h (3 turnos)
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Dias de Operação por Semana
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Normalmente 5 (segunda a sexta) ou 6 dias
              </span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Reiniciando...' : 'Recarregar Dados de Demonstração'}</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Gravando...' : 'Salvar Alterações'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
