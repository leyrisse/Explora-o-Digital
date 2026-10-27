import {
  PlantStructuredCare,
  WateringFrequencyPreset,
  SunlightPreset,
  FertilizingFrequencyPreset,
  SpeciesCareGuide,
  CareSchedule,
  Plant,
} from '../types';

export const WATERING_FREQUENCY_OPTIONS: { id: WateringFrequencyPreset; label: string; defaultDays: number }[] = [
  { id: 'diariamente', label: 'Diariamente (a cada 1 dia)', defaultDays: 1 },
  { id: 'a_cada_2_dias', label: 'A cada 2 dias', defaultDays: 2 },
  { id: 'a_cada_3_dias', label: 'A cada 3 dias', defaultDays: 3 },
  { id: 'semanalmente', label: 'Semanalmente (a cada 7 dias)', defaultDays: 7 },
  { id: 'a_cada_15_dias', label: 'A cada 15 dias (quinzenal)', defaultDays: 15 },
  { id: 'personalizada', label: 'Frequência personalizada...', defaultDays: 7 },
];

export const SUNLIGHT_OPTIONS: { id: SunlightPreset; label: string; legacyValue: 'Sombra' | 'Luz Indireta' | 'Sol Pleno' | 'Meia Sombra' }[] = [
  { id: 'sol_direto', label: 'Sol direto (sol pleno)', legacyValue: 'Sol Pleno' },
  { id: 'luz_indireta_intensa', label: 'Luz indireta intensa', legacyValue: 'Luz Indireta' },
  { id: 'meia_sombra', label: 'Meia-sombra', legacyValue: 'Meia Sombra' },
  { id: 'sombra', label: 'Sombra', legacyValue: 'Sombra' },
  { id: 'personalizada', label: 'Outra / Personalizada', legacyValue: 'Luz Indireta' },
];

export const FERTILIZING_FREQUENCY_OPTIONS: { id: FertilizingFrequencyPreset; label: string; defaultDays: number }[] = [
  { id: 'quinzenal', label: 'A cada 15 dias (quinzenal)', defaultDays: 15 },
  { id: 'mensal', label: 'Mensalmente (a cada 30 dias)', defaultDays: 30 },
  { id: 'a_cada_2_meses', label: 'A cada 2 meses (bimestral)', defaultDays: 60 },
  { id: 'a_cada_3_meses', label: 'A cada 3 meses (trimestral)', defaultDays: 90 },
  { id: 'a_cada_6_meses', label: 'A cada 6 meses (semestral)', defaultDays: 180 },
  { id: 'anual', label: 'Anualmente (a cada 365 dias)', defaultDays: 365 },
  { id: 'nao_necessaria', label: 'Não necessária no momento', defaultDays: 365 },
  { id: 'personalizada', label: 'Frequência personalizada...', defaultDays: 30 },
];

export const DEFAULT_STRUCTURED_CARE: PlantStructuredCare = {
  wateringFrequency: 'semanalmente',
  soilMoistureCheck: 'Verifique com o dedo a 2-3 cm no solo. Se sair seco, regue até a água escorrer pelos orifícios.',
  sunlightType: 'luz_indireta_intensa',
  fertilizerType: 'Adubo equilibrado NPK 10-10-10 ou orgânico (húmus de minhoca)',
  fertilizerFrequency: 'mensal',
  substrate: 'Substrato leve e aerado com boa drenagem',
  temperature: '18°C a 28°C',
  humidity: '50% a 70%',
  maintenanceNotes: 'Retire folhas secas na base e verifique a necessidade de troca de vaso a cada 1-2 anos.',
};

/**
 * Calculates water days from frequency preset
 */
export function getWateringDays(preset: WateringFrequencyPreset, customDays?: number): number {
  if (preset === 'personalizada') {
    return Math.max(1, customDays || 7);
  }
  const found = WATERING_FREQUENCY_OPTIONS.find((opt) => opt.id === preset);
  return found?.defaultDays || 7;
}

/**
 * Calculates fertilizer days from frequency preset
 */
export function getFertilizerDays(preset: FertilizingFrequencyPreset, customDays?: number): number {
  if (preset === 'personalizada') {
    return Math.max(1, customDays || 30);
  }
  const found = FERTILIZING_FREQUENCY_OPTIONS.find((opt) => opt.id === preset);
  return found?.defaultDays || 30;
}

/**
 * Maps SunlightPreset to legacy UI enum
 */
export function mapSunlightToLegacy(
  preset: SunlightPreset
): 'Sombra' | 'Luz Indireta' | 'Sol Pleno' | 'Meia Sombra' {
  const found = SUNLIGHT_OPTIONS.find((opt) => opt.id === preset);
  return found?.legacyValue || 'Luz Indireta';
}

/**
 * Maps days to legacy waterNeeds string
 */
export function mapWaterNeedsLabel(days: number): 'Alta (2-3x/sem)' | 'Média (1-2x/sem)' | 'Baixa (1x/15dias)' {
  if (days <= 3) return 'Alta (2-3x/sem)';
  if (days <= 7) return 'Média (1-2x/sem)';
  return 'Baixa (1x/15dias)';
}

/**
 * Derives structured care fields automatically from AI-generated SpeciesCareGuide
 * without inventing values when data is absent (using 'Não informado' or empty).
 */
