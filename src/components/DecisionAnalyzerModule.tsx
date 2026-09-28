import React, { useState } from 'react';
import { Plant, DecisionRequest, DecisionAnalysisResult, SavedDecision } from '../types';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, Scale, Table, ListChecks, ArrowRight, Loader2, Save, Printer, Share2, HelpCircle, FileText, Check } from 'lucide-react';

interface DecisionAnalyzerModuleProps {
  plants: Plant[];
  onAddDecisionToTimeline?: (plantId: string, decisionTitle: string, bestOption: string) => void;
}

export const DecisionAnalyzerModule: React.FC<DecisionAnalyzerModuleProps> = ({
  plants,
  onAddDecisionToTimeline,
}) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState('Cuidados de Planta');
  const [optionsText, setOptionsText] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DecisionAnalysisResult | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  // Preset scenarios to quick-test with 1 click
  const presetScenarios = [
    {
      label: '🧪 Replante de Inverno vs Primavera',
      title: 'Devo trocar o vaso da minha Monstera agora no inverno ou esperar a primavera?',
      category: 'Cuidados de Planta',
      context: 'Planta em apartamento em Curitiba, raízes despontando no vaso de 30cm, temperatura média de 14°C.',
      options: ['Fazer o replante completo para vaso de 40cm agora', 'Adubação de manutenção leve e esperar Setembro', 'Colocar num cachepô sem mexer na raiz'],
    },
    {
      label: '🤝 Vender com RG vs Manter como Planta Órfã',
      title: 'Devo doar minha Orquídea com RG Digital no Marketplace ou mantê-la no abrigo de Plantas Órfãs?',
      category: 'Transferência & Adoção',
      context: 'Vou mudar de estado e não poderei levar 2 orquídeas que estão comigo há 3 anos.',
      options: ['Abrir anúncio de doação no Marketplace com transferência do RG', 'Mudar o status para Planta Órfã sob custódia do Jardim'],
    },
    {
      label: '🪴 Vaso de Barro Poroso vs Vaso Autoirrigável',
      title: 'Qual tipo de vaso escolher para uma Jiboia Prateada em escritório climatizado?',
      category: 'Equipamentos & Materiais',
      context: 'Escritório com ar-condicionado durante o dia e sem regas nos fins de semana.',
      options: ['Vaso de cerâmica porosa tradicional', 'Vaso autoirrigável com reservatório inferior'],
    },
    {
      label: '💼 Assinatura de Tutoria Profissional para Viveiro',
      title: 'Vale a pena oferecer o RG Digital do Jardim como diferencial para meus clientes de viveiro?',
      category: 'Estratégia de Negócios',
      context: 'Sou viveirista e quero fidelizar clientes pós-venda garantindo suporte e transferência de histórico.',
      options: ['Oferecer o RG Digital gratuito para todas as mudas no ato da compra', 'Cobrar uma taxa mensal de tutoria técnica'],
    },
  ];

  const handleApplyPreset = (scenario: typeof presetScenarios[0]) => {
    setTitle(scenario.title);
    setCategory(scenario.category);
    setContext(scenario.context);
    setOptionsText(scenario.options.join('\n'));
    setErrorMessage(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor, informe a pergunta ou título da decisão que deseja analisar.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setSavedSuccessMessage(null);

    const parsedOptions = optionsText
      .split('\n')
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          context,
          category,
          options: parsedOptions,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Falha ao processar análise da IA.');
      }

      setAnalysisResult(json.data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocorreu um erro ao conectar ao servidor de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToPlantTimeline = () => {
    if (!analysisResult || !selectedPlantId) return;
    const selectedPlant = plants.find((p) => p.id === selectedPlantId);
    if (!selectedPlant) return;

    if (onAddDecisionToTimeline) {
      onAddDecisionToTimeline(
        selectedPlantId,
        title,
        analysisResult.recommendation.bestOption
      );
      setSavedSuccessMessage(`Decisão anexada com sucesso à Linha do Tempo da planta ${selectedPlant.name} (${selectedPlant.rgDigital})!`);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#2D3A2D] rounded-3xl p-6 sm:p-8 text-[#F5F5F0] border border-[#5A5A40]/60 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#5A5A40] text-[#F5F5F0] text-xs px-3 py-1 rounded-full border border-[#D4AF37]/30 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Assistente Botânico & Estratégico com Gemini 3.6
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F5F0]">
            Analisador de Decisões do Jardim
          </h2>
          <p className="text-[#F5F5F0]/90 text-sm sm:text-base leading-relaxed">
            Apresente qualquer dilema sobre o seu cultivo, manejo, transferências ou negócios do viveiro. A IA do Jardim gera uma <strong className="text-[#D4AF37]">Lista de Prós e Contras</strong>, uma <strong className="text-[#D4AF37]">Tabela Comparativa</strong> detalhada e uma <strong className="text-[#D4AF37]">Recomendação Botânica com Plano de Ação</strong>.
          </p>
        </div>
      </div>

      {/* Preset Scenarios Quick Picker */}
      <div className="space-y-3 bg-white p-5 rounded-3xl border border-[#5A5A40]/20 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#2D3A2D] uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#A68069]" />
            Ou escolha um cenário de teste rápido (1 Clique):
          </label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {presetScenarios.map((scen, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(scen)}
              className="text-left bg-[#F5F5F0] p-3.5 rounded-2xl border border-[#5A5A40]/20 hover:border-[#A68069] hover:bg-[#5A5A40]/10 transition-all text-xs text-[#2D3A2D] font-medium shadow-2xs group flex flex-col justify-between"
            >
              <span className="font-serif font-bold">{scen.label}</span>
              <span className="text-[10px] text-[#A68069] font-bold group-hover:underline mt-2">
                Carregar este dilema →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Input Form */}
      <form onSubmit={handleAnalyze} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#5A5A40]/20 shadow-xs space-y-6">
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
              Qual decisão você precisa tomar? <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Devo trocar o vaso da minha Monstera em pleno inverno ou esperar a primavera?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-4 py-3 text-sm text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
                Categoria da Decisão
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
              >
                <option value="Cuidados de Planta">Cuidados de Planta (Regas, Replante, Poda)</option>
                <option value="Transferência & Adoção">Transferência & Adoção (Doação, Venda, Adoção Órfã)</option>
                <option value="Equipamentos & Materiais">Equipamentos & Materiais (Vasos, Substratos, Luz)</option>
                <option value="Estratégia de Negócios">Estratégia de Negócios (Viveiro, Consultoria, Clientes)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
                Vincular a uma Planta do Jardim (Opcional)
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069] font-semibold"
              >
                <option value="">Nenhuma (Decisão geral)</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species}) — {p.rgDigital}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
              Opções sob Avaliação (Uma por linha - Opcional)
            </label>
            <textarea
              rows={3}
              placeholder={'Ex:\nOpção A: Replante completo para vaso de 40cm\nOpção B: Esperar Setembro na Primavera\nOpção C: Usar cachepô sem mexer no terrão'}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl p-3.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D3A2D] uppercase tracking-wider mb-1.5">
              Contexto Adicional (Clima, cidade, estado da planta, histórico)
            </label>
            <input
              type="text"
              placeholder="Ex: Moro em Curitiba, temperatura média 14°C, planta está num vaso de barro de 30cm no apartamento."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#5A5A40]/30 rounded-2xl px-3.5 py-2.5 text-xs text-[#2D3A2D] focus:outline-none focus:ring-2 focus:ring-[#A68069]"
            />
          </div>

        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-[#A68069] hover:bg-[#8e6c57] text-[#F5F5F0] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 border border-[#D4AF37]/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
              <span>Analisando Prós, Contras e Tabela Comparativa via Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>Analisar Decisão com IA do Jardim</span>
            </>
          )}
        </button>
      </form>

      {/* ANALYSIS RESULTS DISPLAY */}
      {analysisResult && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Executive Summary Card */}
          <div className="bg-[#2D3A2D] text-[#F5F5F0] p-6 sm:p-8 rounded-3xl border border-[#5A5A40] shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Síntese da Análise Estratégica
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F5F5F0]">
              {title}
            </h3>
            <p className="text-[#F5F5F0]/90 text-sm sm:text-base leading-relaxed">
              {analysisResult.summary}
            </p>
          </div>

          {/* SECTION 1: PROS AND CONS LIST */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#5A5A40]/30 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-[#D4AF37] flex items-center justify-center font-bold">
                <ListChecks className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2D3A2D]">
                1. Lista Comparativa de Prós e Contras
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {analysisResult.prosAndCons.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-[#5A5A40]/20 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-[#5A5A40]/15 pb-3">
                      <h4 className="font-serif font-bold text-[#2D3A2D] text-base">{item.optionName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.riskLevel === 'Baixo'
                            ? 'bg-[#5A5A40]/20 text-[#2D3A2D] border-[#5A5A40]/40'
                            : item.riskLevel === 'Médio'
                            ? 'bg-[#D4AF37]/20 text-[#2D3A2D] border-[#D4AF37]/50'
                            : 'bg-[#A68069]/20 text-[#A68069] border-[#A68069]/50'
                        }`}
                      >
                        Risco {item.riskLevel}
                      </span>
                    </div>

                    {/* Pros */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Prós ({item.pros.length})
                      </span>
                      <ul className="space-y-1">
                        {item.pros.map((pro, pIdx) => (
                          <li key={pIdx} className="text-xs text-[#2D3A2D] flex items-start gap-1.5">
                            <span className="text-[#5A5A40] font-bold">•</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="space-y-1.5 pt-2 border-t border-[#5A5A40]/15">
                      <span className="text-[11px] font-bold text-[#A68069] uppercase tracking-wider flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-[#A68069]" />
                        Contras ({item.cons.length})
                      </span>
                      <ul className="space-y-1">
                        {item.cons.map((con, cIdx) => (
                          <li key={cIdx} className="text-xs text-[#5A5A40] flex items-start gap-1.5">
                            <span className="text-[#A68069] font-bold">•</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="bg-[#F5F5F0] p-3 rounded-2xl border border-[#5A5A40]/15 flex items-center justify-between text-xs">
                    <span className="text-[#5A5A40] font-medium">Viabilidade Botânica:</span>
                    <span className="font-mono font-bold text-[#2D3A2D] text-sm bg-white px-2.5 py-0.5 rounded-lg border border-[#5A5A40]/20">
                      {item.score} / 10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: COMPARATIVE TABLE MATRIX */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#5A5A40]/30 pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#2D3A2D] text-[#D4AF37] flex items-center justify-center font-bold">
                <Table className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2D3A2D]">
                2. Tabela Comparativa Lado a Lado
              </h3>
            </div>

            <div className="bg-white rounded-3xl border border-[#5A5A40]/20 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#2D3A2D]">
                  <thead className="bg-[#2D3A2D] text-[#F5F5F0] font-serif font-bold uppercase tracking-wider">
                    <tr>
                      {analysisResult.comparisonTable.headers.map((hdr, hIdx) => (
                        <th key={hIdx} className="p-4 border-r border-[#5A5A40] last:border-r-0">
                          {hdr}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#5A5A40]/15">
                    {analysisResult.comparisonTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#F5F5F0] transition-colors">
                        <td className="p-4 font-serif font-bold text-[#2D3A2D] bg-[#F5F5F0]/60 border-r border-[#5A5A40]/20">
                          {row.optionName}
                        </td>
                        <td className="p-4 border-r border-[#5A5A40]/15">{row.botanicalImpact}</td>
                        <td className="p-4 border-r border-[#5A5A40]/15">{row.effort}</td>
                        <td className="p-4 border-r border-[#5A5A40]/15">{row.costAndRisks}</td>
                        <td className="p-4">{row.longTermEffect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 3: IMPACT ANALYSIS & RECOMMENDATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Impact Analysis Text */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#5A5A40]/20 shadow-xs space-y-4">
              <h4 className="font-serif text-xl font-bold text-[#2D3A2D] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#A68069]" />
                3. Análise Detalhada de Impacto & Perenidade
              </h4>
              <div className="text-xs sm:text-sm text-[#2D3A2D] space-y-3 leading-relaxed whitespace-pre-line">
                {analysisResult.impactAnalysis}
              </div>
            </div>

            {/* Winner Recommendation & Action Plan */}
            <div className="bg-[#2D3A2D] text-[#F5F5F0] rounded-3xl p-6 sm:p-8 border border-[#5A5A40] shadow-md space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-[#2D3A2D] font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Opção Recomendada
                </div>

                <div>
                  <h4 className="font-serif text-xl font-bold text-[#F5F5F0] mb-2">
                    {analysisResult.recommendation.bestOption}
                  </h4>
                  <p className="text-xs text-[#F5F5F0]/90 leading-relaxed bg-[#5A5A40]/40 p-3.5 rounded-2xl border border-[#5A5A40]/60">
                    {analysisResult.recommendation.rationale}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    Passos de Ação Imediatos:
                  </span>
                  <ul className="space-y-1.5">
                    {analysisResult.recommendation.actionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="text-xs text-[#F5F5F0]/90 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#5A5A40] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#5A5A40] space-y-2">
                {selectedPlantId && (
                  <button
                    onClick={handleSaveToPlantTimeline}
                    className="w-full py-3 px-3 rounded-2xl bg-[#D4AF37] hover:bg-[#c29f2f] text-[#2D3A2D] font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Anexar à Linha do Tempo da Planta
                  </button>
                )}

                {savedSuccessMessage && (
                  <p className="text-[11px] text-[#D4AF37] text-center font-bold">
                    {savedSuccessMessage}
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
