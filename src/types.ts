export type CareTaskType = 'WATER' | 'FERTILIZE' | 'PRUNE' | 'REPOT' | 'SUNLIGHT' | 'NOTE';

export interface CareSchedule {
  waterFrequencyDays: number;
  fertilizeFrequencyDays: number;
  pruneFrequencyDays: number;
  lastWatered: string; // YYYY-MM-DD
  lastFertilized: string;
  lastPruned?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: CareTaskType | 'BLOOM' | 'TRANSFER' | 'ADOPTION' | 'MILESTONE';
  title: string;
  description: string;
  authorName: string;
  authorRole?: string;
  photoUrl?: string;
}

export interface Tutor {
  id: string;
  name: string;
  role: 'Tutor Principal' | 'Guardião de Fim de Semana' | 'Consultor Agrônomo' | 'Co-tutor';
  avatar: string;
  joinedDate: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  rgDigital: string;
  photo: string;
  environmentId: string;
  environmentName: string;
  collectionName?: string;
  birthDate: string; // Date added / acquired
  status: 'HEALTHY' | 'NEEDS_CARE' | 'DORMANT' | 'RECOVERING';
  healthScore: number; // 0 - 100
  careSchedule: CareSchedule;
  tutors: Tutor[];
  timeline: TimelineEvent[];
  qrCodeDataUrl?: string;
  isOrphan: boolean;
  orphanReason?: string;
  notes?: string;
  acquisitionStory?: string;
  sunlightNeeds: 'Sombra' | 'Luz Indireta' | 'Sol Pleno' | 'Meia Sombra';
  waterNeeds: 'Alta (2-3x/sem)' | 'Média (1-2x/sem)' | 'Baixa (1x/15dias)';
}

export interface Environment {
  id: string;
  name: string;
  iconName: string;
  description: string;
  plantCount: number;
  coverImage: string;
}

export interface PlantCollection {
  id: string;
  name: string;
  color: string;
  description: string;
  plantCount: number;
}

export interface DecisionOptionEvaluated {
  optionName: string;
  pros: string[];
  cons: string[];
  score: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
}

export interface ComparisonRow {
  optionName: string;
  botanicalImpact: string;
  effort: string;
  costAndRisks: string;
  longTermEffect: string;
}

export interface ComparisonTable {
  headers: string[];
  rows: ComparisonRow[];
}

export interface DecisionRecommendation {
  bestOption: string;
  rationale: string;
  actionSteps: string[];
}

export interface DecisionAnalysisResult {
  summary: string;
  prosAndCons: DecisionOptionEvaluated[];
  comparisonTable: ComparisonTable;
  impactAnalysis: string;
  recommendation: DecisionRecommendation;
}

export interface DecisionRequest {
  title: string;
  context?: string;
  category?: string;
  options?: string[];
}

export interface SavedDecision {
  id: string;
  createdAt: string;
  plantId?: string;
  plantName?: string;
  request: DecisionRequest;
  result: DecisionAnalysisResult;
}

export interface MarketplaceItem {
  id: string;
  plantId: string;
  plantName: string;
  plantSpecies: string;
  rgDigital: string;
  title: string;
  price: number; // 0 if free/donation
  type: 'VENDA' | 'TROCA' | 'DOACAO';
  sellerName: string;
  sellerType: 'HOBBYIST' | 'PRO';
  sellerAvatar: string;
  location: string;
  photo: string;
  description: string;
  verifiedRg: boolean;
  timelineEventCount: number;
  plantAgeYears: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: 'Entusiasta' | 'Viveirista Profissional' | 'Botanista' | 'Guardião';
  timeAgo: string;
  title: string;
  content: string;
  plantName?: string;
  plantRg?: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  tags: string[];
}
