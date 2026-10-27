import React, { useState, useEffect } from 'react';
import {
  Plant,
  CareTaskType,
  TimelineEvent,
  Tutor,
  Environment,
  PlantCollection,
  SpeciesCareGuide,
  PlantStructuredCare,
  CareSchedule,
  WishListItem,
  InitialPlantData,
} from './types';
import {
  INITIAL_PLANTS,
  INITIAL_ENVIRONMENTS,
  INITIAL_COLLECTIONS,
} from './data/mockData';
import { mapSunlightToLegacy, mapWaterNeedsLabel } from './utils/careUtils';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { HomeModule } from './components/HomeModule';
import { GardenModule } from './components/GardenModule';
import { DecisionAnalyzerModule } from './components/DecisionAnalyzerModule';
import { CareCalendarModule } from './components/CareCalendarModule';
import { CameraModule } from './components/CameraModule';
import { PlantProfileModal } from './components/PlantProfileModal';
import { NewPlantModal } from './components/NewPlantModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('HOME');

  const [plants, setPlants] = useState<Plant[]>(() => {
    try {
      const saved = localStorage.getItem('jardim_plants_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar plantas do localStorage:', e);
    }
    return INITIAL_PLANTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('jardim_plants_v1', JSON.stringify(plants));
    } catch (e) {
      console.warn('Erro ao salvar plantas no localStorage:', e);
    }
  }, [plants]);

  // Wishlist state with localStorage persistence
  const [wishList, setWishList] = useState<WishListItem[]>(() => {
    try {
      const saved = localStorage.getItem('jardim_wishlist_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar lista de desejos do localStorage:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('jardim_wishlist_v1', JSON.stringify(wishList));
    } catch (e) {
      console.warn('Erro ao salvar lista de desejos no localStorage:', e);
    }
  }, [wishList]);

  const [environments, setEnvironments] = useState<Environment[]>(INITIAL_ENVIRONMENTS);
  const [collections, setCollections] = useState<PlantCollection[]>(INITIAL_COLLECTIONS);

  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isNewPlantModalOpen, setIsNewPlantModalOpen] = useState(false);
  const [pendingPlantInitialData, setPendingPlantInitialData] = useState<InitialPlantData | null>(null);
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
        }

        const newTimelineEvent: TimelineEvent = {
          id: `evt-${Date.now()}`,
          date: today,
          type: taskType,
          title: taskTitle,
          description: `Cuidados realizados com carinho por Camila Silva.`,
          authorName: 'Camila Silva',
          authorRole: 'Tutor Principal',
        };

        return {
          ...p,
          status: 'HEALTHY',
          careSchedule: updatedSchedule,
          timeline: [newTimelineEvent, ...p.timeline],
        };
      })
    );

    showToast(`🌱 ${taskNameFormatted} registrada para "${targetPlantName}"!`);
  };

  // Add timeline event
  const handleAddTimelineEvent = (
    plantId: string,
    eventData: Omit<TimelineEvent, 'id' | 'authorName' | 'authorRole'>
  ) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      authorName: 'Camila Silva',
      authorRole: 'Tutor Principal',
    };

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          timeline: [newEvent, ...p.timeline],
        };
      })
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) =>
        prev
          ? {
              ...prev,
              timeline: [newEvent, ...prev.timeline],
            }
          : null
      );
    }

    showToast(`📸 Momento registrado com sucesso na Linha do Tempo!`);
  };

  // Add tutor
  const handleAddTutor = (plantId: string, tutorName: string, role: Tutor['role']) => {
    const today = new Date().toISOString().split('T')[0];
    const newTutor: Tutor = {
      id: `tutor-${Date.now()}`,
      name: tutorName,
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      joinedDate: today,
    };

    const newEvent: TimelineEvent = {
      id: `evt-tutor-${Date.now()}`,
      date: today,
      type: 'NOTE',
      title: `Novo Tutor Vinculado: ${tutorName}`,
      description: `${tutorName} agora é tutor (${role}) desta planta no ecossistema Jardim.`,
      authorName: 'Plataforma Jardim',
      authorRole: 'Ecossistema Digital',
    };

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          tutors: [...p.tutors, newTutor],
          timeline: [newEvent, ...p.timeline],
        };
      })
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) =>
        prev
          ? {
              ...prev,
              tutors: [...prev.tutors, newTutor],
              timeline: [newEvent, ...prev.timeline],
            }
          : null
      );
    }

    showToast(`🤝 Tutor "${tutorName}" vinculado à planta com sucesso!`);
  };

  // Transfer plant custody
  const handleTransferOwnership = (plantId: string, newTutorName: string, reason?: string) => {
    const today = new Date().toISOString().split('T')[0];

    const transferEvt: TimelineEvent = {
      id: `evt-transfer-${Date.now()}`,
      date: today,
      type: 'TRANSFER',
      title: `Transferência Oficial de Tutoria para ${newTutorName}`,
      description: `Custódia principal transferida. Motivo: ${reason || 'Transferência formalizada via plataforma Jardim'}. Todo o histórico anterior permanece preservado intacto.`,
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
              name: `${newTutorName} (Tutor Atual)`,
              role: 'Tutor Principal',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              joinedDate: today,
            },
            ...p.tutors,
          ],
          timeline: [transferEvt, ...p.timeline],
        };
      })
    );

    showToast(`Custódia transferida com sucesso para ${newTutorName}!`);
  };

  // Add saved decision to plant timeline
  const handleAddDecisionToTimeline = (plantId: string, decisionTitle: string, bestOption: string) => {
    handleAddTimelineEvent(plantId, {
      date: new Date().toISOString().split('T')[0],
      type: 'NOTE',
      title: `Decisão Estratégica via IA: ${decisionTitle}`,
      description: `Análise realizada com suporte do Analisador de Decisões do Jardim. Opção escolhida e recomendada: "${bestOption}".`,
    });
    showToast(`Análise de IA registrada na Linha do Tempo!`);
  };

  // Update plant care guide
  const handleUpdatePlantCareGuide = (plantId: string, careGuide: SpeciesCareGuide) => {
    setPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, careGuide } : p))
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) => (prev ? { ...prev, careGuide } : null));
    }
    showToast(`🌿 Guia de cuidados atualizado com sucesso!`);
  };

  // Update structured plant care and sync careSchedule
  const handleUpdatePlantCare = (
    plantId: string,
    structuredCare: PlantStructuredCare,
    careSchedule: CareSchedule,
    careGuide?: SpeciesCareGuide
  ) => {
    const sunlightNeeds = mapSunlightToLegacy(structuredCare.sunlightType);
    const waterNeeds = mapWaterNeedsLabel(careSchedule.waterFrequencyDays);

    setPlants((prev) =>
      prev.map((p) => {
        if (p.id !== plantId) return p;
        return {
          ...p,
          structuredCare,
          careSchedule,
          sunlightNeeds,
          waterNeeds,
          careGuide: careGuide || p.careGuide,
        };
      })
    );

    if (selectedPlant && selectedPlant.id === plantId) {
      setSelectedPlant((prev) =>
        prev
          ? {
              ...prev,
              structuredCare,
              careSchedule,
              sunlightNeeds,
              waterNeeds,
              careGuide: careGuide || prev.careGuide,
            }
          : null
      );
    }
  };

  // Add new plant to personal garden
  const handleSaveNewPlant = (newPlant: Plant) => {
    setPlants((prev) => [newPlant, ...prev]);
    showToast(`🌱 Planta "${newPlant.name}" cadastrada com sucesso!`);
  };

  // Normalization function to prevent duplicate species in wishlist
  const normalizeSpeciesKey = (scientificName?: string, popularName?: string): string => {
    if (scientificName && scientificName.trim()) {
      return scientificName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (popularName && popularName.trim()) {
      return popularName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    return '';
  };

  // Add species to Wish List (Requirement 6)
  const handleAddToWishList = (item: {
    scientificName: string;
    popularName?: string;
    photoUrl: string;
    careGuide?: SpeciesCareGuide;
  }) => {
    const key = normalizeSpeciesKey(item.scientificName, item.popularName);
    const alreadyExists = wishList.some(
      (w) => normalizeSpeciesKey(w.scientificName, w.popularName) === key
    );

    if (alreadyExists) {
      showToast(`⚠️ Esta espécie já está no seu Jardim Futuro!`);
      return;
    }

    const newItem: WishListItem = {
      id: `wish-${Date.now()}`,
      scientificName: item.scientificName,
      popularName: item.popularName,
      photoUrl: item.photoUrl,
      addedAt: new Date().toLocaleDateString('pt-BR'),
      careGuide: item.careGuide,
    };

    setWishList((prev) => [newItem, ...prev]);
    showToast(`✨ "${item.popularName || item.scientificName}" foi adicionada ao Jardim Futuro!`);
  };

  // Remove from Wish List (Jardim Futuro)
  const handleRemoveFromWishList = (id: string) => {
    setWishList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Planta removida do Jardim Futuro.`);
  };

  // Open garden registration pre-filled from identified result (Requirement 5)
  const handleOpenGardenFromIdentified = (data: InitialPlantData) => {
    setPendingPlantInitialData(data);
    setIsNewPlantModalOpen(true);
  };

  const overdueTasksCount = plants.filter((p) => p.status === 'NEEDS_CARE').length;

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
        onOpenNewPlantModal={() => {
          setPendingPlantInitialData(null);
          setIsNewPlantModalOpen(true);
        }}
      />

      {/* Main Body Module Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        
        {activeTab === 'HOME' && (
          <HomeModule
            plants={plants}
            onLogCareTask={handleLogCareTask}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onNavigateToCare={() => setActiveTab('CARE')}
          />
        )}

        {activeTab === 'GARDEN' && (
          <GardenModule
            plants={plants}
            environments={environments}
            collections={collections}
            onSelectPlant={(plant) => setSelectedPlant(plant)}
            onOpenNewPlantModal={() => {
              setPendingPlantInitialData(null);
              setIsNewPlantModalOpen(true);
            }}
            wishList={wishList}
            onRemoveWishListItem={handleRemoveFromWishList}
            onAddToGarden={handleOpenGardenFromIdentified}
            onNavigateToCamera={() => setActiveTab('CAMERA')}
          />
        )}

        {activeTab === 'CAMERA' && (
          <CameraModule
            onAddToGarden={handleOpenGardenFromIdentified}
            onAddToWishList={handleAddToWishList}
            onShowToast={showToast}
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

      </main>

      {/* Footer */}
      <footer className="bg-[#2D3A2D] text-[#F5F5F0]/80 py-8 pb-28 border-t border-[#5A5A40]/40 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#F5F5F0]">
            <span className="font-serif font-bold text-[#D4AF37] text-sm">Jardim</span>
            <span>• Ecossistema Digital com Histórico Perpétuo</span>
          </div>
          <p>© 2026 Jardim. Preservando histórias e conexões afetivas com as plantas.</p>
        </div>
      </footer>

      {/* Primary Module Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueTasksCount={overdueTasksCount}
      />

      {/* Plant Profile Modal */}
      {selectedPlant && (
        <PlantProfileModal
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
          onAddTimelineEvent={handleAddTimelineEvent}
          onAddTutor={handleAddTutor}
          onTransferOwnership={handleTransferOwnership}
          onLogCareTask={handleLogCareTask}
          onUpdatePlantCareGuide={handleUpdatePlantCareGuide}
          onUpdatePlantCare={handleUpdatePlantCare}
        />
      )}

      {/* New Plant Modal (Supports initialData when triggered from Camera or Wishlist) */}
      {isNewPlantModalOpen && (
        <NewPlantModal
          environments={environments}
          initialData={pendingPlantInitialData || undefined}
          onClose={() => {
            setIsNewPlantModalOpen(false);
            setPendingPlantInitialData(null);
          }}
          onSavePlant={(newPlant) => {
            handleSaveNewPlant(newPlant);
            setPendingPlantInitialData(null);
          }}
        />
      )}

    </div>
  );
}
