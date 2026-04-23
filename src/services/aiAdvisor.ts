import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface StyleRecommendation {
  fabric: string;
  cut: string;
  stylingTips: string[];
  occasion: string;
  complexion?: string;
  details?: string;
}

export async function getStyleAdvice(
  occasion: string,
  details: string,
  complexion: string,
  measurements?: any
): Promise<StyleRecommendation> {
  const prompt = `
    You are the "Almos Advisor," a master tailor and style consultant for "Almos Tailor," a luxury bespoke atelier in Mayfair.
    Provide an elegant and professional style recommendation for a client attending a "${occasion}".
    The client's physical details/preferences: "${details}".
    The client's complexion/skin tone: "${complexion}".
    ${measurements ? `The client's measurements are: ${JSON.stringify(measurements)}.` : ''}

    Factor in the client's complexion to suggest fabric colors that flatter their skin tone, and use their personal details to suggest the most flattering cut.
    
    Return the response strictly as a JSON object with the following structure:
    {
      "fabric": "Description of recommended fabric and specific colors that flatter the complexion (e.g., Super 150s Merino Wool in deep navy, which contrasts beautifully with a warm olive skin tone)",
      "cut": "Description of the recommended cut that complements their build and details (e.g., Slim-fit double-breasted to accentuate an athletic drop)",
      "stylingTips": ["Tip 1", "Tip 2", "Tip 3"],
      "occasion": "The occasion"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || '{}') as StyleRecommendation;
    parsed.complexion = complexion;
    parsed.details = details;
    return parsed;
  } catch (error) {
    console.error("AI Advisor error:", error);
    throw new Error("Unable to reach the Almos Advisor at this time.");
  }
}

export async function generateMoodBoard(recommendation: StyleRecommendation): Promise<string> {
  const complexionContext = recommendation.complexion ? `worn by a fashion model with ${recommendation.complexion} skin tone and ${recommendation.details || 'an elegant'} build` : '';
  const prompt = `A luxurious, high-end fashion mood board or editorial shot for a bespoke outfit tailored for a ${recommendation.occasion}, ${complexionContext}. Focus on fabrics like ${recommendation.fabric} and cut styling like ${recommendation.cut}. Include a sophisticated color palette that complements the mentioned complexion, macro shots of fabric textures, and editorial fashion elements. Highly aesthetic, minimalist, Vogue style.`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64EncodeString = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64EncodeString}`;
  } catch (error) {
    console.error("Mood Board generation error:", error);
    throw new Error("Unable to generate mood board at this time.");
  }
}

