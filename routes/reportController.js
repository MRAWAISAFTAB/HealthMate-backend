import Report from '../models/Report.js';
import { analyzeReport } from '../services/gemini.service.js';

export const uploadAndAnalyzeReport = async (req, res) => {
    try {
        const { userId, reportName } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Bhai, file toh upload karo! 📁" });
        }

        const base64Data = file.buffer.toString('base64');
        const fileDataUri = `data:${file.mimetype};base64,${base64Data}`;

        // analyzeReport ab structured object return karta hai
        const aiResult = await analyzeReport(file.buffer, file.mimetype);

        const newReport = new Report({
            userId,
            fileName: reportName || file.originalname,
            fileUrl: fileDataUri,
            aiAnalysis: {
                summaryEnglish:   aiResult.summaryEnglish   || "",
                summaryUrdu:      aiResult.summaryUrdu      || "",
                abnormalValues:   aiResult.abnormalValues   || [],
                doctorQuestions:  aiResult.doctorQuestions  || [],
                foodsToAvoid:     aiResult.foodsToAvoid     || [],
                recommendedFoods: aiResult.recommendedFoods || [],
                homeRemedies:     aiResult.homeRemedies     || [],
                disclaimer:       aiResult.disclaimer       || "",
            }
        });

        await newReport.save();

        res.status(201).json({
            message: "Report analyzed and saved! ✅",
            data: {
                _id:         newReport._id,
                fileName:    newReport.fileName,
                aiAnalysis:  newReport.aiAnalysis
            }
        });

    } catch (error) {
        console.error("Controller error:", error.message);
        res.status(500).json({ message: error.message || "Analysis mein masla aya." });
    }
};

export const getUserReports = async (req, res) => {
    try {
        const userId = req.user?.id || req.query.userId;
        if (!userId) return res.status(400).json({ message: "User ID nahi mili!" });
        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error("Fetch Error:", error.message);
        res.status(500).json({ message: "History fetch karne mein masla hua." });
    }
};