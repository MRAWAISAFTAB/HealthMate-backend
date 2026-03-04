import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['BP', 'Sugar', 'Weight', 'Temp'], required: true },
    value: { type: String, required: true }, // e.g., "120/80" or "95"
    unit: { type: String }, // e.g., "mmHg", "mg/dL", "kg"
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Vitals', vitalsSchema);