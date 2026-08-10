import mongoose from 'mongoose';

const PromoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true }, // e.g., 20 for 20% or $20
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // max discount for percentage type
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 }, // max times this code can be used
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who created it
  },
  { timestamps: true }
);

export default mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);