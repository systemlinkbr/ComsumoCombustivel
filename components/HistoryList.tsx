import React from 'react';
import { FuelEntry } from '../types';
import { computeEntries, formatCurrency, formatDate, formatNumber } from '../utils';
import { Droplet, Edit2, Trash2 } from 'lucide-react';

interface HistoryListProps {
  entries: FuelEntry[];
  onEdit: (entry: FuelEntry) => void;
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onEdit, onDelete }) => {
  const computed = computeEntries(entries);

  if (computed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 pb-24">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Droplet className="w-8 h-8 text-slate-300" />
        </div>
        <p>Nenhum registro encontrado.</p>
        <p className="text-sm">Comece adicionando seu primeiro abastecimento!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-500">
      <header className="px-1 mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
      </header>

      <div className="space-y-3">
        {computed.map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 transition-all hover:shadow-md">
            
            {/* Top Row: Date & Actions */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {formatDate(entry.date)}
              </span>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(entry);
                  }}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  aria-label="Excluir"
                >
                  <Trash2 className="w-4 h-4 group-hover:stroke-2" />
                </button>
              </div>
            </div>

            {/* Middle Row: Main Stats */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-bold text-slate-900">
                  {formatCurrency(entry.totalCost)}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>{entry.liters} L</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span>{formatCurrency(entry.pricePerLiter)}/L</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold text-base px-2 py-1 rounded-lg inline-block ${entry.efficiency ? 'bg-brand-50 text-brand-700' : 'bg-slate-50 text-slate-400'}`}>
                  {entry.efficiency ? `${formatNumber(entry.efficiency)} Km/L` : '-'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {entry.distance > 0 ? `+${formatNumber(entry.distance, 0)} km` : 'Ponto Inicial'}
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};