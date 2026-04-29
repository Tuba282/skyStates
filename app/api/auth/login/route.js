import dbConnect from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Use direct collection to ensure we get 'status' even if mongoose schema hasn't reloaded
    const user = await mongoose.connection.db.collection('users').findOne({ email });
    
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status === 'BLOCKED') {
      return NextResponse.json({ message: 'Account blocked. Contact administrator.' }, { status: 403 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      token,
    });

    response.cookies.set('skyestate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
  }
}
