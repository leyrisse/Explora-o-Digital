import React from 'react';
import {
  PlantStructuredCare,
  WateringFrequencyPreset,
  SunlightPreset,
  FertilizingFrequencyPreset,
} from '../types';
import {
  WATERING_FREQUENCY_OPTIONS,
  SUNLIGHT_OPTIONS,
  FERTILIZING_FREQUENCY_OPTIONS,
} from '../utils/careUtils';
import {
  Droplets,
  Sun,
  Sprout,
  Layers,
  Thermometer,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

interface PlantCareFormFieldsProps {
  care: PlantStructuredCare;
  onChange: (updatedCare: PlantStructuredCare) => void;
  disabled?: boolean;
}

export const PlantCareFormFields: React.FC<PlantCareFormFieldsProps> = ({
  care,
  onChange,
  disabled = false,
}) => {
  const updateField = <K extends keyof PlantStructuredCare>(
    key: K,
    value: PlantStructuredCare[K]
  ) => {
    onChange({
      ...care,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-[#5A5A40]/15">
        <span className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Cuidados Estruturados da Planta
        </span>
        <span className="text-[10px] text-[#5A5A40]">Campos preenchidos e editáveis</span>
      </div>

      {/* 1. Rega */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-sky-800">
          <div className="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
            <Droplets className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Rega e Irrigação</h5>
            <p className="text-[10px] text-[#5A5A40]">Frequência e verificação de umidade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Frequência de Rega <span className="text-red-500">*</span>
            </label>
            <select
              value={care.wateringFrequency}
              disabled={disabled}
              onChange={(e) =>
                updateField('wateringFrequency', e.target.value as WateringFrequencyPreset)
              }
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            >
              {WATERING_FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {care.wateringFrequency === 'personalizada' && (
            <div>
              <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
                Intervalo em dias (personalizado)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                disabled={disabled}
                value={care.customWateringDays || 7}
                onChange={(e) =>
                  updateField('customWateringDays', parseInt(e.target.value, 10) || 1)
                }
                className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] font-bold focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                placeholder="Ex: 5"
              />
            </div>
          )}

          <div className={care.wateringFrequency === 'personalizada' ? 'sm:col-span-2' : ''}>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Como verificar a umidade do solo
            </label>
            <input
              type="text"
              disabled={disabled}
              value={care.soilMoistureCheck}
              onChange={(e) => updateField('soilMoistureCheck', e.target.value)}
              placeholder="Ex: Inserir o dedo a 2 cm; regar apenas se sair seco."
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>
        </div>
      </div>

      {/* 2. Iluminação */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-amber-800">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Iluminação e Exposição Solar</h5>
            <p className="text-[10px] text-[#5A5A40]">Nível de luz ideal para o desenvolvimento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Luz Recomendada <span className="text-red-500">*</span>
            </label>
            <select
              value={care.sunlightType}
              disabled={disabled}
              onChange={(e) => updateField('sunlightType', e.target.value as SunlightPreset)}
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            >
              {SUNLIGHT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {care.sunlightType === 'personalizada' && (
            <div>
              <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
                Especificação da luz (personalizada)
              </label>
              <input
                type="text"
                disabled={disabled}
                value={care.customSunlight || ''}
                onChange={(e) => updateField('customSunlight', e.target.value)}
                placeholder="Ex: Sol direto suave pela manhã (2h) e sombra à tarde"
                className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Adubação */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Adubação e Nutrição</h5>
            <p className="text-[10px] text-[#5A5A40]">Tipo de fertilizante e frequência recomendada</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Tipo de Adubo Recomendado
            </label>
            <input
              type="text"
              disabled={disabled}
              value={care.fertilizerType}
              onChange={(e) => updateField('fertilizerType', e.target.value)}
              placeholder="Ex: NPK 10-10-10 líquido ou Bokashi orgânico"
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Frequência de Adubação <span className="text-red-500">*</span>
            </label>
            <select
              value={care.fertilizerFrequency}
              disabled={disabled}
              onChange={(e) =>
                updateField('fertilizerFrequency', e.target.value as FertilizingFrequencyPreset)
              }
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] font-medium focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            >
              {FERTILIZING_FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {care.fertilizerFrequency === 'personalizada' && (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
                Intervalo de adubação em dias (personalizado)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                disabled={disabled}
                value={care.customFertilizerDays || 30}
                onChange={(e) =>
                  updateField('customFertilizerDays', parseInt(e.target.value, 10) || 1)
                }
                className="w-full sm:w-1/2 bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] font-bold focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                placeholder="Ex: 45"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Substrato */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-stone-800">
          <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5 text-stone-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Substrato e Drenagem</h5>
            <p className="text-[10px] text-[#5A5A40]">Composição e aeração do solo</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
            Recomendação de Substrato Adequado à Espécie
          </label>
          <input
            type="text"
            disabled={disabled}
            value={care.substrate}
            onChange={(e) => updateField('substrate', e.target.value)}
            placeholder="Ex: 50% terra vegetal, 30% perlita e 20% casca de pinus com alta drenagem"
            className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
          />
        </div>
      </div>

      {/* 5. Temperatura e Umidade */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-teal-800">
          <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
            <Thermometer className="w-3.5 h-3.5 text-teal-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Temperatura e Umidade</h5>
            <p className="text-[10px] text-[#5A5A40]">Condições climáticas recomendadas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Faixa de Temperatura
            </label>
            <input
              type="text"
              disabled={disabled}
              value={care.temperature}
              onChange={(e) => updateField('temperature', e.target.value)}
              placeholder="Ex: 18°C a 28°C (ou 'Não informado')"
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
              Umidade do Ar
            </label>
            <input
              type="text"
              disabled={disabled}
              value={care.humidity}
              onChange={(e) => updateField('humidity', e.target.value)}
              placeholder="Ex: 50% a 70% de umidade relativa (ou 'Não informado')"
              className="w-full bg-white border border-[#5A5A40]/30 rounded-xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>
        </div>
      </div>

      {/* 6. Manutenção */}
      <div className="bg-[#FAF8F5] border border-[#5A5A40]/25 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center gap-2 text-rose-800">
          <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
            <Scissors className="w-3.5 h-3.5 text-rose-700" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-[#2D3A2D]">Manutenção, Poda e Replantio</h5>
            <p className="text-[10px] text-[#5A5A40]">Orientações curtas para podar e cuidar</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[#2D3A2D] mb-1">
            Orientações de Poda e Replantio
          </label>
          <textarea
            rows={2}
            disabled={disabled}
            value={care.maintenanceNotes}
            onChange={(e) => updateField('maintenanceNotes', e.target.value)}
            placeholder="Ex: Poda de folhas secas rente à haste; replantio para vaso maior a cada 1-2 anos."
            className="w-full bg-white border border-[#5A5A40]/30 rounded-xl p-3 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
          />
        </div>
      </div>
    </div>
  );
};
