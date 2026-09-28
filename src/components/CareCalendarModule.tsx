import React, { useState } from 'react';
import { Plant, CareTaskType } from '../types';
import { calculateNextCareDate } from '../utils/dateUtils';
import { Calendar, Droplets, Sprout, Scissors, CheckCircle2, Clock, Filter, AlertTriangle } from 'lucide-react';

interface CareCalendarModuleProps {
  plants: Plant[];
  onLogCareTask: (plantId: string, taskType: CareTaskType) => void;
}

export const CareCalendarModule: React.FC<CareCalendarModuleProps> = ({
  plants,
  onLogCareTask,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'WATER' | 'FERTILIZE' | 'PRUNE'>('ALL');

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="border-b border-[#5A5A40]/30 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3A2D] flex items-center gap-2">
            Gestão & Agenda de Cuidados
          </h2>
          <p className="text-[#5A5A40] text-sm mt-1">
            Próximas regas, adubações e podas calculadas automaticamente com base nas frequências cadastradas.
          </p>
        </div>

        {/* Task type filter */}
        <div className="flex items-center gap-1.5 bg-[#5A5A40]/15 p-1 rounded-2xl border border-[#5A5A40]/20 text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL' ? 'bg-[#2D3A2D] font-bold text-[#F5F5F0] shadow-2xs' : 'text-[#5A5A40]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterType('WATER')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              filterType === 'WATER' ? 'bg-[#A68069] font-bold text-[#F5F5F0] shadow-2xs' : 'text-[#A68069]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Regas
          </button>
          <button
            onClick={() => setFilterType('FERTILIZE')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              filterType === 'FERTILIZE' ? 'bg-[#5A5A40] font-bold text-[#F5F5F0] shadow-2xs' : 'text-[#5A5A40]'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Adubação
          </button>
          <button
            onClick={() => setFilterType('PRUNE')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
              filterType === 'PRUNE' ? 'bg-[#D4AF37] font-bold text-[#2D3A2D] shadow-2xs' : 'text-[#2D3A2D]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            Podas
          </button>
        </div>
      </div>

      {/* Plants Care Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plants.map((plant) => {
          const nextWater = calculateNextCareDate(plant.careSchedule.lastWatered, plant.careSchedule.waterFrequencyDays);
          const nextFertilize = calculateNextCareDate(plant.careSchedule.lastFertilized, plant.careSchedule.fertilizeFrequencyDays);
          const nextPrune = calculateNextCareDate(plant.careSchedule.lastPruned, plant.careSchedule.pruneFrequencyDays || 90);

          return (
            <div
              key={plant.id}
              className={`bg-white rounded-3xl p-5 border shadow-xs transition-all space-y-4 ${
                nextWater.isOverdue ? 'border-[#A68069] ring-2 ring-[#A68069]/30 bg-[#A68069]/5' : 'border-[#5A5A40]/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={plant.photo}
                  alt={plant.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#5A5A40]/20"
                />
                <div>
                  <h4 className="font-serif font-bold text-[#2D3A2D] text-lg">{plant.name}</h4>
                  <p className="text-xs text-[#5A5A40] italic font-serif">{plant.species}</p>
                  <span className="inline-block font-mono text-[10px] text-[#A68069] bg-[#F5F5F0] px-2.5 py-0.5 rounded-md border border-[#5A5A40]/20 font-bold mt-1">
                    {plant.rgDigital}
                  </span>
                </div>
              </div>

              {/* Status metrics with Next Dates */}
              <div className="space-y-3 text-xs bg-[#F5F5F0] p-4 rounded-2xl border border-[#5A5A40]/15">
                {(filterType === 'ALL' || filterType === 'WATER') && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[#5A5A40] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-[#A68069]" />
                        Rega (a cada {plant.careSchedule.waterFrequencyDays} dias)
                      </span>
                      <span className="text-[11px] opacity-75">Última: {plant.careSchedule.lastWatered}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#5A5A40]/10">
                      <span className="font-bold text-[#2D3A2D]">Próxima Rega:</span>
                      <strong className={`font-mono text-xs ${nextWater.isOverdue ? 'text-red-700 font-bold' : 'text-[#A68069]'}`}>
                        {nextWater.statusText}
                      </strong>
                    </div>
                  </div>
                )}

                {(filterType === 'ALL' || filterType === 'FERTILIZE') && (
                  <div className="space-y-1 border-t border-[#5A5A40]/15 pt-2">
                    <div className="flex items-center justify-between text-[#5A5A40] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Adubação (a cada {plant.careSchedule.fertilizeFrequencyDays} dias)
                      </span>
                      <span className="text-[11px] opacity-75">Última: {plant.careSchedule.lastFertilized}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#5A5A40]/10">
                      <span className="font-bold text-[#2D3A2D]">Próxima Adubação:</span>
                      <strong className="font-mono text-xs text-[#2D3A2D]">
                        {nextFertilize.statusText}
                      </strong>
                    </div>
                  </div>
                )}

                {(filterType === 'ALL' || filterType === 'PRUNE') && (
                  <div className="space-y-1 border-t border-[#5A5A40]/15 pt-2">
                    <div className="flex items-center justify-between text-[#5A5A40] font-medium">
                      <span className="flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Poda (a cada {plant.careSchedule.pruneFrequencyDays || 90} dias)
                      </span>
                      <span className="text-[11px] opacity-75">Última: {plant.careSchedule.lastPruned || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-xl border border-[#5A5A40]/10">
                      <span className="font-bold text-[#2D3A2D]">Próxima Poda:</span>
                      <strong className="font-mono text-xs text-[#5A5A40]">
                        {nextPrune.formattedNextDate !== 'Não registrada' ? nextPrune.statusText : 'Não agendada'}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => onLogCareTask(plant.id, 'WATER')}
                  className="py-2 px-2 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Registrar Rega"
                >
                  <Droplets className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Regar
                </button>

                <button
                  onClick={() => onLogCareTask(plant.id, 'FERTILIZE')}
                  className="py-2 px-2 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Registrar Adubação"
                >
                  <Sprout className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Adubar
                </button>

                <button
                  onClick={() => onLogCareTask(plant.id, 'PRUNE')}
                  className="py-2 px-2 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F5F0] font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Registrar Poda de Manutenção"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Podar
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

