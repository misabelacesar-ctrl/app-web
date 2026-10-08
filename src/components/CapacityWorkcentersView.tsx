import React, { useState } from 'react';
import { Gauge, Plus, Edit2, Users, Clock, Percent, Activity, CheckCircle2, X } from 'lucide-react';
import { Workcenter, CompanySettings } from '../types';

interface CapacityWorkcentersViewProps {
  workcenters: Workcenter[];
  company: CompanySettings | null;
  onSaveWorkcenter: (data: Partial<Workcenter>, isEdit?: boolean, id?: number) => Promise<void>;
}

export const CapacityWorkcentersView: React.FC<CapacityWorkcentersViewProps> = ({
  workcenters,
  company,
  onSaveWorkcenter
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWc, setEditingWc] = useState<Workcenter | null>(null);

  const daysPerWeek = company?.days_per_week || 5;
  const totalFactoryDailyHours = workcenters.reduce((acc, w) => acc + (w.capacity_hours_per_day * w.efficiency_rate), 0);
  const totalWeeklyHours = totalFactoryDailyHours * daysPerWeek;
  const totalOperators = workcenters.reduce((acc, w) => acc + w.operators_count, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Capacidade Produtiva & Postos de Trabalho</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dimensionamento de centros de trabalho, eficiência e horas disponíveis para o PCP
          </p>
        </div>

        <button
          onClick={() => {
            setEditingWc(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo Posto de Trabalho</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Capacidade Semanal Útil</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalWeeklyHours.toFixed(1)}h
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {daysPerWeek} dias/semana • considerando taxa de eficiência
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Quadro de Operadores Ativos</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalOperators} pessoas
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Distribuídos em {workcenters.length} células de manufatura
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Eficiência Média da Fábrica</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {workcenters.length > 0 ? (
              (workcenters.reduce((acc, w) => acc + w.efficiency_rate, 0) / workcenters.length * 100).toFixed(0)
            ) : 0}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Fator OEE / produtividade aplicada no cálculo de carga
          </div>
        </div>
      </div>

      {/* Workcenters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workcenters.map((w) => {
          const effectiveDailyHours = (w.capacity_hours_per_day * w.efficiency_rate).toFixed(1);
          const weeklyEffective = (Number(effectiveDailyHours) * daysPerWeek).toFixed(1);

          return (
            <div key={w.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-black text-blue-700">{w.code}</span>
                  <h3 className="font-bold text-slate-900 text-base">{w.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{w.description}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingWc(w);
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacidade / Dia</span>
                  <span className="font-bold text-slate-900 text-sm">{w.capacity_hours_per_day} horas</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Eficácia Real</span>
                  <span className="font-bold text-emerald-700 text-sm">{(w.efficiency_rate * 100).toFixed(0)}% OEE</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Operadores</span>
                  <span className="font-bold text-slate-900 text-sm">{w.operators_count} operadores</span>
                </div>
                <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg">
                  <span className="text-[10px] text-blue-700 uppercase font-bold block">Horas Úteis / Semana</span>
                  <span className="font-black text-blue-900 text-sm">{weeklyEffective}h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Workcenter */}
      {isModalOpen && (
        <WorkcenterModal
          workcenter={editingWc}
          onClose={() => setIsModalOpen(false)}
          onSave={async (data: Partial<Workcenter>) => {
            await onSaveWorkcenter(data, !!editingWc, editingWc?.id);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const WorkcenterModal = ({ workcenter, onClose, onSave }: any) => {
  const [code, setCode] = useState(workcenter?.code || '');
  const [name, setName] = useState(workcenter?.name || '');
  const [description, setDescription] = useState(workcenter?.description || '');
  const [capacityHours, setCapacityHours] = useState(workcenter?.capacity_hours_per_day || 8);
  const [operatorsCount, setOperatorsCount] = useState(workcenter?.operators_count || 2);
  const [efficiencyRate, setEfficiencyRate] = useState(workcenter?.efficiency_rate || 0.85);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await onSave({
      code: code || `CTR-${Date.now().toString().slice(-4)}`,
      name,
      description,
      capacity_hours_per_day: Number(capacityHours),
      operators_count: Number(operatorsCount),
      efficiency_rate: Number(efficiencyRate)
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-base">
            {workcenter ? 'Editar Posto de Trabalho' : 'Novo Posto de Trabalho'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Código</label>
              <input type="text" placeholder="CTR-CORTE" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-mono uppercase" />
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1">Nome do Posto / Célula *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
          </div>
          <div>
            <label className="font-semibold block mb-1">Descrição das Máquinas / Processos</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-1.5 border rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold block mb-1">Horas / Dia</label>
              <input type="number" step="0.5" min="1" max="24" value={capacityHours} onChange={(e) => setCapacityHours(Number(e.target.value))} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Operadores</label>
              <input type="number" min="1" value={operatorsCount} onChange={(e) => setOperatorsCount(Number(e.target.value))} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Taxa Eficiência (0-1)</label>
              <input type="number" step="0.05" min="0.1" max="1" value={efficiencyRate} onChange={(e) => setEfficiencyRate(Number(e.target.value))} className="w-full px-3 py-1.5 border rounded-lg font-bold" />
            </div>
          </div>
          <div className="pt-3 flex justify-end gap-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg">{loading ? 'Salvando...' : 'Salvar Posto'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
