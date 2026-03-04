import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    aiAnalysis: {
        summaryEnglish:   { type: String, default: "" },
        summaryUrdu:      { type: String, default: "" },
        abnormalValues:   [{ type: String }],
        doctorQuestions:  [{ type: String }],
        foodsToAvoid:     [{ type: String }],
        recommendedFoods: [{ type: String }],
        homeRemedies:     [{ type: String }],
        disclaimer:       { type: String, default: "" },
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', reportSchema);