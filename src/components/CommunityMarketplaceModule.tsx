import React, { useState } from 'react';
import { MarketplaceItem, CommunityPost, Plant } from '../types';
import { HeartHandshake, ShoppingBag, Heart, MessageSquare, ThumbsUp, ShieldCheck, QrCode, Tag, Plus, CheckCircle2, Search, ArrowRight, UserCheck, Send, X } from 'lucide-react';
import { TutorChatModal } from './TutorChatModal';

interface CommunityMarketplaceModuleProps {
  marketplaceItems: MarketplaceItem[];
  posts: CommunityPost[];
  plants: Plant[];
  onAdoptOrphanPlant: (plantId: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onShowToast?: (msg: string) => void;
}

export const CommunityMarketplaceModule: React.FC<CommunityMarketplaceModuleProps> = ({
  marketplaceItems,
  posts: initialPosts,
  plants,
  onAdoptOrphanPlant,
  onSelectPlant,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'MARKETPLACE' | 'ORPHANS' | 'FORUM'>('ORPHANS');
  const [adoptionSuccessId, setAdoptionSuccessId] = useState<string | null>(null);

  // Forum State
  const [postsList, setPostsList] = useState<CommunityPost[]>(initialPosts);
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Array<{ id: string; author: string; text: string; time: string }>>>({
    'post-1': [
      { id: 'c1', author: 'Mariana Duarte', text: 'Excelente dica! O tutor primário salvou a planta.', time: 'Há 1 hora' },
    ],
  });
  const [newCommentInput, setNewCommentInput] = useState('');

  // New Forum Post Modal State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPlantRg, setNewPostPlantRg] = useState('');

  // Tutor Chat Modal State
  const [activeChat, setActiveChat] = useState<{
    itemTitle: string;
    plantSpecies: string;
    rgDigital: string;
    sellerName: string;
    photoUrl: string;
  } | null>(null);

  const orphanPlants = plants.filter((p) => p.isOrphan);

  const handleAdopt = (plant: Plant) => {
    onAdoptOrphanPlant(plant.id);
    setAdoptionSuccessId(plant.id);
    if (onShowToast) onShowToast(`❤️ Parabéns! Você adotou a planta ${plant.name}!`);
  };

  // Toggle Like Handler
  const handleToggleLike = (postId: string) => {
    setLikedPostIds((prev) => {
      const currentlyLiked = !!prev[postId];
      const newStatus = !currentlyLiked;

      setPostsList((pList) =>
        pList.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            likes: currentlyLiked ? p.likes - 1 : p.likes + 1,
          };
        })
      );

      if (onShowToast) {
        onShowToast(newStatus ? '❤️ Você curtiu esta publicação no Fórum!' : 'Curtida removida.');
      }

      return { ...prev, [postId]: newStatus };
    });
  };

  // Submit Comment Handler
  const handleAddComment = (postId: string) => {
    if (!newCommentInput.trim()) return;

    const commentObj = {
      id: `c-${Date.now()}`,
      author: 'Camila Silva',
      text: newCommentInput,
      time: 'Agora mesmo',
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), commentObj],
    }));

    setPostsList((pList) =>
      pList.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );

    setNewCommentInput('');
    if (onShowToast) onShowToast('💬 Comentário adicionado com sucesso!');
  };

  // Create New Post Handler
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const createdPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: 'Camila Silva',
      authorRole: 'Guardião',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: newPostTitle,
      content: newPostContent,
      plantRg: newPostPlantRg ? newPostPlantRg.toUpperCase() : undefined,
      likes: 0,
      commentsCount: 0,
      timeAgo: 'Agora mesmo',
      tags: ['Dúvida', 'Comunidade'],
    };

    setPostsList([createdPost, ...postsList]);
    setIsNewPostModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostPlantRg('');
    if (onShowToast) onShowToast(' Nova publicação postada no Fórum da Comunidade!');
  };

  return (
    <div className="space-y-8 animate-fadeIn relative">
      
      {/* Tutor Chat Modal */}
      {activeChat && (
        <TutorChatModal
          itemTitle={activeChat.itemTitle}
          plantSpecies={activeChat.plantSpecies}
          rgDigital={activeChat.rgDigital}
          sellerName={activeChat.sellerName}
          photoUrl={activeChat.photoUrl}
          onClose={() => setActiveChat(null)}
          onShowToast={onShowToast || (() => {})}
        />
      )}

      {/* New Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#F5F5F0] rounded-3xl max-w-lg w-full border border-[#5A5A40]/40 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/20 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#2D3A2D] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#A68069]" />
                Nova Publicação no Fórum
              </h3>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-1.5 text-[#5A5A40] hover:text-[#2D3A2D] rounded-xl hover:bg-[#5A5A40]/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                  Título da Dúvida ou Relato
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Ex: Como lidar com folhas amarelas na Costela-de-Adão?"
                  className="w-full bg-white px-3.5 py-2.5 rounded-2xl border border-[#5A5A40]/30 text-xs text-[#2D3A2D] font-bold focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                  RG Digital da Planta Relacionada (Opcional)
                </label>
                <input
                  type="text"
                  value={newPostPlantRg}
                  onChange={(e) => setNewPostPlantRg(e.target.value)}
                  placeholder="Ex: RG-2024-9482"
                  className="w-full bg-white px-3.5 py-2.5 rounded-2xl border border-[#5A5A40]/30 text-xs text-[#2D3A2D] font-mono focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1">
                  Conteúdo / Descrição Detalhada
                </label>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Escreva detalhes sobre o substrato, rega e ambiente..."
                  className="w-full bg-white p-3.5 rounded-2xl border border-[#5A5A40]/30 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold text-xs rounded-2xl shadow-xs transition-colors"
              >
                Publicar no Fórum de Tutores
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Title & Subtabs */}
      <div className="border-b border-[#5A5A40]/30 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D3A2D] flex items-center gap-2">
            Comunidade, Marketplace & Adoções
          </h2>
          <p className="text-[#5A5A40] text-sm mt-1">
            Espaço de troca entre membros. Todos os anúncios de venda, troca ou doação são obrigatoriamente vinculados a um RG Digital real.
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="bg-[#5A5A40]/15 p-1 rounded-2xl border border-[#5A5A40]/20 flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setSubTab('ORPHANS')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              subTab === 'ORPHANS'
                ? 'bg-[#A68069] text-[#F5F5F0] font-bold shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
            Plantas Órfãs ({orphanPlants.length})
          </button>

          <button
            onClick={() => setSubTab('MARKETPLACE')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              subTab === 'MARKETPLACE'
                ? 'bg-[#2D3A2D] text-[#F5F5F0] font-bold shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            Marketplace com RG
          </button>

          <button
            onClick={() => setSubTab('FORUM')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              subTab === 'FORUM'
                ? 'bg-[#5A5A40] text-[#F5F5F0] font-bold shadow-xs'
                : 'text-[#5A5A40] hover:text-[#2D3A2D]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
            Fórum de Tutores
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PLANTAS ÓRFÃS (ORPHAN PLANTS SHELTER) */}
      {subTab === 'ORPHANS' && (
        <div className="space-y-6">
          <div className="bg-[#2D3A2D] text-[#F5F5F0] p-6 sm:p-8 rounded-3xl border border-[#5A5A40] shadow-md space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-[#5A5A40] text-[#F5F5F0] text-xs px-3 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              Conceito Exclusivo do Jardim
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#F5F5F0]">
              Abrigo de Plantas Órfãs
            </h3>
            <p className="text-[#F5F5F0]/90 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Quando um tutor encerra a conta ou precisa doar uma planta, ela se torna "órfã". O perfil, o RG Digital e todo o histórico de anos permanecem ativos no aplicativo até que um novo tutor a adote, garantindo a perenidade dos dados!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orphanPlants.map((plant) => (
              <div
                key={plant.id}
                className="bg-white rounded-3xl border border-[#5A5A40]/20 overflow-hidden shadow-xs space-y-4 p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={plant.photo}
                      alt={plant.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#5A5A40]/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#F5F5F0] text-[#A68069] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-[#5A5A40]/20">
                          {plant.rgDigital}
                        </span>
                        <span className="text-[10px] font-bold text-[#2D3A2D] bg-[#5A5A40]/20 px-2 py-0.5 rounded-md">
                          {plant.timeline.length} Registros na História
                        </span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-[#2D3A2D] mt-1">{plant.name}</h4>
                      <p className="text-xs text-[#5A5A40] italic font-serif">{plant.species}</p>
                    </div>
                  </div>

                  <div className="bg-[#F5F5F0] p-3.5 rounded-2xl border border-[#5A5A40]/15 text-xs text-[#2D3A2D] space-y-1">
                    <span className="font-bold block text-[#A68069]">História do Desapego / Origem:</span>
                    <p className="text-[#2D3A2D] leading-snug">{plant.orphanReason || plant.acquisitionStory}</p>
                  </div>
                </div>

                {adoptionSuccessId === plant.id ? (
                  <div className="p-3.5 bg-[#5A5A40] text-[#F5F5F0] rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 border border-[#D4AF37]/50">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    Parabéns! Você adotou {plant.name} com RG {plant.rgDigital}!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#5A5A40]/10">
                    <button
                      onClick={() => onSelectPlant(plant)}
                      className="flex-1 py-2.5 px-3 bg-[#F5F5F0] hover:bg-[#e6e6dc] text-[#2D3A2D] font-bold text-xs rounded-2xl transition-colors"
                    >
                      Ver RG & Linha do Tempo
                    </button>

                    <button
                      onClick={() => handleAdopt(plant)}
                      className="flex-1 py-2.5 px-3 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Adotar esta Planta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: MARKETPLACE WITH REAL RG */}
      {subTab === 'MARKETPLACE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketplaceItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#5A5A40]/20 p-5 shadow-xs hover:border-[#A68069] transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.photo}
                    alt={item.plantName}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-[#5A5A40]/20 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#2D3A2D] text-[#D4AF37] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-[#5A5A40]">
                        {item.rgDigital}
                      </span>
                      {item.verifiedRg && (
                        <span className="bg-[#5A5A40]/20 text-[#2D3A2D] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#A68069]" />
                          RG Verificado
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-[#2D3A2D] text-lg leading-snug">{item.title}</h4>
                    <p className="text-xs text-[#5A5A40] italic font-serif">{item.plantSpecies}</p>
                  </div>
                </div>

                <p className="text-xs text-[#2D3A2D] leading-relaxed bg-[#F5F5F0] p-3.5 rounded-2xl border border-[#5A5A40]/15">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#5A5A40]/10">
                  <div>
                    <span className="text-[#5A5A40] block text-[10px]">Anunciante:</span>
                    <strong className="text-[#2D3A2D] font-bold">{item.sellerName}</strong> ({item.location})
                  </div>

                  <div className="text-right">
                    <span className="text-[#5A5A40] block text-[10px]">Valor:</span>
                    <strong className="text-[#A68069] font-bold text-sm">
                      {item.price === 0 ? 'Gratuito (Doação)' : `R$ ${item.price},00`}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setActiveChat({
                      itemTitle: item.title,
                      plantSpecies: item.plantSpecies,
                      rgDigital: item.rgDigital,
                      sellerName: item.sellerName,
                      photoUrl: item.photo,
                    })
                  }
                  className="w-full py-3 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
                  Falar com Tutor / Solicitar Transferência de RG
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TUTORS FORUM */}
      {subTab === 'FORUM' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#5A5A40]/20 shadow-2xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2D3A2D]">Fórum de Discussão entre Tutores</h3>
              <p className="text-xs text-[#5A5A40]">Troque dicas, faça perguntas sobre espécies ou compartilhe avanços de cultivo.</p>
            </div>
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold px-4 py-2 rounded-2xl text-xs shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              Nova Publicação
            </button>
          </div>

          <div className="space-y-4">
            {postsList.map((post) => {
              const isLiked = !!likedPostIds[post.id];
              const isCommentsOpen = openCommentPostId === post.id;
              const postComments = commentsMap[post.id] || [];

              return (
                <div key={post.id} className="bg-white rounded-3xl p-6 border border-[#5A5A40]/20 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#A68069]/40"
                      />
                      <div>
                        <h5 className="font-serif font-bold text-[#2D3A2D] text-base">{post.authorName}</h5>
                        <span className="text-[11px] text-[#A68069] font-bold bg-[#F5F5F0] px-2.5 py-0.5 rounded-md border border-[#5A5A40]/15">
                          {post.authorRole} • {post.timeAgo}
                        </span>
                      </div>
                    </div>

                    {post.plantRg && (
                      <span className="text-[11px] font-mono bg-[#2D3A2D] text-[#D4AF37] px-2.5 py-1 rounded-md border border-[#5A5A40] font-bold">
                        {post.plantRg}
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-lg font-bold text-[#2D3A2D]">{post.title}</h4>
                  <p className="text-xs sm:text-sm text-[#2D3A2D] leading-relaxed">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-52 object-cover rounded-2xl ring-1 ring-[#5A5A40]/20"
                    />
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#5A5A40] pt-2 border-t border-[#5A5A40]/10">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-xl border ${
                        isLiked
                          ? 'bg-[#A68069] text-[#F5F5F0] border-[#A68069]'
                          : 'bg-[#F5F5F0] text-[#5A5A40] border-[#5A5A40]/20 hover:bg-[#5A5A40]/10'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'text-[#D4AF37]' : ''}`} />
                      <span>{post.likes} Curtidas</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentPostId(isCommentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 font-bold transition-all px-3 py-1.5 rounded-xl bg-[#F5F5F0] text-[#5A5A40] border border-[#5A5A40]/20 hover:bg-[#5A5A40]/10"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#A68069]" />
                      <span>{post.commentsCount} Comentários</span>
                    </button>
                  </div>

                  {/* COMMENTS DRAWER */}
                  {isCommentsOpen && (
                    <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#5A5A40]/15 space-y-3 animate-fadeIn">
                      <h6 className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider">
                        Comentários ({postComments.length})
                      </h6>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {postComments.length === 0 ? (
                          <p className="text-xs text-[#5A5A40] italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                        ) : (
                          postComments.map((c) => (
                            <div key={c.id} className="bg-white p-3 rounded-xl border border-[#5A5A40]/15 text-xs space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-[#A68069]">
                                <span>{c.author}</span>
                                <span className="text-[#5A5A40] opacity-75">{c.time}</span>
                              </div>
                              <p className="text-[#2D3A2D]">{c.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Escreva um comentário..."
                          value={newCommentInput}
                          onChange={(e) => setNewCommentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-[#5A5A40]/25 text-xs text-[#2D3A2D] focus:outline-none focus:ring-1 focus:ring-[#A68069]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-3 py-1.5 bg-[#2D3A2D] hover:bg-[#1f291f] text-[#F5F5F0] font-bold text-xs rounded-xl shadow-2xs transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

