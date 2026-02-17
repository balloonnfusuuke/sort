import { GoogleGenAI, Type } from "@google/genai";
import { Participant } from "../types";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

// New function to just predict readings for a list of participants
export const predictReadings = async (targets: Participant[]): Promise<{id: string, reading: string}[]> => {
    const ai = getAiClient();
    
    // Create a simplified list for the prompt
    const inputList = targets.map(p => ({
        id: p.id,
        name: p.normalizedName
    }));

    const dataString = JSON.stringify(inputList);

    const prompt = `
      You are an expert Japanese secretary.
      I have a list of names (mostly Kanji) that I cannot sort because I don't know the reading (Yomigana).
      
      Please provide the "reading" for each name in full-width Katakana.
      
      Rules:
      1. Return JSON array of objects with "id" and "reading".
      2. "reading" MUST be full-width Katakana (e.g., "タナカ", "サトウ").
      3. If you are extremely unsure or it looks like a foreign name that shouldn't be katakana-ized blindly, return an empty string "" for the reading.
      4. Do NOT change the ID.

      Input Data:
      ${dataString}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            reading: { type: Type.STRING, description: "Full width Katakana reading" }
                        },
                        required: ["id", "reading"]
                    }
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) return [];

        const parsedItems = JSON.parse(jsonText);
        return parsedItems;

    } catch (error) {
        console.error("Gemini Prediction Error:", error);
        throw new Error("Failed to predict readings.");
    }
};

// Kept for backward compatibility or reference, but mostly unused in new flow
export const normalizeRosterData = async (rawData: any[]): Promise<Participant[]> => {
    // ... (Old logic, effectively deprecated in this update)
    return [];
};
