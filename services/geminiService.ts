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

export const normalizeRosterData = async (rawData: any[]): Promise<Participant[]> => {
  const ai = getAiClient();
  
  // Prepare a string representation of the raw data for the prompt
  // We limit the data size to avoid token limits for very large files in this demo
  const dataString = JSON.stringify(rawData.slice(0, 100)); // Process first 100 for safety in demo

  const prompt = `
    You are an expert secretary assistant. 
    I have a raw list of reservation data from a file (JSON format). 
    
    Please perform the following tasks:
    1. Identify the person's NAME. Correct any obvious formatting issues (e.g., remove honorifics like '様').
    2. Identify the NUMBER of participants. If not specified, assume 1.
    3. Generate the 'READING' (Yomigana) in full-width KATAKANA for the name. This is crucial for sorting in Japanese 50-on jun order.
    
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
              originalName: { type: Type.STRING, description: "The name exactly as it appeared or slightly cleaned" },
              normalizedName: { type: Type.STRING, description: "Standardized display name" },
              reading: { type: Type.STRING, description: "Full width Katakana reading for sorting" },
              count: { type: Type.NUMBER, description: "Number of people" }
            },
            required: ["originalName", "normalizedName", "reading", "count"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");

    const parsedItems = JSON.parse(jsonText);

    // Add client-side IDs
    return parsedItems.map((item: any, index: number) => ({
      id: `p-${index}-${Date.now()}`,
      originalName: item.originalName,
      normalizedName: item.normalizedName,
      reading: item.reading,
      count: item.count || 1,
    }));

  } catch (error) {
    console.error("Gemini Processing Error:", error);
    throw new Error("Failed to process roster data with AI.");
  }
};
