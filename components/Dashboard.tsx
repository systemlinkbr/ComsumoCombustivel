import React from 'react';
import { DashboardStats } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils';
import { TrendingUp, DollarSign, Calendar, MapPin, Gauge, Trophy } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

const StatCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  highlight?: boolean;
  secondaryHighlight?: boolean;
}> = ({ label, value, subValue, icon: Icon, highlight, secondaryHighlight }) => {
  
  let bgClass = 'bg-white border-slate-100 text-slate-800';
  let textLabelClass = 'text-slate-500';
  let iconClass = 'text-slate-400';
  let subValueClass = 'text-slate-400';

  if (highlight) {
    bgClass = 'bg-brand-900 text-white border-brand-900';
    textLabelClass = 'text-brand-100';
    iconClass = 'text-brand-400';
    subValueClass = 'text-brand-200';
  } else if (secondaryHighlight) {
    bgClass = 'bg-slate-800 text-white border-slate-800';
    textLabelClass = 'text-slate-300';
    iconClass = 'text-yellow-500';
    subValueClass = 'text-slate-400';
  }

  return (
    <div className={`p-5 rounded-2xl shadow-sm border ${bgClass}`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-sm font-medium ${textLabelClass}`}>{label}</span>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="text-3xl font-bold tracking-tight">
        {value}
        {subValue && <span className={`text-sm ml-1 ${subValueClass} font-normal`}>{subValue}</span>}
      </div>
    </div>
  );
};

const SecondaryCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
}> = ({ label, value, icon: Icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
    <div className="flex items-center gap-2 mb-2 text-slate-500">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-xl font-bold text-slate-900">{value}</div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  // Date Helpers
  const today = new Date();
  
  // Format: "Segunda-feira, 26 de outubro"
  const formattedFullDate = today.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Capitalize first letter of the date string
  const formattedFullDateCapitalized = formattedFullDate.charAt(0).toUpperCase() + formattedFullDate.slice(1);

  const currentMonth = today.toLocaleString('pt-BR', { month: 'long' });
  // Capitalize first letter of month
  const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="px-1 space-y-1">
        <span className="text-xs font-medium text-brand-600 uppercase tracking-wide bg-brand-50 px-2 py-1 rounded-md">
          {formattedFullDateCapitalized}
        </span>
        <div className="pt-2">
          <h1 className="text-2xl font-bold text-slate-900">Resumo</h1>
          <p className="text-slate-500 text-sm">Desempenho e gastos do seu veículo</p>
        </div>
      </header>

      <section className="space-y-3">
        {/* Main Average Card */}
        <StatCard 
          label="Média Geral"
          value={formatNumber(stats.averageEfficiency)}
          subValue="Km/L"
          icon={Gauge}
          highlight
        />

        {/* Best Efficiency Card (New) */}
        {stats.bestEfficiency && (
          <StatCard 
            label="Melhor Média"
            value={formatNumber(stats.bestEfficiency.value)}
            subValue={`em ${formatDate(stats.bestEfficiency.date)}`}
            icon={Trophy}
            secondaryHighlight
          />
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <SecondaryCard 
          label={`Gasto (${currentMonthCapitalized})`}
          value={formatCurrency(stats.currentMonthCost)}
          icon={Calendar}
        />
        <SecondaryCard 
          label={`Km (${currentMonthCapitalized})`}
          value={`${formatNumber(stats.currentMonthDistance, 0)} km`}
          icon={TrendingUp}
        />
        <SecondaryCard 
          label="Gasto Total"
          value={formatCurrency(stats.totalCost)}
          icon={DollarSign}
        />
        <SecondaryCard 
          label="Km Total"
          value={`${formatNumber(stats.totalDistance, 0)} km`}
          icon={MapPin}
        />
      </section>
    </div>
  );
};