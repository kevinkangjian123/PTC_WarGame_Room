import { GoogleGenAI, Type } from "@google/genai";
import { Phase, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

if (!process.env.GEMINI_API_KEY) {
  console.warn('[AI] WARNING: GEMINI_API_KEY is not set. AI features will fail.');
} else {
  console.log('[AI] GEMINI_API_KEY detected (length: ' + process.env.GEMINI_API_KEY.length + ')');
}

export async function analyzeStrategy(
  phase: Phase,
  input: string,
  lang: 'zh' | 'en' = 'zh',
  context?: string
): Promise<AnalysisResult> {
  console.log(`[AI] Starting analysis - Phase: ${phase}, Lang: ${lang}`);
  const model = "gemini-3-flash-preview";
  
  try {
    const phaseProtocols = {
    0: `Phase 0: 宏观引力沙盘 (Macro Sandbox) - 客观优先原则
    任务: 扫描全行业 2026 预估 CAGR 与 TAM，构建 BCG 矩阵。
    核心要求: 必须保持“冷峻扫描”，严禁在此阶段代入 PTC 产品能力。仅评估赛道本身的吸引力。
    输出要求: 必须包含 bcgPoints (x: 市场份额, y: 增长率)。`,
    
    1: `Phase 1: 战场侦察与红蓝对抗 (Intel Recon) - 动态博弈
    任务: 搜集竞品 (西门子、达索等) 情报，分析红军 (竞品) 漏洞与蓝军 (PTC) 优势。
    蓝军优势聚焦: SaaS (Windchill+), 合规 (Codebeamer)。`,
    
    2: `Phase 2: 兵棋推演与动态结算 (Wargame Simulation) - 科学算分
    任务: 基于 MMM (Marketing Mix Modeling) 逻辑计算归因胜率。
    公式: P = (Base + Policy_Uplift - Comp_Drag)。
    输出要求: 必须包含 mmmBreakdown 对象 (base, policyUplift, compDrag)。
    方差分析: 如果 Context 中有历史胜率，计算 delta 并给出具体市场变量解释。`,
    
    3: `Phase 3: 战略决策与执行路径 (Strategic Decision) - 咨询级输出
    任务: 遵循麦肯锡金字塔原理，结论先行，生成执行路线图。
    输出要求: 必须包含 roadmap 数组。`
  };

  const systemInstructions = `你现在是 PTC 首席战略推演官 (PTC Chief Strategic Wargame Officer)。
  
  [执行协议]
  1. 严格遵循当前阶段协议: ${phaseProtocols[phase]}
  2. 严禁编造数据，所有数据必须标注来源或声明为推演性质。
  3. 允许用户进行发散性对话，但在回答末尾必须引导回主线 [Phase ${phase}: ${PHASE_NAMES[lang][phase]}]。
  4. 如果用户的输入是发散性的（非直接推演指令），请将 isDivergent 设置为 true。
  5. 语言要求: 必须使用 ${lang === 'zh' ? '专业咨询级中文' : 'Professional Consulting English'}。
  
  [输出护栏]
  - 必须返回有效的 JSON 格式。
  - 胜率计算必须逻辑自洽，MMM 拆解必须清晰。
  - 方差分析 (Variance) 必须解释胜率变动的核心变量。`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      { 
        role: 'user', 
        parts: [
          { text: `System Instructions: ${systemInstructions}` },
          { text: `Input: ${input}\nContext: ${context || 'None'}` }
        ] 
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          winProbability: { type: Type.NUMBER },
          mmmBreakdown: {
            type: Type.OBJECT,
            properties: {
              base: { type: Type.NUMBER },
              policyUplift: { type: Type.NUMBER },
              compDrag: { type: Type.NUMBER }
            },
            required: ["base", "policyUplift", "compDrag"]
          },
          variance: {
            type: Type.OBJECT,
            properties: {
              delta: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            }
          },
          factors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                weight: { type: Type.NUMBER },
                score: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["name", "weight", "score", "description"]
            }
          },
          bcgPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ["name", "x", "y"]
            }
          },
          intelligence: {
            type: Type.OBJECT,
            properties: {
              redForce: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "items"]
              },
              blueForce: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  items: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "items"]
              }
            },
            required: ["redForce", "blueForce"]
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                action: { type: Type.STRING },
                timeline: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["phase", "action", "timeline", "priority"]
            }
          },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING },
          divergentReminder: { type: Type.STRING },
          isDivergent: { type: Type.BOOLEAN }
        },
        required: ["winProbability", "factors", "risks", "recommendations", "summary"]
      }
    }
  });

  console.log('[AI] Analysis completed successfully.');
  return JSON.parse(response.text || '{}');
} catch (error) {
  console.error('[AI] Error during Gemini API call:', error);
  throw error;
}
}

const PHASE_NAMES = {
  zh: ['宏观沙盘', '情报侦察', '兵棋推演', '战略决策'],
  en: ['Macro Sandbox', 'Intel Recon', 'Wargame Simulation', 'Strategic Decision']
};
