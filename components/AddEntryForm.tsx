import React, { useState, useEffect } from 'react';
import { FuelEntry } from '../types';
import { Save, AlertCircle } from 'lucide-react';

interface AddEntryFormProps {
  onSave: (entry: Omit<FuelEntry, 'id'>) => void;
  lastOdometer: number;
}

export const AddEntryForm: React.FC<AddEntryFormProps> = ({ onSave, lastOdometer }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Auto-calculation Logic
  // We use flags to avoid circular dependency loops if we were using useEffects blindly.
  // Instead, we calculate on change.

  const handlePriceChange = (val: string) => {
    setPrice(val);
    const p = parseFloat(val);
    const l = parseFloat(liters);
    if (!isNaN(p) && !isNaN(l)) {
      setTotal((p * l).toFixed(2));
    }
  };

  const handleLitersChange = (val: string) => {
    setLiters(val);
    const l = parseFloat(val);
    const p = parseFloat(price);
    if (!isNaN(l) && !isNaN(p)) {
      setTotal((l * p).toFixed(2));
    }
  };

  const handleTotalChange = (val: string) => {
    setTotal(val);
    const t = parseFloat(val);
    const p = parseFloat(price);
    
    // If we have total and price, calculate liters
    if (!isNaN(t) && !isNaN(p) && p > 0) {
      setLiters((t / p).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const odoVal = parseFloat(odometer);
    const priceVal = parseFloat(price);
    const litersVal = parseFloat(liters);
    const totalVal = parseFloat(total);

    if (isNaN(odoVal) || isNaN(priceVal) || isNaN(litersVal) || isNaN(totalVal)) {
      setError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (lastOdometer > 0 && odoVal <= lastOdometer) {
      setError(`O hodômetro deve ser maior que o anterior (${lastOdometer} km).`);
      return;
    }

    onSave({
      date,
      odometer: odoVal,
      pricePerLiter: priceVal,
      liters: litersVal,
      totalCost: totalVal,
    });
  };

  return (
    <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
      <header className="px-1 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Novo Abastecimento</h1>
        <p className="text-slate-500 text-sm">Registre os detalhes do abastecimento</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
            required
          />
        </div>

        {/* Odometer */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Hodômetro Atual (Km)</label>
          <input
            type="number"
            inputMode="numeric"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder={`Ex: ${lastOdometer > 0 ? lastOdometer + 100 : 10000}`}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
            required
          />
          {lastOdometer > 0 && (
            <p className="text-xs text-slate-400">Último registro: {lastOdometer} km</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Preço (R$/L)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
              required
            />
          </div>

          {/* Liters */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Litros</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={liters}
              onChange={(e) => handleLitersChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
              required
            />
          </div>
        </div>

        {/* Total */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Valor Total (R$)</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-slate-400 font-medium">R$</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={total}
              onChange={(e) => handleTotalChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900 font-bold text-lg"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-brand-900 text-white font-semibold py-4 rounded-xl shadow-lg shadow-brand-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Save className="w-5 h-5" />
          Salvar Abastecimento
        </button>
      </form>
    </div>
  );
};
