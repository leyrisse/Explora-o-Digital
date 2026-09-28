import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Jardim API" });
  });

  // Gemini Decision Analysis Endpoint
  app.post("/api/analyze-decision", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chave GEMINI_API_KEY não configurada no servidor." });
      }

      const { title, context, options, category } = req.body;

      if (!title) {
        return res.status(400).json({ error: "O título da decisão é obrigatório." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const optionsList = Array.isArray(options) && options.length > 0 
        ? options.join(", ") 
        : "Opções implícitas para avaliação do usuário";

      const prompt = `Você é o Assistente Botânico & Estratégico do aplicativo "Jardim" - um ecossistema digital para amantes de plantas que valoriza o bem-estar das plantas, a perenidade do histórico e a comunidade.

O usuário precisa tomar uma decisão importante:
- Título da Decisão: "${title}"
- Categoria: "${category || "Cuidados com Plantas / Gestão do Jardim"}"
- Contexto Adicional: "${context || "Nenhum contexto extra fornecido"}"
- Opções sob consideração: "${optionsList}"

Sua tarefa é analisar rigorosamente as opções com empatia, conhecimento botânico/prático e visão de longo prazo. Forneça uma resposta estruturada em formato JSON contendo:
1. "summary": Um resumo executivo claro e acolhedor (2-3 frases em Português).
2. "prosAndCons": Uma lista de opções avaliadas, onde cada item tem:
   - "optionName": Nome da opção
   - "pros": Array de 2-4 prós detalhados
   - "cons": Array de 2-4 contras detalhados
   - "score": Nota de 1 a 10 para a viabilidade/saúde
   - "riskLevel": "Baixo", "Médio" ou "Alto"
3. "comparisonTable":
   - "headers": Array de nomes de colunas (ex: ["Opção", "Impacto Botânico / Prático", "Esforço Necessário", "Custo / Riscos", "Efeito no Histórico"])
   - "rows": Array de objetos com "optionName", "botanicalImpact", "effort", "costAndRisks", "longTermEffect"
4. "impactAnalysis": Análise em texto corrido (3 parágrafos) cobrindo saúde da planta/ecossistema, praticidade diária e preservação da memória no RG Digital.
5. "recommendation":
   - "bestOption": A melhor escolha recomendada
   - "rationale": Por que esta é a melhor opção com base nas evidências
   - "actionSteps": Array de 3 a 5 passos práticos imediatos para executar a decisão com segurança

Responda ESTRITAMENTE no formato JSON com a estrutura solicitada em Português do Brasil.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              prosAndCons: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    optionName: { type: Type.STRING },
                    pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                    score: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING },
                  },
                  required: ["optionName", "pros", "cons", "score", "riskLevel"],
                },
              },
              comparisonTable: {
                type: Type.OBJECT,
                properties: {
                  headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        optionName: { type: Type.STRING },
                        botanicalImpact: { type: Type.STRING },
                        effort: { type: Type.STRING },
                        costAndRisks: { type: Type.STRING },
                        longTermEffect: { type: Type.STRING },
                      },
                      required: ["optionName", "botanicalImpact", "effort", "costAndRisks", "longTermEffect"],
                    },
                  },
                },
                required: ["headers", "rows"],
              },
              impactAnalysis: { type: Type.STRING },
              recommendation: {
                type: Type.OBJECT,
                properties: {
                  bestOption: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["bestOption", "rationale", "actionSteps"],
              },
            },
            required: ["summary", "prosAndCons", "comparisonTable", "impactAnalysis", "recommendation"],
          },
        },
      });

      const jsonText = response.text || "{}";
      const resultData = JSON.parse(jsonText);
      res.json({ success: true, data: resultData });
    } catch (err: any) {
      console.error("Erro na rota /api/analyze-decision:", err);
      res.status(500).json({ error: err?.message || "Falha ao processar análise da IA." });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌿 Servidor do Jardim rodando na porta ${PORT}`);
  });
}

startServer();
