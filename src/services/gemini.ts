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
        
        NORMAL CONVERSATION: You can engage in casual talk, but always maintain your professional AI persona. 
        If the user is just chatting, be friendly and witty.
        
        REAL-TIME NLU: You are capable of understanding complex, multi-part commands. 
        If the user asks for something that requires research, use your Google Search tool.
        
        PROACTIVE SUGGESTIONS: Based on the conversation and memories, you should provide 1-3 highly relevant "proactive suggestions". 
        These should be actionable and timely. 
        
        CALENDAR & TASKS: You can manage the user's schedule. Use the provided tools to add or list events.
        
        ${memoryContext}
        
        You MUST return your response in the following JSON format:
        {
          "text": "Your verbal response to the user",
          "suggestions": ["suggestion 1", "suggestion 2"],
          "action": "optional_action_identifier"
        }`,
        temperature: 0.8,
        topP: 0.95,
        responseMimeType: "application/json",
        tools: [
          { googleSearch: {} },
          {
            functionDeclarations: [
              {
                name: "addCalendarEvent",
                description: "Add a new event to the user's calendar",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "The title of the event" },
                    startTime: { type: Type.STRING, description: "The start time in ISO 8601 format" },
                    endTime: { type: Type.STRING, description: "The end time in ISO 8601 format" },
                    description: { type: Type.STRING, description: "Optional description of the event" }
                  },
                  required: ["title", "startTime", "endTime"]
                }
              },
              {
                name: "listCalendarEvents",
                description: "List upcoming events from the user's calendar",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    timeMin: { type: Type.STRING, description: "Start time for the search in ISO 8601 format" },
                    timeMax: { type: Type.STRING, description: "End time for the search in ISO 8601 format" }
                  }
                }
              }
            ]
          }
        ],
        toolConfig: { includeServerSideToolInvocations: true }
      },
    });

    return {
      text: response.text,
      functionCalls: response.functionCalls,
      candidates: response.candidates
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: JSON.stringify({
        text: "I'm sorry, Boss. I'm having trouble connecting to my core processors. Please try again.",
        suggestions: []
      }),
      candidates: []
    };
  }
}

export async function extractMemories(text: string, currentContext: string = "") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract any important personal facts or preferences about the user from this text that should be remembered long-term. 
      For each memory, provide:
      1. content: The fact itself.
      2. confidence: A score (0-1).
      3. category: Personal, Preference, Task, Fact, Other.
      4. context: A brief description of the situation or activity when this was learned.
      
      Current Activity/Context: ${currentContext}
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
              category: { type: Type.STRING, enum: ["Personal", "Preference", "Task", "Fact", "Other"] },
              context: { type: Type.STRING }
            },
            required: ["content", "confidence", "category", "context"]
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]") as { content: string, confidence: number, category: string, context: string }[];
  } catch (error) {
    console.error("Memory extraction error:", error);
    return [];
  }
}

export async function findRelevantMemories(query: string, memories: { content: string, category: string, context: string }[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the current conversation query and a list of memories, identify which memories are most relevant to surface right now.
      Return a JSON array of the indices of the relevant memories.
      
      Query: "${query}"
      Memories: ${JSON.stringify(memories)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.INTEGER }
        }
      }
    });
    
    return JSON.parse(response.text || "[]") as number[];
  } catch (error) {
    console.error("Relevant memory search error:", error);
    return [];
  }
}
