import mongoose from 'mongoose';

type CategoryUpdate = {
  name?: string;
  slug?: string;
  description?: string;
};

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: '', // ✅ add default to satisfy validation
    },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate slug from name before saving
CategorySchema.pre('save', function (next) {
  if (this.isModified('name') && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Handle updates via findOneAndUpdate
CategorySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<CategoryUpdate>;
  if (update.name) {
    update.slug = update.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);