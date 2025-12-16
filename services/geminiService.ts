import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the uploaded house image to determine style and recommendations.
 */
export const analyzeHouseImage = async (base64Image: string, mimeType: string, language: Language): Promise<AnalysisResult> => {
  try {
    const langInstruction = language === 'es' ? 'IMPORTANT: Respond in Spanish. The values for style, recommendations, and reasoning must be in Spanish.' : 'Respond in English.';
    const prompt = `
      Analyze this image of a house. 
      1. Identify the architectural style (e.g., Colonial, Modern, Ranch, etc.).
      2. Suggest 3 types of roofing materials that would best complement this specific house style and color palette.
      3. Provide a brief reasoning for these recommendations.
      
      ${langInstruction}
      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            reasoning: { type: Type.STRING }
          },
          required: ["style", "recommendations", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis received from AI.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * Generates a specific insight about why a material fits the specific house.
 */
export const getMaterialInsight = async (
  base64Image: string, 
  mimeType: string, 
  style: string, 
  materialName: string,
  language: Language
): Promise<string> => {
  try {
    const langInstruction = language === 'es' 
      ? 'CRITICAL: Write the response in Spanish.' 
      : 'CRITICAL: Write the response in English.';

    const prompt = `
      You are an expert building scientist and roofing consultant.
      Provide a detailed technical breakdown of the benefits of ${materialName} roofing for a ${style} house.
      
      CRITICAL INSTRUCTION: Focus ONLY on functional advantages. Do NOT discuss aesthetics or visual style.
      
      Include specific details on:
      1. Weather resistance (e.g., wind uplift ratings, leak prevention mechanisms).
      2. Energy performance (e.g., thermal mass, UV reflectivity, insulation value).
      3. Longevity and maintenance.

      Start directly with the benefits. 
      Use professional, engaging language. 
      ${langInstruction}
      Keep the response between 40-60 words to ensure it is concise enough to be read aloud clearly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      },
    });

    return response.text || (language === 'es' 
      ? `${materialName} ofrece una protección superior contra la intemperie y propiedades de eficiencia energética que reducen los costos a largo plazo.` 
      : `${materialName} offers superior weather protection and energy efficiency properties that reduce long-term costs.`);
  } catch (error) {
    console.error("Insight generation failed:", error);
    return language === 'es'
      ? `${materialName} es conocido por su durabilidad excepcional y capacidad de prevención de fugas.`
      : `${materialName} is known for its exceptional durability and leak prevention capabilities.`;
  }
};

/**
 * Generates a new version of the house image with the selected roof.
 */
export const generateNewRoof = async (
  base64Image: string, 
  mimeType: string, 
  materialName: string, 
  colorName: string,
  analysisStyle: string
): Promise<string> => {
  try {
    // Specific prompt engineering for image editing
    // Note: Image editing prompts are typically best in English for the model, regardless of UI language
    const prompt = `
      Edit this image of a ${analysisStyle} house.
      Replace the existing roof with a ${colorName} ${materialName} roof.
      
      CRITICAL INSTRUCTIONS:
      - ONLY change the roof. Do not change the walls, windows, sky, or landscaping.
      - Maintain the exact perspective, lighting, and shadows of the original photo.
      - The new roof texture must be photorealistic and high resolution.
      - Ensure the roof edges blend naturally with the existing structure.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      },
    });

    // Extract the image from the response
    let generatedImageBase64 = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break; // Found the image
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("No image generated by the model.");
    }

    return generatedImageBase64;
  } catch (error) {
    console.error("Roof generation failed:", error);
    throw error;
  }
};