const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ['ADMIN', 'AGENT', 'USER'], default: 'USER' },
  agency: String,
  avatar: String
});

const PropertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: String,
  type: { type: String, enum: ['Sale', 'Rent'] },
  category: String,
  beds: Number,
  baths: Number,
  area: String,
  images: [String],
  status: { type: String, default: 'Approved' },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

const LOCATIONS = [
  'DHA Phase 8, Karachi', 'DHA Phase 6, Karachi', 'Clifton Block 4, Karachi', 'Clifton Block 5, Karachi',
  'Bahria Town Precinct 1, Karachi', 'Bahria Town Precinct 12, Karachi', 'Gulshan-e-Iqbal Block 13, Karachi',
  'North Nazimabad Block L, Karachi', 'PECHS Block 6, Karachi', 'KDA Scheme 1, Karachi',
  'Malir Cantt, Karachi', 'Emaar Oceanfront, Karachi', 'Navy Housing Scheme, Karachi'
];

const CATEGORIES = ['Villa', 'Apartment', 'Penthouse', 'Office', 'Townhouse'];
const TYPES = ['Sale', 'Rent'];

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
  'https://images.unsplash.com/photo-1600585154542-63ef06d79038?w=800',
  'https://images.unsplash.com/photo-1580587767853-3b668ec75525?w=800',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // Find or Create Agent Agent
    let agent = await User.findOne({ email: 'agent@skyestate.com' });
    if (!agent) {
      const hashedPassword = await bcrypt.hash('password', 10);
      agent = await User.create({
        name: 'Agent Real Estate',
        email: 'agent@skyestate.com',
        password: hashedPassword,
        role: 'AGENT',
        agency: 'Agent Karachi Properties',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
      });
    }

    // Clear Agent's old properties
    await Property.deleteMany({ agent: agent._id });

    const properties = [];
    for (let i = 1; i <= 50; i++) {
      const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];

      // Select 3 random images
      const shuffledImages = [...IMAGE_POOL].sort(() => 0.5 - Math.random());
      const selectedImages = shuffledImages.slice(0, 3);

      const price = type === 'Sale'
        ? Math.floor(Math.random() * 80000000) + 15000000
        : Math.floor(Math.random() * 400000) + 50000;

      properties.push({
        title: `${cat === 'Office' ? 'Prime' : 'Luxury'} ${i % 2 === 0 ? 'Modern' : 'Elegant'} ${cat} in ${loc.split(',')[0]}`,
        description: `Experience luxury living at its best. This ${cat.toLowerCase()} offers high-end finishes, spacious rooms, and a prime location in ${loc}. Perfect for families and investment. Comes with modern amenities and 24/7 security.`,
        price,
        location: loc,
        type,
        category: cat,
        beds: cat === 'Office' ? 0 : Math.floor(Math.random() * 4) + 2,
        baths: Math.floor(Math.random() * 3) + 2,
        area: `${Math.floor(Math.random() * 500) + 120} ${cat === 'Apartment' ? 'Sq Ft' : 'Sq Yards'}`,
        images: selectedImages,
        status: 'Approved',
        agent: agent._id,
        featured: i <= 10 // First 10 are featured
      });
    }

    await Property.insertMany(properties);
    console.log(`Successfully seeded ${properties.length} properties for Agent Agent!`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
