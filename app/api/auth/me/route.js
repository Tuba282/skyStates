import dbConnect from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('skyestate_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No token' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Direct DB access for the session check
    const user = await mongoose.connection.db.collection('users').findOne({ 
      _id: new mongoose.Types.ObjectId(decoded.userId) 
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.status === 'BLOCKED') {
      return NextResponse.json({ message: 'User blocked' }, { status: 403 });
    }

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
