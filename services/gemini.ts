import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MOCK_MOVIES } from '../constants';

// Initialize the API client
// Note: In a real production app, ensure strict error handling if key is missing.
const apiKey = process.env.API_KEY || 'dummy_key_for_ui_demo'; 
const ai = new GoogleGenAI({ apiKey });

export interface AIRecommendation {
  text: string;
}

const SYSTEM_INSTRUCTION = `
You are the AI Concierge for "Universal Movies Hub" (UMH), a premium movie streaming service.
Your tone is futuristic, witty, and helpful. 
You have access to the following current movie catalog:
${MOCK_MOVIES.map(m => `- ${m.title} (${m.year}): ${m.genre.join(', ')}. Plot: ${m.description}`).join('\n')}

When a user asks for a recommendation, prioritize movies from this list, but you can discuss general cinema knowledge.
Keep responses concise (under 100 words) and formatting clean.
`;

let chatSession: Chat | null = null;

export const getGeminiChat = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    if (apiKey === 'dummy_key_for_ui_demo') {
      // Simulate response if no key is provided to prevent crashing in preview environments
      await new Promise(r => setTimeout(r, 1000));
      return "I can't connect to the neural network (API Key missing), but I'd recommend checking out 'Cyberpunk Chronicles' for a thrill!";
    }

    const chat = getGeminiChat();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "I'm having trouble processing that request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Connection interrupted. Please try again later.";
  }
};
