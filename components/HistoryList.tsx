import React from 'react';
import { FuelEntry } from '../types';
import { computeEntries, formatCurrency, formatDate, formatNumber } from '../utils';
import { Droplet, MapPin, Calendar, TrendingUp, Edit2 } from 'lucide-react';

interface HistoryListProps {
  entries: FuelEntry[];
  onEdit: (entry: FuelEntry) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ entries, onEdit }) => {
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
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="px-1">
        <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
        <p className="text-slate-500 text-sm">Linha do tempo dos seus abastecimentos</p>
      </header>

      <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
        {computed.map((entry, index) => (
          <div key={entry.id} className="relative pl-6">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${index === 0 ? 'bg-brand-500' : 'bg-slate-300'}`} />
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative group">
              {/* Edit Button */}
              <button 
                onClick={() => onEdit(entry)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                aria-label="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start mb-3 pr-8">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(entry.date)}</span>
                </div>
                <div className="font-bold text-brand-900">
                  {formatCurrency(entry.totalCost)}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs uppercase tracking-wide mb-1">
                    <MapPin className="w-3 h-3" />
                    Distância
                  </div>
                  <div className="font-semibold text-slate-700">
                    {entry.distance > 0 ? `+${formatNumber(entry.distance, 1)} km` : '-'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-slate-400 text-xs uppercase tracking-wide mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Eficiência
                  </div>
                  <div className={`font-bold text-lg ${entry.efficiency ? 'text-slate-900' : 'text-slate-300'}`}>
                    {entry.efficiency ? `${formatNumber(entry.efficiency)} Km/L` : '---'}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-50 flex gap-4 text-xs text-slate-400">
                 <span>{entry.liters} L</span>
                 <span>{formatCurrency(entry.pricePerLiter)}/L</span>
                 <span>Odo: {entry.odometer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};