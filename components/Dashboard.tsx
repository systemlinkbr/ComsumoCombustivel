import React, { useMemo } from 'react';
import { DashboardStats } from '../types';
import { formatCurrency, formatNumber, formatDate } from '../utils';
import { TrendingUp, DollarSign, Calendar, MapPin, Gauge, Trophy, LineChart, Coins } from 'lucide-react';

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

const EfficiencyChart: React.FC<{ data: { date: string; value: number }[] }> = ({ data }) => {
  // Config
  const height = 120;
  const width = 300; // viewBox width
  const padding = 15;

  const points = useMemo(() => {
    if (data.length < 2) return null;

    const maxVal = Math.max(...data.map(d => d.value)) * 1.1; // 10% headroom
    const minVal = Math.max(0, Math.min(...data.map(d => d.value)) * 0.9);
    const range = maxVal - minVal;

    return data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      // Invert Y because SVG 0 is top
      const y = height - padding - ((d.value - minVal) / (range || 1)) * (height - padding * 2);
      return { x, y, value: d.value, date: d.date };
    });
  }, [data]);

  if (!points) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-48 text-slate-400">
        <LineChart className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Dados insuficientes para gráfico</p>
      </div>
    );
  }

  // Create path string
  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  
  // Create area polygon (close the loop at bottom)
  const areaData = `${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase">Evolução (Km/L)</h3>
        </div>
        <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
          Último: {formatNumber(points[points.length - 1].value)}
        </div>
      </div>
      
      <div className="relative w-full aspect-[2.5/1]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeDasharray="4" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f1f5f9" />

          {/* Area Fill */}
          <path d={areaData} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path d={pathData} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r="3" 
              className="fill-white stroke-brand-500 stroke-2"
            />
          ))}
          
          {/* Axis Labels */}
          {/* Min/Max Y */}
          <text x={padding - 5} y={padding} textAnchor="end" dominantBaseline="middle" className="text-[8px] fill-slate-400 font-medium">
            {formatNumber(Math.max(...data.map(d => d.value)), 1)}
          </text>
           <text x={padding - 5} y={height - padding} textAnchor="end" dominantBaseline="middle" className="text-[8px] fill-slate-400 font-medium">
            {formatNumber(Math.min(...data.map(d => d.value)), 1)}
          </text>

          {/* Start/End X */}
          <text x={points[0].x} y={height + 12} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">
            {points[0].date}
          </text>
          <text x={points[points.length - 1].x} y={height + 12} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">
            {points[points.length - 1].date}
          </text>

        </svg>
      </div>
    </div>
  );
};

const CostEfficiencyCard: React.FC<{
  monthValue: number;
  totalValue: number;
}> = ({ monthValue, totalValue }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
        <Coins className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custo / Km (Mês)</p>
        <p className="text-xl font-bold text-slate-900">{formatCurrency(monthValue)}</p>
      </div>
    </div>
    <div className="text-right pl-4 border-l border-slate-100">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Média Geral</p>
        <p className="text-sm font-bold text-slate-600">{formatCurrency(totalValue)}</p>
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

        {/* Chart */}
        {stats.chartData.length >= 2 && (
          <EfficiencyChart data={stats.chartData} />
        )}

        {/* New Cost Efficiency Card */}
        <CostEfficiencyCard monthValue={stats.costPerKmMonth} totalValue={stats.costPerKmTotal} />
      </section>

      {/* Monthly Grid */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1 mt-2">
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