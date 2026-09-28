import React, { useState } from 'react';
import { Plant, Environment, PlantCollection } from '../types';
import { Search, Filter, LayoutGrid, List, Sparkles, Plus, QrCode, ShieldCheck, Home as HomeIcon, Sofa, Sun, Laptop, MapPin, Tag, ChevronDown } from 'lucide-react';

interface GardenModuleProps {
  plants: Plant[];
  environments: Environment[];
  collections: PlantCollection[];
  onSelectPlant: (plant: Plant) => void;
  onOpenNewPlantModal: () => void;
}

export const GardenModule: React.FC<GardenModuleProps> = ({
  plants,
  environments,
  collections,
  onSelectPlant,
  onOpenNewPlantModal,
}) => {
  const [selectedEnvId, setSelectedEnvId] = useState<string | 'ALL'>('ALL');
  const [selectedColName, setSelectedColName] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST' | 'VIRTUAL'>('GRID');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filtered plants
  const filteredPlants = plants.filter((plant) => {
    const matchesEnv = selectedEnvId === 'ALL' || plant.environmentId === selectedEnvId;
    const matchesCol = selectedColName === 'ALL' || plant.collectionName === selectedColName;
    const matchesQuery =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.rgDigital.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesEnv && matchesCol && matchesQuery;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Single Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#5A5A40]/30 pb-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2D3A2D] flex items-center gap-2">
            Organização do Jardim
            <span className="text-xs font-mono font-bold bg-[#5A5A40]/20 text-[#2D3A2D] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/30">
              {filteredPlants.length} plantas
            </span>
          </h2>
          <p className="text-[#5A5A40] text-xs mt-0.5">
            Gerencie suas espécies por Ambientes, Coleções ou no Jardim Virtual Imersivo.
          </p>
        </div>

        {/* View Mode Controls & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#5A5A40]/15 p-1 rounded-2xl flex items-center gap-1 text-xs font-medium border border-[#5A5A40]/20 shadow-xs">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'GRID' ? 'bg-[#2D3A2D] text-[#F5F5F0] shadow-xs font-bold' : 'text-[#5A5A40] hover:text-[#2D3A2D]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cards
            </button>

            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'LIST' ? 'bg-[#2D3A2D] text-[#F5F5F0] shadow-xs font-bold' : 'text-[#5A5A40] hover:text-[#2D3A2D]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>

            <button
              onClick={() => setViewMode('VIRTUAL')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'VIRTUAL' ? 'bg-[#D4AF37] text-[#2D3A2D] shadow-xs font-bold' : 'text-[#2D3A2D] hover:bg-[#5A5A40]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2D3A2D]" />
              Jardim Virtual
            </button>
          </div>

          <button
            onClick={onOpenNewPlantModal}
            className="flex items-center gap-1.5 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold px-3.5 py-2 rounded-2xl text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            Cadastrar Planta
          </button>
        </div>
      </div>

      {/* FILTER TOGGLE BUTTON RIGHT BELOW SEPARATOR LINE */}
      <div className="flex items-center justify-between -mt-4 pt-1">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            isFilterOpen || selectedEnvId !== 'ALL' || selectedColName !== 'ALL' || searchQuery
              ? 'bg-[#2D3A2D] text-[#F5F5F0] border-[#5A5A40]'
              : 'bg-white text-[#5A5A40] hover:text-[#2D3A2D] border-[#5A5A40]/25 shadow-2xs'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Filtros</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          {(selectedEnvId !== 'ALL' || selectedColName !== 'ALL' || searchQuery) && (
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" title="Filtro Ativo" />
          )}
        </button>

        {/* Quick Search Bar when filters are collapsed */}
        {!isFilterOpen && (
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#5A5A40]" />
            <input
              type="text"
              placeholder="Busca rápida por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-8 pr-3 py-1 rounded-xl border border-[#5A5A40]/20 text-xs text-[#2D3A2D] focus:outline-none focus:ring-1 focus:ring-[#A68069]"
            />
          </div>
        )}
      </div>

      {/* EXPANDABLE FILTERS SECTION */}
      {isFilterOpen && (
        <div className="pt-2 border-t border-[#5A5A40]/15 animate-fadeIn space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Filters Pills */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Environment Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-[#5A5A40] mr-1">Ambiente:</span>
                <button
                  onClick={() => setSelectedEnvId('ALL')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedEnvId === 'ALL'
                      ? 'bg-[#2D3A2D] text-[#F5F5F0] shadow-2xs font-bold'
                      : 'bg-white text-[#5A5A40] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/15'
                  }`}
                >
                  Todos ({plants.length})
                </button>

                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => setSelectedEnvId(env.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedEnvId === env.id
                        ? 'bg-[#2D3A2D] text-[#F5F5F0] shadow-2xs font-bold'
                        : 'bg-white text-[#2D3A2D] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/15'
                    }`}
                  >
                    {env.name} ({env.plantCount})
                  </button>
                ))}
              </div>

              <span className="hidden lg:inline text-[#5A5A40]/40">•</span>

              {/* Collection Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[11px] font-bold text-[#5A5A40] mr-1">Coleção:</span>
                <button
                  onClick={() => setSelectedColName('ALL')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedColName === 'ALL'
                      ? 'bg-[#5A5A40] text-[#F5F5F0] shadow-2xs font-bold'
                      : 'bg-white text-[#5A5A40] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/15'
                  }`}
                >
                  Todas
                </button>

                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColName(col.name)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedColName === col.name
                        ? 'bg-[#5A5A40] text-[#F5F5F0] shadow-2xs font-bold'
                        : 'bg-white text-[#2D3A2D] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/15'
                    }`}
                  >
                    {col.name} ({col.plantCount})
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Search Bar */}
            <div className="relative min-w-[200px] md:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#5A5A40]" />
              <input
                type="text"
                placeholder="Buscar por nome ou RG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-[#5A5A40]/25 text-xs text-[#2D3A2D] focus:outline-none focus:ring-1 focus:ring-[#A68069]"
              />
            </div>

          </div>
        </div>
      )}

      {/* EMPTY FILTER RESULTS BANNER */}
      {filteredPlants.length === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-[#5A5A40]/20 shadow-xs space-y-4">
          <div className="w-12 h-12 bg-[#F5F5F0] rounded-2xl flex items-center justify-center mx-auto text-[#A68069]">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-[#2D3A2D]">Nenhuma planta encontrada com esses filtros</h4>
            <p className="text-xs text-[#5A5A40] mt-1">
              Tente alterar os termos de busca, selecionar outro ambiente ou limpar a seleção atual.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedEnvId('ALL');
              setSelectedColName('ALL');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-2xl transition-colors shadow-xs"
          >
            Limpar Todos os Filtros
          </button>
        </div>
      )}

      {/* VIEW MODE 1: REALISTIC VIRTUAL GARDEN WITH SUNBEAMS & LIGHT EFFECTS */}
      {viewMode === 'VIRTUAL' && (
        <div className="bg-gradient-to-b from-[#1b261b] via-[#2D3A2D] to-[#182318] rounded-3xl p-5 sm:p-8 border border-[#5A5A40] shadow-2xl relative overflow-hidden space-y-6">
          
          {/* Sweeping Sunbeams / Rays of Sunlight Atmosphere Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Window Slats Light Shafts (Raios solares passando por fresta) */}
            <div className="absolute -top-32 -left-32 w-[160%] h-[180%] sunbeam-slats pointer-events-none opacity-50 animate-sunbeam-slow" />
            
            {/* Primary Solar Ray Sweep */}
            <div className="absolute -top-32 -left-20 w-[140%] h-[180%] bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent blur-2xl transform -rotate-35 animate-sunbeam pointer-events-none" />
            
            {/* Secondary Ambient Sunbeam Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-yellow-400/10 to-transparent rounded-full blur-3xl animate-sunbeam-slow pointer-events-none" />
            
            {/* Floating golden pollen dust particles */}
            <div className="absolute top-1/4 left-1/5 w-2 h-2 rounded-full bg-[#D4AF37]/60 blur-xs animate-particle" />
            <div className="absolute top-2/3 right-1/4 w-3 h-3 rounded-full bg-amber-200/50 blur-xs animate-particle" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-yellow-100/70 blur-xs animate-particle" style={{ animationDelay: '4s' }} />
          </div>

          {/* Virtual Garden Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[#F5F5F0] border-b border-[#5A5A40]/80 pb-4 gap-3">
            <div>
              <h3 className="font-serif text-2xl font-bold flex items-center gap-2 text-[#F5F5F0]">
                <Sun className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                Jardim Virtual
              </h3>
              <p className="text-xs text-[#F5F5F0]/80 mt-0.5">
                Raios solares incidindo por frestas de janela sobre os microclimas do seu jardim.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#1b261b]/80 border border-[#D4AF37]/40 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md">
              <Sun className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-mono text-[#D4AF37] font-bold">
                Luz Solar Ativa • 24°C
              </span>
            </div>
          </div>

          {/* Realistic Botanical Microclimate Shelves */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {environments.map((env) => {
              const envPlants = filteredPlants.filter((p) => p.environmentId === env.id);

              return (
                <div
                  key={env.id}
                  className="bg-[#233123]/80 backdrop-blur-md border border-[#5A5A40]/80 rounded-3xl p-5 relative overflow-hidden space-y-4 shadow-xl group hover:border-[#D4AF37]/60 transition-all"
                >
                  {/* Subtle Sunbeam overlay on shelf */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-xl pointer-events-none" />

                  {/* Environment Header */}
                  <div className="flex items-center justify-between text-[#F5F5F0] relative z-10">
                    <span className="font-serif font-bold text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D4AF37]" />
                      {env.name}
                    </span>
                    <span className="text-xs bg-[#182318] px-3 py-1 rounded-full text-[#D4AF37] border border-[#5A5A40] font-mono font-bold shadow-xs">
                      {envPlants.length} espécimes
                    </span>
                  </div>

                  {/* Plants Shelf Display Grid */}
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {envPlants.map((plant) => (
                      <div
                        key={plant.id}
                        onClick={() => onSelectPlant(plant)}
                        className="bg-[#182318]/90 p-3 rounded-2xl border border-[#5A5A40]/80 hover:border-[#D4AF37] transition-all cursor-pointer group space-y-2 hover:scale-[1.03] shadow-md hover:shadow-2xl relative overflow-hidden"
                      >
                        {/* Sunray shimmer on card hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="relative h-28 overflow-hidden rounded-xl">
                          <img
                            src={plant.photo}
                            alt={plant.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#182318] via-transparent to-transparent opacity-60" />
                          <span className="absolute bottom-1.5 left-1.5 bg-[#182318]/90 text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border border-[#D4AF37]/40 shadow-xs">
                            {plant.rgDigital}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-[#F5F5F0] group-hover:text-[#D4AF37] transition-colors">
                            {plant.name}
                          </h5>
                          <p className="text-[10px] text-[#F5F5F0]/70 italic line-clamp-1 font-serif">{plant.species}</p>
                        </div>
                      </div>
                    ))}

                    {envPlants.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-xs text-[#F5F5F0]/60 border border-dashed border-[#5A5A40]/60 rounded-2xl bg-[#182318]/50">
                        Nenhuma planta neste ambiente no momento.
                      </div>
                    )}
                  </div>

                  {/* Shelf Wood Pedestal Bar */}
                  <div className="h-2.5 w-full bg-[#A68069]/30 rounded-full border border-[#A68069]/40 mt-2 shadow-inner" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: GRID CARDS */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              className="bg-white rounded-3xl border border-[#5A5A40]/20 overflow-hidden shadow-xs hover:shadow-md hover:border-[#A68069] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges Header */}
                <div className="relative h-48 overflow-hidden bg-[#F5F5F0]">
                  <img
                    src={plant.photo}
                    alt={plant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="bg-[#2D3A2D]/90 text-[#D4AF37] text-[11px] font-mono px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#D4AF37]/30 font-bold shadow-xs">
                      {plant.rgDigital}
                    </span>
                    {plant.isOrphan && (
                      <span className="bg-[#A68069] text-[#F5F5F0] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Órfã
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 right-3 bg-white/95 text-[#2D3A2D] text-[11px] font-bold px-3 py-1 rounded-xl backdrop-blur-xs shadow-xs border border-[#5A5A40]/20">
                    {plant.environmentName}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#2D3A2D] group-hover:text-[#A68069] transition-colors">
                      {plant.name}
                    </h3>
                    <p className="text-xs text-[#5A5A40] italic font-serif">{plant.species}</p>
                  </div>

                  {plant.collectionName && (
                    <span className="inline-block bg-[#5A5A40]/15 text-[#2D3A2D] text-[11px] px-3 py-1 rounded-full border border-[#5A5A40]/30 font-bold">
                      {plant.collectionName}
                    </span>
                  )}

                  <div className="text-xs text-[#5A5A40] space-y-1.5 pt-2 border-t border-[#5A5A40]/15">
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A5A40]/80">Luz & Sol:</span>
                      <span className="font-semibold text-[#2D3A2D]">{plant.sunlightNeeds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5A5A40]/80">Regas:</span>
                      <span className="font-semibold text-[#2D3A2D]">{plant.waterNeeds}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Tutor count & Timeline events */}
              <div className="bg-[#F5F5F0] p-4 border-t border-[#5A5A40]/15 flex items-center justify-between text-xs text-[#5A5A40]">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {plant.tutors.map((t, idx) => (
                      <img
                        key={idx}
                        src={t.avatar}
                        alt={t.name}
                        className="inline-block h-5 w-5 rounded-full ring-2 ring-white"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-[#2D3A2D]">
                    {plant.tutors.length} {plant.tutors.length === 1 ? 'Tutor' : 'Tutores'}
                  </span>
                </div>

                <span className="font-bold text-[#A68069] group-hover:underline">
                  Ver Linha do Tempo ({plant.timeline.length}) →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: LIST TABLE */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-3xl border border-[#5A5A40]/20 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D3A2D]">
              <thead className="bg-[#2D3A2D] text-[#F5F5F0] font-serif font-bold border-b border-[#5A5A40] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Planta</th>
                  <th className="p-4">RG Digital</th>
                  <th className="p-4">Ambiente</th>
                  <th className="p-4">Coleção</th>
                  <th className="p-4">Última Rega</th>
                  <th className="p-4">Tutores</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5A5A40]/15">
                {filteredPlants.map((plant) => (
                  <tr
                    key={plant.id}
                    onClick={() => onSelectPlant(plant)}
                    className="hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-semibold text-[#2D3A2D] flex items-center gap-3">
                      <img
                        src={plant.photo}
                        alt={plant.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#5A5A40]/30"
                      />
                      <div>
                        <div className="text-sm font-serif font-bold">{plant.name}</div>
                        <div className="text-[#5A5A40] italic text-[11px]">{plant.species}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[#A68069] font-bold">{plant.rgDigital}</td>
                    <td className="p-4 font-medium">{plant.environmentName}</td>
                    <td className="p-4 font-medium">{plant.collectionName || '—'}</td>
                    <td className="p-4 font-medium">{plant.careSchedule.lastWatered}</td>
                    <td className="p-4 font-medium">{plant.tutors.map((t) => t.name).join(', ')}</td>
                    <td className="p-4 text-right font-bold text-[#A68069]">
                      Abrir Perfil →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
