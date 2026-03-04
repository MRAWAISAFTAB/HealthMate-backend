import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeReport = async (fileBuffer, mimeType) => {
    try {
        const systemPrompt = `
You are 'HealthMate AI' — a bilingual medical report analyzer.

STRICT RULE 1:
If the uploaded image is NOT a medical report (e.g., selfie, food, code, random object):
Return ONLY this exact JSON:
{
  "isValid": false,
  "error": "Ye medical report nahi hai."
}

STRICT RULE 2:
Always respond with ONLY valid JSON. No markdown, no backticks, no explanation outside JSON.

STRICT RULE 3:
For valid medical reports, return exactly this JSON structure and nothing else.
`;

        const promptText = `
Analyze this medical report and return ONLY a valid JSON object with this exact structure:

{
  "isValid": true,
  "summaryEnglish": "2-3 sentence simple English summary of the report",
  "summaryUrdu": "2-3 jumlon mein simple Roman Urdu mein report ki wazahat. Asaan alfaz use karo.",
  "abnormalValues": [
    "Value name: result (normal range)",
    "Another abnormal value if any"
  ],
  "doctorQuestions": [
    "Question 1 to ask your doctor?",
    "Question 2 to ask your doctor?",
    "Question 3 to ask your doctor?"
  ],
  "foodsToAvoid": [
    "Food item 1",
    "Food item 2"
  ],
  "recommendedFoods": [
    "Healthy food 1",
    "Healthy food 2"
  ],
  "homeRemedies": [
    "Remedy 1",
    "Remedy 2"
  ],
  "disclaimer": "This AI analysis is for understanding only, not medical advice. Always consult your doctor. | Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi. Apne doctor se zaroor milein."
}

CRITICAL RULES:
- Return ONLY valid JSON with double quotes. NO single quotes anywhere.
- NO markdown, NO backticks, NO text before or after the JSON object.
- summaryUrdu MUST be in Roman Urdu (Urdu written in English letters e.g. "Yeh report normal hai").
- abnormalValues: only values outside normal range. Empty array [] if all normal.
- All string values must use double quotes only.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            systemInstructions: systemPrompt,
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

        const rawText = response.text.trim();
        console.log("=== GEMINI RAW RESPONSE ===");
        console.log(rawText);
        console.log("=== END GEMINI RAW ===");

        // Strip markdown backticks
        let cleaned = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        // Fix single quotes -> double quotes for valid JSON
        const jsonFixed = cleaned
            .replace(/'/g, '"')
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

        let parsed;
        try {
            parsed = JSON.parse(jsonFixed);
            console.log("=== PARSED OK ===", JSON.stringify(parsed).slice(0, 200));
        } catch (e) {
            console.log("=== JSON.parse FAILED, using regex fallback ===", e.message);
            const extract = (key) => {
                const match = cleaned.match(new RegExp(key + '["\'\\s]*:\\s*["\'](.*?)["\'](,|\\n|})', 's'));
                return match ? match[1] : '';
            };
            const extractArr = (key) => {
                const match = cleaned.match(new RegExp(key + '["\'\\s]*:\\s*\\[(.*?)\\]', 's'));
                if (!match) return [];
                return match[1].match(/["'](.*?)["'](?=,|\s*\])/gs)?.map(s => s.replace(/^["']/,'').replace(/["']*$/,'')) || [];
            };
            parsed = {
                isValid: !cleaned.includes('"isValid": false') && !cleaned.includes("isValid: false"),
                summaryEnglish:   extract('summaryEnglish'),
                summaryUrdu:      extract('summaryUrdu'),
                abnormalValues:   extractArr('abnormalValues'),
                doctorQuestions:  extractArr('doctorQuestions'),
                foodsToAvoid:     extractArr('foodsToAvoid'),
                recommendedFoods: extractArr('recommendedFoods'),
                homeRemedies:     extractArr('homeRemedies'),
                disclaimer:       extract('disclaimer'),
            };
        }

        if (!parsed.isValid) {
            throw new Error(parsed.error || "Ye medical report nahi hai.");
        }

        return parsed;

    } catch (error) {
        if (error.message?.includes("medical report")) {
            throw error;
        }
        console.error("Gemini error:", error);
        throw new Error("AI analysis failed: " + error.message);
    }
};