export interface FuelEntry {
  id: string;
  date: string; // ISO string
  odometer: number;
  pricePerLiter: number;
  liters: number;
  totalCost: number;
}

export interface ComputedEntry extends FuelEntry {
  distance: number;
  efficiency: number | null; // null for the first entry
}

export interface DashboardStats {
  averageEfficiency: number;
  bestEfficiency: { value: number; date: string } | null;
  totalCost: number;
  currentMonthCost: number;
  currentMonthDistance: number;
  totalDistance: number;
}

export type ViewState = 'dashboard' | 'add' | 'history';