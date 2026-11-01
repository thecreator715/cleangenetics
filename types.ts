
export enum StrainType {
  INDICA = 'Indica',
  SATIVA = 'Sativa',
  HYBRID = 'Hybrid',
}

export interface Product {
  id: string;
  name: string;
  type: StrainType;
  thc: string;
  cbd: string;
  price: number;
  image: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Expert';
  floweringTime: string;
  malePollen?: string;
  femalePlant?: string;
  harvestDate?: string;
}

export interface CartItem extends Product {
  quantity: number;
  isPromo?: boolean;
}

export interface Stash {
  id: string;
  name: string;
  items: CartItem[];
  updatedAt: number;
  // Make compatible with potential future numeric totals if needed, 
  // but for now cart items just hold the string values.
}

export type ViewState = 'HOME' | 'SHOP' | 'CLONES' | 'POLLEN' | 'MEDICINES' | 'CART' | 'ASSISTANT' | 'ABOUT' | 'ORDERS' | 'PRODUCT';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  command?: {
    type: 'SUGGEST_PRODUCTS' | 'OPEN_MODAL' | 'TOGGLE_POWER' | 'SET_FARM_TYPE';
    data?: any;
  };
}

// New Types for Grow System & History
export type PlantStage = 'Seedling' | 'Vegetative' | 'Flowering' | 'Flushing' | 'Harvest';
export type LightSchedule = '18/6' | '12/12' | '20/4' | '24/0' | 'Outdoor';

export interface EnvironmentStats {
  temp: number; // Fahrenheit
  humidity: number; // %
  co2: number; // ppm
  vpd: number; // kPa
}

export interface GrowPlant {
  id: string;
  catalogId: string;
  name: string; // Will now typically include #ID (e.g., "Neon Haze #01")
  uniqueId: string; // The sequential ID (e.g., "#01")
  stage: PlantStage;
  plantedDate: number;
  lastWatered: number;
  wateringIntervalHours: number;
  autoWater: boolean;
  health: number; // 0-100
  // Advanced Metrics
  lightSchedule: LightSchedule;
  lightStartHour: number; // 0-23 (Start time of lights ON)
  ppfd: number; // µmol/m²/s
  ec: number; // Electrical Conductivity
  ph: number;
  environment: EnvironmentStats;
  notes: string;
}

export interface Farm {
  id: string;
  name: string;
  type: 'Tent' | 'Room' | 'Greenhouse' | 'Outdoor';
  isOn: boolean;
  plants: GrowPlant[];
}

export interface PastOrder {
  id: string;
  date: number;
  total: number;
  items: { id: string; name: string; quantity: number; price: number; type: StrainType }[];
}
