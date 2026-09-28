import React, { useState } from 'react';
import { Plant, Environment, CareSchedule } from '../types';
import { X, Plus, Sparkles, QrCode, Leaf } from 'lucide-react';

interface NewPlantModalProps {
  environments: Environment[];
  onClose: () => void;
  onSavePlant: (plant: Plant) => void;
}

export const NewPlantModal: React.FC<NewPlantModalProps> = ({
  environments,
  onClose,
  onSavePlant,
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [envId, setEnvId] = useState(environments[0]?.id || 'env-sala');
  const [collectionName, setCollectionName] = useState('Aráceas Majestosas');
  const [sunlightNeeds, setSunlightNeeds] = useState<'Sombra' | 'Luz Indireta' | 'Sol Pleno' | 'Meia Sombra'>('Luz Indireta');
  const [waterNeeds, setWaterNeeds] = useState<'Alta (2-3x/sem)' | 'Média (1-2x/sem)' | 'Baixa (1x/15dias)'>('Média (1-2x/sem)');
  const [waterFrequencyDays, setWaterFrequencyDays] = useState(7);
  const [fertilizeFrequencyDays, setFertilizeFrequencyDays] = useState(30);
  const [pruneFrequencyDays, setPruneFrequencyDays] = useState(60);
  const [acquisitionStory, setAcquisitionStory] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim()) return;

    const selectedEnv = environments.find((e) => e.id === envId);
    const generatedRg = `RG-JRD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newPlant: Plant = {
      id: `plant-${Date.now()}`,
      name,
      species,
      rgDigital: generatedRg,
      photo: photoUrl,
      environmentId: envId,
      environmentName: selectedEnv?.name || 'Sala de Estar',
      collectionName,
      birthDate: todayStr,
      status: 'HEALTHY',
      healthScore: 100,
      sunlightNeeds,
      waterNeeds: waterFrequencyDays <= 3 ? 'Alta (2-3x/sem)' : waterFrequencyDays <= 7 ? 'Média (1-2x/sem)' : 'Baixa (1x/15dias)',
      acquisitionStory: acquisitionStory || 'Registrada com amor no aplicativo Jardim.',
      careSchedule: {
        waterFrequencyDays: Number(waterFrequencyDays) || 7,
        fertilizeFrequencyDays: Number(fertilizeFrequencyDays) || 30,
        pruneFrequencyDays: Number(pruneFrequencyDays) || 60,
        lastWatered: todayStr,
        lastFertilized: todayStr,
        lastPruned: todayStr,
      },
      tutors: [
        {
          id: 'tutor-1',
          name: 'Camila Silva (Tutor Principal)',
          role: 'Tutor Principal',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
          joinedDate: todayStr,
        },
      ],
      timeline: [
        {
          id: `evt-${Date.now()}`,
          date: todayStr,
          type: 'MILESTONE',
          title: 'Nascimento do RG Digital',
          description: `Planta registrada no ecossistema Jardim com RG Digital ${generatedRg}. ${acquisitionStory}`,
          authorName: 'Camila Silva',
          authorRole: 'Tutor Principal',
        },
      ],
      isOrphan: false,
    };

    onSavePlant(newPlant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#5A5A40]/30 shadow-2xl space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#5A5A40]/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2D3A2D] text-[#D4AF37] flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D3A2D]">Cadastrar Nova Planta</h3>
              <p className="text-xs text-[#5A5A40]">Criação do RG Digital e QR Code Permanente</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#5A5A40] hover:text-[#2D3A2D] p-1.5 rounded-xl hover:bg-[#F5F5F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
              Nome Afetivo / Apelido da Planta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Maya, Beto, Luna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
              Espécie Botânica <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Monstera Deliciosa (Costela-de-Adão)"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                Ambiente
              </label>
              <select
                value={envId}
                onChange={(e) => setEnvId(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                Coleção
              </label>
              <select
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
              >
                <option value="Aráceas Majestosas">Aráceas Majestosas</option>
                <option value="Coleção Raridades">Coleção Raridades</option>
                <option value="Plantas Resgatadas">Plantas Resgatadas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                Rega (dias)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={waterFrequencyDays}
                onChange={(e) => setWaterFrequencyDays(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-bold"
                required
              />
              <span className="text-[10px] text-[#5A5A40] mt-0.5 block">Ex: 7d</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                Adubo (dias)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={fertilizeFrequencyDays}
                onChange={(e) => setFertilizeFrequencyDays(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-bold"
                required
              />
              <span className="text-[10px] text-[#5A5A40] mt-0.5 block">Ex: 30d</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                Poda (dias)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={pruneFrequencyDays}
                onChange={(e) => setPruneFrequencyDays(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3 py-2 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-bold"
                required
              />
              <span className="text-[10px] text-[#5A5A40] mt-0.5 block">Ex: 60d</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
              História da Chegada / Origem Afetiva
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Ganhei de presente do meu irmão quando mudei para o novo apartamento."
              value={acquisitionStory}
              onChange={(e) => setAcquisitionStory(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl p-3 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
              URL da Foto da Planta
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

          <div className="pt-4 border-t border-[#5A5A40]/15 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#5A5A40] hover:bg-[#F5F5F0] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 border border-[#5A5A40]"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              Gerar RG Digital & Cadastrar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
