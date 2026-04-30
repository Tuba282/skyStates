import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ADMIN', 'AGENT', 'USER'], 
    default: 'USER' 
  },
  avatar: { 
    type: String, 
    default: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
  },
  agency: { type: String },
  phone: { type: String },
  bio: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  status: { 
    type: String, 
    enum: ['ACTIVE', 'BLOCKED'], 
    default: 'ACTIVE' 
  },
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

export default mongoose.models.User || mongoose.model('User', UserSchema);
