
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A check to ensure the API key is available.
  // In a real application, you might want to handle this more gracefully.
  console.error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDescription = async (prompt: string): Promise<string> => {
  if (!API_KEY) return "API klíč není nakonfigurován.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rozšiřte tento stručný popis služby do profesionálnější a podrobnější položky pro cenovou nabídku. Popis by měl být vhodný pro klienta. Udržujte ho v rozsahu jedné nebo dvou vět. Stručný popis: "${prompt}"`
    });
    return response.text;
  } catch (error) {
    console.error("Chyba při generování popisu:", error);
    return "Chyba při generování popisu. Zkuste to prosím znovu.";
  }
};

export const generateTerms = async (): Promise<string> => {
    if (!API_KEY) return "API klíč není nakonfigurován.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Vygenerujte standardní obchodní podmínky pro cenovou nabídku od freelancera nebo malé firmy. Zahrňte stručné sekce pro:
            1. Platební podmínky (např. 50 % předem, 50 % po dokončení, splatnost 30 dní).
            2. Rozsah práce (obecné prohlášení, že detaily jsou v nabídce).
            3. Časový harmonogram (obecné prohlášení).
            4. Důvěrnost.
            5. Storno podmínky.
            Jazyk udržujte jasný, stručný a profesionální.`
        });
        return response.text;
    } catch (error) {
        console.error("Chyba při generování podmínek:", error);
        return "Chyba při generování podmínek. Zkuste to prosím znovu.";
    }
};
