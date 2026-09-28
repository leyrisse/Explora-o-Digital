import React, { useState } from 'react';
import { Plant, CareTaskType, TimelineEvent, Tutor } from '../types';
import { calculateNextCareDate } from '../utils/dateUtils';
import { X, QrCode, History, ShieldCheck, UserPlus, Send, Calendar, Droplets, Sprout, Scissors, Sun, FileText, Plus, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

interface PlantProfileModalProps {
  plant: Plant;
  onClose: () => void;
  onAddTimelineEvent: (plantId: string, event: Omit<TimelineEvent, 'id'>) => void;
  onAddTutor: (plantId: string, tutor: Tutor) => void;
  onTransferOwnership: (plantId: string, newTutorName: string, reason: string) => void;
  onLogCareTask?: (plantId: string, taskType: CareTaskType) => void;
}

export const PlantProfileModal: React.FC<PlantProfileModalProps> = ({
  plant,
  onClose,
  onAddTimelineEvent,
  onAddTutor,
  onTransferOwnership,
  onLogCareTask,
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'RG_QR' | 'TUTORS' | 'TRANSFER'>('TIMELINE');

  // New timeline event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<CareTaskType | 'BLOOM' | 'TRANSFER' | 'ADOPTION' | 'MILESTONE'>('NOTE');

  // New tutor state
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorRole, setNewTutorRole] = useState<'Guardião de Fim de Semana' | 'Consultor Agrônomo' | 'Co-tutor'>('Guardião de Fim de Semana');

  // Transfer state
  const [transferTutorName, setTransferTutorName] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onAddTimelineEvent(plant.id, {
      date: new Date().toISOString().split('T')[0],
      type: eventType,
      title: eventTitle,
      description: eventDesc,
      authorName: plant.tutors[0]?.name || 'Tutor Ativo',
      authorRole: plant.tutors[0]?.role || 'Tutor',
    });

    setEventTitle('');
    setEventDesc('');
  };

  const handleCreateTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorName.trim()) return;

    onAddTutor(plant.id, {
      id: `tutor-${Date.now()}`,
      name: newTutorName,
      role: newTutorRole,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
      joinedDate: new Date().toISOString().split('T')[0],
    });

    setNewTutorName('');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTutorName.trim()) return;

    onTransferOwnership(plant.id, transferTutorName, transferReason);
    setTransferSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 space-y-0 my-auto">
        
        {/* Cover Header */}
        <div className="relative h-56 sm:h-64 bg-[#2D3A2D] text-[#F5F5F0] overflow-hidden rounded-t-3xl">
          <img
            src={plant.photo}
            alt={plant.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D3A2D] via-[#2D3A2D]/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-[#2D3A2D]/80 hover:bg-[#2D3A2D] text-[#F5F5F0] p-2 rounded-full border border-[#5A5A40] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Plant Identity Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#D4AF37] text-[#2D3A2D] font-mono font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                  {plant.rgDigital}
                </span>
                {plant.isOrphan && (
                  <span className="bg-[#A68069] text-[#F5F5F0] font-bold text-xs px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40">
                    Planta Órfã
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5F0]">{plant.name}</h2>
              <p className="text-[#D4AF37] italic text-sm font-serif">{plant.species}</p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="flex items-center gap-2 text-xs bg-[#2D3A2D]/90 p-2.5 rounded-2xl border border-[#5A5A40] text-[#F5F5F0]">
                <Sun className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-medium">{plant.sunlightNeeds}</span>
                <span>•</span>
                <Droplets className="w-4 h-4 text-[#A68069]" />
                <span className="font-medium">{plant.waterNeeds}</span>
              </div>

              {/* Direct Care Action Buttons */}
              {onLogCareTask && (
                <div className="flex items-center gap-1.5 bg-[#1f291f]/90 p-1.5 rounded-2xl border border-[#D4AF37]/40 backdrop-blur-xs">
                  <button
                    onClick={() => onLogCareTask(plant.id, 'WATER')}
                    className="px-2.5 py-1 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                  >
                    <Droplets className="w-3 h-3 text-[#D4AF37]" />
                    Regar
                  </button>
                  <button
                    onClick={() => onLogCareTask(plant.id, 'FERTILIZE')}
                    className="px-2.5 py-1 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F5F0] rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all"
                  >
                    <Sprout className="w-3 h-3 text-[#D4AF37]" />
                    Adubar
                  </button>
                  <button
                    onClick={() => onLogCareTask(plant.id, 'PRUNE')}
                    className="px-2.5 py-1 bg-[#2D3A2D] hover:bg-[#182318] text-[#F5F5F0] rounded-xl text-[11px] font-bold flex items-center gap-1 border border-[#5A5A40] shadow-2xs transition-all"
                  >
                    <Scissors className="w-3 h-3 text-[#D4AF37]" />
                    Podar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-[#5A5A40]/20 bg-[#F5F5F0] px-6 pt-3 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-3 font-semibold text-xs rounded-t-2xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'TIMELINE'
                ? 'bg-white border-[#A68069] text-[#2D3A2D] shadow-xs font-bold'
                : 'border-transparent text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <History className="w-4 h-4 text-[#A68069]" />
            Linha do Tempo Inapagável ({plant.timeline.length})
          </button>

          <button
            onClick={() => setActiveTab('RG_QR')}
            className={`px-4 py-3 font-semibold text-xs rounded-t-2xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'RG_QR'
                ? 'bg-white border-[#A68069] text-[#2D3A2D] shadow-xs font-bold'
                : 'border-transparent text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            RG Digital & QR Code
          </button>

          <button
            onClick={() => setActiveTab('TUTORS')}
            className={`px-4 py-3 font-semibold text-xs rounded-t-2xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'TUTORS'
                ? 'bg-white border-[#A68069] text-[#2D3A2D] shadow-xs font-bold'
                : 'border-transparent text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            Tutores & Guardiões ({plant.tutors.length})
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER')}
            className={`px-4 py-3 font-semibold text-xs rounded-t-2xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'TRANSFER'
                ? 'bg-white border-[#A68069] text-[#2D3A2D] shadow-xs font-bold'
                : 'border-transparent text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <Send className="w-4 h-4 text-[#A68069]" />
            Transferir Custódia / Vender
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* TAB 1: TIMELINE */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              
              {/* Add event form */}
              <form onSubmit={handleCreateEvent} className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#5A5A40]/20 space-y-3">
                <span className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[#A68069]" />
                  Registrar Novo Marco na Linha do Tempo Permanente
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Título do evento (ex: Nova folha fenestrada)"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="sm:col-span-2 bg-white border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-medium"
                    required
                  />

                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="bg-white border border-[#5A5A40]/30 rounded-2xl px-3 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
                  >
                    <option value="NOTE">Nota de Cultivo</option>
                    <option value="BLOOM">Floração / Flor</option>
                    <option value="PRUNE">Poda de Manutenção</option>
                    <option value="REPOT">Troca de Vaso / Substrato</option>
                    <option value="WATER">Rega Especial</option>
                    <option value="FERTILIZE">Adubação Nutritiva</option>
                    <option value="MILESTONE">Marco de Aniversário</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  placeholder="Detalhes (substrato utilizado, tamanho do vaso, observações do tutor)..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full bg-white border border-[#5A5A40]/30 rounded-2xl p-3 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition-colors border border-[#5A5A40]"
                  >
                    Salvar na História Inapagável
                  </button>
                </div>
              </form>

              {/* Timeline Items List */}
              <div className="relative pl-6 border-l-2 border-[#5A5A40] space-y-6">
                {plant.timeline.map((evt) => (
                  <div key={evt.id} className="relative space-y-2 group">
                    {/* Bullet */}
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#2D3A2D] ring-4 ring-[#F5F5F0] flex items-center justify-center text-[#D4AF37]" />

                    <div className="bg-white p-5 rounded-3xl border border-[#5A5A40]/20 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#5A5A40]">
                        <span className="font-bold text-[#A68069]">{evt.date}</span>
                        <span className="font-bold text-[#2D3A2D] bg-[#F5F5F0] px-2.5 py-0.5 rounded-md border border-[#5A5A40]/15">
                          Por: {evt.authorName}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-[#2D3A2D] text-base">{evt.title}</h4>
                      <p className="text-xs text-[#2D3A2D] leading-relaxed">{evt.description}</p>

                      {evt.photoUrl && (
                        <img
                          src={evt.photoUrl}
                          alt={evt.title}
                          className="w-full h-44 object-cover rounded-2xl mt-2 ring-1 ring-[#5A5A40]/20"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: RG DIGITAL & QR CODE */}
          {activeTab === 'RG_QR' && (
            <div className="space-y-6">
              <div className="bg-[#2D3A2D] text-[#F5F5F0] rounded-3xl p-6 sm:p-8 border border-[#5A5A40] shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Simulated Digital Badge */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-[#D4AF37] font-bold flex items-center justify-center text-xs">
                      RG
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#F5F5F0]">Documento Digital Oficial</h4>
                      <p className="text-xs text-[#F5F5F0]/80">Certificado Inapagável de Identidade Botânica</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono bg-[#1f291f] p-4 rounded-2xl border border-[#5A5A40]">
                    <div><span className="text-[#5A5A40]">CÓDIGO RG:</span> <strong className="text-[#D4AF37]">{plant.rgDigital}</strong></div>
                    <div><span className="text-[#5A5A40]">NOME:</span> <span className="text-[#F5F5F0]">{plant.name}</span></div>
                    <div><span className="text-[#5A5A40]">ESPÉCIE:</span> <span className="text-[#F5F5F0]/90 italic">{plant.species}</span></div>
                    <div><span className="text-[#5A5A40]">CADASTRO:</span> <span className="text-[#F5F5F0]/80">{plant.birthDate}</span></div>
                    <div><span className="text-[#5A5A40]">PRÓXIMA REGA:</span> <span className="text-[#D4AF37] font-bold">{calculateNextCareDate(plant.careSchedule.lastWatered, plant.careSchedule.waterFrequencyDays).statusText}</span></div>
                    <div><span className="text-[#5A5A40]">PRÓXIMA ADUBAÇÃO:</span> <span className="text-[#F5F5F0]">{calculateNextCareDate(plant.careSchedule.lastFertilized, plant.careSchedule.fertilizeFrequencyDays).statusText}</span></div>
                    <div><span className="text-[#5A5A40]">PRÓXIMA PODA:</span> <span className="text-[#F5F5F0]">{calculateNextCareDate(plant.careSchedule.lastPruned, plant.careSchedule.pruneFrequencyDays || 90).statusText}</span></div>
                    <div><span className="text-[#5A5A40]">TUTOR INICIAL:</span> <span className="text-[#F5F5F0]/80">{plant.tutors[0]?.name}</span></div>
                  </div>
                </div>

                {/* QR Code Visual */}
                <div className="bg-white p-6 rounded-3xl text-[#2D3A2D] text-center space-y-3 shadow-md border border-[#5A5A40]/20">
                  <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider block">
                    QR Code Perpétuo da Planta
                  </span>

                  {/* QR Code Graphic Representation */}
                  <div className="w-36 h-36 mx-auto bg-[#2D3A2D] p-3 rounded-2xl flex items-center justify-center ring-4 ring-[#5A5A40]/30">
                    <QrCode className="w-28 h-28 text-[#D4AF37]" />
                  </div>

                  <p className="text-[11px] text-[#5A5A40]">
                    Ao escanear este QR code fixado no vaso, qualquer pessoa pode acessar a história completa da {plant.name}.
                  </p>

                  <button
                    onClick={() => alert(`Imprimindo etiqueta com QR Code para ${plant.name} (${plant.rgDigital})...`)}
                    className="w-full py-2.5 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-2xl transition-colors"
                  >
                    Imprimir Etiqueta para Vaso
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: TUTORS & GUARDIANS */}
          {activeTab === 'TUTORS' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#5A5A40]/20 pb-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2D3A2D]">Tutores e Guardiões Compartilhados</h3>
                  <p className="text-xs text-[#5A5A40]">Várias pessoas podem cuidar da planta juntas e receber lembretes</p>
                </div>
              </div>

              {/* Tutors list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plant.tutors.map((tut) => (
                  <div key={tut.id} className="bg-white p-4 rounded-2xl border border-[#5A5A40]/20 flex items-center gap-3.5 shadow-2xs">
                    <img
                      src={tut.avatar}
                      alt={tut.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#5A5A40]/40"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-[#2D3A2D] text-base">{tut.name}</h4>
                      <span className="text-xs font-bold bg-[#F5F5F0] text-[#A68069] px-2.5 py-0.5 rounded-md border border-[#5A5A40]/15">
                        {tut.role}
                      </span>
                      <p className="text-[11px] text-[#5A5A40] mt-1">Desde {tut.joinedDate}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Tutor form */}
              <form onSubmit={handleCreateTutor} className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#5A5A40]/20 space-y-3">
                <span className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#A68069]" />
                  Adicionar Novo Tutor ou Guardião
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do Co-tutor ou Guardião"
                    value={newTutorName}
                    onChange={(e) => setNewTutorName(e.target.value)}
                    className="bg-white border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-medium"
                    required
                  />

                  <select
                    value={newTutorRole}
                    onChange={(e) => setNewTutorRole(e.target.value as any)}
                    className="bg-white border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
                  >
                    <option value="Guardião de Fim de Semana">Guardião de Fim de Semana</option>
                    <option value="Co-tutor">Co-tutor Compartilhado</option>
                    <option value="Consultor Agrônomo">Consultor Agrônomo Técnico</option>
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs transition-colors border border-[#5A5A40]"
                  >
                    Vincular Novo Tutor
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 4: TRANSFER CUSTODY */}
          {activeTab === 'TRANSFER' && (
            <div className="space-y-6">
              <div className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#A68069]/40 text-[#2D3A2D] text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#A68069]">
                  <AlertCircle className="w-4 h-4 text-[#A68069]" />
                  Transferência Definitiva de Tutoria (RG {plant.rgDigital})
                </div>
                <p className="leading-relaxed">
                  Ao doar, vender ou disponibilizar para adoção, você transfere a propriedade ativa do perfil. <strong>O histórico acumulado e as fotos registradas não serão apagados</strong> — o novo tutor dará continuidade à história.
                </p>
              </div>

              {!transferSuccess ? (
                <form onSubmit={handleExecuteTransfer} className="bg-white p-6 rounded-3xl border border-[#5A5A40]/20 shadow-xs space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
                      Nome do Novo Tutor / Comprador / Adotante <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mateus Oliveira"
                      value={transferTutorName}
                      onChange={(e) => setTransferTutorName(e.target.value)}
                      className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
                      Motivo / Contexto da Transferência
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Venda via Marketplace do Jardim / Mudança de Cidade"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 border border-[#5A5A40]"
                  >
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    Confirmar Transferência de Custódia & Manter História
                  </button>
                </form>
              ) : (
                <div className="bg-[#2D3A2D] border border-[#5A5A40] p-6 sm:p-8 rounded-3xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#D4AF37] mx-auto" />
                  <h4 className="font-serif text-xl font-bold text-[#F5F5F0]">
                    Transferência Concluída com Sucesso!
                  </h4>
                  <p className="text-xs text-[#F5F5F0]/90 max-w-md mx-auto leading-relaxed">
                    A custódia principal da {plant.name} foi atribuída a <strong className="text-[#D4AF37]">{transferTutorName}</strong>. Um evento oficial foi registrado na Linha do Tempo e o RG Digital permanece ativo.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
