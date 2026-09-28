import React, { useState } from 'react';
import { X, Send, ShieldCheck, QrCode, User, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ME' | 'TUTOR';
  senderName: string;
  text: string;
  time: string;
}

interface TutorChatModalProps {
  itemTitle: string;
  plantSpecies: string;
  rgDigital: string;
  sellerName: string;
  photoUrl: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const TutorChatModal: React.FC<TutorChatModalProps> = ({
  itemTitle,
  plantSpecies,
  rgDigital,
  sellerName,
  photoUrl,
  onClose,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'TUTOR',
      senderName: sellerName,
      text: `Olá! Sou o tutor responsável por ${itemTitle} (${rgDigital}). Como posso te ajudar com a planta ou transferência do RG Digital?`,
      time: '12:30',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = textToSend || inputMessage;
    if (!finalMsg.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'ME',
      senderName: 'Camila Silva',
      text: finalMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Simulate Tutor Response
    setTimeout(() => {
      const tutorReply: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'TUTOR',
        senderName: sellerName,
        text: `Com certeza! Tenho todo o histórico de cultivo registrado no RG ${rgDigital}. Posso efetuar a transferência direta para a sua conta no aplicativo!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, tutorReply]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#F5F5F0] rounded-3xl max-w-lg w-full border border-[#5A5A40]/40 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Chat Header */}
        <div className="bg-[#2D3A2D] text-[#F5F5F0] p-4 sm:p-5 flex items-center justify-between border-b border-[#5A5A40]">
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt={itemTitle}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#D4AF37]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#F5F5F0]">{sellerName}</h3>
                <span className="text-[10px] font-mono bg-[#5A5A40] text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  {rgDigital}
                </span>
              </div>
              <p className="text-xs text-[#F5F5F0]/80 italic">Planta: {itemTitle} ({plantSpecies})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#F5F5F0]/70 hover:text-white rounded-xl hover:bg-[#5A5A40]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F5F5F0]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'ME' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-2xs space-y-1 ${
                  msg.sender === 'ME'
                    ? 'bg-[#2D3A2D] text-[#F5F5F0] rounded-tr-none'
                    : 'bg-white text-[#2D3A2D] border border-[#5A5A40]/20 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] font-bold opacity-75 mb-1">
                  <span>{msg.senderName}</span>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-[#5A5A40]/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleSendMessage('Quais são os cuidados atuais da planta?')}
            className="px-2.5 py-1 bg-[#F5F5F0] hover:bg-[#5A5A40]/20 text-[#2D3A2D] rounded-xl text-[11px] whitespace-nowrap border border-[#5A5A40]/20 font-medium"
          >
            🌱 Quais os cuidados atuais?
          </button>
          <button
            onClick={() => handleSendMessage('Gostaria de agendar a transferência do RG Digital!')}
            className="px-2.5 py-1 bg-[#F5F5F0] hover:bg-[#5A5A40]/20 text-[#2D3A2D] rounded-xl text-[11px] whitespace-nowrap border border-[#5A5A40]/20 font-medium"
          >
            🤝 Quero solicitar a transferência de RG
          </button>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-[#5A5A40]/20 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Digite sua mensagem para o tutor..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-[#F5F5F0] px-4 py-2.5 rounded-2xl border border-[#5A5A40]/20 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
          />
          <button
            type="submit"
            className="p-2.5 bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] rounded-2xl transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
