import React from 'react';
import { DashboardStats } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils';
import { TrendingUp, DollarSign, Calendar, MapPin, Gauge, Trophy, ArrowRight } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

const MainStatCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
}> = ({ label, value, subValue, icon: Icon }) => {
  return (
    <div className="p-6 rounded-3xl shadow-lg bg-slate-900 text-white relative overflow-hidden group">
      {/* Abstract Background Shape */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-500"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Icon className="w-5 h-5 text-brand-300" />
            </div>
            <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-white">{value}</span>
            {subValue && <span className="text-lg text-slate-400 font-medium">{subValue}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const BestRecordCard: React.FC<{
  value: string;
  date: string;
}> = ({ value, date }) => (
  <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <Trophy className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Recorde Pessoal</p>
        <p className="text-amber-900/70 text-xs">Em {date}</p>
      </div>
    </div>
    <div className="text-right">
      <span className="text-xl font-bold text-amber-900">{value}</span>
      <span className="text-xs text-amber-700 ml-1">Km/L</span>
    </div>
  </div>
);

const MonthlyCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  bgIconClass: string;
}> = ({ label, value, icon: Icon, colorClass, bgIconClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 flex flex-col justify-between h-32 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgIconClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>
    <div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">{label}</span>
      <div className="text-xl font-bold text-slate-800">{value}</div>
    </div>
  </div>
);

const TotalRowCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  subText?: string;
}> = ({ label, value, icon: Icon, subText }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
    {subText && (
       <div className="text-right hidden sm:block">
         <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{subText}</span>
       </div>
    )}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const today = new Date();
  
  const formattedFullDate = today.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  const formattedFullDateCapitalized = formattedFullDate.charAt(0).toUpperCase() + formattedFullDate.slice(1);
  
  const currentMonth = today.toLocaleString('pt-BR', { month: 'long' });
  const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <header className="px-1 flex justify-between items-end">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider bg-brand-50/80 px-2 py-1 rounded-md">
            {formattedFullDateCapitalized}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Visão Geral</h1>
        </div>
      </header>

      <section className="space-y-4">
        {/* Main Hero Card */}
        <MainStatCard 
          label="Média Geral"
          value={formatNumber(stats.averageEfficiency)}
          subValue="Km/L"
          icon={Gauge}
        />

        {/* Record Strip */}
        {stats.bestEfficiency && (
          <BestRecordCard 
            value={formatNumber(stats.bestEfficiency.value)}
            date={formatDate(stats.bestEfficiency.date)}
          />
        )}
      </section>

      {/* Monthly Grid */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase">Resumo de {currentMonthCapitalized}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <MonthlyCard 
            label="Gasto Mensal"
            value={formatCurrency(stats.currentMonthCost)}
            icon={DollarSign}
            colorClass="text-emerald-600"
            bgIconClass="bg-emerald-50"
          />
          <MonthlyCard 
            label="Km Percorrido"
            value={`${formatNumber(stats.currentMonthDistance, 0)} km`}
            icon={TrendingUp}
            colorClass="text-brand-600"
            bgIconClass="bg-brand-50"
          />
        </div>
      </section>

      {/* Totals - Wide Layout */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-1 px-1 mt-6">
          <MapPin className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase">Acumulado Total</h3>
        </div>
        
        <TotalRowCard 
          label="Custo Total"
          value={formatCurrency(stats.totalCost)}
          icon={DollarSign}
        />
        
        <TotalRowCard 
          label="Distância Total"
          value={`${formatNumber(stats.totalDistance, 0)} km`}
          icon={MapPin}
        />
      </section>
    </div>
  );
};