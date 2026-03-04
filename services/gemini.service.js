import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({});

export const analyzeReport = async (fileBuffer, mimeType) => {
    try {
        // System Prompt: AI ki personality aur invalid image handling ke liye
        const systemPrompt = `
You are 'HealthMate AI'. 

STRICT RULE:
If the uploaded image is NOT a medical report (e.g., code, selfie, objects, food):
- Do NOT provide any analysis.
- Do NOT provide summaries or suggestions.
- Respond ONLY with the exact phrase: "Not a medical report." (Urdu: Ye medical report nahi hai.)

Otherwise, follow the standard JSON analysis for actual medical reports.
`;

        const promptText = `
            Analyze this medical report:
            1. Simple English Summary.
            2. Friendly Roman Urdu explanation.
            3. Abnormal values list.
            4. 3 doctor questions.
            Disclaimer: Not medical advice.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Use 1.5-flash as stable baseline
            systemInstructions: systemPrompt, // System instructions for behavior
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: promptText },
                        {
                            inlineData: {
                                data: fileBuffer.toString("base64"),
                                mimeType: mimeType
                            }
                        }
                    ]
                }
            ],
        });

        return response.text;

    } catch (error) {
        console.error("An error occurred during AI analysis:", error);
        throw new Error("AI analysis failed.");
    }
};