export function deriveStructuredCareFromGuide(guide?: SpeciesCareGuide | null): PlantStructuredCare {
  if (!guide) {
    return { ...DEFAULT_STRUCTURED_CARE };
  }

  // 1. Watering Frequency
  let wateringFrequency: WateringFrequencyPreset = 'semanalmente';
  const wf = (guide.watering?.frequency || '').toLowerCase();
  const wn = (guide.watering?.need || '').toLowerCase();

  if (wf.includes('diari') || wn.includes('diari')) {
    wateringFrequency = 'diariamente';
  } else if (wf.includes('2 dias') || wf.includes('a cada 2') || wf.includes('dias alternados')) {
    wateringFrequency = 'a_cada_2_dias';
  } else if (wf.includes('3 dias') || wf.includes('2 a 3') || wf.includes('2 ou 3')) {
    wateringFrequency = 'a_cada_3_dias';
  } else if (wf.includes('15') || wf.includes('quinzen') || wf.includes('2 semanas') || wf.includes('duas semanas')) {
    wateringFrequency = 'a_cada_15_dias';
  } else if (wf.includes('semana') || wf.includes('1 vez por semana') || wf.includes('1x')) {
    wateringFrequency = 'semanalmente';
  }

  // 2. Soil Moisture Check
  const soilMoistureCheck = guide.watering?.checkMethod?.trim() || 'Não informado';

  // 3. Lighting
  let sunlightType: SunlightPreset = 'luz_indireta_intensa';
  const lt = (guide.lighting?.type || '').toLowerCase();
  if (lt.includes('pleno') || lt.includes('direto')) {
    sunlightType = 'sol_direto';
  } else if (lt.includes('meia-sombra') || lt.includes('meia sombra')) {
    sunlightType = 'meia_sombra';
  } else if (lt.includes('sombra') && !lt.includes('meia')) {
    sunlightType = 'sombra';
  } else if (lt.includes('indireta')) {
    sunlightType = 'luz_indireta_intensa';
  }

  // 4. Fertilization
  const fertilizerType = guide.fertilization?.type?.trim() || 'Não informado';
  let fertilizerFrequency: FertilizingFrequencyPreset = 'mensal';
  const ff = (guide.fertilization?.frequency || '').toLowerCase();

  if (
    ff.includes('não necessária') ||
    ff.includes('desnecess') ||
    ff.includes('dispens') ||
    ff.includes('evitar adub')
  ) {
    fertilizerFrequency = 'nao_necessaria';
  } else if (ff.includes('15 dias') || ff.includes('quinzen')) {
    fertilizerFrequency = 'quinzenal';
  } else if (ff.includes('2 meses') || ff.includes('bimestral')) {
    fertilizerFrequency = 'a_cada_2_meses';
  } else if (ff.includes('3 meses') || ff.includes('trimestral')) {
    fertilizerFrequency = 'a_cada_3_meses';
  } else if (ff.includes('6 meses') || ff.includes('semestral')) {
    fertilizerFrequency = 'a_cada_6_meses';
  } else if (ff.includes('ano') || ff.includes('anual')) {
    fertilizerFrequency = 'anual';
  } else if (ff.includes('mês') || ff.includes('mensal') || ff.includes('30 dias')) {
    fertilizerFrequency = 'mensal';
  }

  // 5. Substrate
  const substrate =
    guide.substrate?.idealMix?.trim() ||
    guide.substrate?.drainage?.trim() ||
    'Não informado';

  // 6. Environment
  const temperature = guide.environment?.temperature?.trim() || 'Não informado';
  const humidity = guide.environment?.humidity?.trim() || 'Não informado';

  // 7. Maintenance
  const pruningNotes = guide.maintenance?.pruning?.trim();
  const repottingNotes = guide.maintenance?.repotting?.trim();
  const generalTips = guide.maintenance?.generalTips?.trim();

  const maintenanceParts: string[] = [];
  if (pruningNotes) maintenanceParts.push(`Poda: ${pruningNotes}`);
  if (repottingNotes) maintenanceParts.push(`Replantio: ${repottingNotes}`);
  if (generalTips && generalTips !== pruningNotes && generalTips !== repottingNotes) {
    maintenanceParts.push(`Manejo: ${generalTips}`);
  }

  const maintenanceNotes = maintenanceParts.length > 0 ? maintenanceParts.join(' | ') : 'Não informado';

  return {
    wateringFrequency,
    soilMoistureCheck,
    sunlightType,
    fertilizerType,
    fertilizerFrequency,
    substrate,
    temperature,
    humidity,
    maintenanceNotes,
  };
}

/**
 * Ensures a plant has a valid PlantStructuredCare object even if created previously.
 */
export function getOrInitializeStructuredCare(plant: Plant): PlantStructuredCare {
  if (plant.structuredCare) {
    return { ...plant.structuredCare };
  }
  if (plant.careGuide) {
    return deriveStructuredCareFromGuide(plant.careGuide);
  }

  // Derive from existing simple schedule
  let wateringFreq: WateringFrequencyPreset = 'semanalmente';
  const wDays = plant.careSchedule?.waterFrequencyDays || 7;
  if (wDays <= 1) wateringFreq = 'diariamente';
  else if (wDays === 2) wateringFreq = 'a_cada_2_dias';
  else if (wDays <= 4) wateringFreq = 'a_cada_3_dias';
  else if (wDays <= 8) wateringFreq = 'semanalmente';
  else if (wDays <= 18) wateringFreq = 'a_cada_15_dias';
  else wateringFreq = 'personalizada';

  let sunPreset: SunlightPreset = 'luz_indireta_intensa';
  if (plant.sunlightNeeds === 'Sol Pleno') sunPreset = 'sol_direto';
  else if (plant.sunlightNeeds === 'Meia Sombra') sunPreset = 'meia_sombra';
  else if (plant.sunlightNeeds === 'Sombra') sunPreset = 'sombra';

  return {
    ...DEFAULT_STRUCTURED_CARE,
    wateringFrequency: wateringFreq,
    customWateringDays: wateringFreq === 'personalizada' ? wDays : undefined,
    sunlightType: sunPreset,
  };
}
