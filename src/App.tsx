import React, { useState } from 'react';
import { Plant, CareTaskType, TimelineEvent, Tutor, Environment, PlantCollection, MarketplaceItem, CommunityPost } from './types';
import { INITIAL_PLANTS, INITIAL_ENVIRONMENTS, INITIAL_COLLECTIONS, INITIAL_MARKETPLACE, INITIAL_COMMUNITY_POSTS } from './data/mockData';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { HomeModule } from './components/HomeModule';
import { GardenModule } from './components/GardenModule';
import { DecisionAnalyzerModule } from './components/DecisionAnalyzerModule';
import { CareCalendarModule } from './components/CareCalendarModule';
import { CommunityMarketplaceModule } from './components/CommunityMarketplaceModule';
import { PlantProfileModal } from './components/PlantProfileModal';
import { NewPlantModal } from './components/NewPlantModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('HOME');

  const [plants, setPlants] = useState<Plant[]>(INITIAL_PLANTS);
  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS);
  const [collections, setCollections] = useState<PlantCollection[]>(INITIAL_COLLECTIONS);
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);

  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Care task logger
  const handleLogCareTask = (plantId: string, taskType: CareTaskType) => {
    const today = new Date().toISOString().split('T')[0];

    let targetPlantName = '';
    let taskNameFormatted = '';

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;

        targetPlantName = p.name;
        const updatedSchedule = { ...p.careSchedule };
        let taskTitle = 'Rega Concluída';
        if (taskType === 'WATER') {
          updatedSchedule.lastWatered = today;
          taskTitle = 'Rega Concluída';
          taskNameFormatted = 'Rega';
        } else if (taskType === 'FERTILIZE') {
          updatedSchedule.lastFertilized = today;
          taskTitle = 'Adubação de Nutrição';
          taskNameFormatted = 'Adubação';
        } else if (taskType === 'PRUNE') {
          updatedSchedule.lastPruned = today;
          taskTitle = 'Poda de Manutenção';
          taskNameFormatted = 'Poda';
        } else if (taskType === 'REPOT') {
          taskTitle = 'Troca de Vaso';
          taskNameFormatted = 'Troca de Vaso';
        } else {
          taskTitle = 'Cuidado de Rotina';
          taskNameFormatted = 'Cuidados';
        }

        const newTimelineEvent: TimelineEvent = {
          id: `evt-${Date.now()}`,
          date: today,
          type: taskType,
          title: taskTitle,
          description: `Cuidados de rotina (${taskNameFormatted}) registrados pelo tutor no aplicativo Jardim.`,
          authorName: p.tutors[0]?.name || 'Camila Silva',
          authorRole: p.tutors[0]?.role || 'Tutor Principal',
        };

        return {
          ...p,
          status: 'HEALTHY' as const,
          careSchedule: updatedSchedule,
          timeline: [newTimelineEvent, ...p.timeline],
        };
      })
    );

    showToast(`✨ ${taskNameFormatted || 'Cuidado'} registrado com sucesso para ${targetPlantName || 'a planta'}!`);

    // Refresh selected plant if open in modal
    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) => {
        if (!prev) return null;
        const updatedSchedule = { ...prev.careSchedule };
        if (taskType === 'WATER') updatedSchedule.lastWatered = today;
        if (taskType === 'FERTILIZE') updatedSchedule.lastFertilized = today;
        if (taskType === 'PRUNE') updatedSchedule.lastPruned = today;

        return {
          ...prev,
          status: 'HEALTHY' as const,
          careSchedule: updatedSchedule,
          timeline: [
            {
              id: `evt-${Date.now()}`,
              date: today,
              type: taskType,
              title: taskType === 'PRUNE' ? 'Poda de Manutenção' : taskType === 'FERTILIZE' ? 'Adubação de Nutrição' : 'Rega Concluída',
              description: `Cuidados de rotina registrados pelo tutor no aplicativo Jardim.`,
              authorName: prev.tutors[0]?.name || 'Camila Silva',
              authorRole: prev.tutors[0]?.role || 'Tutor Principal',
            },
            ...prev.timeline,
          ],
        };
      });
    }
  };

  // Add timeline event
  const handleAddTimelineEvent = (plantId: string, eventData: Omit<TimelineEvent, 'id'>) => {
    const newEvt: TimelineEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          timeline: [newEvt, ...p.timeline],
        };
      })
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) => (prev ? { ...prev, timeline: [newEvt, ...prev.timeline] } : null));
    }
  };

  // Add tutor
  const handleAddTutor = (plantId: string, tutor: Tutor) => {
    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          tutors: [...p.tutors, tutor],
        };
      })
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) => (prev ? { ...prev, tutors: [...prev.tutors, tutor] } : null));
    }
  };

  // Transfer ownership
  const handleTransferOwnership = (plantId: string, newTutorName: string, reason: string) => {
    const today = new Date().toISOString().split('T')[0];

    const transferEvt: TimelineEvent = {
      id: `evt-transfer-${Date.now()}`,
      date: today,
      type: 'TRANSFER',
      title: `Transferência Oficial do RG Digital para ${newTutorName}`,
      description: `Custódia principal transferida. Motivo: ${reason || 'Adoção/Venda via comunidade Jardim'}. Todo o histórico anterior permanece preservado intacto.`,
      authorName: 'Plataforma Jardim',
      authorRole: 'Ecossistema Digital',
    };

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          isOrphan: false,
          tutors: [
            {
              id: `tutor-new-${Date.now()}`,
              name: newTutorName,
              role: 'Tutor Principal',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              joinedDate: today,
            },
            ...p.tutors,
          ],
          timeline: [transferEvt, ...p.timeline],
        };
      })
    );

    showToast(` Custódia transferida com sucesso para ${newTutorName}!`);
  };

  // Adopt orphan plant
  const handleAdoptOrphanPlant = (plantId: string) => {
    handleTransferOwnership(plantId, 'Camila Silva (Novo Tutor Registrado)', 'Adoção responsável pelo abrigo de plantas órfãs do Jardim');
    showToast(`❤️ Parabéns! Você adotou a planta e assumiu a custódia responsável!`);
  };

  // Add saved decision to plant timeline
  const handleAddDecisionToTimeline = (plantId: string, decisionTitle: string, bestOption: string) => {
    handleAddTimelineEvent(plantId, {
      date: new Date().toISOString().split('T')[0],
      type: 'NOTE',
      title: `Decisão Estratégica via IA: ${decisionTitle}`,
      description: `Análise realizada com suporte do Analisador de Decisões do Jardim. Opção escolhida e recomendada: "${bestOption}".`,
      authorName: 'Camila Silva com IA Jardim',
      authorRole: 'Tutor Principal',
    });
    showToast(`Análise de IA registrada na Linha do Tempo!`);
  };

  // Add new plant
  const handleSaveNewPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]);
    showToast(`🌱 Planta "${newPlant.name}" criada com RG ${newPlant.rgDigital}!`);
  };

  const overdueTasksCount = plants.filter((p) => p.status === 'NEEDS_CARE').length;
  const orphanPlantsCount = plants.filter((p) => p.isOrphan).length;

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2D3A2D] font-sans flex flex-col antialiased relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 bg-[#2D3A2D] text-[#F5F5F0] px-5 py-3 rounded-2xl shadow-2xl border border-[#D4AF37]/50 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <Header
        onOpenNewPlantModal={() => setIsNewPlantModalOpen(true)}
      />

      {/* Main Body Module Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        
        {activeTab === 'HOME' && (
          <HomeModule
            plants={plants}
            onLogCareTask={handleLogCareTask}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onNavigateToCare={() => setActiveTab('CARE')}
            onNavigateToCommunity={() => setActiveTab('COMMUNITY')}
          />
        )}

        {activeTab === 'GARDEN' && (
          <GardenModule
            plants={plants}
            environments={environments}
            collections={collections}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onOpenNewPlantModal={() => setIsNewPlantModalOpen(true)}
          />
        )}

        {activeTab === 'CARE' && (
          <CareCalendarModule
            plants={plants}
            onLogCareTask={handleLogCareTask}
          />
        )}

        {activeTab === 'DECISION_AI' && (
          <DecisionAnalyzerModule
            plants={plants}
            onAddDecisionToTimeline={handleAddDecisionToTimeline}
          />
        )}

        {activeTab === 'COMMUNITY' && (
          <CommunityMarketplaceModule
            marketplaceItems={marketplaceItems}
            posts={communityPosts}
            plants={plants}
            onAdoptOrphanPlant={handleAdoptOrphanPlant}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onShowToast={showToast}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#2D3A2D] text-[#F5F5F0]/80 py-8 pb-28 border-t border-[#5A5A40]/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#F5F5F0]">
            <span className="font-serif font-bold text-[#D4AF37] text-sm">Jardim</span>
            <span>• Ecossistema Digital com RG e Histórico Perpétuo</span>
          </div>
          <p>© 2026 Jardim. Preservando histórias e conexões afetivas com as plantas.</p>
        </div>
      </footer>

      {/* Primary Module Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueTasksCount={overdueTasksCount}
        orphanPlantsCount={orphanPlantsCount}
      />

      {/* Plant Profile & RG Modal */}
      {selectedPlant && (
        <PlantProfileModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onAddTimelineEvent={handleAddTimelineEvent}
          onAddTutor={handleAddTutor}
          onTransferOwnership={handleTransferOwnership}
          onLogCareTask={handleLogCareTask}
        />
      )}

      {/* New Plant Modal */}
      {isNewPlantModalOpen && (
        <NewPlantModal
          environments={environments}
          onClose={() => setIsNewPlantModalOpen(false)}
          onSavePlant={handleSaveNewPlant}
        />
      )}

    </div>
  );
}
