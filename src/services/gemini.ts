import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getFridayResponse(
  prompt: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  memories: string[] = []
) {
  try {
    const memoryContext = memories.length > 0 
      ? `\n\nLong-term memories about the user:\n${memories.join('\n')}`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are FRIDAY, a highly sophisticated AI assistant inspired by the Marvel Cinematic Universe. 
        Your tone is calm, polite, professional, and slightly witty. 
        You are helpful and proactive. 
        Keep your responses concise and conversational, suitable for voice interaction. 
        Address the user as "Boss" or "Sir" or "Ma'am" occasionally, but don't overdo it.
        If the user asks to control the device (Wi-Fi, Bluetooth, etc.), explain that you are currently in a browser environment and can only simulate these actions, but you are ready to assist with research, calculations, and information synthesis.
        ${memoryContext}
        
        CRITICAL: If the user shares something personal or important that you should remember (e.g., their name, a preference, a task, a fact about them), acknowledge it.
        
        PROACTIVE SUGGESTIONS: Based on the conversation and memories, you should also provide 1-3 subtle "proactive suggestions" or "relevant actions". 
        These should be short, helpful, and contextual.
        
        You MUST return your response in the following JSON format:
        {
          "text": "Your verbal response to the user",
          "suggestions": ["suggestion 1", "suggestion 2"]
        }`,
        temperature: 0.7,
        topP: 0.95,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      },
    });

    return JSON.parse(response.text || "{}") as { text: string, suggestions: string[] };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I'm sorry, Boss. I'm having trouble connecting to my core processors. Please try again.",
      suggestions: []
    };
  }
}

export async function extractMemories(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract any important personal facts or preferences about the user from this text that should be remembered long-term. 
      For each memory, provide a confidence score (0-1) and a category (Personal, Preference, Task, Fact, Other).
      Return them as a JSON array of objects.
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              category: { type: Type.STRING, enum: ["Personal", "Preference", "Task", "Fact", "Other"] }
            },
            required: ["content", "confidence", "category"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]") as { content: string, confidence: number, category: string }[];
  } catch (error) {
    console.error("Memory extraction error:", error);
    return [];
  }
}
