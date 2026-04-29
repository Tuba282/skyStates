import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Sale', 'Rent'], required: true },
  category: { type: String, required: true },
  beds: { type: Number, required: true },
  baths: { type: Number, required: true },
  area: { type: String, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  status: { type: String, default: 'Pending' },
  featured: { type: Boolean, default: false },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Property || mongoose.model('Property', PropertySchema);
