import { FuelEntry, ComputedEntry, DashboardStats } from './types';

export const generateId = (): string => {
  // Fallback for environments where crypto.randomUUID is not available (e.g. non-secure contexts)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatNumber = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

export const computeEntries = (entries: FuelEntry[]): ComputedEntry[] => {
  // Sort by odometer just in case, though usually date correlates
  const sorted = [...entries].sort((a, b) => b.odometer - a.odometer); // Newest first

  return sorted.map((entry, index) => {
    // Determine the "previous" entry (which is actually the next one in the reversed list, or previous in chronological)
    // Since we sorted newest first, the "previous" chronological entry is at index + 1
    const previousEntry = sorted[index + 1];

    if (!previousEntry) {
      return {
        ...entry,
        distance: 0,
        efficiency: null,
      };
    }

    const distance = entry.odometer - previousEntry.odometer;
    // Efficiency calculation: distance traveled since last fill / liters put in NOW.
    const efficiency = distance > 0 ? distance / entry.liters : 0;

    return {
      ...entry,
      distance,
      efficiency,
    };
  });
};

export const calculateStats = (entries: FuelEntry[]): DashboardStats => {
  if (entries.length === 0) {
    return {
      averageEfficiency: 0,
      bestEfficiency: null,
      totalCost: 0,
      currentMonthCost: 0,
      currentMonthDistance: 0,
      totalDistance: 0,
      chartData: [],
      costPerKmTotal: 0,
      costPerKmMonth: 0,
    };
  }

  const computed = computeEntries(entries);
  
  // Total Cost
  const totalCost = entries.reduce((acc, curr) => acc + curr.totalCost, 0);

  // Total Distance (Max Odometer - Min Odometer)
  const sortedByOdometer = [...entries].sort((a, b) => a.odometer - b.odometer);
  const totalDistance = sortedByOdometer.length > 1 
    ? sortedByOdometer[sortedByOdometer.length - 1].odometer - sortedByOdometer[0].odometer
    : 0;

  // Average Efficiency (Weighted Average)
  const validIntervals = computed.filter(c => c.efficiency !== null && c.efficiency > 0);
  const totalIntervalDistance = validIntervals.reduce((acc, curr) => acc + curr.distance, 0);
  const totalIntervalLiters = validIntervals.reduce((acc, curr) => acc + curr.liters, 0);
  
  const averageEfficiency = totalIntervalLiters > 0 
    ? totalIntervalDistance / totalIntervalLiters 
    : 0;

  // Best Efficiency Logic
  let bestEfficiency = null;
  if (validIntervals.length > 0) {
    // Sort by efficiency descending to find the max
    const sortedByEfficiency = [...validIntervals].sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
    const bestEntry = sortedByEfficiency[0];
    if (bestEntry && bestEntry.efficiency) {
      bestEfficiency = {
        value: bestEntry.efficiency,
        date: bestEntry.date
      };
    }
  }

  // Chart Data: Sort chronologically (Oldest -> Newest)
  const chartData = [...validIntervals]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => ({
      date: formatDate(e.date).slice(0, 5), // DD/MM
      value: e.efficiency || 0
    }));

  // Month Stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthEntries = computed.filter(e => {
    // Note: 'date' in FuelEntry is YYYY-MM-DD string
    const parts = e.date.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 0-indexed
    return month === currentMonth && year === currentYear;
  });

  const currentMonthCost = thisMonthEntries.reduce((acc, curr) => acc + curr.totalCost, 0);
  const currentMonthDistance = thisMonthEntries.reduce((acc, curr) => acc + curr.distance, 0);

  // Cost per Km Stats
  const costPerKmTotal = totalDistance > 0 ? totalCost / totalDistance : 0;
  const costPerKmMonth = currentMonthDistance > 0 ? currentMonthCost / currentMonthDistance : 0;

  return {
    averageEfficiency,
    bestEfficiency,
    totalCost,
    currentMonthCost,
    currentMonthDistance,
    totalDistance,
    chartData,
    costPerKmTotal,
    costPerKmMonth,
  };
};