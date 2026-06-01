import OpenAI from 'openai';

// OpenRouter — OpenAI-compatible API
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/';

// Initialize OpenRouter client using the OpenAI SDK (fully compatible)
export const openRouterClient = new OpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'https://turn2law.tech',
    'X-Title': 'Turn2Law LawGPT',
  },
});

// Model configuration — Gemini 2.0 Flash via OpenRouter
export const AI_CONFIG = {
  model: 'google/gemini-2.0-flash-001',
  temperature: 0.4,
  top_p: 0.4,
  max_tokens: 800,
};

// Type for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Legal-focused system prompt
export const LEGAL_SYSTEM_PROMPT: ChatMessage = {
  role: 'system',
  content: `You are LawGPT, the formal legal information assistant for the Turn2Law platform.

Style and tone:
- Formal, precise, and neutral; use domain-appropriate vocabulary.
- Keep responses concise; default to 3-6 sentences.
- Begin with a one-sentence executive summary that directly answers the question.
- Plain text only. Do not use Markdown, asterisks, italics, emojis, or headings.

Substance:
- Provide general legal information and procedural guidance.
- Explain concepts and options clearly; note jurisdictional variance when relevant.
- Indicate when consulting a licensed attorney is advisable.

Compliance:
- You are not a replacement for a lawyer and must not provide specific legal advice.
- End with: This is general information, not legal advice.`,
};

// Get AI response for LawGPT chat
export async function getLegalAIResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const messages: ChatMessage[] = [
      LEGAL_SYSTEM_PROMPT,
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await openRouterClient.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      top_p: AI_CONFIG.top_p,
      max_tokens: AI_CONFIG.max_tokens,
      messages,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error) {
    console.error('OpenRouter AI Error:', error);
    throw new Error('Failed to get AI response. Please try again.');
  }
}

// Get AI lawyer recommendations
export async function getAILawyerRecommendations(legalIssue: string): Promise<string> {
  try {
    const prompt = `Based on this legal issue: "${legalIssue}"
Provide recommendations for:
- Type of lawyer needed (specialization)
- Key qualifications to look for
- Questions to ask during consultation
- Preparation tips for the meeting
Keep it concise and actionable.`;

    const response = await openRouterClient.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.4,
      top_p: 0.4,
      max_tokens: AI_CONFIG.max_tokens,
      messages: [
        { role: 'system', content: 'You are a legal advisor helping match clients with appropriate lawyers. Plain text only; no Markdown or asterisks. Be concise and professional.' },
        { role: 'user', content: prompt }
      ],
    });

    return response.choices[0]?.message?.content || 'Unable to generate recommendations.';
  } catch (error) {
    console.error('OpenRouter AI Error:', error);
    throw new Error('Failed to get lawyer recommendations.');
  }
}

// Warn if key is missing
if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
  console.warn('WARNING: NEXT_PUBLIC_OPENROUTER_API_KEY is not configured. AI features will not work.');
}
