import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import Inquiry from '@/models/Inquiry';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const role = decoded.role;

    // Stats logic
    let totalListings = 0;
    let newInquiries = 0;
    let totalUsers = 0;

    if (role === 'ADMIN') {
      totalListings = await Property.countDocuments();
      newInquiries = await Inquiry.countDocuments({ status: 'Unread' });
      totalUsers = await User.countDocuments();
    } else if (role === 'AGENT') {
      totalListings = await Property.countDocuments({ agent: userId });
      newInquiries = await Inquiry.countDocuments({ agent: userId, status: 'Unread' });
    }

    return NextResponse.json({
      totalListings,
      newInquiries,
      totalUsers,
      totalViews: totalListings * 124, // Mock views for demo effect
      platformUsers: totalUsers || 1240 // Admin view see actual, agents see a placeholder
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching stats' }, { status: 500 });
  }
}
