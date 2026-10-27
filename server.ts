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
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

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

  // In-memory cache for species care guides to prevent redundant AI queries
  const speciesCareGuideCache = new Map<string, any>();

  // Species Care Guide Generation Endpoint via Gemini
  app.post("/api/species-care-guide", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || !apiKey.trim()) {
        return res.status(500).json({
          error: "A chave GEMINI_API_KEY não está configurada no servidor. Configure a chave para gerar orientações de cultivo.",
        });
      }

      const { scientificName, commonName, family } = req.body;

      if (!scientificName || typeof scientificName !== "string" || !scientificName.trim()) {
        return res.status(400).json({
          error: "O nome científico da espécie é obrigatório para consultar as orientações botânicas.",
        });
      }

      const cleanScientificName = scientificName.trim();
      const cacheKey = cleanScientificName.toLowerCase().replace(/\s+/g, " ");

      if (speciesCareGuideCache.has(cacheKey)) {
        return res.json({
          success: true,
          data: speciesCareGuideCache.get(cacheKey),
          cached: true,
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Você é o botânico especialista do aplicativo "Jardim". Sua missão é fornecer orientações de cultivo rigorosas, práticas e seguras para a espécie vegetal especificada.
Identificação botânica de referência:
- Nome científico: "${cleanScientificName}"
- Nome popular de referência: "${commonName ? String(commonName).trim() : "Não especificado"}"
- Família botânica: "${family ? String(family).trim() : "Não especificada"}"

DIRETRIZES DE CONTEÚDO E SEGURANÇA:
1. Rega:
   - "need": Nível de necessidade hídrica (ex: "Moderada", "Baixa / Secar entre regas", "Constante / Solo levemente úmido").
   - "checkMethod": Como testar na prática a umidade antes de molhar (ex: "Toque o dedo a 2-3 cm de profundidade no solo; se sair seco, regue").
   - "frequency": Frequência média de referência (ex: "Aprox. 1 a 2 vezes por semana no verão, a cada 10 a 15 dias no inverno").
   - "alert": Ressalva clara avisando que a frequência exata varia sempre com o ambiente, drenagem do vaso, substrato e estação do ano.

2. Iluminação:
   - "type": Exposição ideal (ex: "Luz indireta brilhante / Meia-sombra", "Sol pleno", "Sombra com boa luminosidade").
   - "idealLocation": Posição sugerida na casa (ex: "Próximo a janelas com cortina leve ou varanda protegida do sol das 11h às 15h").
   - "warning": Efeito do excesso ou falta de luz (ex: "Raios solares diretos intensos causam queimaduras foliares; pouca luz causa estiolamento").

3. Adubação:
   - "type": Tipo de adubo adequado (ex: "Adubo equilibrado NPK 10-10-10 ou orgânico como húmus de minhoca e bokashi").
   - "frequency": Frequência recomendada (ex: "A cada 30 a 45 dias na primavera e verão; suspender no outono e inverno").
   - "caution": Cuidados para não intoxicar a planta (ex: "Nunca aplique adubo mineral com solo seco para não queimar as raízes; prefira dosagens menores").

4. Substrato:
   - "drainage": Grau de drenagem e aeração exigidos (ex: "Excelente drenagem, evitando qualquer acúmulo de água nas raízes").
   - "idealMix": Composição prática recomendada (ex: "Mistura com 50% de terra vegetal, 30% de perlita/casca de arroz e 20% de casca de pinus").

5. Ambiente (Temperatura e Umidade):
   - "temperature": Faixa térmica ideal em °C (ex: "18°C a 27°C, tolera breves variações").
   - "humidity": Umidade relativa do ar (ex: "Moderada a alta (acima de 50%)").
   - "warning": Riscos climáticos (ex: "Sensível a geadas, ar condicionado direto e correntes de vento frio constante").

6. Manutenção:
   - "pruning": Como e quando podar (ex: "Remoção de folhas secas, velhas ou amareladas rente à base com tesoura esterilizada").
   - "repotting": Troca de vaso e renovação do substrato (ex: "A cada 1 a 2 anos na primavera, apenas quando as raízes preencherem o vaso").
   - "generalTips": Dica prática extra para iniciantes (ex: "Limpar as folhas com pano levemente úmido a cada 15 dias para favorecer a fotossíntese").

7. Transparência Botânica:
   - "isWellKnownSpecies": true se a espécie possuir literatura botânica consolidada; false se for espécie rara, híbrido incerto ou gênero genérico.
   - "confidenceNote": Mensagem orientando que os parâmetros são diretrizes biológicas da espécie e que o tutor deve observar as respostas reais da planta no seu vaso e ambiente específico.

Responda ESTRITAMENTE em formato JSON.`;

      // Candidate models: gemini-3.8-flash (primary per gemini-api skill) with fallback to gemini-3.6-flash
      const candidateModels = ["gemini-3.8-flash", "gemini-3.6-flash"];
      let geminiResponse: any = null;
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          geminiResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  scientificName: { type: Type.STRING },
                  commonName: { type: Type.STRING },
                  family: { type: Type.STRING },
                  isWellKnownSpecies: { type: Type.BOOLEAN },
                  watering: {
                    type: Type.OBJECT,
                    properties: {
                      need: { type: Type.STRING },
                      checkMethod: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      alert: { type: Type.STRING },
                    },
                    required: ["need", "checkMethod", "frequency", "alert"],
                  },
                  lighting: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      idealLocation: { type: Type.STRING },
                      warning: { type: Type.STRING },
                    },
                    required: ["type", "idealLocation", "warning"],
                  },
                  fertilization: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      frequency: { type: Type.STRING },
                      caution: { type: Type.STRING },
                    },
                    required: ["type", "frequency", "caution"],
                  },
                  substrate: {
                    type: Type.OBJECT,
                    properties: {
                      drainage: { type: Type.STRING },
                      idealMix: { type: Type.STRING },
                    },
                    required: ["drainage", "idealMix"],
                  },
                  environment: {
                    type: Type.OBJECT,
                    properties: {
                      temperature: { type: Type.STRING },
                      humidity: { type: Type.STRING },
                      warning: { type: Type.STRING },
                    },
                    required: ["temperature", "humidity", "warning"],
                  },
                  maintenance: {
                    type: Type.OBJECT,
                    properties: {
                      pruning: { type: Type.STRING },
                      repotting: { type: Type.STRING },
                      generalTips: { type: Type.STRING },
                    },
                    required: ["pruning", "repotting"],
                  },
                  confidenceNote: { type: Type.STRING },
                },
                required: [
                  "scientificName",
                  "isWellKnownSpecies",
                  "watering",
                  "lighting",
                  "fertilization",
                  "substrate",
                  "environment",
                  "maintenance",
                  "confidenceNote",
                ],
              },
            },
          });
          if (geminiResponse?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Tentativa de gerar guia com modelo ${model} falhou:`, err?.message || err);
        }
      }

      if (!geminiResponse?.text) {
        throw new Error(lastError?.message || "Não foi possível gerar as orientações botânicas.");
      }

      const parsed = JSON.parse(geminiResponse.text);

      const guideData = {
        scientificName: parsed.scientificName || cleanScientificName,
        commonName: parsed.commonName || (commonName ? String(commonName) : undefined),
        family: parsed.family || (family ? String(family) : undefined),
        isWellKnownSpecies: Boolean(parsed.isWellKnownSpecies),
        watering: {
          need: String(parsed.watering?.need || "Moderada"),
          checkMethod: String(parsed.watering?.checkMethod || "Verifique a umidade inserindo o dedo 2-3 cm no solo"),
          frequency: String(parsed.watering?.frequency || "1 a 2 vezes por semana"),
          alert: String(
            parsed.watering?.alert ||
              "Lembre-se: a frequência real de rega depende do vaso, do substrato, da ventilação e da época do ano."
          ),
        },
        lighting: {
          type: String(parsed.lighting?.type || "Luz indireta"),
          idealLocation: String(parsed.lighting?.idealLocation || "Próximo a janelas bem iluminadas"),
          warning: String(parsed.lighting?.warning || "Evite sol direto excessivo para não queimar as folhas."),
        },
        fertilization: {
          type: String(parsed.fertilization?.type || "NPK equilibrado ou adubo orgânico"),
          frequency: String(parsed.fertilization?.frequency || "A cada 30 a 60 dias no período de crescimento"),
          caution: String(
            parsed.fertilization?.caution ||
              "Nunca adube em solo ressecado e respeite a dosagem recomendada pelo fabricante."
          ),
        },
        substrate: {
          drainage: String(parsed.substrate?.drainage || "Boa drenagem"),
          idealMix: String(parsed.substrate?.idealMix || "Mistura aerada com matéria orgânica e perlita"),
        },
        environment: {
          temperature: String(parsed.environment?.temperature || "18°C a 27°C"),
          humidity: String(parsed.environment?.humidity || "Moderada a alta"),
          warning: String(parsed.environment?.warning || "Proteja contra correntes de ar frio intenso."),
        },
        maintenance: {
          pruning: String(parsed.maintenance?.pruning || "Remover folhas secas ou danificadas na base"),
          repotting: String(parsed.maintenance?.repotting || "Replantar a cada 1-2 anos se necessário"),
          generalTips: parsed.maintenance?.generalTips ? String(parsed.maintenance.generalTips) : undefined,
        },
        confidenceNote: String(
          parsed.confidenceNote ||
            "Orientações botânicas geradas a partir do nome científico. Monitore sempre as condições específicas do seu ambiente."
        ),
        source: "Assistente Botânico Jardim (IA)",
        lastUpdated: new Date().toISOString(),
      };

      // Save to server cache
      speciesCareGuideCache.set(cacheKey, guideData);

      return res.json({
        success: true,
        data: guideData,
        cached: false,
      });
    } catch (err: any) {
      console.error("Erro na rota /api/species-care-guide:", err);
      return res.status(500).json({
        error: err?.message || "Falha interna ao obter orientações de cuidados da espécie.",
      });
    }
  });

  // Pl@ntNet Official Plant Identification Endpoint
  app.post("/api/identify-plant", async (req, res) => {
    try {
      const apiKey = process.env.PLANTNET_API_KEY;
      if (!apiKey || !apiKey.trim()) {
        return res.status(500).json({
          error: "A chave PLANTNET_API_KEY não está configurada no servidor. Configure a chave nos Secrets do ambiente.",
        });
      }

      const { imageBase64, mimeType, organ } = req.body;

      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({
          error: "A imagem em formato base64 é obrigatória para identificação botânica.",
        });
      }

      let cleanBase64 = imageBase64.trim();
      let detectedMimeType = typeof mimeType === "string" && mimeType.trim() ? mimeType.trim() : "image/jpeg";

      // Detect and strip Data URI prefix (e.g., data:image/png;base64,...)
      const dataUriMatch = cleanBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
      if (dataUriMatch) {
        if (!mimeType) {
          detectedMimeType = dataUriMatch[1];
        }
        cleanBase64 = dataUriMatch[2].trim();
      }

      cleanBase64 = cleanBase64.replace(/\s/g, "");

      if (cleanBase64.length < 50) {
        return res.status(400).json({
          error: "O arquivo de imagem é inválido ou insuficiente para análise botânica.",
        });
      }

      // Allowed MIME types for Pl@ntNet
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const normalizedMime = detectedMimeType.toLowerCase();
      const finalMime = allowedMimes.includes(normalizedMime)
        ? (normalizedMime === "image/jpg" ? "image/jpeg" : normalizedMime)
        : "image/jpeg";

      let imageBuffer: Buffer;
      try {
        imageBuffer = Buffer.from(cleanBase64, "base64");
      } catch {
        return res.status(400).json({
          error: "Falha na decodificação base64 da imagem enviada.",
        });
      }

      // Size limit: 12MB
      const maxSizeBytes = 12 * 1024 * 1024;
      if (imageBuffer.length > maxSizeBytes) {
        return res.status(400).json({
          error: "A imagem excede o tamanho máximo permitido de 12MB. Envie uma foto menor ou compactada.",
        });
      }

      // Allowed organs for Pl@ntNet: leaf, flower, fruit, bark, auto
      const allowedOrgans = ["auto", "leaf", "flower", "fruit", "bark"];
      const organNormalized = typeof organ === "string" ? organ.trim().toLowerCase() : "auto";
      const selectedOrgan = allowedOrgans.includes(organNormalized) ? organNormalized : "auto";

      // Build multipart/form-data request using native Node 22 FormData and Blob
      const formData = new FormData();
      const imageBlob = new Blob([imageBuffer], { type: finalMime });
      const extension = finalMime === "image/png" ? "png" : finalMime === "image/webp" ? "webp" : "jpg";
      formData.append("images", imageBlob, `planta.${extension}`);
      formData.append("organs", selectedOrgan);

      // Construct official Pl@ntNet API URL with api-key query param and lang=pt
      const plantnetUrl = new URL("https://my-api.plantnet.org/v2/identify/all");
      plantnetUrl.searchParams.set("api-key", apiKey.trim());
      plantnetUrl.searchParams.set("lang", "pt");

      const plantnetResponse = await fetch(plantnetUrl.toString(), {
        method: "POST",
        body: formData,
      });

      // Handle specific HTTP status codes without leaking API key
      if (plantnetResponse.status === 404) {
        return res.json({
          success: true,
          candidates: [],
          message: "Nenhuma espécie botânica foi reconhecida com confiança para esta imagem. Tente enviar uma foto mais nítida, com boa iluminação e foco direto na folha ou flor.",
        });
      }

      if (plantnetResponse.status === 401 || plantnetResponse.status === 403) {
        console.error("Erro de autenticação Pl@ntNet: Chave inválida ou não autorizada (HTTP " + plantnetResponse.status + ")");
        return res.status(500).json({
          error: "Falha de autenticação na API Pl@ntNet. Verifique se a chave PLANTNET_API_KEY é válida.",
        });
      }

      if (plantnetResponse.status === 429) {
        return res.status(429).json({
          error: "O limite de requisições da API Pl@ntNet foi atingido para este período. Aguarde alguns instantes antes de tentar novamente.",
        });
      }

      if (plantnetResponse.status === 400) {
        const errorBody: any = await plantnetResponse.json().catch(() => ({}));
        return res.status(400).json({
          error: errorBody?.message || "A imagem enviada não foi aceita pela API Pl@ntNet. Use imagens nos formatos JPEG, PNG ou WEBP.",
        });
      }

      if (!plantnetResponse.ok) {
        return res.status(502).json({
          error: `Erro ao consultar serviço Pl@ntNet (Status ${plantnetResponse.status}). Tente novamente mais tarde.`,
        });
      }

      const json: any = await plantnetResponse.json();
      const rawResults = Array.isArray(json?.results) ? json.results : [];
      const bestMatch = typeof json?.bestMatch === "string" ? json.bestMatch : "";
      const remainingRequests = typeof json?.remainingIdentificationRequests === "number" ? json.remainingIdentificationRequests : undefined;

      const candidates = rawResults.slice(0, 8).map((item: any) => {
        const rawScore = typeof item?.score === "number" ? item.score : 0;
        const scorePercentage = Math.round(rawScore * 1000) / 10;
        const sp = item?.species || {};
        const scientificName = String(sp?.scientificName || sp?.scientificNameWithoutAuthor || "Espécie desconhecida").trim();
        const scientificNameWithoutAuthor = String(sp?.scientificNameWithoutAuthor || scientificName).trim();
        const commonNames = Array.isArray(sp?.commonNames)
          ? sp.commonNames.map((n: any) => String(n).trim()).filter((n: string) => n.length > 0)
          : [];
        const family = sp?.family?.scientificNameWithoutAuthor ? String(sp.family.scientificNameWithoutAuthor).trim() : undefined;
        const genus = sp?.genus?.scientificNameWithoutAuthor ? String(sp.genus.scientificNameWithoutAuthor).trim() : undefined;

        let sampleImageUrl: string | undefined;
        if (Array.isArray(item?.images) && item.images.length > 0) {
          sampleImageUrl = item.images[0]?.url?.s || item.images[0]?.url?.m || item.images[0]?.url?.o;
        }

        return {
          score: rawScore,
          scorePercentage,
          scientificName,
          scientificNameWithoutAuthor,
          commonNames,
          family,
          genus,
          sampleImageUrl,
        };
      });

      return res.json({
        success: true,
        bestMatch,
        candidates,
        remainingRequests,
      });
    } catch (err: any) {
      console.error("Erro na rota /api/identify-plant:", err?.message || err);
      return res.status(500).json({
        error: "Erro interno no servidor ao processar identificação com Pl@ntNet.",
      });
    }
  });

  // Gemini Plant Identification Endpoint
  app.post("/api/ai/identify-plant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Chave GEMINI_API_KEY não configurada no servidor.",
        });
      }

      const { imageBase64, mimeType, userNotes } = req.body;

      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({
          error: "A imagem em formato base64 é obrigatória.",
        });
      }

      let cleanBase64 = imageBase64.trim();
      let detectedMimeType = typeof mimeType === "string" && mimeType.trim() ? mimeType.trim() : "image/jpeg";

      // Detect and strip Data URI scheme (e.g., data:image/png;base64,...)
      const dataUriMatch = cleanBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
      if (dataUriMatch) {
        if (!mimeType) {
          detectedMimeType = dataUriMatch[1];
        }
        cleanBase64 = dataUriMatch[2].trim();
      }

      // Strip whitespace or newline characters from base64 string
      cleanBase64 = cleanBase64.replace(/\s/g, "");

      if (cleanBase64.length < 50) {
        return res.status(400).json({
          error: "O conteúdo base64 fornecido é inválido ou insuficiente para uma imagem.",
        });
      }

      const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
      if (!allowedMimes.includes(detectedMimeType.toLowerCase())) {
        detectedMimeType = "image/jpeg";
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Você é um botânico especialista do aplicativo "Jardim". Sua missão é analisar com rigor a fotografia fornecida e identificar a espécie vegetal com honestidade científica e cautela.

DIRETRIZES DE IDENTIFICAÇÃO BOTÂNICA:
1. Análise morfológica da foto:
   - "isPlant": Marque como false se a imagem for de um objeto inanimado, animal, pessoa, paisagem distante sem foco botânico ou imagem escura/desfocada onde não seja possível distinguir tecidos vegetais.
   - "commonName": Nome popular predominante no Brasil (ex: "Costela-de-adão", "Jiboia", "Zamioculca") quando identificável. Se a identificação for incerta ou a foto não for planta, retorne null.
   - "scientificName": Nome científico binomial em latim (ex: "Monstera deliciosa", "Epipremnum aureum"). Se a espécie exata não puder ser confirmada, use o gênero provável (ex: "Philodendron sp.") ou null. Não afirme com certeza se os caracteres diagnósticos estiverem ausentes.
   - "confidence": Grau qualitativo estrito: "alto", "medio" ou "baixo".
     * "alto": Somente quando estruturas diagnósticas inequívocas da espécie estiverem nítidas.
     * "medio": Quando o gênero é evidente, mas a espécie/cultivar exata apresenta ambiguidade.
     * "baixo": Quando a foto for distante, desfocada, ou houver múltiplas espécies muito semelhantes.
   - "isReliable": Indicação explícita: marque true SOMENTE se a identificação for segura e sem ambiguidades. Se houver qualquer dúvida razoável, marque false.
   - "alternativeSpecies": Lista de outras espécies possíveis ou morfologicamente semelhantes em caso de dúvida (array vazio se a identificação for inequívoca).
   - "generalBotanicalCare": Informações gerais teóricas da espécie botânica:
     * "lighting": Requisitos de luminosidade fisiológica da espécie (ex: Sol pleno, Meia-sombra, Luz filtrada).
     * "watering": Regime fisiológico de irrigação geral da espécie.
     * "pruning": Diretrizes gerais de poda e limpeza botânica.
     * "fertilization": Necessidades nutricionais botânicas gerais.
     (Caso isPlant seja false, preencha com "Não aplicável").

2. DIFERENCIAÇÃO CRUCIAL (Informações Gerais vs. Ambiente Individual):
   - "environmentalConsiderations": Ressalva explícita diferenciando as necessidades teóricas da espécie das condições reais da planta individual no ambiente do usuário. Explique como fatores práticos como drenagem do vaso, substrato, umidade relativa do ar, ventilação e posição da janela alteram a rotina de rega e cuidados.

3. NOTAS E RESSALVAS:
   - "identificationNotes": Explique detalhadamente os caracteres morfológicos observados na foto (ex: formato da lâmina foliar, nervuras, filotaxia) e registre as limitações da imagem, advertindo o usuário sobre qualquer incerteza.

${userNotes ? `Informações adicionais fornecidas pelo usuário: "${String(userNotes).slice(0, 300)}"` : ""}

Responda ESTRITAMENTE em formato JSON.`;

      const imagePart = {
        inlineData: {
          mimeType: detectedMimeType,
          data: cleanBase64,
        },
      };

      const textPart = {
        text: prompt,
      };

      // Primary model: gemini-3.6-flash (reliable, multimodal, low-latency) with fallback to gemini-3.8-flash
      const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash"];
      let geminiResponse: any = null;
      let lastError: any = null;

      for (const model of candidateModels) {
        try {
          geminiResponse = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  isPlant: { type: Type.BOOLEAN },
                  commonName: { type: Type.STRING },
                  scientificName: { type: Type.STRING },
                  confidence: { type: Type.STRING, enum: ["alto", "medio", "baixo"] },
                  isReliable: { type: Type.BOOLEAN },
                  alternativeSpecies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  generalBotanicalCare: {
                    type: Type.OBJECT,
                    properties: {
                      lighting: { type: Type.STRING },
                      watering: { type: Type.STRING },
                      pruning: { type: Type.STRING },
                      fertilization: { type: Type.STRING },
                    },
                    required: ["lighting", "watering", "pruning", "fertilization"],
                  },
                  environmentalConsiderations: { type: Type.STRING },
                  identificationNotes: { type: Type.STRING },
                },
                required: [
                  "isPlant",
                  "confidence",
                  "isReliable",
                  "alternativeSpecies",
                  "generalBotanicalCare",
                  "environmentalConsiderations",
                  "identificationNotes",
                ],
              },
            },
          });
          if (geminiResponse?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Tentativa com modelo ${model} falhou:`, err?.message || err);
        }
      }

      if (!geminiResponse?.text) {
        throw new Error(lastError?.message || "O serviço Gemini não retornou resposta válida.");
      }

      const rawParsed = JSON.parse(geminiResponse.text);

      // Sanitize and validate fields on the server before sending to client
      const isPlant = Boolean(rawParsed.isPlant);
      const isReliable = Boolean(rawParsed.isReliable);
      const confidence = ["alto", "medio", "baixo"].includes(rawParsed.confidence)
        ? rawParsed.confidence
        : "baixo";

      const commonName = isPlant && rawParsed.commonName && rawParsed.commonName !== "N/A"
        ? String(rawParsed.commonName).trim()
        : null;

      const scientificName = isPlant && rawParsed.scientificName && rawParsed.scientificName !== "N/A"
        ? String(rawParsed.scientificName).trim()
        : null;

      const alternativeSpecies = Array.isArray(rawParsed.alternativeSpecies)
        ? rawParsed.alternativeSpecies
            .map((item: any) => String(item).trim())
            .filter((item: string) => item.length > 0 && item !== "N/A")
        : [];

      const generalBotanicalCare = {
        lighting: String(rawParsed.generalBotanicalCare?.lighting || "Não especificado"),
        watering: String(rawParsed.generalBotanicalCare?.watering || "Não especificado"),
        pruning: String(rawParsed.generalBotanicalCare?.pruning || "Não especificado"),
        fertilization: String(rawParsed.generalBotanicalCare?.fertilization || "Não especificado"),
      };

      const environmentalConsiderations = String(
        rawParsed.environmentalConsiderations ||
          "As recomendações botânicas acima são gerais para a espécie. As necessidades reais de rega e luminosidade dependem diretamente do ambiente de cultivo (tamanho do vaso, drenagem, substrato e microclima)."
      );

      const identificationNotes = String(
        rawParsed.identificationNotes ||
          "Identificação automatizada realizada com base nas características botânicas visíveis na fotografia."
      );

      const result = {
        isPlant,
        commonName,
        scientificName,
        confidence,
        isReliable,
        alternativeSpecies,
        generalBotanicalCare,
        environmentalConsiderations,
        identificationNotes,
      };

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("Erro na rota /api/ai/identify-plant:", err);
      return res.status(500).json({
        error: err?.message || "Falha interna ao identificar a planta pela imagem.",
      });
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
