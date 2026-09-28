import React from 'react';
import { Leaf, Sun, Droplets, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenNewPlantModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewPlantModal,
}) => {
  return (
    <header className="bg-[#2D3A2D] text-[#F5F5F0] border-b border-[#5A5A40]/60 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center shadow-lg text-[#D4AF37] font-bold border border-[#A68069]/40">
              <Leaf className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#F5F5F0]">Jardim</h1>
              <p className="text-xs text-[#F5F5F0]/70 hidden sm:block">
                Ecossistema de cultivo, memórias e vida perpétua
              </p>
            </div>
          </div>

          {/* Weather Widget Context */}
          <div className="hidden lg:flex items-center gap-4 bg-[#5A5A40]/40 border border-[#5A5A40]/80 px-3.5 py-1.5 rounded-xl text-xs text-[#F5F5F0]">
            <div className="flex items-center gap-1.5 text-[#D4AF37]">
              <Sun className="w-4 h-4" />
              <span>24°C Curitiba</span>
            </div>
            <div className="w-px h-3 bg-[#5A5A40]" />
            <div className="flex items-center gap-1.5 text-teal-300">
              <Droplets className="w-4 h-4" />
              <span>Umidade 68%</span>
            </div>
            <div className="w-px h-3 bg-[#5A5A40]" />
            <span className="text-[#F5F5F0]/90 font-medium">Clima ideal para regas</span>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Add New Plant Button */}
            <button
              onClick={onOpenNewPlantModal}
              className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-[#2D3A2D] font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Cadastrar Planta</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

